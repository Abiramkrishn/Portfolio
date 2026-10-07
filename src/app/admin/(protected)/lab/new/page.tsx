import { nextCode, projectOptions } from "@/db/queries/admin";
import { PageHeader } from "@/components/admin/ui";
import { LogEditor } from "@/components/admin/log-editor";

// Per-request by design: every dashboard view reads the session and live data.
export const instant = false;

export const metadata = { title: "New lab entry" };

export default async function NewLog() {
  const [code, projects] = await Promise.all([nextCode("LOG"), projectOptions()]);
  return (
    <>
      <PageHeader kicker="Lab" title="New entry" />
      <LogEditor
        id={null}
        projects={projects}
        initial={{
          slug: "",
          code,
          kind: "build_log",
          title: "",
          summary: "",
          body: "",
          tags: [],
          projectId: null,
          links: [],
          visibility: "draft",
          publishedAt: "",
          needsReview: false,
        }}
      />
    </>
  );
}
