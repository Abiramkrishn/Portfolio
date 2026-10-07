// Fig. 1 on the homepage: one shared system map and several "traces" through it.
// Coordinates live in a 1200×560 viewBox. Captions describe how these kinds of systems
// work and how I test them — they are not measurements of a specific deployment.

export type MapNode = {
  id: string;
  label: string;
  tech: string;
  x: number;
  y: number;
  /** Only drawn while a trace that uses it is active. */
  ghost?: boolean;
};

export type TraceStep = {
  from?: string;
  to?: string;
  caption: string;
  tools: string[];
  /** The request is stopped part-way along this wire. */
  blocked?: boolean;
};

export type Trace = { id: string; label: string; intent: string; steps: TraceStep[] };

export const MAP_SIZE = { width: 1200, height: 560 };
export const NODE_SIZE = { w: 170, h: 58 };
export const PERIMETER = { x: 238, y: 22, w: 744, h: 398 };
export const RAIL_Y = 520;

export const mapNodes: MapNode[] = [
  { id: "phone", label: "Phone call", tech: "Telephony", x: 24, y: 56 },
  { id: "whatsapp", label: "WhatsApp", tech: "Business platform", x: 24, y: 144 },
  { id: "web", label: "Web app", tech: "React · TypeScript", x: 24, y: 232 },
  { id: "store", label: "Storefront", tech: "Shopify · WooCommerce", x: 24, y: 320 },
  { id: "adversary", label: "Adversary", tech: "Untrusted network", x: 24, y: 420, ghost: true },
  { id: "gateway", label: "Webhooks & APIs", tech: "Verified intake", x: 276, y: 188 },
  { id: "app", label: "Application core", tech: "Laravel · PHP", x: 520, y: 112 },
  { id: "flows", label: "Workflows", tech: "n8n automations", x: 520, y: 290 },
  { id: "agent", label: "AI agent", tech: "Gemini · tool calls", x: 776, y: 56 },
  { id: "db", label: "Data", tech: "PostgreSQL", x: 776, y: 200 },
  { id: "fulfil", label: "Fulfilment", tech: "Shiprocket", x: 1006, y: 290 },
];

/** Wires drawn faintly at rest, so the map reads as a system before anything moves. */
export const mapWires: [string, string][] = [
  ["phone", "gateway"],
  ["whatsapp", "gateway"],
  ["web", "gateway"],
  ["store", "gateway"],
  ["gateway", "app"],
  ["gateway", "agent"],
  ["gateway", "flows"],
  ["agent", "app"],
  ["app", "db"],
  ["app", "flows"],
  ["flows", "db"],
  ["flows", "fulfil"],
];

export const traces: Trace[] = [
  {
    id: "call",
    label: "Phone call",
    intent: "A voice conversation that has to act on real data",
    steps: [
      {
        from: "phone",
        to: "gateway",
        caption: "A customer calls the business. The telephony provider hands the call to the platform.",
        tools: ["Telephony"],
      },
      {
        from: "gateway",
        to: "agent",
        caption: "The call is connected to an AI agent that holds the conversation.",
        tools: ["Voice AI", "Gemini"],
      },
      {
        from: "agent",
        to: "app",
        caption: "Mid-call, the agent needs real information, so it calls a tool on the backend instead of guessing.",
        tools: ["AI agents", "REST APIs"],
      },
      {
        from: "app",
        to: "db",
        caption: "The backend authorises the request, then reads or writes the record.",
        tools: ["Laravel", "PostgreSQL"],
      },
      {
        from: "gateway",
        to: "whatsapp",
        caption: "After the call, the customer gets a written follow-up on WhatsApp.",
        tools: ["WhatsApp Business"],
      },
    ],
  },
  {
    id: "order",
    label: "WhatsApp order",
    intent: "Free-text chat turned into a real, fulfilled order",
    steps: [
      {
        from: "whatsapp",
        to: "gateway",
        caption: "A customer orders in a normal chat message. The webhook is verified before anything else happens.",
        tools: ["WhatsApp Business", "Webhooks"],
      },
      {
        from: "gateway",
        to: "agent",
        caption: "An AI agent turns free text into a structured order, and asks when something is missing.",
        tools: ["Gemini", "Conversational AI"],
      },
      {
        from: "agent",
        to: "app",
        caption: "The order is checked against products, stock and pricing by the backend, not the model.",
        tools: ["Laravel", "REST APIs"],
      },
      {
        from: "app",
        to: "db",
        caption: "It's stored alongside the conversation that produced it.",
        tools: ["PostgreSQL"],
      },
      {
        from: "app",
        to: "flows",
        caption: "A workflow takes over the operational steps.",
        tools: ["n8n"],
      },
      {
        from: "flows",
        to: "fulfil",
        caption: "The shipment is booked with the courier.",
        tools: ["Shiprocket"],
      },
    ],
  },
  {
    id: "automation",
    label: "Store automation",
    intent: "Operations that used to be someone's daily checklist",
    steps: [
      {
        from: "store",
        to: "gateway",
        caption: "A new order in the store fires a webhook.",
        tools: ["Shopify", "WooCommerce", "Webhooks"],
      },
      {
        from: "gateway",
        to: "flows",
        caption: "The payload is verified and handed to a workflow.",
        tools: ["n8n"],
      },
      {
        from: "flows",
        to: "fulfil",
        caption: "The workflow books the shipment.",
        tools: ["Shiprocket"],
      },
      {
        from: "flows",
        to: "db",
        caption: "Every step is logged, so a failure is visible and can be replayed.",
        tools: ["PostgreSQL"],
      },
      {
        from: "gateway",
        to: "whatsapp",
        caption: "Tracking details reach the customer on WhatsApp.",
        tools: ["WhatsApp Business", "Third-party APIs"],
      },
    ],
  },
  {
    id: "attack",
    label: "Attack it",
    intent: "The same system, from the other side",
    steps: [
      {
        from: "adversary",
        to: "gateway",
        caption: "I start where an attacker would: mapping every exposed port, path and endpoint.",
        tools: ["Nmap", "Gobuster"],
      },
      {
        from: "gateway",
        to: "app",
        caption: "Then I replay real requests with tampered IDs, tokens and payloads.",
        tools: ["Burp Suite"],
      },
      {
        from: "app",
        to: "db",
        blocked: true,
        caption: "Can one customer read another's records? Authorisation lives at the data layer, so the request stops here.",
        tools: ["Web application security"],
      },
      {
        caption: "Anything that does get through becomes a written finding with a fix. Before launch, not after.",
        tools: ["Vulnerability assessment", "Metasploit", "Nessus / OpenVAS"],
      },
    ],
  },
];
