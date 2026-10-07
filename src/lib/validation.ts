// Shared schemas: the same rules run in the browser (for feedback) and in server actions
// (for enforcement). Nothing here trusts the client.

import { z } from "zod";
import {
  AVAILABILITY,
  INQUIRY_STATUSES,
  LIFECYCLE,
  LINK_KINDS,
  LOG_KINDS,
  PROJECT_STAGES,
  VISIBILITIES,
} from "./types";
import { DOMAIN_KEYS } from "@/content/taxonomy";
import { ENGAGEMENT_KEYS, briefOptions } from "@/content/site";

const text = (max: number) => z.string().trim().max(max);
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http:// or https://");
const slug = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only");

export const briefSchema = z.object({
  engagements: z.array(z.enum(ENGAGEMENT_KEYS as [string, ...string[]])).max(5).default([]),
  currentState: z.union([z.enum(briefOptions.currentState as [string, ...string[]]), z.literal("")]),
  message: z
    .string()
    .trim()
    .min(30, "A few sentences help: at least 30 characters.")
    .max(5000, "Keep it under 5,000 characters. We can go deeper on a call."),
  timeline: z.union([z.enum(briefOptions.timeline as [string, ...string[]]), z.literal("")]),
  budget: text(120),
  name: z.string().trim().min(2, "Your name, please.").max(120),
  email: z.email("That email doesn't look right.").max(200),
  company: text(160),
});
export type BriefInput = z.infer<typeof briefSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(3).max(200),
  password: z.string().min(1).max(512),
  code: z.string().trim().max(12).optional(),
});

const coverageSchema = z.partialRecord(z.enum(LIFECYCLE), text(160));

export const diagramSchema = z.object({
  layers: z.array(text(40)).max(8),
  nodes: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(40).regex(/^[a-z0-9_-]+$/i, "Node ids: letters, numbers, - and _"),
        label: z.string().trim().min(1).max(60),
        layer: z.number().int().min(0).max(7),
        tech: text(80).optional(),
        detail: text(600).optional(),
      }),
    )
    .max(40),
  edges: z
    .array(
      z.object({
        from: z.string().trim().min(1).max(40),
        to: z.string().trim().min(1).max(40),
        label: text(40).optional(),
        dashed: z.boolean().optional(),
      }),
    )
    .max(80),
  caption: text(200).optional(),
});

const linkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  url: optionalUrl.refine((v) => v !== "", "URL is required"),
  kind: z.enum(LINK_KINDS),
});

const evidenceSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("image"), mediaId: z.string().regex(/^[a-f0-9]{32}$/), caption: text(300) }),
  z.object({
    kind: z.literal("link"),
    url: optionalUrl.refine((v) => v !== "", "URL is required"),
    caption: text(300),
  }),
]);

export const projectSchema = z.object({
  slug,
  code: z.string().trim().min(1).max(16),
  title: z.string().trim().min(2).max(120),
  tagline: text(240),
  summary: text(600),
  role: text(240),
  timeframe: text(60),
  stage: z.union([z.enum(PROJECT_STAGES), z.null()]),
  visibility: z.enum(VISIBILITIES),
  featured: z.boolean(),
  sortOrder: z.number().int().min(-1000).max(1000),
  domains: z.array(z.enum(DOMAIN_KEYS as [string, ...string[]])).max(7),
  stack: z.array(z.string().trim().min(1).max(40)).max(30),
  coverage: coverageSchema,
  problem: text(8000),
  built: text(12000),
  diagram: diagramSchema,
  decisions: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        context: text(1500),
        decision: text(1500),
        tradeoff: text(1500),
      }),
    )
    .max(20),
  challenges: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(160),
        symptom: text(1500),
        investigation: text(2500),
        resolution: text(1500),
      }),
    )
    .max(20),
  security: text(8000),
  testing: text(8000),
  outcomes: text(8000),
  evidence: z.array(evidenceSchema).max(30),
  links: z.array(linkSchema).max(10),
  coverMediaId: z.union([z.string().regex(/^[a-f0-9]{32}$/), z.null()]),
  seoTitle: text(120),
  seoDescription: text(300),
  needsReview: z.boolean(),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const logSchema = z.object({
  slug,
  code: z.string().trim().min(1).max(16),
  kind: z.enum(LOG_KINDS),
  title: z.string().trim().min(2).max(160),
  summary: text(400),
  body: text(30000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  projectId: z.union([z.uuid(), z.null()]),
  links: z.array(linkSchema).max(10),
  visibility: z.enum(VISIBILITIES),
  publishedAt: z.union([z.iso.date(), z.literal("")]),
  needsReview: z.boolean(),
});
export type LogInput = z.infer<typeof logSchema>;

export const settingsSchema = z.object({
  availability: z.enum(AVAILABILITY),
  availabilityNote: text(120),
  email: z.union([z.email().max(200), z.literal("")]),
  linkedin: optionalUrl,
  github: optionalUrl,
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^\+?[0-9 ]*$/, "Digits only, in international format (e.g. +91 98…)"),
  whatsapp: z
    .string()
    .trim()
    .max(20)
    .regex(/^\+?[0-9 ]*$/, "Digits only, in international format (e.g. +91 98…)"),
  bookingUrl: optionalUrl,
  cvUrl: optionalUrl,
  location: text(80),
  timezone: text(60),
  now: text(600),
  responseTime: text(60),
  notifyOnInquiry: z.boolean(),
});

export const inquiryStatusSchema = z.enum(INQUIRY_STATUSES);

/** Flatten zod errors to { field: firstMessage } for inline form feedback. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
