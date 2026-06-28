# Milestone G — PostgreSQL Migration Guide

This document explains how to migrate IndiGate from SQLite to PostgreSQL on
Supabase. The schema is already compatible — no code changes are needed,
only environment configuration.

## Why migrate?

SQLite is in-process and can't scale beyond a single server. For Vercel's
serverless architecture, PostgreSQL on Supabase is the production target.

## Current state

- **Active DB**: SQLite (`db/custom.db`)
- **Schema**: `prisma/schema.prisma` — uses JSON strings for arrays, plain
  strings for enums. This works identically on both SQLite and PostgreSQL.
- **No code changes needed** — all `JSON.parse()` / `JSON.stringify()` calls
  work on both databases.

## Steps to migrate

### 1. Create a Supabase project
- Go to https://supabase.com → New Project
- Note your project URL and database password

### 2. Get connection strings
In Supabase Dashboard → Settings → Database → Connection strings:
- **Transaction mode URL** (port 6543) → `DATABASE_URL`
- **Direct URL** (port 5432) → `DIRECT_URL`

### 3. Update `.env`
```env
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

### 4. Update `prisma/schema.prisma`
Change the datasource block:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 5. Push schema + seed
```bash
bun run db:push    # Creates all tables on Postgres
bunx tsx prisma/seed.ts  # Seeds demo data
```

### 6. Set up Supabase Storage (for file uploads)
- Create a bucket called `indigate-uploads` (public read, authenticated write)
- Add to `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=indigate-uploads
```

### 7. Set up Resend (for emails)
- Create account at https://resend.com
- Verify your domain (`indigate.work`)
- Add to `.env`:
```env
RESEND_API_KEY=re_xxxx
EMAIL_FROM=IndiGate <noreply@indigate.work>
ADMIN_EMAIL=admin@indigate.work
```

### 8. Deploy to Vercel
- Set all env vars in Vercel dashboard
- `bun run build && vercel --prod`

## Optional: Native Postgres arrays/enums

If you want to upgrade from JSON-string arrays to native Postgres arrays:

1. Change in schema:
   - `CandidateProfile.skills`: `String @default("[]")` → `String[] @default([])`
   - `CandidateProfile.savedJobIds`: `String @default("[]")` → `String[] @default([])`
   - `Job.skillsRequired`: `String @default("[]")` → `String[] @default([])`

2. Add native enums:
   ```prisma
   enum Role { CANDIDATE COMPANY ADMIN }
   enum JLPTLevel { N1 N2 N3 N4 N5 NONE }
   enum JobType { FULL_TIME PART_TIME INTERNSHIP CONTRACT }
   enum SalaryType { HOURLY MONTHLY YEARLY }
   enum ApplicationStatus { APPLIED SHORTLISTED INTERVIEWED OFFERED REJECTED WITHDRAWN }
   ```

3. Update all `String` enum fields to use the enum types.

4. Remove `JSON.parse()` / `JSON.stringify()` for array fields in:
   - `src/lib/api.ts` (toCandidateDTO, toJobDTO mappers)
   - All API routes that read/write these fields

5. Replace SQLite `LIKE` filters with Postgres array containment:
   - `{ skills: { hasSome: skillsArray } }`

**Note**: This is optional. The JSON-string approach works perfectly on
Postgres and requires zero code changes. Only do this if you want type safety
at the database level.
