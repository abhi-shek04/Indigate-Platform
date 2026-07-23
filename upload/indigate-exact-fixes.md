# IndiGate — Exact Fix Prompts
### Copy-paste these into Cursor / Claude Code / Windsurf
> Do them in order. Each one takes 5–15 minutes.

---

## FIX 1 — Create the upload route (MOST IMPORTANT)
**Paste this entire prompt into your AI coding tool:**

```
In my IndiGate Next.js project, I need you to create ONE new file.

The file path is: src/app/api/upload/route.ts

This is a Next.js App Router API route that handles file uploads to Supabase Storage.
The Supabase client already exists at src/lib/supabase.ts — use it, don't recreate it.
The auth helpers already exist at src/lib/auth.ts — use getSession(), don't change it.
The Prisma client already exists at src/lib/db.ts — use it, don't change it.

Here is the exact code to put in that file:

import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSupabase, SUPABASE_BUCKET } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await req.formData()
    const file = form.get("file") as File | null
    const kind = form.get("kind") as string | null

    if (!file || !kind) {
      return NextResponse.json({ error: "Missing file or kind" }, { status: 400 })
    }

    // Validate by kind
    if (kind === "resume") {
      if (!file.name.endsWith(".pdf") && file.type !== "application/pdf") {
        return NextResponse.json({ error: "Resume must be a PDF" }, { status: 400 })
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 })
      }
      if (session.role !== "CANDIDATE") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    if (kind === "logo") {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Logo must be an image" }, { status: 400 })
      }
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 })
      }
      if (session.role !== "COMPANY") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    const ext = file.name.split(".").pop() ?? "bin"
    const path = `${kind}s/${session.id}/${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json(
        { error: "Storage not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY to .env" },
        { status: 503 }
      )
    }

    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: pubData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(path)

    const url = pubData.publicUrl

    // Save the URL back to the database
    if (kind === "resume") {
      await db.candidateProfile.update({
        where: { userId: session.id },
        data: { resumeUrl: url, resumeName: file.name },
      })
    } else if (kind === "logo") {
      await db.companyProfile.update({
        where: { userId: session.id },
        data: { logoUrl: url },
      })
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error("[UPLOAD ERROR]", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

Create this file exactly as written above. Do not modify any other files.
Do not change src/lib/supabase.ts, src/lib/auth.ts, or src/lib/db.ts.
Just create the one new file.
```

---

## FIX 2 — Delete the broken download route
**Paste this prompt into your AI coding tool:**

```
In my IndiGate Next.js project, delete this file:
src/app/api/download/route.ts

It reads from a folder that doesn't exist in the project and always returns 404.
It was a leftover from the build environment and is not needed.

Just delete that one file. Do not change anything else.
```

---

## FIX 3 — Remove unused packages
**Run these commands yourself in your terminal** (not an AI prompt — just run them):

```bash
npm uninstall next-auth
npm uninstall z-ai-web-dev-sdk
```

Why:
- `next-auth` is in your package.json but your app uses custom auth (src/lib/auth.ts). next-auth is never imported anywhere.
- `z-ai-web-dev-sdk` is the Z.ai build environment tool. It does not belong in your app.

---

## FIX 4 — Fix tsconfig.json
**Paste this prompt into your AI coding tool:**

```
In my IndiGate project, open tsconfig.json and make ONE change:

Find this line:
"noImplicitAny": false

Change it to:
"noImplicitAny": true

Or simply delete that line entirely — the "strict": true setting already
includes noImplicitAny: true, so the false value was overriding strict mode
and hiding type errors.

After making this change, run: npx tsc --noEmit
If there are TypeScript errors, fix them one by one.
Common errors will be in the API route files where variables are typed as
Record<string, unknown> — change these to proper Prisma where clause types.

Do not change any other settings in tsconfig.json.
```

---

## FIX 5 — Fill in your .env file
**Do this yourself** — these are secret keys, don't paste them into an AI:

Open your `.env` file and add these lines:

```env
DATABASE_URL="file:./db/custom.db"

# REQUIRED — generate this with: openssl rand -base64 32
SESSION_SECRET="paste-your-generated-secret-here"

# REQUIRED for the app to know its own URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# REQUIRED for file uploads (get from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGci..."
SUPABASE_STORAGE_BUCKET="indigate-uploads"

# REQUIRED for emails (get from resend.com)
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="IndiGate <noreply@indigate.work>"
ADMIN_EMAIL="admin@indigate.work"
```

**How to get each value:**

`SESSION_SECRET` — Open your terminal and run:
```bash
openssl rand -base64 32
```
Copy the output and paste it as the SESSION_SECRET value.

`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_KEY`:
1. Go to supabase.com → your project
2. Click Settings → API
3. Copy "Project URL" → that's NEXT_PUBLIC_SUPABASE_URL
4. Copy "service_role" key (NOT anon key) → that's SUPABASE_SERVICE_KEY

`RESEND_API_KEY`:
1. Go to resend.com → sign up free
2. Go to API Keys → Create API Key
3. Copy it → that's RESEND_API_KEY

---

## MANUAL STEP 1 — Create Supabase storage bucket
**Do this in the Supabase dashboard (5 minutes):**

1. Go to supabase.com → your project
2. Click "Storage" in the left sidebar
3. Click "New bucket"
4. Name: `indigate-uploads`
5. Toggle "Public bucket" to ON
6. Click "Create bucket"

That's it. Your upload route will now be able to store files there.

---

## MANUAL STEP 2 — Set up Resend domain (before going live)
**Do this when you're ready to send real emails:**

1. Go to resend.com → Domains → Add Domain
2. Type: `indigate.work`
3. Resend will show you 3-4 DNS records to add
4. Go to wherever you manage your domain's DNS (GoDaddy, Namecheap, Cloudflare, etc.)
5. Add each DNS record exactly as Resend shows
6. Click "Verify" in Resend
7. Wait 5-10 minutes for DNS to propagate

After this, emails from `noreply@indigate.work` will be delivered properly and won't go to spam.

---

## BEFORE GOING LIVE — PostgreSQL migration
**Paste this prompt into your AI coding tool when ready to deploy:**

```
I need to migrate my IndiGate project from SQLite to PostgreSQL on Supabase.
My current database is SQLite defined in prisma/schema.prisma.
Vercel's serverless environment cannot use SQLite (read-only filesystem).

Here is what I need you to do:

STEP 1: Update prisma/schema.prisma
Change the datasource block from:
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }

To:
  datasource db {
    provider  = "postgresql"
    url       = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }

STEP 2: The schema has these fields that use JSON strings because SQLite
doesn't support arrays. Now that we're on PostgreSQL, keep them as String
for now (we can migrate to native arrays later). Do NOT change the field types.
These fields stay as String:
- CandidateProfile.skills (String @default("[]"))
- CandidateProfile.savedJobIds (String @default("[]"))
- Job.skillsRequired (String @default("[]"))

STEP 3: Add these two environment variables to .env
(I will fill in the actual values from my Supabase dashboard):
DATABASE_URL="postgresql://postgres.xxx:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"

STEP 4: After I update .env with the real Supabase URLs, run these commands:
npx prisma generate
npx prisma db push

STEP 5: Update prisma/seed.ts so that the production seed ONLY creates the
admin account. Comment out all the fake company and candidate data.
We don't want fake demo data in production.

Make only these changes. Do not modify any API routes or components.
```

**How to get the PostgreSQL URLs from Supabase:**
1. Go to Supabase → your project → Settings → Database
2. Scroll to "Connection string"
3. Select "Transaction" mode — copy that URL → paste as DATABASE_URL (change port to 6543)
4. Select "Session" mode — copy that URL → paste as DIRECT_URL (port 5432)

---

## FINAL CHECKLIST before going live

Run through this yourself:

- [ ] Fix 1 done: `src/app/api/upload/route.ts` created
- [ ] Fix 2 done: `src/app/api/download/route.ts` deleted
- [ ] Fix 3 done: `next-auth` and `z-ai-web-dev-sdk` uninstalled
- [ ] Fix 4 done: `noImplicitAny: false` removed from tsconfig.json
- [ ] Fix 5 done: `.env` has all required values including SESSION_SECRET
- [ ] Supabase bucket `indigate-uploads` created and set to public
- [ ] Resend domain verified for `indigate.work`
- [ ] PostgreSQL migration done (prisma/schema.prisma uses postgresql provider)
- [ ] Production seed only creates admin account (no demo data)
- [ ] `npm run build` passes with zero errors
- [ ] All Vercel environment variables set (copy from .env)
- [ ] Admin password changed after first login

**Test this flow after fixes:**
1. Register as a new candidate
2. Go to Resume tab → upload a PDF
3. Check Supabase Storage → file should appear in indigate-uploads/resumes/
4. Apply to a job → confirm the resume URL is saved in the application
5. Check Resend dashboard → welcome email should show up in logs

---

*IndiGate Fix Guide · Indobox Inc · Abhishek*
