import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authEnv } from "@/lib/env";
import { LoginForm } from "./login-form";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  let totp = false;
  let problem: string | null = null;
  try {
    totp = Boolean(authEnv().ADMIN_TOTP_SECRET);
  } catch (err) {
    problem = err instanceof Error ? err.message : "Admin credentials aren't set.";
  }

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="label text-ink-3">
          <span className="text-signal-ink">Dashboard</span> · Restricted
        </p>
        <h1 className="headline mt-4">Sign in</h1>
        {!problem ? (
          <LoginForm totp={totp} />
        ) : (
          <p className="mt-6 border-l-2 border-signal bg-signal-soft px-4 py-3 text-[0.95rem]">
            {problem} Add the values to your environment variables, then redeploy.
          </p>
        )}
      </div>
    </main>
  );
}
