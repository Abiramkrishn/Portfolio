# Abiram Krishn — portfolio & content system

Personal site and private dashboard. Public pages are prerendered and served as static HTML; the dashboard at `/admin` edits projects, lab entries, media, enquiries and availability, and the public site updates immediately — no redeploy.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind CSS 4 · PostgreSQL + Drizzle ORM · Vitest.

---

## Run it locally

Requirements: Node 20.9+ (24 recommended), Docker (for Postgres).

```bash
npm install
cp .env.example .env                  # then fill in the admin block (next step)
npm run admin:setup -- you@example.com "a long passphrase" --totp   # prints values for .env
docker compose up -d db               # Postgres on 127.0.0.1:5433
npm run db:migrate
npm run db:seed                       # initial content (safe to re-run)
npm run dev                           # http://localhost:3000  ·  dashboard: /admin
```

`--totp` is optional; it prints an `otpauth://` URI to add to your authenticator app. Without it, login is email + password only.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server (build needs a reachable, migrated database) |
| `npm test` | Unit tests (diagram layout, Markdown sanitising, request signing, validation) |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run db:generate` | New SQL migration after editing `src/db/schema.ts` |
| `npm run db:migrate` · `npm run db:seed` | Apply migrations · seed initial content |
| `npm run db:studio` | Browse the database |
| `npm run admin:setup` | Generate admin credentials |

---

## Where content lives

| Changes often → **dashboard** (database) | Changes rarely → **code** (`src/content/`) |
| --- | --- |
| Projects (system files), upcoming work | Hero, “problems I take on”, method, principles |
| Lab entries (build logs, security, experiments, notes) | Engagement types, FAQ, about text |
| Media (screenshots) | Tool taxonomy (`taxonomy.ts`) and the hero trace (`traces.ts`) |
| Availability, contact links, “Now”, notifications | |

### Using the dashboard

- **Add upcoming work:** Overview → *Add upcoming work*. A title, tagline and domain are enough; it appears under “In the workshop” on the homepage and `/work` straight away.
- **Turn it into a case study:** change the stage and write the *Problem* section — a project gets its own page at `/work/<slug>` once Problem has content. Every other section (diagram, decisions, field notes, break test, testing, outcomes, evidence) is hidden publicly until it has content, so nothing appears half-finished.
- **Diagrams are data:** add layers (columns) and components, then connections. The live preview is exactly what the public page renders; screen readers and small screens get the same information as an outline.
- **Evidence:** upload screenshots in *Media* (alt text required), then attach them to a project.
- **Stack tags that match the taxonomy** (e.g. “Laravel”, “Burp Suite”) automatically link the project as evidence on the stack map.
- **Preview** shows drafts on the real page (Draft Mode); visitors never see them.
- **Needs review** is an internal flag. Seeded content has it — see *Before you go live*.

---

## Deploy

The build prerenders public pages from the database, so **migrate before you build**, and give the build a `DATABASE_URL`.

### Option A — Vercel + Neon (least maintenance)

Vercel can't reach the Docker database on your computer, so the site needs a hosted one. **Don't import your local `.env` into Vercel**: its `DATABASE_URL` points to localhost and its admin login is the local one.

1. **Environment variables:** in Vercel → Project → Settings → Environment Variables, delete any `DATABASE_URL`, `DATABASE_PREPARE`, `SITE_URL`, `ADMIN_*` and `AUTH_SECRET` copied from a local `.env`.
2. **Database:** Project → Storage → Create Database → **Neon** (Serverless Postgres) → create, then connect it to the project for all environments. It adds `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED` (direct) for you. Poolers are detected automatically, so `DATABASE_PREPARE` isn't needed.
3. **Admin login:** on your computer run `npm run admin:setup -- your@email.com "a new long passphrase" --totp` and add `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH_B64`, `AUTH_SECRET` and `ADMIN_TOTP_SECRET` to Vercel. Use a passphrase you have never used locally. A live site refuses an `@example.com` admin email.
4. **Email (optional):** add the six `SMTP_*` / `NOTIFY_EMAIL` values from *Get briefs in Gmail* below.
5. **Domain:** add `SITE_URL=https://your-domain` once you have one. Until then the site uses its `*.vercel.app` address.
6. **Redeploy** (Deployments → ⋯ → Redeploy). `npm run vercel-build` applies migrations, seeds the initial content on the first deploy only (`db:seed --bootstrap`), then builds.

On Vercel, image uploads are limited to 4 MB (the platform caps request bodies at 4.5 MB).

### Option B — VPS with Docker (Hostinger VPS or any Linux host)

```bash
export POSTGRES_PASSWORD='a-strong-password'
export BUILD_DATABASE_URL="postgres://portfolio:${POSTGRES_PASSWORD}@127.0.0.1:5433/portfolio"
export SITE_URL=https://your-domain
# .env must contain the admin block (ADMIN_*, AUTH_SECRET) and SITE_URL
docker compose up -d db
docker compose --profile app run --rm migrate
docker compose --profile app run --rm migrate npm run db:seed
docker compose --profile app up -d --build app     # serves on 127.0.0.1:3000
```

Put a TLS-terminating reverse proxy in front (Caddy is the shortest path: `your-domain { reverse_proxy 127.0.0.1:3000 }`). It must forward `X-Forwarded-For` (used for rate limiting) and the public host. Both Postgres and the app bind to loopback only. Back up the `pgdata` volume — it holds content *and* uploaded images.

> The production CSP includes `upgrade-insecure-requests`, so a production build served over plain `http://` (e.g. `npm start` on localhost) will try to load some admin assets over https. Serve production over HTTPS.

---

## Get briefs in Gmail

Every brief is saved to the dashboard inbox. To also receive each one as an email (pressing Reply in Gmail answers the client directly):

1. Turn on **2-Step Verification** for your Google account.
2. Create an **App Password** at https://myaccount.google.com/apppasswords (name it "Portfolio"). Google shows 16 characters.
3. Paste it into `.env` after `SMTP_PASS=` (spaces are fine). The other values are already set for Gmail: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, and `SMTP_USER`, `SMTP_FROM`, `NOTIFY_EMAIL` set to your address.
4. Restart the server, then open **Dashboard → Settings → Send test email**. If it fails, it says why (for example, the App Password was rejected).
5. In production, add the same six values (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL`) to your host's environment variables (Vercel project settings, or `.env` on the VPS) and redeploy.

The App Password is a secret: it stays out of git (`.env` is ignored), and you can revoke it in your Google account at any time. The "Email me when a brief arrives" switch in Settings turns notifications off without removing the configuration.

---

## Security model

- **Admin auth** — argon2id password hash (stored base64 in env so `$` survives `.env` expansion), optional TOTP, same work whether or not the email matches.
- **Sessions** — 32 random bytes in a `__Host-` cookie (HttpOnly, Secure, SameSite=Strict, 7 days); only the SHA-256 is stored, so sessions are revocable (*Overview → Sign out everywhere*).
- **Authorisation** — `src/proxy.ts` only does a fast redirect. Every dashboard page, server action and route handler calls `requireAdmin()` itself; replaying an admin action with a forged cookie is refused.
- **Rate limits** — in Postgres (works on serverless and VPS): login 5/15 min per IP + a global ceiling; brief form 5/hour per IP. IPs are stored only as salted HMACs.
- **Brief form** — schema validation, honeypot, signed minimum fill time.
- **Uploads** — decoded and re-encoded with sharp (WebP, ≤2400px), metadata/EXIF/GPS stripped, SVG refused; served from `/media/<content-hash>` with `nosniff` and a sandbox CSP.
- **CSP** — public pages: a static policy (no third-party scripts, Markdown rendered without raw HTML). `/admin`: per-request nonce with `strict-dynamic`. Plus HSTS, `frame-ancestors 'none'`, nosniff, strict referrer and permissions policies.

---

## Before you go live

1. **Use new admin credentials in production.** Generate them with `npm run admin:setup` and never reuse the local login. A live deployment refuses an `@example.com` admin email.
2. **Settings:** email, LinkedIn, GitHub, WhatsApp, location/time zone, reply-time promise.
3. **Verify seeded content** (flagged *Review* in the dashboard). Projects SYS-001–006 were written from your own repositories (READMEs, architecture/security/evaluation docs, commit history) — confirm each is accurate and that you're happy to disclose it publicly, add screenshots and links, then clear the flag. Clients are described, not named, except Cakee (linked to its live site) — confirm you may show it. Lab entries LOG-001, 003 and 004 are complete drafts from the Vaakku docs; publish them when you're ready. LOG-002 is a skeleton.
4. Set `SITE_URL` to the real domain (canonical URLs, sitemap, Open Graph).

## Project layout

```
src/app/(site)/      public pages (root layout, home, work, lab, about, hire)
src/app/admin/       dashboard (own root layout; per-request rendering + nonce CSP)
src/app/media/       uploaded image delivery       src/proxy.ts   admin gate + CSP nonce
src/components/      schematic/ (trace hero, diagrams, coverage strip), home/, work/, admin/, ui/
src/content/         copy, taxonomy, hero traces    src/db/        schema, queries, migrations, seed
src/lib/             auth, validation, rate limiting, media, SEO, schematic geometry
```
