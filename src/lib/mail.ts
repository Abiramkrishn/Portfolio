import "server-only";
import nodemailer from "nodemailer";
import { mailEnv, siteUrl } from "./env";
import type { BriefInput } from "./validation";
import type { EmailStatus } from "./types";
import { engagements, type EngagementKey } from "@/content/site";

type MailEnv = NonNullable<ReturnType<typeof mailEnv>>;

function transport(env: MailEnv) {
  return nodemailer.createTransport({
    host: env.host,
    port: env.port,
    secure: env.port === 465, // 465 = implicit TLS; 587 upgrades with STARTTLS
    // With a login, never send credentials over an unencrypted connection.
    requireTLS: Boolean(env.user) && env.port !== 465,
    auth: env.user ? { user: env.user, pass: env.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
  });
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Strip anything that could break out of a header line. */
const headerSafe = (s: string) => s.replace(/[\r\n\t]+/g, " ").slice(0, 120);

/** Turn provider errors into something actionable in the dashboard. */
export function explainMailError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/535|Username and Password not accepted|BadCredentials/i.test(msg)) {
    return "Gmail rejected the login. Use a Google App Password (not your normal password) in SMTP_PASS, with 2-Step Verification on.";
  }
  if (/ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(msg)) {
    return "Couldn't reach the mail server. Check SMTP_HOST/SMTP_PORT and that outbound SMTP isn't blocked by your host.";
  }
  return msg.slice(0, 200);
}

/** The notification email for a brief: subject, plain text, HTML (all user input escaped). */
export function buildInquiryMessage(id: string, brief: BriefInput) {
  const wants = brief.engagements.map((e) => engagements[e as EngagementKey]?.label ?? e).join(", ");
  const link = `${siteUrl()}/admin/inquiries/${id}`;
  const rows: [string, string][] = [
    ["From", `${brief.name} <${brief.email}>`],
    ["Company", brief.company || "not given"],
    ["Looking for", wants || "not given"],
    ["Where they are", brief.currentState || "not given"],
    ["Timeline", brief.timeline || "not given"],
    ["Budget", brief.budget || "not given"],
  ];

  const text = [
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    brief.message,
    "",
    `Reply to this email to answer ${brief.name} directly.`,
    `Open in dashboard: ${link}`,
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f2f0ea;font-family:Arial,Helvetica,sans-serif;color:#141414">
<div style="max-width:600px;margin:0 auto;padding:24px">
  <p style="margin:0 0 4px;font:12px/1.4 monospace;letter-spacing:.08em;text-transform:uppercase;color:#b23808">New project brief</p>
  <h1 style="margin:0 0 20px;font-size:22px;line-height:1.3">${escapeHtml(brief.name)}${brief.company ? ` · ${escapeHtml(brief.company)}` : ""}</h1>
  <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
    ${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px 8px 0;border-bottom:1px solid #d7d3c9;color:#66645d;width:130px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #d7d3c9">${escapeHtml(v)}</td></tr>`,
      )
      .join("")}
  </table>
  <div style="background:#f8f7f3;border:1px solid #d7d3c9;border-radius:6px;padding:16px;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(brief.message)}</div>
  <p style="margin:20px 0 0;font-size:14px">Reply to this email to answer ${escapeHtml(brief.name)} directly, or <a href="${escapeHtml(link)}" style="color:#b23808">open it in the dashboard</a>.</p>
</div></body></html>`;

  return {
    replyTo: { name: headerSafe(brief.name), address: brief.email },
    subject: headerSafe(`New brief: ${brief.name}${wants ? ` (${wants})` : ""}`),
    text,
    html,
  };
}

/** Email a new brief. The brief is already stored; the result is recorded on it for the dashboard. */
export async function notifyNewInquiry(id: string, brief: BriefInput): Promise<{ status: EmailStatus; error?: string }> {
  const env = mailEnv();
  if (!env) return { status: "not_configured" };
  try {
    await transport(env).sendMail({ from: env.from, to: env.to, ...buildInquiryMessage(id, brief) });
    return { status: "sent" };
  } catch (err) {
    const error = explainMailError(err);
    console.error("[mail] could not send inquiry notification:", error);
    return { status: "failed", error };
  }
}

/** Used by the dashboard's "Send test email" button. */
export async function sendTestEmail(): Promise<{ ok: boolean; message: string }> {
  const env = mailEnv();
  if (!env) {
    return {
      ok: false,
      message: "Email isn't configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM and NOTIFY_EMAIL, then restart the server.",
    };
  }
  try {
    const t = transport(env);
    await t.verify();
    await t.sendMail({
      from: env.from,
      to: env.to,
      subject: "Portfolio: test email",
      text: `This is a test from your portfolio dashboard. New project briefs will arrive at ${env.to} like this.`,
    });
    return { ok: true, message: `Sent. Check ${env.to} (and the spam folder the first time).` };
  } catch (err) {
    return { ok: false, message: explainMailError(err) };
  }
}
