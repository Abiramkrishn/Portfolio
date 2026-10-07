// The capability taxonomy: domains (what kind of problem) and layers (where in a system).
// Project `stack` values and lab `tags` are matched against tool names and aliases, which is
// how the stack map links every tool to the work that used it.

export type DomainKey =
  | "ai"
  | "product"
  | "integration"
  | "automation"
  | "commerce"
  | "security"
  | "infrastructure";

export const DOMAINS: Record<DomainKey, { label: string; short: string }> = {
  ai: { label: "AI systems", short: "AI" },
  product: { label: "SaaS & full-stack", short: "Product" },
  integration: { label: "APIs & integrations", short: "Integration" },
  automation: { label: "Automation & workflows", short: "Automation" },
  commerce: { label: "Commerce systems", short: "Commerce" },
  security: { label: "Application security", short: "Security" },
  infrastructure: { label: "Infrastructure & production", short: "Infra" },
};

export const DOMAIN_KEYS = Object.keys(DOMAINS) as DomainKey[];

export type Tool = { name: string; aliases?: string[]; note?: string };

export type Layer = {
  key: string;
  label: string;
  role: string;
  tools: Tool[];
};

/** Layers of a system, top (closest to people) to bottom (closest to metal). */
export const LAYERS: Layer[] = [
  {
    key: "interface",
    label: "Interface",
    role: "What people touch",
    tools: [
      { name: "React" },
      { name: "Next.js" },
      { name: "TypeScript" },
      { name: "JavaScript" },
      { name: "PWA", aliases: ["Progressive Web App"] },
    ],
  },
  {
    key: "application",
    label: "Application",
    role: "Business logic and APIs",
    tools: [
      { name: "Node.js", aliases: ["Express", "Fastify"] },
      { name: "Laravel" },
      { name: "PHP" },
      { name: "REST APIs", aliases: ["REST", "API design"] },
      { name: "SaaS architecture", aliases: ["Multi-tenant"] },
    ],
  },
  {
    key: "intelligence",
    label: "Intelligence",
    role: "Models, agents, conversation",
    tools: [
      { name: "Gemini", aliases: ["Google Gemini", "Gemini Live"] },
      { name: "AI agents", aliases: ["Agents"] },
      { name: "Conversational AI" },
      { name: "Voice AI" },
      { name: "Prompt & system design", aliases: ["Prompt design"] },
      { name: "Model evaluation", aliases: ["AI evaluation"] },
    ],
  },
  {
    key: "integration",
    label: "Integration",
    role: "Channels and the systems between",
    tools: [
      { name: "Webhooks" },
      { name: "WhatsApp Business", aliases: ["WhatsApp"] },
      { name: "Telephony", aliases: ["Vobiz", "Exotel", "Plivo"] },
      { name: "Realtime", aliases: ["WebSockets", "Server-sent events", "Supabase Realtime"] },
      { name: "Queues", aliases: ["BullMQ"] },
      { name: "n8n" },
      { name: "Third-party APIs" },
    ],
  },
  {
    key: "commerce",
    label: "Commerce",
    role: "Stores, orders, fulfilment",
    tools: [{ name: "Shopify" }, { name: "WooCommerce" }, { name: "Shiprocket" }, { name: "Razorpay" }],
  },
  {
    key: "data",
    label: "Data",
    role: "Where the truth lives",
    tools: [
      { name: "PostgreSQL", aliases: ["Postgres"] },
      { name: "pgvector" },
      { name: "Redis" },
      { name: "MySQL" },
      { name: "Supabase" },
    ],
  },
  {
    key: "infrastructure",
    label: "Infrastructure",
    role: "Where it runs",
    tools: [
      { name: "Linux" },
      { name: "Docker" },
      { name: "VPS / cloud", aliases: ["VPS", "Cloud deployment", "Hostinger", "Caddy"] },
      { name: "Production readiness" },
    ],
  },
];

/** Security cuts across every layer, so it is drawn as a band rather than a row. */
export const SECURITY_BAND: Layer = {
  key: "security",
  label: "Security",
  role: "Across every layer",
  tools: [
    { name: "Penetration testing", aliases: ["Pentesting"] },
    { name: "Web application security", aliases: ["AppSec"] },
    { name: "Tenant isolation", aliases: ["Row-level security", "RLS", "Multi-tenant isolation"] },
    { name: "Vulnerability assessment" },
    { name: "Burp Suite" },
    { name: "Nmap" },
    { name: "Gobuster" },
    { name: "Metasploit" },
    { name: "Nessus / OpenVAS", aliases: ["Nessus", "OpenVAS"] },
  ],
};

export function normalizeTool(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const toolIndex = new Map<string, string>();
for (const layer of [...LAYERS, SECURITY_BAND]) {
  for (const tool of layer.tools) {
    toolIndex.set(normalizeTool(tool.name), tool.name);
    for (const alias of tool.aliases ?? []) toolIndex.set(normalizeTool(alias), tool.name);
  }
}

/** Resolve a free-text stack entry to its canonical taxonomy name, if it has one. */
export function canonicalTool(value: string): string | undefined {
  return toolIndex.get(normalizeTool(value));
}

export const ALL_TOOL_NAMES = [...LAYERS, SECURITY_BAND].flatMap((l) => l.tools.map((t) => t.name));
