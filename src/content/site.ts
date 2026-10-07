// Foundational copy. Kept in code (version-controlled) because it changes rarely;
// projects, lab entries, availability and contact details are edited in the dashboard.

import type { DomainKey } from "./taxonomy";
import type { StageKey } from "@/lib/types";

export const site = {
  name: "Abiram Krishn",
  initials: "AK",
  role: "Independent systems engineer",
  descriptor: "Systems engineer for AI, SaaS, integrations and security",
  description:
    "Abiram Krishn builds complete software systems (AI applications, SaaS products, integrations and automation) and tests them like an attacker before they ship.",
  hero: {
    eyebrow: "Independent engineer · AI · SaaS · Integrations · Security",
    lineOne: "I build complete systems.",
    lineTwoLead: "Then I try to",
    lineTwoEmphasis: "break",
    lineTwoTail: "them.",
    sub: "I'm Abiram Krishn. I work across AI, SaaS, integrations, automation and application security, taking a problem from system design to a secured, production-ready build.",
  },
  seams: {
    lead: "Most software doesn't fail inside a component.",
    body: "It fails at the seams: between a model and a phone line, a webhook and a database, a store and a shipping API, a prototype and production. That's where I do my best work: I understand each side well enough to connect them, and I test the connection like someone trying to break it.",
  },
};

export type EngagementKey = "build" | "integrate" | "ai" | "audit" | "rescue";

export type Problem = {
  id: string;
  title: string;
  lede: string;
  approach: string[];
  tools: string[];
  domain: DomainKey;
  engagement: EngagementKey;
};

export const problems: Problem[] = [
  {
    id: "ai-in-the-real-world",
    title: "Your AI demo works. Real conversations don't.",
    lede: "Getting a model to answer once is easy. Getting it to hold up on real calls and messages, with interruptions, tool calls, bad audio and costs that grow with usage, is a systems problem.",
    approach: [
      "Design the agent around tools and data it can actually trust",
      "Evaluate models on real conversations, not only benchmarks",
      "Treat latency and cost per conversation as design constraints",
    ],
    tools: ["Gemini", "AI agents", "Prompt & system design", "Voice AI"],
    domain: "ai",
    engagement: "ai",
  },
  {
    id: "systems-dont-talk",
    title: "Your tools don't talk to each other.",
    lede: "Orders in one place, customers in another, messages in a third. Each integration works alone; together they drop data at the seams.",
    approach: [
      "Map the data flow and decide which system owns what",
      "Build verified, retry-safe webhooks and API bridges",
      "Connect WhatsApp, telephony and third-party services to your backend",
    ],
    tools: ["REST APIs", "Webhooks", "WhatsApp Business", "Telephony"],
    domain: "integration",
    engagement: "integrate",
  },
  {
    id: "manual-work",
    title: "Your team repeats the same steps every day.",
    lede: "Copying order details, sending updates, booking shipments, chasing status. If a person follows a checklist, a workflow can too, and log every step it takes.",
    approach: [
      "Turn the manual process into an explicit, observable workflow",
      "Automate store operations across Shopify, WooCommerce and Shiprocket",
      "Keep a person in the loop where judgement actually matters",
    ],
    tools: ["n8n", "Shopify", "WooCommerce", "Shiprocket"],
    domain: "automation",
    engagement: "integrate",
  },
  {
    id: "product-not-script",
    title: "You need a product, not a script.",
    lede: "A working prototype isn't a SaaS. Accounts, roles, data isolation, dashboards and an API other systems can rely on are what make it one.",
    approach: [
      "Design the data model and tenancy before the screens",
      "Build the backend and dashboard end to end",
      "Expose clean REST APIs for the integrations that come later",
    ],
    tools: ["Laravel", "PHP", "React", "TypeScript", "PostgreSQL"],
    domain: "product",
    engagement: "build",
  },
  {
    id: "launch-safety",
    title: "You're about to launch and don't know if it's safe.",
    lede: "Most breaches aren't clever. They're an unchecked ID in a URL, a forgotten admin path, or a webhook that trusts anyone who calls it.",
    approach: [
      "Test the application the way an attacker would, from recon to exploitation",
      "Review authentication, authorisation and tenant isolation",
      "Report each finding with its severity and a concrete fix",
    ],
    tools: ["Burp Suite", "Nmap", "Gobuster", "Metasploit", "Nessus / OpenVAS"],
    domain: "security",
    engagement: "audit",
  },
  {
    id: "survive-production",
    title: "It works on a laptop. It has to survive production.",
    lede: "Environments, secrets, migrations, logs, backups and failure modes. Production readiness is a checklist someone has to actually work through.",
    approach: [
      "Audit the architecture and deployment for single points of failure",
      "Set up Linux and VPS environments properly",
      "Debug the cross-system failures that nobody owns",
    ],
    tools: ["Linux", "VPS / cloud", "PostgreSQL", "Production readiness"],
    domain: "infrastructure",
    engagement: "rescue",
  },
];

export const lifecycle: Record<StageKey, { label: string; short: string; what: string; deliverable: string }> = {
  problem: {
    label: "Problem",
    short: "Prob.",
    what: "What has to be true when this works: users, constraints, risks, and what already exists.",
    deliverable: "A written problem statement and scope",
  },
  architecture: {
    label: "Architecture",
    short: "Arch.",
    what: "Components, data flow, data ownership, failure modes and cost, decided before code.",
    deliverable: "A system diagram and a decision log",
  },
  build: {
    label: "Build",
    short: "Build",
    what: "Backend, frontend and data model, written to be read by the next engineer.",
    deliverable: "Working software in your repository",
  },
  integrate: {
    label: "Integrate",
    short: "Integ.",
    what: "Third-party APIs, webhooks, messaging and telephony: verified, retried and logged.",
    deliverable: "Connections that fail loudly, not silently",
  },
  automate: {
    label: "Automate",
    short: "Auto.",
    what: "Manual steps become workflows with clear owners and an audit trail.",
    deliverable: "Documented, observable workflows",
  },
  secure: {
    label: "Secure",
    short: "Secure",
    what: "I attack my own build: authentication, access control, input handling, exposed surface.",
    deliverable: "A findings report, and the fixes",
  },
  ship: {
    label: "Ship",
    short: "Ship",
    what: "Deployment, environments, monitoring hooks and a handover you can actually use.",
    deliverable: "A production deploy and a runbook",
  },
};

export const principles = [
  {
    title: "Decisions are written down.",
    body: "Every significant choice gets a short record: what was decided, why, and what it costs. You can audit my thinking, not only my code.",
  },
  {
    title: "No invented numbers.",
    body: "I don't promise percentages I haven't measured. Where there's evidence, I show it. Where there isn't, I say so.",
  },
  {
    title: "Security is a stage, not a feature.",
    body: "It has its own place in the plan and its own time in the schedule, not a scan the night before launch.",
  },
  {
    title: "You own everything.",
    body: "Code, infrastructure, accounts and documentation sit in your name from the first day.",
  },
];

export const engagements: Record<
  EngagementKey,
  { label: string; summary: string; firstStep: string }
> = {
  build: {
    label: "Build",
    summary: "A new product, SaaS or internal tool, from architecture to deploy.",
    firstStep: "A scoping conversation and a written system outline",
  },
  integrate: {
    label: "Integrate & automate",
    summary: "Connect your systems, channels and operations into workflows that run themselves.",
    firstStep: "A map of the current flow and where it breaks",
  },
  ai: {
    label: "Add AI",
    summary: "Conversational agents and AI features wired into your real data and channels.",
    firstStep: "A small evaluation against your real conversations",
  },
  audit: {
    label: "Audit",
    summary: "A security and production-readiness review of an application that already exists.",
    firstStep: "An agreed scope and test window",
  },
  rescue: {
    label: "Rescue",
    summary: "Something in production misbehaves and nobody owns the fix.",
    firstStep: "Access, logs, and a first diagnosis",
  },
};

export const ENGAGEMENT_KEYS = Object.keys(engagements) as EngagementKey[];

export const briefOptions = {
  currentState: [
    "Idea or planning stage",
    "A prototype exists",
    "A live product",
    "Something is broken",
  ],
  timeline: ["As soon as possible", "Within a month", "In 1–3 months", "Flexible"],
};

export const faq = [
  {
    q: "What happens after I send a brief?",
    a: "I read it properly, then reply {responseTime}, either with questions or with a suggested first step and a time to talk.",
  },
  {
    q: "Do you work inside existing codebases?",
    a: "Yes. Audits, rescues and integrations usually start inside code someone else wrote. I read it before I suggest changing it.",
  },
  {
    q: "What do you need from me to start?",
    a: "A clear description of the problem, access to whatever exists today (repository, hosting, accounts), and someone who can answer questions.",
  },
];

export const about = {
  intro: [
    "I'm Abiram Krishn, an independent engineer. I build across the whole of a modern software system: AI models and agents, SaaS backends and dashboards, the APIs and webhooks between services, the automations that run on top, and the Linux servers underneath.",
    "I also work on the other side of software: penetration testing, vulnerability assessment and security audits. That changes how I build: I design for the request an attacker will send, not only the one the interface sends.",
    "The common thread is systems thinking. I'm most useful when a problem crosses boundaries, when it needs someone who can follow a request from a phone call, through an API and a model, into a database and back out again.",
  ],
  // Add real entries here when you want them shown; empty lists stay hidden.
  experience: [] as { period: string; title: string; detail: string }[],
  education: [] as { period: string; title: string; detail: string }[],
};
