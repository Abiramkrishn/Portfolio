# syntax=docker/dockerfile:1

# ── Dependencies ────────────────────────────────────────────────────────────
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── Migrations / seed (no build needed) ─────────────────────────────────────
FROM deps AS migrator
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
CMD ["npm", "run", "db:migrate"]

# ── Build ───────────────────────────────────────────────────────────────────
# Public pages are prerendered from the database, so the build must reach a migrated DB.
FROM deps AS build
ARG BUILD_DATABASE_URL
ARG SITE_URL=http://localhost:3000
ENV DATABASE_URL=$BUILD_DATABASE_URL \
    SITE_URL=$SITE_URL \
    BUILD_STANDALONE=1 \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/assets ./assets
USER app
EXPOSE 3000
CMD ["node", "server.js"]
