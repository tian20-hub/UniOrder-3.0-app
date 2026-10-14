# Uniorder

Uniorder is a campus uniform ordering app built with React, Vite, and Supabase. It provides student ordering, size-level inventory, account and role administration, order processing, student order requests, and in-app order notifications.

## Local setup

1. Install dependencies:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env.local` and enter the Supabase project URL and **publishable/anon** key. Never put a service-role key in a `VITE_` variable or browser code.

3. Apply `supabase/migrations/202610150001_uniform_ordering.sql` to the Supabase project. With the Supabase CLI linked to the project:

   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   supabase db push
   ```

   The migration creates the tables, row-level security policies, order and stock RPCs, notification and status-history triggers, and the initial course-uniform catalog.

4. In Supabase Authentication, configure the site URL and redirect allow-list to include the app URL and `/reset-password`. Enable email confirmation if students should verify their campus email before signing in.

5. Start the app:

   ```bash
   npm run dev
   ```

## Initial administrator

Public sign-up always creates a Student account. No role can be selected at sign-up or sign-in. After creating and confirming the first account, promote it once in the Supabase SQL editor using that account's email:

```sql
update public.profiles
set role = 'Administrator'
where email = lower('admin@your-campus.edu');
```

After that, use Mother Admin to invite staff and assign roles. The database checks roles for protected routes and operations; hiding a screen in the UI is not the security boundary.

## Local demo account

Run `npm run dev` without Supabase variables configured to enable a local Student demo login:

- Email: `demo.student@uniorder.local`
- Password: `Demo123!`

The login page offers a one-click demo sign-in. This fixed demo credential is available only in Vite development mode and only when Supabase is not configured. Demo orders, stock, and notifications are stored in this browser and are not shared with Supabase. Use **Reset demo data** in the app to restore the sample catalog and clear demo activity. Do not deploy the development server or demo credentials as a production authentication method.

## Supabase demo accounts

For a local or isolated demo Supabase project, provision pre-confirmed accounts for Student, Finance, and Administrator:

```powershell
$env:SUPABASE_URL = "http://127.0.0.1:54321"
$env:SUPABASE_SERVICE_ROLE_KEY = "<local service-role key>"
npm run demo:accounts
```

For a hosted, isolated demo project, also explicitly confirm the target project reference before running the command:

```powershell
$env:SUPABASE_URL = "https://YOUR_PROJECT_REF.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<demo project service-role key>"
$env:ALLOW_DEMO_ACCOUNTS = "true"
$env:DEMO_PROJECT_REF = "YOUR_PROJECT_REF"
npm run demo:accounts
```

The command prints randomly generated passwords once; save them securely. Running it again resets these demo accounts' passwords. Never run it against production or use demo credentials for real users: the demo Administrator has full administrative privileges.

## Staff invitations

Mother Admin sends invitations through the `invite-user` Supabase Edge Function. Deploy it after linking the CLI:

```bash
supabase functions deploy invite-user
supabase secrets set APP_URL=https://your-app.example
```

Set `APP_URL` to the frontend's exact origin (scheme and host, with no path or trailing slash). The function uses it as the CORS allow-origin and invitation redirect base. Supabase supplies `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to the function runtime. The service-role key stays server-side; the function rejects cross-origin browser requests when `APP_URL` is not configured.

## Implemented workflows

- Supabase Auth sign-up, sign-in, email confirmation, password reset, and session restore.
- Server-controlled Student, Finance, and Administrator roles; administrator invitations, role assignment, and account pausing, with safeguards against locking out the last active administrator.
- Student-owned order history and persistent profile preferences.
- One course-uniform catalog shared with administrator-managed size stock.
- Transactional stock reservation and server-calculated order totals during checkout; overselling is rejected and orders are capped at 500 items. A directly cancelled unpaid order returns its reserved stock.
- Payment confirmation, preparation, and release status transitions with persistent status history and in-app notifications.
- Student exchange/return requests with finance review.
- Supabase Realtime refresh for orders, stock, requests, notifications, and campus settings.
- Dynamic active-order and unread-notification indicators.

Payment provider integration, payment-evidence upload, and pickup-location scheduling are not included; the existing campus payment confirmation and pickup statuses remain manual.

Existing browser-only demo orders and stock are not imported. The migration seeds the catalog in Supabase, which becomes the single source of truth.

## Build

```bash
npm run build
```
