# Admin Dashboard

Single-file admin dashboard prototype (Command Centre, Users, Financial Activity, Integrations, AI, Support,
Risk & Security, Analytics, Configuration, Administration) with an AI Admin Assistant.

## Run locally
Open `index.html` in a browser. It needs internet on first load for Tailwind (CDN) and the Inter font.
Everything else (icons, logo) is embedded.

Demo sign-in: any `@kobo.com` email, password of 12+ characters, then any 6-digit code except `000000`.

## Deploy to GitHub Pages
Repo **Settings → Pages → Deploy from a branch → `main` / root**. The site is served from `index.html`.

## Notes
- All data is sample data held in memory; actions update the UI and Audit Log but nothing is persisted (except assistant chat history in `localStorage`).
- The AI assistant calls Claude only when the page is opened inside Claude. Elsewhere it uses built-in answers and reports.
- Role switcher ("Viewing as") demonstrates permission gating and data masking.
