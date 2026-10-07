import { getSettingsAdmin } from "@/db/queries/admin";
import { mailEnv } from "@/lib/env";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import { TestEmail } from "@/components/admin/test-email";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const settings = await getSettingsAdmin();
  const mail = mailEnv();
  return (
    <>
      <PageHeader kicker="Site" title="Settings" />
      <SettingsForm initial={settings} mailConfigured={Boolean(mail)} />
      <TestEmail configured={Boolean(mail)} to={mail?.to ?? null} />
    </>
  );
}
