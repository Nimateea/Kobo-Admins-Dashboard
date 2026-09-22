# Admin Dashboard — React/Vite port (scaffold + vertical slice)

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
- **Command Centre** (`src/pages/CommandCentre.tsx`) — KPI cards (static
  values here; the prototype's period-filter and live-recalculation logic
  isn't ported yet, see below).
- **Users** (`src/pages/Users.tsx`, `src/components/DataTable.tsx`) — a
  generic sortable table component (click a header to sort, click again to
  reverse), status/risk filters, and saved views backed by `localStorage`
  (`src/lib/useSavedViews.ts`).
- **Approvals** (`src/pages/Approvals.tsx`, `src/state/approvalsStore.ts`) —
  the maker-checker engine. A Suspend button on the Users table creates a
  real approval request; Approvals shows Approve/Reject only to a
  *different* admin with the `approvals.decide` permission, and Cancel only
  to the original requester.

## What isn't ported yet

Everything else the single-file prototype has: Transactions, Accounts,
Providers/Integrations, Support tickets + messaging, Risk & Security,
Analytics with charts, Feature Flags, Audit Logs, the AI Admin Assistant,
the period filter, dark-theme graph views, CSV export, and the rest of the
~40 views. The patterns here (a Zustand store per concern, a page per
route, `DataTable` for any list) are meant to make porting each of those
mechanical — see "Adding a new page" below.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-checks with tsc, then builds — verified clean
npm test          # Vitest + React Testing Library — 18 tests, all passing
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
