# Multi-stage Dockerfile for IndiGate (Next.js standalone output)
# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM oven/bun:1.1 AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source + prisma
COPY . .

# Generate Prisma client + build
ENV DATABASE_URL="file:/app/db/prod.db"
ENV NEXT_PUBLIC_APP_URL="https://indigate.work"
RUN bun run db:generate
RUN bun run build

# ---- Runtime stage ----
FROM oven/bun:1.1 AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone server + static assets + public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma

# Health check via the readiness endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

EXPOSE 3000

# Apply DB schema on boot, then start the server
CMD ["sh", "-c", "bun run db:push && bun server.js"]
