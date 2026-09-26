# Kobo Admin Dashboard

## Current status

This is a static dashboard prototype with Supabase-backed administrator sign-in being introduced. It is **not ready for production customer or financial data**: most dashboard datasets and mutations still live in browser memory, and the only database policy currently included protects administrator profiles.

The login flow requires a Supabase password, a verified TOTP factor (enrolled during first sign-in), and an active row in `public.admin_profiles`. It fails closed when the Supabase configuration is missing. The browser receives only the Supabase URL and public anon key; never expose a service-role key in client code or Vercel client environment variables.

## Supabase setup

1. Create a Supabase project and disable public sign-ups. Admin accounts should be invited by a trusted project administrator.
2. Apply `supabase/migrations/20260926000000_admin_profiles.sql` using the Supabase SQL editor or migration tooling.
3. For each invited Auth user, create an `admin_profiles` row using a trusted SQL session. Set `user_id` to the Auth user UUID, `full_name`, one of the roles defined by the schema, and `status` to `active`. Never allow users to update their own role or status.
4. In Vercel project settings, add `SUPABASE_URL` and `SUPABASE_ANON_KEY` for the production environment, then redeploy. These values are served by `/api/config`; the anon key is public by design and must be constrained by RLS.
5. Sign in with the invited account. After password verification, the first sign-in displays a TOTP enrollment QR code and secret. Verify the authenticator code to complete enrollment. Subsequent sign-ins require a fresh TOTP challenge.

## QA

Run `npm test` with Node.js 20 or later. These checks parse the inline scripts and exercise the auth-config function; they are not browser end-to-end tests. A browser smoke test is still required before release.

## Production work still required

- Move users, transactions, accounts, tickets, risk events, providers, feature flags, audit history, and all writes from in-memory arrays to authenticated server/database operations.
- Add RLS policies and role/permission checks for every data table and mutation. Client-side navigation checks are presentation only, not authorization.
- Replace sample records and placeholder `.example` provider URLs; connect and test approved service endpoints and webhook receivers.
- Add audit writes on the server so users cannot forge or erase the audit trail in the browser.
- Exercise login, MFA enrollment/recovery, permissions, workflow mutations, and responsive layouts in a real browser; validate headers in the deployed response.# Admin Dashboard — React/Vite port (scaffold + vertical slice)

This is a proper React + TypeScript + Vite foundation for the single-file
admin dashboard prototype, built to be a real starting point rather than a
mockup: it compiles, is unit- and integration-tested, and the maker-checker
approval bug from the prototype is fixed here in a way a test locks in.

## What's actually ported and working

- **Auth** (`src/pages/Login.tsx`, `src/state/sessionStore.ts`) — sign in by
  admin email, 2FA step, unknown/suspended emails rejected. There is exactly
  one identity source (`useSession`), so there is no separate "preview a
  role" control that can drift out of sync with it — that mismatch was the
  root cause of the bug you found in the prototype.
- **Permissions** (`src/lib/permissions.ts`) — the same role → permission
  grants as the prototype's `ROLES` object, plus `has(role, permission)`.
- **Layout** (`src/components/Layout.tsx`) — sidebar with permission-gated
  nav links, identity card, sign out.
- **Command Centre** (`src/pages/CommandCentre.tsx`) — period-filtered KPIs
  and transaction summaries.
- **Users** (`src/pages/Users.tsx`, `src/components/DataTable.tsx`) — a
  generic sortable table component (click a header to sort, click again to
  reverse), status/risk filters, and saved views backed by `localStorage`
  (`src/lib/useSavedViews.ts`).
- **Transactions and Accounts** (`src/pages/Transactions.tsx`,
  `src/pages/Accounts.tsx`) — sample activity and linked-account tables,
  permission-gated CSV exports, and maker-checker adjustment/disconnect
  requests backed by `src/state/financeStore.ts`.
- **Providers, Support, and Risk** (`src/pages/Providers.tsx`,
  `src/pages/Support.tsx`, `src/pages/Risk.tsx`) — provider status controls,
  ticket assignment/status/replies, and risk-event dispositions. Local state
  is shared across routes through `src/state/operationsStore.ts`.
- **Analytics, Feature Flags, Audit Logs, and Admin Assistant** — period-based
  sample charts, local flag controls, filterable/exportable audit rows, and a
  deterministic assistant that summarizes the included sample records.
- **Approvals** (`src/pages/Approvals.tsx`, `src/state/approvalsStore.ts`) —
  the maker-checker engine. A Suspend button on the Users table creates a
  real approval request; Approvals shows Approve/Reject only to a
  *different* admin with the `approvals.decide` permission, and Cancel only
  to the original requester.

## Demo boundaries

All records are seeded in the browser; there is no production API, bank
connection, or server-side persistence. Operational changes last for the
current app session. The Admin Assistant uses deterministic local summaries,
not a connected AI model. Other prototype views not named above still need
their requirements and data contracts before they can be ported.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks with tsc, then builds — verified clean
npm test          # Vitest + React Testing Library — 22 tests, all passing
```

Demo accounts (same as the prototype): `amara.obi@kobo.com` (Super Admin),
`halima.sani@kobo.com` (Risk Admin), `ngozi.eze@kobo.com` (Analyst, for
testing permission gating), `dev.rotimi@kobo.com` (Suspended, for testing
login rejection). Any 6-digit 2FA code except `000000` passes.

## Tests worth reading first

- `src/state/approvalsStore.test.ts` — unit tests for the approvals engine,
  including a test named exactly for the bug: *"the reported bug: cannot
  approve your own request under any role"*. It simulates the failure mode
  directly (a requester whose role field is swapped to Super Admin) and
  asserts approval is still blocked.
- `src/test/App.test.tsx` — the same scenario end-to-end through rendered
  UI: sign in as the requester, request a suspension, confirm only Cancel is
  offered, sign out, sign in as a different admin, approve it for real.

## Adding a new page

1. Add types + seed data to `src/lib/mockData.ts`.
2. Add a Zustand store under `src/state/` if the page needs mutable state
   beyond simple filters (see `approvalsStore.ts` for the pattern).
3. Build the page in `src/pages/`, using `DataTable` for any list and
   `useSavedViews` if it needs saved filters.
4. Register the route in `src/App.tsx` and a nav entry with its permission
   in `src/components/Layout.tsx`'s `NAV` array.
5. Write the test first if the page has any non-trivial logic (permission
   gating, a workflow like approvals) — that's what caught the bug here.

## Design tokens

`tailwind.config.js` carries the exact colors from the prototype's absolute-
black theme (`app.main`/`sidebar`/`card` = `#000`, `app.hover` = `#171717`,
`app.border` = `#262626`, `app.accent` = `#6366f1`). Reuse these classes
(`bg-app-card`, `border-app-border`, etc.) rather than introducing new
colors, so a page built here matches the rest of the app without needing a
design review.
