# IndiGate — Source Code Download

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ or Bun
- SQLite (included — no external DB needed for dev)

### 2. Install dependencies
```bash
bun install
# or: npm install
```

### 3. Set up environment variables
Create a `.env` file:
```
DATABASE_URL="file:./db/custom.db"
SESSION_SECRET="your-random-secret-here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional (for production features):
# NEXT_PUBLIC_SUPABASE_URL=
# SUPABASE_SERVICE_KEY=
# SUPABASE_STORAGE_BUCKET=indigate-uploads
# RESEND_API_KEY=
# EMAIL_FROM=IndiGate <noreply@indigate.work>
# ADMIN_EMAIL=admin@indigate.work
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

### 4. Set up the database
```bash
bun run db:push      # Create SQLite database + tables
bunx tsx prisma/seed.ts  # Seed demo data (admin, companies, jobs, candidates)
```

### 5. Download the Japanese font (for resume PDF export)
```bash
mkdir -p public/fonts
curl -sL "https://github.com/notofonts/noto-cjk/raw/main/google-fonts/NotoSansJP%5Bwght%5D.ttf" -o public/fonts/NotoSansJP.ttf
```

### 6. Start the dev server
```bash
bun run dev
# or: npm run dev
```

Open http://localhost:3000

### 7. Lint
```bash
bun run lint
```

## Demo Accounts
- **Candidate**: arjun@example.com / candidate123
- **Company**: hr@technova.jp / company123
- **Admin**: admin@indigate.work / admin123

## Tech Stack
- Next.js 16 (App Router, Turbopack)
- TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Prisma ORM (SQLite)
- Framer Motion
- Zustand
- Zod + React Hook Form
- Sonner (toasts)
- @react-pdf/renderer (resume PDF export)
- otpauth (TOTP 2FA)
- Resend (email — optional)

## Architecture
This is a **single-page app**. All views render at `/` via Zustand store navigation.
- `src/lib/store.ts` — Zustand store (auth, navigation, tabs, locale)
- `src/lib/auth.ts` — HMAC-signed cookie sessions
- `src/lib/i18n.ts` — EN + JA translations
- `src/lib/email.ts` — Email templates (Resend)
- `src/lib/totp.ts` — Real RFC 6238 TOTP (Google Authenticator)
- `src/lib/supabase.ts` — File storage (Supabase or local fallback)

## Key Features
- Bilingual EN/JA platform
- Candidate portal (profile, resume builder, PDF export, applications, saved jobs)
- Company portal (post jobs, manage applicants, interview scheduling, talent search, analytics)
- Admin panel (full CRUD for jobs/testimonials/contacts, company approvals, CSV export)
- Real TOTP 2FA (Google Authenticator)
- Google OAuth (needs credentials)
- Email system (Resend)
- File uploads (Supabase Storage or local)
- Job view tracking + analytics
- Visa Guide + FAQ sections
- SEO (sitemap, robots, OG image, security headers, rate limiting)
