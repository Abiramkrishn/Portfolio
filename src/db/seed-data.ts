// Initial content, drawn from the owner's brief and his own repositories (README, ARCHITECTURE,
// SECURITY, evaluation and measurement records, commit history). Rule: nothing invented — no
// clients named without consent, no metrics that aren't in the project's own records.
// Entries marked `needsReview: true` show a "verify before relying on this" banner in the dashboard.

import type { logEntries, projects } from "./schema";

type NewProject = typeof projects.$inferInsert;
type NewLog = typeof logEntries.$inferInsert & { projectSlug?: string };

export const seedProjects: NewProject[] = [
  // ─── SYS-001 ────────────────────────────────────────────────────────────
  {
    slug: "vaakku-ai",
    code: "SYS-001",
    title: "Vaakku AI",
    tagline:
      "Malayalam-first, multi-tenant voice and chat agents that answer real phone calls and WhatsApp for businesses, built on Gemini Live.",
    summary:
      "A platform where each business gets AI agents that take phone calls and WhatsApp chats in Malayalam or English, check real data, book appointments and hand off to people. Built as a TypeScript modular monolith with row-level-security isolation, measured on live calls, and rehearsed for production.",
    role: "Architecture · backend & voice engine · AI evaluation and cost · security · production readiness",
    timeframe: "Since March 2026",
    stage: "ongoing",
    visibility: "published",
    featured: true,
    sortOrder: 1,
    domains: ["ai", "product", "integration", "security", "infrastructure"],
    stack: [
      "TypeScript",
      "Node.js",
      "Fastify",
      "Next.js",
      "PostgreSQL",
      "pgvector",
      "Redis",
      "BullMQ",
      "Gemini Live",
      "Voice AI",
      "AI agents",
      "Model evaluation",
      "Telephony",
      "WhatsApp Business",
      "Razorpay",
      "Tenant isolation",
      "Docker",
      "Caddy",
    ],
    coverage: {
      problem: "Phone agents that feel like a person, in Malayalam",
      architecture: "Modular monolith, three process roles, RLS-isolated data",
      build: "TypeScript backend, voice engine and dashboard",
      integrate: "Carriers, WhatsApp, payments and Gemini",
      automate: "Queued call summaries, billing, knowledge processing, webhooks",
      secure: "Tenant isolation, verified webhooks, AI spend limits, scanning",
      ship: "CI, rehearsed deploys and rollbacks, runbooks",
    },
    problem: `Callers don't experience compute. They experience silence. A business that puts an AI agent on its phone line needs it to behave like a person: answer quickly, stop when interrupted, speak Malayalam as naturally as English, and act on real data (check a calendar, book an appointment) without inventing facts.

The model sets a hard floor: about 1.3 seconds before its first word, and no application tuning moves that. On top of it, one platform has to serve many businesses, each with its own numbers, voice, knowledge and campaigns; keep every workspace's data apart; survive carrier and model outages; and keep the cost of every call under control.`,
    built: `- **Native audio, not a pipeline.** One speech-to-speech model (Gemini Live) instead of speech-to-text → LLM → text-to-speech removes two serialisation hops.
- **Engineering around the model's floor:** sessions pre-warmed while the carrier sets up the call (~350 ms saved), a cached opening line, a short spoken acknowledgement when the caller stops (~277 ms), filler during tool calls, and real barge-in.
- **One codebase, three roles.** A TypeScript modular monolith (Fastify, Node 24) runs as \`api\`, \`voice\` and \`worker\` processes, so dashboard traffic and PDF parsing can't stall the 20 ms audio loop.
- **Channels:** phone through carrier-independent codecs, WhatsApp, and a website widget, plus a Next.js dashboard with live call listening and take-over.
- **A chat agent** for WhatsApp and the web with calendar and booking tools, a consent guard and a model fallback chain.
- **An AI gateway** for everything that isn't live voice: per-task fallback chains, circuit breakers, versioned prompts and a usage-and-cost row per request.
- **Multi-tenant data:** Postgres 17 with row-level security, pgvector knowledge search scoped to each workspace, Redis for queues, call slots and pub/sub, and private per-workspace object storage.`,
    diagram: {
      layers: ["Channels", "Edge", "Process roles", "AI", "Data"],
      nodes: [
        { id: "phone", label: "Phone call", layer: 0, tech: "Carrier codecs", detail: "Calls arrive as signed carrier webhooks, then a media stream. The carrier's wire format is a codec, so the audio path doesn't depend on the carrier." },
        { id: "whatsapp", label: "WhatsApp", layer: 0, tech: "Meta webhooks", detail: "Messages are HMAC-verified and queued; a worker runs the chat agent." },
        { id: "widget", label: "Website widget", layer: 0, tech: "Chat · voice", detail: "Per-key rate limits, allowed origins and signed voice tickets." },
        { id: "dashboard", label: "Dashboard", layer: 0, tech: "Next.js · SSE", detail: "Rendered per request under a nonce CSP; changes are pushed over server-sent events." },
        { id: "caddy", label: "Caddy", layer: 1, tech: "TLS · routing", detail: "Routes telephony to voice servers, and sends a call's media stream back to the server that pre-warmed its session." },
        { id: "api", label: "api", layer: 2, tech: "Fastify · REST · SSE", detail: "Sign-in, dashboard data, provider webhooks, the widget API and the live-listen relay." },
        { id: "voice", label: "voice", layer: 2, tech: "A live session per call", detail: "Pre-warms the model, runs the 20 ms audio loop, and hands a call to the least-loaded peer when its event loop saturates." },
        { id: "worker", label: "worker", layer: 2, tech: "BullMQ jobs", detail: "Call summaries and billing, chat replies, knowledge processing and outgoing webhooks." },
        { id: "live", label: "Gemini Live", layer: 3, tech: "Speech to speech", detail: "Native-audio model over a hand-framed WebSocket. When it's down, a circuit breaker gives callers an apology and flags a call-back." },
        { id: "gateway", label: "AI gateway", layer: 3, tech: "Fallbacks · metering", detail: "Chat, summaries, embeddings and transcription, with per-task fallback chains, circuit breakers and a cost row per request." },
        { id: "pg", label: "Postgres + pgvector", layer: 4, tech: "Row-level security", detail: "58 RLS policies on 28 tables; the API role can't bypass them. Knowledge search is exact within one workspace." },
        { id: "redis", label: "Redis", layer: 4, tech: "Queues · pub/sub", detail: "BullMQ queues, cluster-wide call slots, rate limits and real-time fan-out." },
        { id: "storage", label: "Object storage", layer: 4, tech: "Per-workspace keys", detail: "Recordings and knowledge files under each workspace's prefix; every read is checked against the requesting workspace." },
      ],
      edges: [
        { from: "phone", to: "caddy" },
        { from: "whatsapp", to: "caddy" },
        { from: "widget", to: "caddy" },
        { from: "dashboard", to: "caddy" },
        { from: "caddy", to: "api" },
        { from: "caddy", to: "voice", label: "calls" },
        { from: "voice", to: "live", label: "audio" },
        { from: "worker", to: "gateway" },
        { from: "api", to: "pg" },
        { from: "voice", to: "redis" },
        { from: "worker", to: "storage" },
      ],
      caption: "Production shape: one image, three process roles, shared data services.",
    },
    decisions: [
      {
        title: "Speech to speech, then engineer around the floor",
        context: "A speech-to-text → LLM → text-to-speech pipeline has three hops and three places to stall. A native-audio model removes two of them, but its first word still takes ~1.3 s.",
        decision: "Use Gemini Live speech-to-speech, and fill the unavoidable pause the way a person does: pre-warmed sessions, a cached greeting, quick acknowledgements and filler during tool calls.",
        tradeoff: "The platform is tied to one model's behaviour and floor. The remaining latency lever is region co-location, not code.",
      },
      {
        title: "A modular monolith with three process roles",
        context: "Call audio is serviced on one event loop every 20 ms. Dashboard polling, chat replies and PDF parsing shared that loop: 600 open inboxes alone used 67% of it.",
        decision: "One image that runs as api, voice or worker, chosen at start-up. No microservices, no Kubernetes, no Kafka.",
        tradeoff: "Roles share a release cadence. Kubernetes becomes worth it beyond 3–4 voice servers per region, and the roles map one-to-one onto Deployments when it does.",
      },
      {
        title: "Isolation in the database, not just the code",
        context: "Many businesses share one deployment. A single missing org_id filter in application code would expose another workspace.",
        decision: "Row-level security on every workspace table. The API connects as a role without BYPASSRLS and switches to a tenant role per request; every migration checks that the API login can't bypass RLS.",
        tradeoff: "Webhooks, jobs and platform admins need a separate system role that finds its workspace from verified data.",
      },
      {
        title: "Exact vector search inside each workspace",
        context: "Knowledge belongs to one business and is small per workspace.",
        decision: "pgvector in Postgres: filter by workspace, then by distance. No separate vector database.",
        tradeoff: "It won't suit huge shared corpora; at today's sizes it measured 2.2 ms with 60/60 recall.",
      },
      {
        title: "Cost is a runtime guardrail",
        context: "92% of AI spend is the live call, and per-turn cost grows through a call: in a 100-turn probe the prompt grew from 3.1k to 22.2k tokens.",
        decision: "Meter every request and render in one ledger with dated prices; cap each call (₹150) and each workspace per day (₹10,000), limit tool loops, and alert on anomalies. Each limit degrades gracefully.",
        tradeoff: "A very long call ends with a polite wrap-up instead of running on.",
      },
    ],
    challenges: [
      {
        title: "Dashboard work stalled live calls",
        symptom: "One server handled ~125–140 calls, with 1.2–1.9 s audio stalls at call end.",
        investigation: "Measured the event loop: dashboard polling, chat replies, PDF parsing and recording encoding all ran on the loop that services call audio every 20 ms.",
        resolution: "Split into api / voice / worker roles and moved encoding to a worker thread: ~200 calls per server, stalls ≤ 27 ms, 0 failed calls across 1, 2 and 4 servers.",
      },
      {
        title: "A goodbye that didn't hang up",
        symptom: "On real calls in Malayalam the agent said goodbye but the line stayed open, once for ~62 s, until the silence watchdog closed it.",
        investigation: "The goodbye backstop read only the last sentence, and the Malayalam closing phrase the agent used wasn't in its list.",
        resolution: "Closing phrases added for Malayalam, Hindi, English and mixed speech; farewell words inside ordinary answers no longer hang up. Locked in with replayed call recordings and 21 closing / non-closing test lines; confirmation on a live call is pending.",
      },
      {
        title: "Provider drops left callers in silence",
        symptom: "During real-call testing the model provider dropped connections 6 times in 3 calls. Each reconnect 'succeeded', so the fallback never ran. One caller said hello 9 times to no reply.",
        investigation: "The fallback only fired on a failed reconnect, and the silence watchdog counted transcribed words, so with transcription down a talking caller looked silent.",
        resolution: "A stall check driven by audio energy, a limit of two resumes before the apology-and-call-back fallback, and a watchdog that counts speech rather than transcripts. Each is covered by a replay that fails with its guard switched off.",
      },
    ],
    security: `- **Tenant isolation:** row-level security on every workspace table: 58 policies on 28 tables. The API logs in as a role with no superuser or \`BYPASSRLS\` and switches to a tenant role per request, so a missing \`WHERE org_id\` still can't read another workspace. Integration tests try to cross workspaces and must fail.
- **Provider webhooks are verified before any work:** carrier HMAC signatures with nonce replay protection and one-time stream tickets; Meta and Razorpay HMACs; outgoing webhooks are signed.
- **AI spend abuse:** limits per call (15 minutes, ₹150), per tool loop, per workspace per day, per widget key and per server, each with a graceful outcome, plus spend and anomaly alerts.
- **Supply chain:** \`npm audit\` taken from 27 findings (3 critical) to 0; the container image scanned with Trivy at 0 high/critical with no exceptions; secret scanning over the full history.
- **Database connections** use TLS with certificate and host-name verification.`,
    testing: `- **274 backend tests** (195 unit, 79 integration on a fresh Postgres + pgvector), including 11 replays of recorded calls and AI-cost regression tests; browser tests; a voice load test that gates CI.
- **AI evaluation:** 64 chat cases across 8 languages (facts, grounding, tool use and arguments, refusals, hand-off): 63/64 on the production model. A Gemini Live A/B of the call prompt: 26/27, up from 19/27.
- **Real phone calls:** connection, greeting, Malayalam conversation, calendar and booking tools, barge-in, silence handling, recording, transcript and summary, verified end to end.
- **Deploys rehearsed** on the production layout: normal release, broken release, failed migration, rollback, crashes, Redis and AI outages. 48 of 48 long calls survived a full rolling deploy.
- **Still open, stated plainly:** the 8 kHz phone band degrades Malayalam recognition (a 16 kHz carrier is the next lever); business rules held only in prompt text can be overridden, so they're moving into a per-turn state machine; go-live waits on managed production infrastructure.`,
    outcomes: `| Measure | Result | How it was measured |
| --- | --- | --- |
| Caller hears an acknowledgement | **277 ms** ± 8 | 10 samples, live phone calls |
| Full reply after the caller stops | median **~1.45 s**, p95 ~4 s | 24 turns on real calls |
| Tool turn, with filler | **745 ms** (1,386 ms without) | live phone call |
| Latency from 1 to 25 concurrent calls | flat | load harness |
| Dropped audio frames | **0** | every live call |
| Calls per voice server | ~125–140 → **~200** | after the role split |
| Dashboard overview, 2,000 businesses | 106 s → **33 ms** | after indexing and caching |

Figures come from the project's own measurement records. The model's ~1.3 s time to first audio is the floor all of this works around.`,
    evidence: [],
    links: [],
    needsReview: true,
    publishedAt: new Date(),
  },

  // ─── SYS-002 ────────────────────────────────────────────────────────────
  {
    slug: "flowbitly",
    code: "SYS-002",
    title: "Flowbitly",
    tagline:
      "A multi-tenant workforce and project-operations platform: projects, tasks, review gates, time tracking, presence and team chat, with one isolated workspace per organisation.",
    summary:
      "A SaaS for teams that run projects with office admins and field workers. Each organisation gets its own workspace with admin and worker views, real-time chat and presence, attendance and an audit trail; a platform hub manages the organisations. Co-built; my work centred on the multi-tenant shell, tenant isolation, roles and real-time features.",
    role: "Co-developer: multi-tenant shell and workspace switching · tenant isolation · RBAC · real-time chat · worker dashboard",
    timeframe: "March to September 2026",
    stage: "in_progress",
    visibility: "published",
    featured: false,
    sortOrder: 2,
    domains: ["product", "security"],
    stack: ["Next.js", "TypeScript", "React", "Supabase", "PostgreSQL", "Realtime", "Tenant isolation", "PWA", "Docker"],
    coverage: {
      architecture: "Unified multi-tenant shell and workspace switching",
      build: "Admin and worker dashboards, task panels, activity log",
      secure: "Organisation-scoped RLS and hardened roles",
    },
    problem: `Teams that mix office admins and field workers end up running projects across chat groups, spreadsheets and calls. Nobody can see who is working, what is waiting for review, or where the time went.

A product that serves several organisations has a second problem: every organisation's projects, messages and people have to stay strictly apart, including for users who belong to more than one.`,
    built: `- **A unified multi-tenant shell** with a workspace switcher, so a person in several organisations moves between them without signing out.
- **Admin command centre:** projects and milestones, task detail panels, a review desk, attendance and time tracking, team performance and a global activity log.
- **Worker suite:** assigned tasks, a focused workspace view and a live task timer.
- **Real-time chat and presence** (channels and direct messages) on Supabase Realtime.
- **A platform hub** for managing organisations across the whole product.
- **Installable PWA** with desktop notifications.`,
    diagram: {
      layers: ["People", "Application", "Data"],
      nodes: [
        { id: "admin", label: "Org admin", layer: 0, tech: "Command centre", detail: "Projects, reviews, attendance, performance, team management." },
        { id: "worker", label: "Worker", layer: 0, tech: "Task board · timer", detail: "Assigned tasks, focused workspace, time tracking, chat." },
        { id: "platform", label: "Platform admin", layer: 0, tech: "SaaS hub", detail: "Creates and manages organisations." },
        { id: "shell", label: "Next.js app", layer: 1, tech: "Multi-tenant shell", detail: "One shell for every role; the workspace switcher and role checks decide what each person sees." },
        { id: "routes", label: "Route handlers", layer: 1, tech: "Team · billing", detail: "Server-side onboarding, team changes and organisation management." },
        { id: "pg", label: "Supabase Postgres", layer: 2, tech: "Organisation-scoped RLS", detail: "Policies scope projects, channels, messages and activity to the user's organisation." },
        { id: "rt", label: "Realtime", layer: 2, tech: "Chat · presence", detail: "Live messages, presence and updates across open sessions." },
      ],
      edges: [
        { from: "admin", to: "shell" },
        { from: "worker", to: "shell" },
        { from: "platform", to: "shell" },
        { from: "shell", to: "pg" },
        { from: "shell", to: "rt" },
        { from: "routes", to: "pg" },
      ],
      caption: "Every role works in one shell; the database decides what each organisation can read.",
    },
    decisions: [
      {
        title: "One shell, many workspaces",
        context: "People belong to more than one organisation, and separate apps per role would duplicate most of the interface.",
        decision: "A single multi-tenant shell with a workspace switcher; the user's role is resolved at sign-in and pinned to their session.",
        tradeoff: "Routing and role resolution become a single point that every view depends on, which is why that's where the security work concentrated.",
      },
      {
        title: "Organisation scoping in the database",
        context: "Filtering by organisation in the browser is a convenience, not a boundary.",
        decision: "Row-level security policies that scope projects, channels, messages and activity to the signed-in user's organisation; direct messages carry their organisation too.",
        tradeoff: "Policies and real-time subscriptions are more involved, and every new table needs a policy before it ships.",
      },
    ],
    challenges: [],
    security: `- **Cross-tenant lockdown:** organisation scoping added across the projects, activity, team and chat views, with row-level-security policies tying each row to the signed-in user's organisation.
- **Roles hardened** across platform admin, organisation admin and worker, with the role pinned to the session at sign-in.`,
    testing: "",
    outcomes: "",
    evidence: [],
    links: [],
    needsReview: true,
    publishedAt: new Date(),
  },

  // ─── SYS-003 ────────────────────────────────────────────────────────────
  {
    slug: "field-service-pwa",
    code: "SYS-003",
    title: "Field-service operations app",
    tagline:
      "An installable app for an air-conditioning business: installations and service jobs, dispatch, attendance, expenses, parts requests, team chat and invoices, for the office and for technicians in the field.",
    summary:
      "A Next.js and Supabase PWA used by an AC sales-and-service business. Admins plan and dispatch work; technicians see their jobs, complete them with photos, log attendance and expenses and request parts; finished work produces an invoice.",
    role: "Full build: data model, Supabase backend and row-level security, PWA, admin and technician apps",
    timeframe: "April to August 2026",
    stage: "ongoing",
    visibility: "published",
    featured: false,
    sortOrder: 3,
    domains: ["product", "automation"],
    stack: ["Next.js", "TypeScript", "React", "Supabase", "PostgreSQL", "Tenant isolation", "Realtime", "PWA", "Docker"],
    coverage: {
      architecture: "Supabase data model and role-based policies",
      build: "Admin and technician apps in one PWA",
      automate: "Dispatch, job completion and invoice generation",
      secure: "Row-level security on every table",
      ship: "Installable on Android and iPhone; Docker and Vercel setups",
    },
    problem: `A field-service business needs the office and its technicians on the same page: which installation or service job is next, who is on site, what was used and spent, and what to invoice.

The people using it are on phones, in the field, on both Android and iPhone, so it has to install like an app, feel native, and stay out of their way.`,
    built: `- **Admin side:** installations and service jobs, dispatch to technicians, worker management, parts requests, expense review, attendance and a leaderboard.
- **Technician side:** my tasks, job completion with photo upload, attendance, expenses and parts requests.
- **Team chat** in real time, with quick-reply chips that differ for admins and technicians.
- **Work history with invoice generation** as PDF.
- **An installable PWA** with iOS safe-area handling, full-screen mobile views and pull-to-refresh.
- **Row-level security** on every table, with technicians writing only their own records.`,
    diagram: {
      layers: ["People", "App", "Supabase"],
      nodes: [
        { id: "admin", label: "Office admin", layer: 0, tech: "Dispatch · review", detail: "Plans jobs, assigns technicians, reviews expenses and parts requests." },
        { id: "tech", label: "Technician", layer: 0, tech: "Phone, in the field", detail: "Sees assigned jobs, completes them with photos, logs time and spend." },
        { id: "pwa", label: "PWA", layer: 1, tech: "Next.js · installable", detail: "One app for both roles; role-based navigation and views." },
        { id: "pdf", label: "Invoices", layer: 1, tech: "PDF generation", detail: "Completed work turns into a downloadable invoice." },
        { id: "auth", label: "Auth", layer: 2, tech: "Roles in metadata", detail: "Role changes update the user's auth metadata." },
        { id: "db", label: "Postgres", layer: 2, tech: "RLS on 7 tables", detail: "Services, installations, attendance, expenses, parts requests, messages and profiles." },
        { id: "files", label: "Storage", layer: 2, tech: "Job photos", detail: "Photos uploaded when a technician completes a job." },
      ],
      edges: [
        { from: "admin", to: "pwa" },
        { from: "tech", to: "pwa" },
        { from: "pwa", to: "auth" },
        { from: "pwa", to: "db" },
        { from: "pwa", to: "files", label: "photos" },
        { from: "pwa", to: "pdf" },
      ],
      caption: "Two roles, one installable app, permissions enforced in the database.",
    },
    decisions: [
      {
        title: "A PWA, not two native apps",
        context: "Technicians carry both Android phones and iPhones, and the business needed one product it could afford to maintain.",
        decision: "An installable PWA with native-feeling navigation, safe-area handling for iPhones and full-screen mobile views.",
        tradeoff: "iOS treats PWAs differently: installation, safe areas and viewport height all needed deliberate work.",
      },
      {
        title: "Permissions live in the database",
        context: "Admins and technicians share the same app and the same tables.",
        decision: "Row-level security on every table: technicians insert only their own attendance, expenses and requests; admins manage jobs and approvals.",
        tradeoff: "Every workflow has to be designed with its policy. A missing policy shows up as a failed action, not a leak.",
      },
    ],
    challenges: [
      {
        title: "Job completion blocked by a policy",
        symptom: "Technicians couldn't mark a job complete.",
        investigation: "The update was being rejected by row-level security, which didn't yet allow that action for the technician role.",
        resolution: "The policy was corrected for completion, keeping technicians limited to their own work.",
      },
      {
        title: "Refreshing the dashboard raced the session",
        symptom: "A refresh could start loading data before the signed-in session was restored.",
        investigation: "Data requests weren't waiting for authentication to settle.",
        resolution: "Session gating: dashboard data loads only once authentication is confirmed.",
      },
    ],
    security: `- **Row-level security** enabled on every table, with role-based write policies: technicians write only their own attendance, expenses and parts requests; admins manage jobs and approvals.
- **Admin-only areas** such as workforce management are restricted to system admins in both the interface and the data layer.`,
    testing: "",
    outcomes: "",
    evidence: [],
    links: [],
    needsReview: true,
    publishedAt: new Date(),
  },

  // ─── SYS-004 ────────────────────────────────────────────────────────────
  {
    slug: "cakee",
    code: "SYS-004",
    title: "Cakee: bakery e-commerce",
    tagline:
      "A live online bakery store with OTP sign-in, Razorpay and cash-on-delivery checkout, distance-based delivery pricing, and a mobile operations hub for the kitchen.",
    summary:
      "A Laravel storefront and back office for a bakery: catalogue, address-aware checkout, verified online payments or cash on delivery, order notifications, and a mobile hub for stock, recurring tasks and walk-in orders.",
    role: "Full build: Laravel backend, storefront, checkout and payments, admin and operations PWA",
    timeframe: "June to October 2026",
    stage: "shipped",
    visibility: "published",
    featured: false,
    sortOrder: 4,
    domains: ["commerce", "product", "integration", "automation"],
    stack: ["Laravel", "PHP", "JavaScript", "Razorpay", "WhatsApp Business", "PWA", "Third-party APIs"],
    coverage: {
      build: "Storefront, checkout, admin and operations hub",
      integrate: "Razorpay, WhatsApp, email and geocoding",
      automate: "Order notifications and recurring kitchen tasks",
      ship: "Live at cakee.in",
    },
    problem: `A bakery selling made-to-order cakes needs orders to arrive complete: the right address and delivery slot, a fair delivery charge for the distance, and payment (online or on delivery) without the owner chasing customers on the phone.

Behind the counter, the same business needs to track stock, recurring tasks and orders taken in person.`,
    built: `- **Storefront and catalogue** with search, product pages and buy-now.
- **OTP sign-in** and a saved-address book with geocoding.
- **Distance-based delivery pricing:** free within 5 km, then priced slabs, then per kilometre, with a cap so a bad address can't produce an absurd fee.
- **Checkout** with Razorpay (order created and signature verified on the server) or cash on delivery behind a confirmation step; coupons; order history and cancellation.
- **Order notifications** by email and WhatsApp.
- **A mobile operations hub (PWA)** with recurring tasks, a stock manager and manual point-of-sale orders.
- **SEO groundwork:** structured data, meta tags and a sitemap.`,
    diagram: {
      layers: ["Customers & staff", "Laravel app", "Services"],
      nodes: [
        { id: "shopper", label: "Customer", layer: 0, tech: "Storefront", detail: "Browses, signs in with OTP, checks out." },
        { id: "staff", label: "Bakery staff", layer: 0, tech: "Operations PWA", detail: "Stock, recurring tasks and walk-in orders." },
        { id: "app", label: "Laravel", layer: 1, tech: "Controllers · services", detail: "Catalogue, addresses, delivery pricing, orders, coupons and admin." },
        { id: "pay", label: "Razorpay", layer: 2, tech: "Payments", detail: "Orders created server-side; payment signatures verified before an order is confirmed." },
        { id: "notify", label: "Notifications", layer: 2, tech: "Email · WhatsApp", detail: "Order notifications to the business." },
        { id: "geo", label: "Geocoding", layer: 2, tech: "Distance", detail: "Turns a saved address into a delivery distance and charge." },
      ],
      edges: [
        { from: "shopper", to: "app" },
        { from: "staff", to: "app" },
        { from: "app", to: "pay" },
        { from: "app", to: "notify" },
        { from: "app", to: "geo" },
      ],
      caption: "One Laravel application serving the shop and the kitchen.",
    },
    decisions: [
      {
        title: "Delivery priced by distance, with a ceiling",
        context: "A flat fee over-charges nearby customers and under-charges distant ones.",
        decision: "Geocode the delivery address and price by distance slabs, capping the charge.",
        tradeoff: "Pricing depends on geocoding quality, so the cap guards against bad lookups.",
      },
      {
        title: "Payment confirmed only on the server",
        context: "A browser saying “payment succeeded” proves nothing.",
        decision: "Create the Razorpay order on the server and verify the payment signature there before the order is confirmed.",
        tradeoff: "An extra round-trip at checkout.",
      },
    ],
    challenges: [
      {
        title: "Buttons firing twice after navigation",
        symptom: "After moving between pages, cart and buy-now actions could run more than once.",
        investigation: "Page scripts re-attached their listeners on every in-site (Swup) navigation.",
        resolution: "Binding guards on each element and scripts wrapped so they initialise once per page.",
      },
    ],
    security: "",
    testing: "",
    outcomes: "",
    evidence: [],
    links: [{ label: "cakee.in", url: "https://cakee.in", kind: "live" }],
    needsReview: true,
    publishedAt: new Date(),
  },

  // ─── SYS-005 ────────────────────────────────────────────────────────────
  {
    slug: "eusta",
    code: "SYS-005",
    title: "Eusta: multi-store catalogue SaaS",
    tagline:
      "Each business gets its own branded product catalogue and admin at its own address; a super-admin runs plans, subscriptions and accounts across all of them.",
    summary:
      "A Node.js and MySQL platform for businesses that want a professional online catalogue that collects enquiries, without running a full shop. Three surfaces: storefront, store admin and super-admin.",
    role: "Full build: Express API and MySQL schema, storefront, admin and super-admin panels, Hostinger deployment",
    timeframe: "July to August 2026",
    stage: "in_progress",
    visibility: "published",
    featured: false,
    sortOrder: 5,
    domains: ["product", "commerce"],
    stack: ["Node.js", "Express", "MySQL", "JavaScript", "REST APIs", "Hostinger"],
    coverage: {
      architecture: "Slug-based stores on one application",
      build: "Storefront, store admin and super-admin",
      ship: "Hostinger deployment with a database bootstrap",
    },
    problem: `Small businesses want a professional online catalogue that takes enquiries, not a full e-commerce store with carts and payments.

Offering that as a service means many stores on one platform, each with its own branding, products and admin, under one subscription model.`,
    built: `- **A store per business** at its own address, with its own admin.
- **Store admin:** categories and products, bulk import from XML or CSV, enquiries, theme customisation and a page editor.
- **Product-click analytics** for each store.
- **Super-admin:** accounts, subscription plans and subscriptions across every store.
- **An Express API on MySQL** with hashed passwords and signed session tokens.
- **Deployment guide and database bootstrap** for Hostinger.`,
    diagram: {
      layers: ["Surfaces", "API", "Data"],
      nodes: [
        { id: "store", label: "Storefront", layer: 0, tech: "Per-store address", detail: "Catalogue and enquiry forms, branded per business." },
        { id: "admin", label: "Store admin", layer: 0, tech: "Products · enquiries", detail: "Products, bulk import, enquiries, theme and pages." },
        { id: "super", label: "Super-admin", layer: 0, tech: "Plans · accounts", detail: "Subscription plans, subscriptions and users across stores." },
        { id: "api", label: "Express API", layer: 1, tech: "REST · signed tokens", detail: "One application serving every store." },
        { id: "db", label: "MySQL", layer: 2, tech: "9 tables", detail: "Users, categories, products, enquiries, plans, subscriptions, settings and analytics." },
      ],
      edges: [
        { from: "store", to: "api" },
        { from: "admin", to: "api" },
        { from: "super", to: "api" },
        { from: "api", to: "db" },
      ],
      caption: "Three surfaces over one API and database.",
    },
    decisions: [],
    challenges: [],
    security: "",
    testing: "",
    outcomes: "",
    evidence: [],
    links: [],
    needsReview: true,
    publishedAt: new Date(),
  },

  // ─── SYS-006 ────────────────────────────────────────────────────────────
  {
    slug: "rental-building-management",
    code: "SYS-006",
    title: "Rental building management",
    tagline:
      "Requirements and a bilingual English/Arabic prototype for a property manager running 24 buildings of shops and flats out of spreadsheets.",
    summary:
      "A requirements specification built from the client's own working spreadsheets, and a clickable bilingual prototype covering rent collection, cheques, expenses, maintenance certificates, invoices and reports.",
    role: "Requirements analysis (SRS) and front-end prototype",
    timeframe: "2026",
    stage: "in_progress",
    visibility: "published",
    featured: false,
    sortOrder: 6,
    domains: ["product", "automation"],
    stack: ["JavaScript", "Chart.js", "Arabic / RTL"],
    coverage: {
      problem: "Requirements derived from six working spreadsheets",
      architecture: "Data model and scope in a written SRS",
      build: "Bilingual clickable prototype",
    },
    problem: `A UAE property manager runs 24 buildings (commercial shops on the ground floor, flats above) from six separate Excel files. Post-dated cheques have no due or bounce alerts, cash deposits have no running balance, safety certificates are tracked as status text with no expiry dates, and there's no consolidated view of profit or tax.`,
    built: `- **A software requirements specification** derived from the six spreadsheets: buildings and units, tenant onboarding, contracts, cheque and cash collection, reminders, expenses, maintenance certificates, tax, invoices and reports.
- **A bilingual prototype** in English and Arabic, with right-to-left layout: dashboard, buildings, rent collection, cheque list, expenses, maintenance, invoices, a legal board and monthly reports.`,
    diagram: { layers: [], nodes: [], edges: [] },
    decisions: [
      {
        title: "Start from the spreadsheets people actually use",
        context: "The business's real process lived in six working Excel files with overlapping, inconsistent columns.",
        decision: "Analyse those files first and derive the data model and requirements from them, before designing screens.",
        tradeoff: "Slower to a first screen, but the prototype maps to how the business already works.",
      },
    ],
    challenges: [],
    security: "",
    testing: "",
    outcomes: "",
    evidence: [],
    links: [],
    needsReview: true,
    publishedAt: new Date(),
  },

  // ─── SYS-007 ────────────────────────────────────────────────────────────
  {
    slug: "portfolio-system",
    code: "SYS-007",
    title: "Portfolio & content system",
    tagline:
      "The site you're reading: prerendered pages, a private dashboard, and the same security discipline I'd apply to client work.",
    summary:
      "A Next.js and PostgreSQL system that serves prerendered pages, updates from a private dashboard without redeploys, and treats its own admin area as an attack target.",
    role: "Design · architecture · implementation · security",
    timeframe: "2026",
    stage: "shipped",
    visibility: "published",
    featured: false,
    sortOrder: 7,
    domains: ["product", "security", "infrastructure"],
    stack: ["Next.js", "React", "TypeScript", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "Docker", "Linux"],
    coverage: {
      problem: "A credibility layer that stays current",
      architecture: "Prerendered pages + a database-backed dashboard",
      build: "Next.js, TypeScript, PostgreSQL",
      secure: "Hardened admin, split CSP, rate limits",
      ship: "Docker and serverless deploy paths",
    },
    problem: `A freelance portfolio has two jobs that pull in opposite directions. It has to be fast, indexable and calm for visitors, and easy to keep current, so new work appears without touching code or redeploying.

It also carries a reputation. An engineer who audits other people's security can't run a careless admin panel.`,
    built: `- Public pages are **prerendered** and served as static HTML. Saving in the dashboard expires only the data that changed, so updates appear straight away.
- A **private dashboard** manages projects, lab entries, media, enquiries and availability.
- **Diagrams are data.** Every schematic on this site is rendered from nodes and edges stored in the database, with a plain-text outline for screen readers and small screens.
- A **structured brief form** replaces a bare contact box and lands in the dashboard inbox.`,
    diagram: {
      layers: ["Visitors", "Edge", "Application", "Data"],
      nodes: [
        { id: "visitor", label: "Visitor", layer: 0, tech: "Browser", detail: "Reads prerendered pages; sends a brief through the hire form." },
        { id: "owner", label: "Owner", layer: 0, tech: "Dashboard login", detail: "Password + optional TOTP. Sessions are database-backed and revocable." },
        { id: "static", label: "Static pages", layer: 1, tech: "Prerendered HTML", detail: "Public pages ship as static HTML with a static CSP." },
        { id: "proxy", label: "Proxy", layer: 1, tech: "Admin gate · CSP nonce", detail: "Fast redirect for signed-out admin requests, and a fresh CSP nonce per admin request." },
        { id: "app", label: "Next.js app", layer: 2, tech: "Server Components · Actions", detail: "Renders pages, runs dashboard actions, and verifies the session itself on every action." },
        { id: "db", label: "PostgreSQL", layer: 3, tech: "Content · media · sessions", detail: "Projects, lab entries, enquiries, re-encoded images, hashed session tokens and rate-limit counters." },
      ],
      edges: [
        { from: "visitor", to: "static" },
        { from: "owner", to: "proxy" },
        { from: "static", to: "app", label: "brief", dashed: true },
        { from: "proxy", to: "app" },
        { from: "app", to: "db" },
      ],
      caption: "Request paths for visitors and for the dashboard.",
    },
    decisions: [
      {
        title: "Prerender public pages; expire by tag",
        context: "Visitors should get static HTML. I should be able to publish without redeploying.",
        decision: "Cache every public data read under a tag (projects, lab, settings, media) and expire exactly those tags when the dashboard saves.",
        tradeoff: "The build needs database access, and caching has to be understood rather than assumed.",
      },
      {
        title: "Store media in PostgreSQL",
        context: "Uploads need a home that behaves the same on a VPS, in a container or on a serverless host.",
        decision: "Re-encode images on upload (WebP, metadata stripped) and store them in the database, served with immutable cache headers under a content hash.",
        tradeoff: "Not suited to large media: video is linked, not uploaded. At portfolio scale it's one less service to run and secure.",
      },
      {
        title: "Two Content-Security-Policies",
        context: "A nonce-based CSP needs every page rendered per request, which would throw away prerendering.",
        decision: "Public pages get a static policy: they load no third-party scripts and render no raw HTML. The admin area, where the session lives, renders per request under a nonce-based strict-dynamic policy.",
        tradeoff: "The public policy has to allow inline scripts. The risk is contained: no user-generated HTML and no auth state on those pages.",
      },
      {
        title: "Authorise at the data, not at the edge",
        context: "Middleware-only auth checks have been bypassed before (CVE-2025-29927).",
        decision: "The proxy gives a fast redirect, but every dashboard page, server action and route handler checks the session itself.",
        tradeoff: "A few repeated checks. Cheap insurance.",
      },
    ],
    challenges: [],
    security: `- **Login:** argon2id password hash, optional TOTP second factor, rate-limited per IP with a global backoff, and constant work whether or not the email matches.
- **Sessions:** random tokens stored only as SHA-256 hashes, so they can be revoked; HttpOnly, Secure, SameSite=Strict, \`__Host-\` cookie.
- **Uploads:** images only, decoded and re-encoded on the server, EXIF and GPS stripped, SVG refused.
- **Brief form:** schema validation, honeypot, signed minimum fill time, and per-IP rate limiting with salted hashes instead of stored IPs.
- **Headers:** CSP, HSTS, nosniff, \`frame-ancestors 'none'\`, strict referrer policy, permissions policy.`,
    testing: `- Unit tests for diagram layout, Markdown sanitisation, request signing, login and validation schemas.
- Keyboard-only and reduced-motion passes over the interactive pieces.
- Response headers checked on public and admin routes; admin actions replayed with forged sessions and refused.`,
    outcomes: "",
    evidence: [],
    links: [],
    needsReview: false,
    publishedAt: new Date(),
  },

  // ─── SYS-008 ────────────────────────────────────────────────────────────
  {
    slug: "web-application-security-assessments",
    code: "SYS-008",
    title: "Web application security assessments",
    tagline: "Penetration testing and vulnerability assessment of web applications, from reconnaissance to report.",
    summary: "",
    stage: null,
    visibility: "published",
    sortOrder: 8,
    domains: ["security"],
    stack: ["Penetration testing", "Burp Suite", "Nmap", "Gobuster", "Metasploit", "Nessus / OpenVAS", "Linux"],
    needsReview: true,
    publishedAt: new Date(),
  },
];

export const seedLog: NewLog[] = [
  {
    slug: "testing-voice-agents-on-real-phone-lines",
    code: "LOG-001",
    kind: "build_log",
    title: "What real phone calls found that tests didn't",
    summary:
      "Seven live calls against a Malayalam voice agent: the path worked end to end, and three defects only a real line could show.",
    body: `Unit tests, replays and load tests all passed before the first real call. Then the agent went on a phone line.

## The set-up

Outbound calls from the development backend to a verified mobile, in Malayalam, using the same audio path incoming calls take: a pre-warmed Gemini Live session, the 20 ms audio loop, tools against real tables, recording, transcript and post-call summary.

## What held

- Connection to media stream in **0.8 s**, with the model session already warm.
- Greeting released **0.25–0.27 s** after the stream started.
- Calendar checks in **2–3 ms**; a booking made only after the caller confirmed.
- Barge-in: agent audio stopped **24–345 ms** after the caller started talking.
- **0 dropped audio frames** on every call. Recording, transcript, summary and cost rows written by the worker within seconds.

## What only a real call showed

1. **A goodbye that didn't hang up.** In Malayalam the agent said goodbye, but the closing phrase wasn't in the backstop's list, and the backstop read only the last sentence. One line stayed open for ~62 s.
2. **Provider drops that left the caller in silence.** Six model disconnects in three calls. Each reconnect "succeeded", so the fallback never ran. And with transcription down, the silence watchdog took a talking caller for a silent one.
3. **An offer it couldn't keep.** The outbound prompt invited the agent to offer to send things on WhatsApp, which no tool on that call could do.

Speech recognition in mixed Malayalam and Hindi was also visibly weaker on the 8 kHz phone band.

## What changed

Each defect got a fix and a **replay of a recorded call that fails with the guard switched off**: wider closing-phrase detection across languages, a stall check driven by audio energy, a two-resume limit before an apology-and-call-back fallback, and a prompt and tool change so the agent never offers what it can't send. The call-prompt A/B moved from 19/27 to 26/27.

Confirmation on a live call is next; slow turns late in a call are still waiting to be re-measured on a billed key.`,
    tags: ["Voice AI", "Telephony", "Gemini", "Model evaluation"],
    visibility: "draft",
    needsReview: true,
    projectSlug: "vaakku-ai",
  },
  {
    slug: "web-application-assessment-workflow",
    code: "LOG-002",
    kind: "security",
    title: "My web application assessment workflow",
    summary: "",
    body: "[Draft. Write: how you scope an assessment, your recon → testing → reporting steps, and where each tool (Nmap, Gobuster, Burp Suite, Metasploit, Nessus/OpenVAS) fits.]",
    tags: ["Penetration testing", "Burp Suite", "Nmap", "Gobuster"],
    visibility: "draft",
    needsReview: true,
  },
  {
    slug: "evaluating-gemini-models-for-conversation",
    code: "LOG-003",
    kind: "experiment",
    title: "A 64-case evaluation for a multilingual booking agent",
    summary:
      "How the chat agent is graded across 8 languages, and why the first two runs measured rate limits, not quality.",
    body: `A booking agent can sound fluent and still be wrong: invent a price, book on "ok, let me think", or reply in English to a question in Malayalam. So it gets a test suite like any other code.

## What it covers

64 cases for two fictional businesses with fixed facts and prices, in 8 languages:

| Category | Cases | A correct reply… |
| --- | --- | --- |
| facts | 12 | states the business's own hours, prices, people |
| grounding | 8 | doesn't invent a price, discount or service; offers to check instead |
| tools | 8 | checks the calendar before saying a slot is free; books only on a clear yes |
| tool arguments | 6 | passes the right date ("day after", "next Monday") and 24-hour time |
| refusal | 6 | doesn't reveal its instructions, claim to be human, or say "confirmed" without booking |
| language | 8 | answers in the customer's script: Malayalam, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, English |
| multilingual | 5 | keeps Manglish and Hinglish in English letters; follows a switch mid-chat |
| context, continuity, hand-off | 11 | resolves "it" and "2 kg", doesn't book twice, hands refunds and medical questions to a person |

## How it runs

- **The real agent:** the production prompt, tools, consent guard and fallback chain.
- **A sandbox calendar** that answers with the real tools' result texts and writes nothing.
- **A fixed "today"** (always next Wednesday, 10:30 IST), so "tomorrow" is never the clinic's closed day and dates can be checked exactly.
- **Grading that tolerates wording:** required and forbidden patterns, the dominant script of the reply, which tools were called with which arguments ("4 pm" = "16:00"), and whether the chat was handed off.

## Results

| Run | Passed | What it actually measured |
| --- | --- | --- |
| 4 cases at a time | 50/64 | quota errors tripped the main model's circuit breaker; fallbacks were rate-limited too |
| 1 at a time | 60/64 | the three booking misses were all on fallback models |
| **1 at a time, one case every 13 s** | **63/64** | the production model answered every case; the run of record |

The first two runs were measuring the provider's rate limits, not the agent. Running serially was the only way to grade the model that production actually uses.

Agent turns, tool rounds included: **p50 1.46 s, p95 3.65 s**. The whole suite cost **₹4.86** at list price, about ₹0.08 a case.`,
    tags: ["Model evaluation", "Gemini", "Conversational AI", "AI agents"],
    visibility: "draft",
    needsReview: true,
    projectSlug: "vaakku-ai",
  },
  {
    slug: "where-the-money-goes-in-a-voice-ai-call",
    code: "LOG-004",
    kind: "note",
    title: "Where the money goes in a voice AI call",
    summary:
      "An audit of every Gemini request in a voice platform: calls are 92% of the cost, per-turn cost grows through a call, and four kinds of waste were hiding in plain sight.",
    body: `Before adding cost controls, I audited where the AI spend actually went.

## Calls are the cost

92% of the development ledger's AI spend was the live voice model. Inside a long call:

| Part of the bill | Share |
| --- | --- |
| Earlier audio, re-billed every turn | 43–52% |
| Instructions, tools and history, re-billed every turn | 31–38% |
| Speech the agent generates | 15–19% |

Real calls came to **₹4.5–5.8 a minute** at 2.5–4.5 minutes long.

## Per-turn cost grows

Context compression didn't engage within one connection at the production setting. In a 100-turn probe the prompt grew linearly from 3.1k to 22.2k tokens: turn 1 cost ₹0.40, 30 turns ₹32, 100 turns ₹251. Silence, at least, isn't billed: a 66-second mostly-silent call billed about 18 seconds of audio.

## Waste, found and removed

- duplicate call summaries on job retries;
- filler clips re-rendered on every call after a rejection;
- unchanged knowledge re-embedded;
- a tool declared on every call that could never work, re-billed every turn, and causing failed tool rounds.

## Accounting that wasn't there

Greeting, preview and filler renders weren't metered; some transcriptions weren't attributed to their workspace. Now every request, render and call lands in one ledger with dated prices, since several models change price on a known date.

## Guardrails

A per-call cap, tool-loop limits, stall detection, a per-workspace daily limit and anomaly alerts. Each is configurable, and each ends gracefully rather than mid-sentence. Quality held: chat evaluation 63/64 as before, and the call-prompt A/B improved from 19/27 to 26/27.`,
    tags: ["Gemini", "Voice AI", "Production readiness", "AI agents"],
    visibility: "draft",
    needsReview: true,
    projectSlug: "vaakku-ai",
  },
];
