import {
  boolean,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import {
  INQUIRY_STATUSES,
  LOG_KINDS,
  PROJECT_STAGES,
  VISIBILITIES,
  type Challenge,
  type Coverage,
  type Decision,
  type Diagram,
  type Evidence,
  type ProjectLink,
  type SiteSettings,
} from "../lib/types";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const projectStage = pgEnum("project_stage", PROJECT_STAGES);
export const visibility = pgEnum("visibility", VISIBILITIES);
export const logKind = pgEnum("log_kind", LOG_KINDS);
export const inquiryStatus = pgEnum("inquiry_status", INQUIRY_STATUSES);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    code: text("code").notNull(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull().default(""),
    summary: text("summary").notNull().default(""),
    role: text("role").notNull().default(""),
    timeframe: text("timeframe").notNull().default(""),
    stage: projectStage("stage"),
    visibility: visibility("visibility").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    domains: text("domains").array().notNull().default([]),
    stack: text("stack").array().notNull().default([]),
    coverage: jsonb("coverage").$type<Coverage>().notNull().default({}),
    problem: text("problem").notNull().default(""),
    built: text("built").notNull().default(""),
    diagram: jsonb("diagram")
      .$type<Diagram>()
      .notNull()
      .default({ layers: [], nodes: [], edges: [] }),
    decisions: jsonb("decisions").$type<Decision[]>().notNull().default([]),
    challenges: jsonb("challenges").$type<Challenge[]>().notNull().default([]),
    security: text("security").notNull().default(""),
    testing: text("testing").notNull().default(""),
    outcomes: text("outcomes").notNull().default(""),
    evidence: jsonb("evidence").$type<Evidence[]>().notNull().default([]),
    links: jsonb("links").$type<ProjectLink[]>().notNull().default([]),
    coverMediaId: text("cover_media_id"),
    seoTitle: text("seo_title").notNull().default(""),
    seoDescription: text("seo_description").notNull().default(""),
    needsReview: boolean("needs_review").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("projects_visibility_idx").on(t.visibility, t.sortOrder)],
);

export const logEntries = pgTable(
  "log_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    code: text("code").notNull(),
    kind: logKind("kind").notNull().default("note"),
    title: text("title").notNull(),
    summary: text("summary").notNull().default(""),
    body: text("body").notNull().default(""),
    tags: text("tags").array().notNull().default([]),
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
    links: jsonb("links").$type<ProjectLink[]>().notNull().default([]),
    visibility: visibility("visibility").notNull().default("draft"),
    needsReview: boolean("needs_review").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("log_visibility_idx").on(t.visibility, t.publishedAt)],
);

export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company").notNull().default(""),
    engagements: text("engagements").array().notNull().default([]),
    currentState: text("current_state").notNull().default(""),
    message: text("message").notNull(),
    timeline: text("timeline").notNull().default(""),
    budget: text("budget").notNull().default(""),
    status: inquiryStatus("status").notNull().default("new"),
    ipHash: text("ip_hash").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("inquiries_status_idx").on(t.status, t.createdAt)],
);

export const media = pgTable("media", {
  /** Content hash of the processed bytes, so identical uploads dedupe and URLs are immutable. */
  id: text("id").primaryKey(),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  size: integer("size").notNull(),
  alt: text("alt").notNull().default(""),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").$type<Partial<SiteSettings>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  /** SHA-256 of the cookie token; the raw token is never stored. */
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent").notNull().default(""),
  ipHash: text("ip_hash").notNull().default(""),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

export type ProjectRow = typeof projects.$inferSelect;
export type LogRow = typeof logEntries.$inferSelect;
export type InquiryRow = typeof inquiries.$inferSelect;
export type MediaRow = typeof media.$inferSelect;
