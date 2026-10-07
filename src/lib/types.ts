// Shared shapes for structured content. Safe to import from client and server code.

export const LIFECYCLE = [
  "problem",
  "architecture",
  "build",
  "integrate",
  "automate",
  "secure",
  "ship",
] as const;
export type StageKey = (typeof LIFECYCLE)[number];

/** Which lifecycle stages a project covered; the value is a short note (may be empty). */
export type Coverage = Partial<Record<StageKey, string>>;

export type DiagramNode = {
  id: string;
  label: string;
  layer: number;
  tech?: string;
  detail?: string;
};

export type DiagramEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
};

export type Diagram = {
  layers: string[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  caption?: string;
};

export type Decision = {
  title: string;
  context: string;
  decision: string;
  tradeoff: string;
};

export type Challenge = {
  title: string;
  symptom: string;
  investigation: string;
  resolution: string;
};

export type Evidence =
  | { kind: "image"; mediaId: string; caption: string }
  | { kind: "link"; url: string; caption: string };

export const LINK_KINDS = ["live", "repo", "demo", "doc", "other"] as const;
export type LinkKind = (typeof LINK_KINDS)[number];
export type ProjectLink = { label: string; url: string; kind: LinkKind };

export const PROJECT_STAGES = ["upcoming", "in_progress", "ongoing", "shipped"] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const VISIBILITIES = ["draft", "published"] as const;
export type Visibility = (typeof VISIBILITIES)[number];

export const LOG_KINDS = ["build_log", "security", "experiment", "note"] as const;
export type LogKind = (typeof LOG_KINDS)[number];

export const INQUIRY_STATUSES = ["new", "read", "replied", "archived"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const AVAILABILITY = ["open", "limited", "closed"] as const;
export type Availability = (typeof AVAILABILITY)[number];

export type SiteSettings = {
  availability: Availability;
  availabilityNote: string;
  email: string;
  linkedin: string;
  github: string;
  phone: string;
  whatsapp: string;
  bookingUrl: string;
  cvUrl: string;
  location: string;
  timezone: string;
  now: string;
  responseTime: string;
  notifyOnInquiry: boolean;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  availability: "open",
  availabilityNote: "",
  email: "",
  linkedin: "",
  github: "",
  phone: "",
  whatsapp: "",
  bookingUrl: "",
  cvUrl: "",
  location: "",
  timezone: "",
  now: "",
  responseTime: "within two working days",
  notifyOnInquiry: false,
};
