# YCC — Yuva Champions Cricket

Mobile-first registration platform for YCC's cricket championship and quiz competition: team/individual registration, Razorpay payment, QR-coded receipts, a staff scanning/verification portal, and an admin reporting dashboard.

Stack: Next.js 16 (App Router, TypeScript), Tailwind CSS + shadcn/ui, Supabase (Postgres, Auth, RLS), Razorpay, Resend, Vercel.

## One-time setup

### 1. Apply the database schema

The project is linked to Supabase project `gjwpxwodufeyenlbnxjx`, but the schema hasn't been applied yet. In the [Supabase SQL Editor](https://supabase.com/dashboard/project/gjwpxwodufeyenlbnxjx/sql/new), run, in order:

1. `supabase/migrations/0001_init.sql` — tables, RLS policies, and the `allocate_unique_ids` function.
2. `supabase/seed.sql` — sample events for local testing (replace with real events/fees before launch).
3. `supabase/migrations/0002_relax_contact_email.sql` — makes `captain_email` optional (the form no longer collects email, per 01-spec.md), drops the unused `roll_number` column, and seeds the 7 fixed colleges from 01-spec.md.
4. `supabase/migrations/0003_percollege_unique_ids.sql` — fixes unique-ID allocation to be scoped per college (shared across all events) instead of per (college, event), matching 01-spec.md.
5. `supabase/migrations/0004_staff_approval_flow.sql` — adds the staff approval workflow (see below).

If you already ran `seed.sql` once and it fails on a second run with a duplicate-key error, that's expected — it means the events already exist; only re-run the numbered migrations, never `seed.sql` again.

### 2. Configure Google OAuth (staff & admin login)

In Supabase Dashboard → Authentication → Providers, enable Google. You'll need a Google Cloud OAuth Client ID/Secret (Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID → Web application), with the Supabase-provided callback URL (shown on that same Providers page, looks like `https://<project-ref>.supabase.co/auth/v1/callback`) registered as an authorized redirect URI on the Google side.

**Staff access is self-service**: the first time someone signs in at `/staff/login`, a `pending` request is created automatically — no SQL needed. An admin approves or rejects it from `/admin/staff` (also linked from the main admin dashboard, with a badge showing the pending count). Once approved, that Google account can sign in normally from then on.

**Admin access is still manual** (bootstrapping an approval flow for admins has a chicken-and-egg problem — there's no admin yet to approve the first one). After the account has signed in at least once via `/admin/login` (so a row exists in `auth.users`, even if the sign-in itself gets redirected back to login):

```sql
insert into admins (user_id, name, email)
select id, null, email from auth.users where email = 'name@example.com';
```

### 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- Supabase URL/anon key/service role key — already set for this project.
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — already set (test mode).
- `RAZORPAY_WEBHOOK_SECRET` — only needed once you configure a webhook (Razorpay Dashboard → Settings → Webhooks) pointing at `<your-site-url>/api/webhooks/razorpay`, listening for `payment.captured`. Not required for local dev — `/api/razorpay/verify-payment` confirms payments via the checkout callback instead.
- `RESEND_API_KEY` / `RECEIPT_FROM_EMAIL` — optional. The registration form doesn't collect an email address (per 01-spec.md), so email is only sent if `captain_email` is set some other way. The primary delivery path is the receipt auto-downloading on the payment success page, with re-download by unique ID or mobile number at `/receipt`.

### 4. Run locally

```bash
npm install
npm run dev
```

Test payments with Razorpay's test card `4111 1111 1111 1111`, any future expiry, CVV `123`.

## Project structure

- `src/app/(public)` — landing page, event details, registration, payment success, FAQ.
- `src/app/staff` — staff login + QR-scan/search/attendance portal (Google OAuth, gated by the `staff` table).
- `src/app/admin` — admin login + reporting dashboard (gated by the `admins` table).
- `src/app/api` — registration creation, Razorpay order/verify/webhook, attendance, lookup, CSV export.
- `src/lib` — Supabase clients, Razorpay helpers, receipt PDF/QR/email generation, validation schemas.
- `supabase/migrations` — schema + RLS + the unique-ID allocation function.

## Known placeholders to replace

- **FAQ content** (`src/app/(public)/faq/page.tsx`) is generic placeholder copy — the original FAQ doc (`assets/FAQs For YCC Website.sdocx`) is a Samsung Notes export that couldn't be parsed into text.
- **Events/fees** in `supabase/seed.sql` are samples — replace with the real event list before launch.
- **Colleges**: the 7-college list in `0002_relax_contact_email.sql` is fixed per 01-spec.md ("more will be added later") — add new colleges with an `insert into colleges (name, initials) values (...)`, choosing initials carefully since they become the prefix of that college's unique IDs.

## Receipt flow

Registration only collects name, college (dropdown), and mobile number — no email, no roll number. On payment confirmation, the receipt PDF auto-downloads on the success page (with a "please wait" notice while it downloads); it can be re-downloaded any time at `/receipt` using a unique ID or the registered mobile number (rate-limited server-side). The PDF mirrors the reference invoice format in `assets/receipt format.pdf`: org header, a Name/College block, a one-line order summary (price inclusive of all taxes, no tax breakdown), followed by the full roster with a large scannable QR code per participant.
