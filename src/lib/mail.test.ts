import { afterEach, describe, expect, it } from "vitest";
import { mailEnv } from "./env";
import { buildInquiryMessage, explainMailError } from "./mail";

const KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "SMTP_FROM", "NOTIFY_EMAIL"] as const;
const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]));
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function setGmail(pass: string) {
  process.env.SMTP_HOST = "smtp.gmail.com";
  process.env.SMTP_PORT = "587";
  process.env.SMTP_USER = "someone@gmail.com";
  process.env.SMTP_PASS = pass;
  process.env.SMTP_FROM = "Portfolio <someone@gmail.com>";
  process.env.NOTIFY_EMAIL = "someone@gmail.com";
}

describe("mailEnv", () => {
  it("strips the spaces Google shows in App Passwords, and nothing else", () => {
    setGmail("abcd efgh ijkl mnop");
    expect(mailEnv()?.pass).toBe("abcdefghijklmnop");
    setGmail("ssss tsst");
    expect(mailEnv()?.pass).toBe("sssstsst");
  });

  it("is not configured until the password is filled in", () => {
    setGmail("");
    expect(mailEnv()).toBeNull();
  });

  it("leaves non-Gmail passwords untouched", () => {
    setGmail("pass with spaces");
    process.env.SMTP_HOST = "smtp.example.com";
    expect(mailEnv()?.pass).toBe("pass with spaces");
  });
});

describe("explainMailError", () => {
  it("explains Gmail credential rejections", () => {
    expect(explainMailError(new Error("Invalid login: 535-5.7.8 Username and Password not accepted"))).toMatch(/App Password/);
  });

  it("explains network failures", () => {
    expect(explainMailError(new Error("connect ETIMEDOUT 142.250.4.108:587"))).toMatch(/reach the mail server/);
  });
});

describe("buildInquiryMessage", () => {
  const brief = {
    engagements: ["audit"],
    currentState: "A live product",
    message: 'We need a review.\n<script>alert("x")</script>',
    timeline: "",
    budget: "",
    name: "Sam\r\nBcc: victim@example.com",
    email: "sam@example.com",
    company: "<b>Acme</b>",
  };
  const msg = buildInquiryMessage("abc", brief);

  it("replies straight to the client", () => {
    expect(msg.replyTo.address).toBe("sam@example.com");
  });

  it("can't be used to inject headers", () => {
    expect(msg.subject).not.toMatch(/[\r\n]/);
    expect(msg.replyTo.name).not.toMatch(/[\r\n]/);
  });

  it("escapes everything the visitor typed in the HTML version", () => {
    expect(msg.html).not.toContain("<script>");
    expect(msg.html).toContain("&lt;script&gt;");
    expect(msg.html).not.toContain("<b>Acme</b>");
  });

  it("names the engagement and links to the dashboard", () => {
    expect(msg.subject).toContain("Audit");
    expect(msg.text).toContain("/admin/inquiries/abc");
  });
});
