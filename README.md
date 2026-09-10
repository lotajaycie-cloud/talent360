# Talent 360

Talent management app for Century Pacific. The mobile app is the main product.

## Deploying to Vercel

**This repository works with no Vercel configuration.** `index.html` sits at the
root, so Vercel serves it as a static site — no build step, no Node, nothing to
misconfigure. Leave **Root Directory blank**.

If instead you set **Root Directory = `talent360-nextjs`**, that also works:
Next.js builds and a rewrite in `next.config.js` maps `/` to the same app, with
the desktop app additionally available at `/desktop`.

Both paths serve the identical app at the site root. Pick either.

## Signing in

Three super admins, from the July 2026 masterlist:

| Name | Email |
|---|---|
| Joyce Vivien Baquiran Espanola | jespanola@centurypacific.com.ph |
| George Leander Qua Hiansen Wang III | gwang@centurypacific.com.ph |
| Jay-Cie Soriano Lota | jlota@centurypacific.com.ph |

Two test accounts, one per role, for checking that role scoping works. These are
for testing only — the full staff list is not built out:

| Role | Email |
|---|---|
| People Manager | mlepalem@centurypacific.com.ph |
| Employee | jalmirante@centurypacific.com.ph |

Passcode for all: **2026**. You can also sign in with an employee number.

Role is derived from the account you sign in with. There is no way to change role
from inside the app — the demo identity switcher has been removed.

> **This is identity, not security.** The app is client-side only, so the account
> list and passcode are readable in view-source and the gate is bypassable with
> dev tools. It exists so the app can scope data by role. Production must
> authenticate server-side against Microsoft Entra ID and re-check permissions on
> every request.

## Files

| Path | What it is |
|---|---|
| `index.html` | **The mobile app.** Self-contained — React, the design runtime, the logo and all data are bundled inside. No external files. |
| `talent360-nextjs/` | Next.js version. Serves the same app at `/`, desktop app at `/desktop`. |
| `talent360_connected_app.html` | Desktop app, standalone single file. |

## Verifying a copy is intact

`index.html` should be **509,818 bytes**, MD5 `47e166330f30804c2272293918034218`.

If a copy has been corrupted, this finds it:

```
grep -c "sc-camel-root-name" index.html
```

`0` means clean. Anything above `0` means the file was run through Claude Design's
template encoder, which rewrites JavaScript identifiers and produces a syntax
error — the app renders blank. Replace the file rather than trying to repair it.
