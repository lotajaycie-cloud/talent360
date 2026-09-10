# Talent360 (Next.js)

Next.js 14 (App Router) port of the Talent360 connected application, built for
Vercel hosting.

## Local development

```
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

This project lives in the `talent360-nextjs/` subfolder of the repository, so in
Vercel set **Root Directory = `talent360-nextjs`** when importing. That one
setting is what makes the deploy work — pointing Vercel at the repo root instead
will not build, because the Next.js project is not there.

Or from the CLI, run inside this folder:

```
npm i -g vercel
vercel
```

## Routes

| Path | What it serves |
|---|---|
| `/` | **Talent 360 Mobile — the main app.** Served from `public/talent360_mobile.html` via a `beforeFiles` rewrite in `next.config.js`. |
| `/desktop` | Desktop app home. |
| `/assess`, `/calibration`, `/ninebox`, `/succession`, `/idp`, `/profile`, `/mentoring`, `/admin`, `/analytics`, `/audit`, `/cycle` | Desktop module routes. |

The mobile app is a single self-contained HTML document rather than React
components, so it is mounted at the root with a rewrite instead of being an App
Router page. It is fully verified as-is (14-step guided assessment, scoring, all
three roles); re-expressing ~2,000 lines of it as JSX would risk regressions for
no functional gain today. If it ever needs to share state with the desktop
routes, that is the point to port it properly.

## What this is

A faithful port of `talent360_connected_app.html` (the vanilla-JS single-file
version) into proper Next.js structure:

- `lib/employeesData.js` — the real 1,373-employee dataset (July 2026 masterlist,
  cross-matched with real 2026 box placement / competency / IDP data where it exists)
- `lib/config.js` — cycles, critical roles (empty by design), nav structure, demo logins
- `lib/helpers.js` — every computed formula, unchanged from the validated original
- `lib/captions.js` — exact-wording behavioral indicators from the L1-L4 templates
- `lib/store.js` — React Context replacing the original's global `DB` object and
  its mutation functions
- `app/*` — one route per module (Home, Cycle, Assessment, Calibration, 9-Box,
  Succession, IDP, Talent Profile, Mentoring, Admin, Analytics, Audit)
- `components/` — Shell, Sidebar, Topbar, EmployeeView (the role-based layout switch)

Same three-role RBAC (Super Admin / People Manager / Employee) via the login
switcher, same real data, same formulas — this version has actual URLs per module
instead of one 731KB file with client-side view-switching, and is deployable
as a real hosted app.

## What's not carried over from the original — genuine gaps, not oversights

- **No backend, no persistence.** State lives in React Context, in memory — refresh
  the page and everything resets to seed data. Same limitation the original had.
- **The mobile-specific app** (`talent360_mobile_redesign.html`) was not ported —
  this Next.js version is desktop-shaped. It's not responsive for phone use yet.
- **Route-level auth is still just the same prototype login switcher** — client-side
  only, not real authentication. See the comment in `lib/store.js`.
