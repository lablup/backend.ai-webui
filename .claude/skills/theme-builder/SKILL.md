---
name: theme-builder
description: >
  Build a Backend.AI WebUI theme — the v2 appearance document that
  `resources/theme.json` / `resources/theme.schema.json` describe — from a brand
  reference: a website URL, a logo, a set of hex colours, or a plain-language
  description, then validate it and walk the user through previewing it (dev
  server, or the Branding page's JSON Config → Preview → Apply). Trigger on:
  "테마 만들어줘", "theme.json 만들어", "이 사이트 BI/프라이머리 컬러로 webui 테마",
  "브랜드 컬러 테마", "make a WebUI theme from <url>", "brand the WebUI",
  "generate theme.json", "custom theme for <customer>", or any request to
  match the WebUI's colours/logo to a company's identity. Not for editing the
  theme pipeline itself (`react/src/astryx-theme/`) or the schema.
---

# Theme builder

Turns "here is our brand" into a document the loader accepts, with the preview
steps the user needs to see it. Everything about the document's shape — field map,
seed semantics, what reads it, the preview surfaces — is in
`references/appearance-document.md`; read it once per session before writing JSON.

Helpers (plain Node, no install; run from the repository root):

```bash
S=.claude/skills/theme-builder/scripts/theme-builder.mjs
node $S extract <url> [--scripts] [--json]   # brand colour / font / logo candidates from a site
node $S check <theme.json> [--json]          # hex format + WCAG contrast per family, dark-seed suggestions
node $S validate <theme.json> [--json]       # resources/theme.schema.json, one line per offending path
```

## 1. Take the brief

Accept any of: a URL, hex colours (with roles if the user names them), logo files or
image URLs, a company name, or a description ("KT Cloud BI", "deep navy with a gold
accent"). Proceed on what is given — do not ask for a full palette. Ask only when
there is nothing usable at all (no URL, no colour, no name).

Decide two things up front and say them in the report:

- **Family placement.** The brand becomes the `default` family unless the user says to
  keep Backend.AI's shipped families selectable — `default` is what renders with no
  family chosen, and the family selector only appears with `allowThemeMode = true`. When
  the user wants both, keep the shipped families and add the brand under a slug key with
  a `familyLabels` entry.
- **Output path.** Write the draft where the user says; with no path, write
  `.agent-output/themes/<slug>.theme.json` (git-ignored). `resources/theme.json` is only
  the _preview_ copy (step 5) — do not leave the shipped document overwritten unless the
  user asked to replace it.

## 2. Extract the identity

From a URL, run `extract` first. It fetches the HTML and linked stylesheets, ranks
saturated colours by frequency with a background/colour/border breakdown, and lists
brand-named CSS variables, `theme-color`, fonts, logo `<img>`s and icons.

- Few or no colours means the site styles from JS bundles. Re-run with `--scripts`
  (scans up to 20 script files), then confirm in a browser: open the page with the
  `playwright-cli` skill and read computed styles — the primary call-to-action button's
  `background-color`, a body link's `color`, the header/nav background, `:root` custom
  properties, and the logo element's `src`/`currentColor`. Computed values beat
  frequency counts; a colour used on three CTAs is the brand colour, a colour used in
  400 borders is not.
- From an image or logo, sample the dominant saturated colour and one secondary; state
  that they are sampled, not declared.
- From hex colours the user supplies, use them as given.

Map what you found to roles. Say which evidence backed each pick.

| Role                            | Pick                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `accent`                        | The brand's primary action colour (CTA background, `theme-color`, `--primary`/`--brand` variable).                                                                                                                                                                                                                                                                          |
| `link`                          | The site's link colour when it differs from accent; otherwise the accent.                                                                                                                                                                                                                                                                                                   |
| `info`                          | A cooler secondary from the brand if there is one; otherwise the accent. `info` is also the admin-role accent.                                                                                                                                                                                                                                                              |
| `error` / `success` / `warning` | Keep the shipped values unless the brand system defines them.                                                                                                                                                                                                                                                                                                               |
| `headerBg`                      | The site header background; when it is white or transparent, use the accent (light) and a darker or neutral value (dark).                                                                                                                                                                                                                                                   |
| `fontFamily`                    | Keep the shipped `'Ubuntu', Roboto, sans-serif` unless the brand font already exists under `resources/fonts/` or the user will add it (`resources/fonts/ADDING_FONTS.md`). A name without a font directory does nothing.                                                                                                                                                    |
| logos                           | Use the brand's light-on-dark and dark-on-light variants for `src` / `srcDark`; collapsed mark if one exists; login/about logos when the brand has a wordmark. Download the assets into `manifest/` (or a path the user names) and reference them absolutely. Ask before scraping logo files from a site you were only given the URL of — trademark use is the user's call. |

## 3. Derive light and dark pairs

Every seed needs a light and a dark value that both read. Write tuples, not single
strings, for `accent`, `link` and `info`. Rules the runtime imposes (details in the
reference):

- 6-digit hex only. No `rgb()`, no 3-digit shorthand, no alpha.
- Dark values are applied verbatim, so choose them: keep the hue, raise lightness until
  the colour reaches ≥ 4.5:1 on `#141414` while staying ≥ 3:1 under white text. `check`
  prints both ratios and suggests a dark value when the declared one fails.
- Light values need ≥ 3:1 under white text (primary buttons) and on white (accent text).
  A brand colour that fails this — many oranges and cyans do, the shipped Backend.AI
  orange is 2.61:1 — may still be the right choice for the brand; keep it, and report
  the ratio so the user decides.

Run `check` after writing and act on every `WARN` on accent/link/info: either adjust the
value or record in the report why the brand colour stays.

## 4. Write and validate

Start from the skeleton in the reference. Fill only the keys you have evidence for; the
schema rejects unknown keys, so do not add commentary fields. Then:

```bash
node $S validate <draft>   # must print OK
node $S check <draft>      # 0 error; review WARN
```

Fix and repeat until `validate` passes. Do not hand-wave a failure into the report —
the loader drops an invalid document with a console error and the page renders the
neutral Astryx theme, which looks like "the theme did nothing".

## 5. Preview

Offer the path that fits how the user is working; the details and caveats are in the
reference's _Preview surfaces_ table.

1. **Dev server (fastest).** Copy the draft over `resources/theme.json`, start the dev
   server (`dev-server` skill) or let the running one full-reload, and open the login
   page and a signed-in page. Restore the shipped file afterwards
   (`git checkout resources/theme.json`) unless the user asked to replace it. If
   `config.toml` names `general.apiDomainName` and a domain slice was saved, the slice
   wins over the file — say so when the preview does not change.
2. **Branding page (no checkout needed).** As a superadmin open `/branding` → **JSON
   Config** → paste the draft or **Import from JSON** → OK → **Preview**. The preview
   is a per-browser draft; nothing is saved.
3. **Apply.** `/branding` → **Apply** saves the draft to the domain's `appearance` slice
   for every user of that domain and reloads. Only press it when the user says to.

When a browser is available, capture the login page and the main page in both schemes
and hand the user the absolute paths of the screenshots next to the draft's path.

## 6. Report

Short. In this order:

- The draft's absolute path, and whether `resources/theme.json` currently holds it.
- A table: role → light / dark → the evidence (selector, variable, or "user-supplied")
  → contrast ratio, with any deliberate low-contrast keep called out.
- `validate` result and the `check` summary line.
- The preview steps that apply, as commands or clicks.
- What was left out and why (no logo assets, font not shipped, family kept as a
  secondary entry, …).

## Out of scope

- Changing the loader, the theme pipeline, the schema, or the Branding page. If a
  document the schema accepts renders wrong, that is a bug to file, not a reason to
  bend the document.
- Pressing **Apply**, committing `resources/theme.json`, or downloading logo assets
  without the user's say-so.
- Themes for the desktop app's Electron shell, favicons, and email templates.
