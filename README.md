# ZETDC Fault Management System

A web app where electricity customers report faults and ZETDC staff manage and resolve them.
Built with **Next.js (App Router) + TypeScript + Tailwind + Postgres**, ready to deploy on **Vercel**.

## Features

**Customers**
- Left sidebar navigation (hamburger drawer on phones), Settings page (profile, password)
- Personal dashboard (open/resolved counts, active faults, recent updates, load shedding for your area)
- Sign up / log in (email + password — no email or SMS verification)
- Report a fault: type, danger flag, description, address, GPS or map pin, up to 3 photos
- Duplicate detection: faults already reported nearby can be followed ("same problem") instead of duplicated
- Ticket number (`ZET-2026-000001`) and live progress bar + timeline
- In-app notifications (🔔) on every update, message the crew, rate the fix, or reopen if not fixed
- Public outage map, planned-maintenance notices and load shedding schedules (no login needed)

**Admin (control room)**
- Dashboard: open / critical / unassigned, 7-day trend, by status, type and city, crew workload, average fix time, customer rating
- Fault queue with search and filters (status, priority, type, city, crew, overdue/SLA)
- Change status and priority, assign a technician, add public messages or internal notes, merge duplicates
- Fault map with priority colours, CSV export
- User management (create technicians/admins, deactivate accounts) and announcements

**Technicians**
- See only their assigned jobs, navigate to the GPS location, mark in progress / resolved with a note

## Demo accounts (created on first start)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@zetdc.co.zw` | `Admin@123` |
| Technician | `tech@zetdc.co.zw` | `Tech@123` |

Customers sign up themselves at `/register`. **Change the admin password for any real deployment** (set `ADMIN_EMAIL` / `ADMIN_PASSWORD` before the first start).

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

With no `DATABASE_URL` the app uses an embedded Postgres (PGlite) saved in `./.data`, so nothing else needs installing. Tables and demo accounts are created automatically.

## Deploy on Vercel with Supabase

1. **Supabase:** create a project → click **Connect** → copy the **Transaction pooler** connection string (port `6543`). Replace `[YOUR-PASSWORD]` with your database password (URL-encode special characters, e.g. `@` → `%40`).
2. **Vercel:** push this repo to GitHub and import it in Vercel. Under *Settings → Environment Variables* add:
   - `DATABASE_URL` = the Supabase connection string
   - `AUTH_SECRET` = any long random string (`openssl rand -hex 32`)
   - optional `ADMIN_EMAIL` / `ADMIN_PASSWORD` for the first admin account
3. Deploy. Tables and the admin account are created automatically on the first request — no SQL to run.

> Any other Postgres (Neon, Vercel Postgres, Railway…) works the same way. The embedded database is for local use only because Vercel's filesystem is not persistent.

## Custom domain (faults.emura.co.zw)

1. Vercel → your project → **Settings → Domains → Add** → `faults.emura.co.zw`.
2. At your DNS provider for `emura.co.zw`, create a record for the subdomain:
   `CNAME  faults  →  cname.vercel-dns.com` (use the exact value Vercel shows).
3. Wait for DNS to propagate (minutes to a few hours). Vercel issues the HTTPS certificate automatically.
4. Verify: open `https://faults.emura.co.zw/api/health` — it should return `{"status":"ok","database":"connected",...}`.
5. Optional: set `NEXT_PUBLIC_SITE_URL=https://faults.emura.co.zw` so link previews use the right address.

## Project layout

- `app/` — pages (`/report`, `/my-faults`, `/outages`, `/admin/...`) and API routes (`app/api/...`)
- `lib/db.ts` — database driver, schema and seeding · `lib/auth.ts` — sessions · `lib/faults.ts` — queries
- `components/` — UI (map, report form, staff actions, timeline …)

## Notes / design decisions

- Photos are resized in the browser and stored in the database (no file storage needed on Vercel).
- Notifications are in-app instead of SMS/email, as requested.
- Priority is set automatically (danger → critical) and each priority has an SLA target (4h/12h/24h/72h) used to flag overdue faults.
