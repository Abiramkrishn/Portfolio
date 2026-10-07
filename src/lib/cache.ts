// Cache tags shared by the cached readers (src/db/queries/public.ts) and the dashboard
// actions that expire them. Saving in the dashboard expires exactly what changed.
export const TAGS = {
  projects: "projects",
  lab: "lab",
  settings: "settings",
  media: "media",
} as const;
