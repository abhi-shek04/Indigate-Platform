# IndiGate — Production Deployment Guide

This document covers everything needed to deploy IndiGate to production.

## Prerequisites

- **Runtime**: Node.js 20+ or Bun 1.1+
- **Database**: PostgreSQL 14+ recommended for production (SQLite works for single-instance dev)
- **Email**: [Resend](https://resend.com) account for transactional email
- **File storage**: [Supabase](https://supabase.com) project for resume/logo uploads

## Environment Variables

Copy `.env.example` to `.env` and fill in real values. See `.env.example` for full documentation.

### Required in production

| Variable | Purpose | How to generate |
|---|---|---|
| `DATABASE_URL` | Database connection | `postgresql://user:pass@host:5432/indigate?schema=public` |
| `SESSION_SECRET` | HMAC signing secret | `openssl rand -base64 32` |

### Optional (with graceful fallback)

| Variable | Fallback if unset |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://indigate.work` |
| `RESEND_API_KEY` | Emails logged to console (dev only) |
| `EMAIL_FROM` | `IndiGate <noreply@indigate.work>` |
| `ADMIN_EMAIL` | Admin notifications sent to all ADMIN-role users via DB query |
| `NEXT_PUBLIC_SUPABASE_URL` | File uploads return 503 |
| `SUPABASE_SERVICE_KEY` | File uploads return 503 |
| `SUPABASE_STORAGE_BUCKET` | `indigate-uploads` |

## Health & Readiness

- **`GET /api/health`** — liveness probe (no DB call, returns 200 + timestamp)
- **`GET /api/ready`** — readiness probe (validates env + pings DB, returns 200 or 503)

Use these for Kubernetes liveness/readiness probes, load balancer health checks, or deployment smoke tests.

## Database Setup

### SQLite (development / single-instance)
```bash
bun run db:push    # create tables + indexes
bun run db:generate # regenerate Prisma client
```

### PostgreSQL (production)
1. Set `DATABASE_URL` to your PostgreSQL connection string
2. Run `bun run db:push` to create tables + indexes
3. Seed initial admin + demo data: `bun run prisma:db seed` (optional)

### Migration to PostgreSQL
See `MIGRATION-G.md` for the full SQLite → PostgreSQL migration guide. The schema is compatible — only the connection string changes.

## Deployment Options

### Option 1: Docker (recommended)
```bash
# Build
docker build -t indigate .

# Run (mount a volume for the SQLite DB if not using PostgreSQL)
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e SESSION_SECRET="..." \
  -e RESEND_API_KEY="..." \
  -e NEXT_PUBLIC_SUPABASE_URL="..." \
  -e SUPABASE_SERVICE_KEY="..." \
  indigate
```

The Dockerfile:
- Uses multi-stage build (small final image)
- Applies DB schema on boot (`bun run db:push`)
- Includes `HEALTHCHECK` via `/api/health`

### Option 2: Vercel
```bash
vercel
```
Set all environment variables in the Vercel dashboard. Note: Vercel serverless functions don't support the in-memory rate limiter — each invocation has its own memory. For production rate limiting on Vercel, use [Upstash Ratelimit](https://upstash.com/blog/ratelimit) (Redis-based).

### Option 3: Bare metal / VPS
```bash
bun install
bun run db:push
bun run db:generate
bun run build
bun run start    # starts the standalone server
```
Use a process manager (PM2, systemd) to keep the app running and restart on crash.

## CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:
1. **Quality job**: install → prisma generate → tsc → eslint
2. **Build job**: install → prisma generate → `next build`

Both must pass before merge. The workflow uses Bun for speed.

## Security Notes

- **Cookies**: `indigate_session` is httpOnly + sameSite=lax + signed (HMAC SHA-256). `secure` flag auto-enabled in production.
- **Session expiry**: 7 days (validated server-side via `iat` claim).
- **Rate limiting**: In-memory per-instance. Login: 10/15min, Register: 5/hour, Reset: 3/hour, Verify: 5/15min. For multi-instance deployments, replace with Redis-based rate limiting.
- **CSP**: Content-Security-Policy header is set via `next.config.ts`. Note: `script-src` currently allows `'unsafe-eval'` (required by some Next.js dev tooling); review tightening this for strict CSP.
- **Security headers**: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo disabled).

## Backup & Restore

### SQLite
```bash
# Backup (safe hot copy)
sqlite3 db/custom.db ".backup db/backup-$(date +%Y%m%d).db"

# Restore
cp db/backup-YYYYMMDD.db db/custom.db
bun run db:generate
```

### PostgreSQL
```bash
# Backup
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d).sql

# Restore
psql "$DATABASE_URL" < backup-YYYYMMDD.sql
```

Schedule daily backups via cron or your cloud provider's managed backup feature.

## Monitoring Checklist

- [ ] `/api/health` returns 200 (process alive)
- [ ] `/api/ready` returns 200 (DB reachable + env valid)
- [ ] Application logs (stdout) captured by your log aggregator
- [ ] Error rate alerting on 5xx responses
- [ ] Database connection pool monitoring
- [ ] Disk space monitoring (for SQLite + logs)
- [ ] Uptime monitoring on the public URL

## Operational Notes

- **Logs**: Application logs to stdout/stderr. In production, verification codes and reset tokens are NOT logged. In development, they are logged for convenience.
- **Email**: Fire-and-forget. If Resend is unreachable, emails are logged but the operation succeeds. No request is blocked on email delivery.
- **File uploads**: If Supabase is not configured, the upload endpoint returns 503. The rest of the app works normally.
- **Graceful degradation**: The app starts and serves traffic even if email/storage are not configured. Only the database is a hard dependency.
