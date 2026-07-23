# Backend.AI WebUI Docs — Static Site Production Uplift Spec

> **Epic**: FR-2710 ([link](https://lablup.atlassian.net/browse/FR-2710))
> **Spec Task**: FR-2711 ([link](https://lablup.atlassian.net/browse/FR-2711))
> **Predecessors (Done)**: FR-2159 (Static Website Generation), FR-2160 (Website UX Features)
> **Status**: Draft
> **Created**: 2026-04-25

## Overview

Bring the rendered output of `docs-toolkit build:web` (under `packages/backend.ai-webui-docs/dist/web/`) up to production-grade quality on six well-defined axes — site entry & multilingual routing, SEO/sharing metadata, information architecture, reading UX (code blocks: syntax highlighting + Copy button), build robustness/asset delivery, and versioned docs with a minor-grained version selector — **without** migrating away from the in-house `backend.ai-docs-toolkit` package. All capabilities currently delivered by FR-2159 and FR-2160 must be preserved (multi-page output, sidebar, prev/next, edit-this-page, last-updated, CJK client search, anchor registry, multi-page link rewriting, Infima CSS, PDF pipeline). Air-gapped offline operation must continue to work — no CDN, no runtime API calls.

## Problem Statement

The current `build:web` output works as a functional preview but falls short of a production documentation site. Specific gaps were verified by running `pnpm run build:web:en` on 2026-04-25 and inspecting `dist/web/en/quickstart.html`:

- No root `dist/web/index.html` (404 on `/`)
- `<title>` contains literal newlines from `book.config.yaml` `title: |` block scalar
- No SEO meta tags (description / OG / Twitter / canonical / hreflang)
- No `sitemap.xml` / `robots.txt` / JSON-LD
- No favicon / apple-touch-icon / `site.webmanifest`
- No language switcher anywhere on the site
- Sidebar is a flat 1→29 list (no category grouping in `book.config.yaml`)
- Active-page H2 list lives inside the sidebar — no separate right-rail "On this page" TOC
- No breadcrumbs
- No code-block syntax highlighting; no Copy button
- Per-page inlined search script (~2 KB × 29 pages ≈ 60 KB redundant) — should be `assets/search.js`
- `--strict` build mode missing — broken links emit a warning but exit code is 0
- `assets/styles.css` has no content hash (poor cache invalidation)
- 40 MB images per language without `loading="lazy"`, no `width`/`height` hints, no WebP

These gaps were verified against the live build; they are not theoretical.

## Goals

- Bring the rendered site to production-grade quality on the 6 named axes
- Preserve all current capabilities delivered by FR-2159 / FR-2160
- **No PDF-pipeline regressions**: web-side changes must not break `build:pdf` — the two pipelines share `markdown-processor.ts` and `book.config.yaml`
- Keep all work inside the existing toolkit (Option A); no SSG migration
- One PR per feature bucket — coarse-grained, mergeable in any reasonable order with light coordination

## Non-goals

- No markdown content changes (no rewriting docs)
- No search-relevance overhaul (the current bigram tokenizer stays)
- No dark mode (excluded from this spec to keep risk down; will be tackled as a separate follow-up effort)
- No migration to Docusaurus / VitePress / Starlight (deferred)
- No PWA service worker (web app manifest only, not a service worker)
- No cross-language redirect beyond the root index
- No WebP/AVIF generation in scope (stretch — may become a follow-up epic)
- No Algolia DocSearch integration

## User Stories

- As a **first-time visitor**, I want to land on `/` and see a language picker so that I am not greeted with a 404.
- As a **returning visitor**, I want my language preference to persist so that I do not have to re-pick it.
- As a **non-English reader**, I want to switch from any English page to the same page in my language with a single click.
- As a **search engine crawler**, I want valid `sitemap.xml`, `robots.txt`, canonical and hreflang signals so that I can index the site correctly.
- As a **link-sharer on Slack/Twitter**, I want a meaningful preview card (title, description, image) when I paste a doc URL.
- As a **reader navigating a long chapter**, I want a sticky right-rail TOC and breadcrumbs so that I always know where I am.
- As a **reader skimming the sidebar**, I want chapters grouped into meaningful categories so that I can find topics quickly.
- As a **developer reading a code sample**, I want syntax highlighting and a Copy button so that I can use the example without re-typing or losing tokens.
- As a **release engineer**, I want a `--strict` build flag that fails CI on broken links so that broken refs never ship.
- As a **mobile / slow-network reader**, I want images to load lazily with proper aspect ratios so that the page does not jank as it scrolls.
- As a **user moving between releases**, I want a version selector in the header so I can read the same topic for a different minor version without hand-editing URLs.

## Requirements

The work is grouped into **6 feature buckets**. Each bucket maps to one PR and one Jira sub-task under FR-2710.

### F1 — Site entry & multilingual routing

#### Must Have
- [ ] Generate `dist/web/index.html` with a language picker that:
  - infers a default from `navigator.language` / `Accept-Language`,
  - persists the choice in `localStorage.lang`,
  - falls back to `en` when no signal is available,
  - never enters an infinite redirect loop.
- [ ] Add a language-switcher control to every page header that links to the same chapter slug in peer languages.
- [ ] Emit `<link rel="alternate" hreflang="…">` per page covering all available languages plus `x-default`.
- [ ] Fix the multi-line `<title>` bug: collapse `book.config.yaml`'s `title: |` block scalar's newlines to a single line for `<title>` and the sidebar header. Normalize at config-read time.
- [ ] Update `packages/backend.ai-docs-toolkit/ARCHITECTURE.md` to document the new title-normalization rule and any new config knobs introduced by F1.

### F2 — SEO & sharing metadata

#### Must Have
- [ ] Per-page `<meta name="description">` derived from the first non-heading paragraph (capped at ~155 chars).
- [ ] Open Graph tags per page: `og:title`, `og:description`, `og:image`, `og:url`, `og:type=article`, `og:site_name`, `og:locale`.
- [ ] Twitter Card per page: `summary_large_image`.
- [ ] `<link rel="canonical">` per page.
- [ ] Build-time generation of `dist/web/sitemap.xml` covering all pages × all languages, with `lastmod` from git (fallback to `fs.statSync().mtime`).
- [ ] Build-time generation of `dist/web/robots.txt` allowing indexing and pointing to the sitemap.
- [ ] JSON-LD `TechArticle` per page with `headline`, `inLanguage`, `dateModified`, `author`, `publisher`.
- [ ] Default OG image strategy: **proposed default** is to render `manifest/backend.ai-brand-simple.svg` to PNG at build time and ship it as `assets/og-default.png`. Operators may override by setting `og.imagePath` in `docs-toolkit.config.yaml` (path relative to repo root). The choice and its precedence must be documented.

### F3 — Information architecture (sidebar grouping + right-rail TOC + breadcrumbs)

#### Must Have
- [ ] Extend the `book.config.yaml` `navigation` schema to accept a list of `{ category: string, items: NavItem[] }` groups. The existing flat-list form **must remain accepted** (backward compatible — the PDF pipeline also reads this file).
- [ ] Render the sidebar with collapsible category groups; the active page's group auto-expands on load.
- [ ] Add a right-rail "On this page" TOC: shows H2 + H3, sticky-positioned, with scroll-spy that highlights the heading currently in view.
- [ ] Move the active-page H2 list **out** of the sidebar and into the right rail.
- [ ] Add breadcrumbs (`Home › Category › Page`) above the chapter content on every page.
- [ ] Provide a default category mapping for the existing 29 chapters. **Proposed default mapping (4 categories)** — to be refined during implementation:
  1. **Getting Started** — overview, quickstart, signup, login, dashboard
  2. **Workloads** — sessions, model service, model store, batch sessions, import sessions, runtime parameters, service launcher
  3. **Storage & Data** — vfolders (project / user / model / storage browser), data import/export
  4. **Administration** — users, projects (groups), keypairs, resource policies, environments, presets, system settings, statistics, agent monitoring

  The implementer is free to adjust the boundaries and category names in code review; this list defines the *shape* (4–5 categories, balanced per bucket), not the literal final wording.

### F4 — Reading UX: code blocks

#### Must Have
- [ ] Build-time syntax highlighting via Shiki (zero runtime JS for highlighting); cache highlighted output by code-block hash.
- [ ] **Proposed default theme**: `github-light`. Expose `code.lightTheme` in `docs-toolkit.config.yaml` so operators can override; document the key. (Dark-mode is out of scope for this spec — a `code.darkTheme` key is intentionally **not** introduced now, but the namespace is reserved so a future dark-mode effort can extend it cleanly.)
- [ ] Code-block "Copy" button shipped as `assets/code-copy.js` (small, no framework, no external deps).

### F5 — Build robustness & static asset optimization

#### Must Have
- [ ] `--strict` flag (defaulted **on** for production builds): exits 1 when broken links or missing images are detected during `generateWebsite`. Without `--strict`, current warning-only behavior is preserved.
- [ ] Extract the inline per-page search script into a shared `assets/search.js`.
- [ ] Content-hash filenames for `styles.css`, `search.js`, `code-copy.js` (e.g., `styles.{8-char-hex}.css`); update `<link>` and `<script>` tags accordingly.
- [ ] Generate `favicon.ico`, `apple-touch-icon.png`, and `site.webmanifest` (basic web app manifest, **no service worker**) at the site root, referenced from every page.
- [ ] Image rendering: emit `loading="lazy"`, `decoding="async"`, and `width`/`height` attributes parsed best-effort from PNG headers. On parse failure, skip the dimension attributes — never break the build.

#### Stretch (may split to follow-up epic)
- [ ] WebP/AVIF generation behind a `--optimize-images` flag. If implementation slows the bucket, ship the must-haves and file a follow-up.

### F6 — Versioned docs & version selector

#### Must Have
- [ ] **Version unit**: the selector exposes one row per *minor* version. Within a minor, the highest patch represents that minor (e.g., among `25.16.x` only `25.16.5` is shown, labeled `25.16`).
- [ ] **Eligible-minor policy**:
  - Candidates are restricted to **minors released after the `backend.ai-webui-docs` package was introduced into this repo** (older versions are out of scope for this site).
  - Among those candidates, only minors whose docs **build cleanly under the current toolkit with `build:web --strict`** are admitted to the selector. Minors whose markdown structure diverges enough to break the build must be either (a) patched into compatibility, (b) deferred via a follow-up issue, or (c) explicitly excluded — the choice must be documented in the PR.
  - Adding a new minor to the selector is itself a PR whose acceptance includes "build passes for that minor".
- [ ] **Version metadata source**: the list of versions to build, and each version's content source, is declared in a new `versions` key in `docs-toolkit.config.yaml`. Required per entry: `versions[].label` (e.g., `25.16`), `versions[].source`, and exactly one entry must carry `latest: true`.
- [ ] **Past-minor artifact storage — GitHub orphan branches**:
  - Past-minor build artifacts are kept as static files on **orphan branches** of this repository (e.g., `docs-archive/25.16`). Orphan branches share no history with `main`, so the main repo size is unaffected.
  - Each minor's artifact is **built once with the toolkit-of-its-day** and committed to its archive branch — past minors are *not* rebuilt with the current toolkit on every deploy (avoids markdown-compat risk).
  - `versions[].source` accepts two kinds:
    - `{ kind: 'workspace' }` — use the current checkout (for the latest version)
    - `{ kind: 'archive-branch', ref: 'docs-archive/25.16' }` — fetch and merge from the orphan branch
  - The release-time workflow that **creates and pushes** the orphan branch is in scope for this spec (toolkit-side responsibility). How those archives get deployed publicly (AWS Amplify build pipeline, redirect rules, caching, CDN) is **deferred to a separate deployment spec**.
- [ ] **Output directory layout**: build output is partitioned as `dist/web/<version>/<lang>/...`. The root `dist/web/index.html` (F1) and each language landing page resolves to the entry marked `latest`.
- [ ] **Header version selector**: every page header shows a minor-version dropdown. On change, navigate to the same page slug in the target version if it exists; otherwise fall back to that version's index page.
- [ ] **Version scope isolation**: the sidebar, right-rail TOC (F3), search index (F5), and all internal links operate strictly *within* the current version. Search indexes are built per version.
- [ ] **canonical / hreflang**: per-page `<link rel="canonical">` (F2) points at the *latest* version's URL for the same slug. `hreflang` (F1) cross-links languages *within the same version*, never across versions.
- [ ] **Sitemap**: `sitemap.xml` covers all versions × languages × pages.
- [ ] **Single-version compatibility mode**: if `versions` is not declared, build the existing flat `dist/web/<lang>/...` layout (FR-2159 behavior). The version selector is opt-in and does not block other buckets from merging first.
- [ ] Update `ARCHITECTURE.md` to document the version model, directory layout, `versions` schema, and fallback rules.

#### Stretch (may split to follow-up)
- [ ] "This page is not in the selected version" inline notice when the selector falls back to the version's index.
- [ ] "View latest version" inline banner when reading a non-latest version.

## Acceptance Criteria

### F1 — Site entry & multilingual routing
- [ ] Visiting `dist/web/` (root) shows a language picker — no 404, no infinite redirect.
- [ ] Every page exposes a working language switcher to all peer languages.
- [ ] `<link rel="alternate" hreflang="…">` is correct on every page (covers all languages + `x-default`).
- [ ] No literal `\n` appears in any rendered `<title>` or sidebar header in any of the 4 languages.
- [ ] `ARCHITECTURE.md` is updated with the title-normalization rule and any new config keys.

### F2 — SEO & sharing metadata
- [ ] Every page has a non-empty `<meta name="description">` ≤ 160 chars.
- [ ] Every page has OG + Twitter + canonical + JSON-LD; manual spot-check on 3 sample pages passes a structured-data validator (e.g., Google Rich Results Test or schema.org validator).
- [ ] `sitemap.xml` exists and lists all pages × all languages with valid `lastmod`.
- [ ] `robots.txt` exists, allows indexing, and references the sitemap.
- [ ] OG image strategy is implemented and documented (default rendered logo PNG with `og.imagePath` override).

### F3 — Information architecture
- [ ] `book.config.yaml` accepts both flat and grouped navigation forms; existing flat configs still build without modification.
- [ ] Sidebar shows collapsible category groups; the active group auto-expands on initial load.
- [ ] Right-rail TOC sticks on scroll; the active H2/H3 link is highlighted via scroll-spy.
- [ ] Breadcrumb appears on every chapter page in the format `Home › Category › Title`.
- [ ] A default category mapping is committed for all 29 existing chapters.

### F4 — Reading UX
- [ ] Code blocks render with Shiki-tokenized colors (light theme); no runtime highlight.js or Prism is shipped.
- [ ] Each code block has a Copy button that copies the source (verified via headless test or manual smoke test).

### F5 — Build robustness & static assets
- [ ] Building with a deliberately broken link exits 1 (CI gate); building clean exits 0.
- [ ] Search script is loaded as `assets/search.{hash}.js` exactly once across all pages.
- [ ] `styles.css`, `search.js`, `code-copy.js` filenames include a content hash; HTML references match.
- [ ] `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest` are present at the site root and referenced from every page.
- [ ] All `<img>` elements have `loading="lazy"` and `decoding="async"`; ≥ 90% have `width`/`height` attributes.
- [ ] Stretch: `--optimize-images` (WebP) is either implemented or explicitly tracked as a follow-up issue.

### F6 — Versioned docs & version selector
- [ ] Every minor registered in `versions` is verified to **pass `--strict` build under the current toolkit**. Minors that do not pass are not added to the selector; their reason and follow-up plan (patch / exclude) are stated in the PR description.
- [ ] When `versions` is declared, the build emits `dist/web/<version>/<lang>/...`; each version directory is a self-contained, working site.
- [ ] When `versions` is not declared, the existing `dist/web/<lang>/...` layout is preserved (no regression).
- [ ] The header version selector lists every minor version and never lists individual patches.
- [ ] Switching versions navigates to the same slug in the target version if present, else to that version's index page (no 404).
- [ ] `canonical` URLs point at the same slug in the latest version.
- [ ] `sitemap.xml` covers all versions × languages × pages.
- [ ] Search results are scoped to the version the user is currently viewing.
- [ ] `ARCHITECTURE.md` documents the version model and directory layout.

### Cross-cutting — PDF pipeline non-regression (applies to all buckets)
- [ ] Each bucket's PR verifies, on the same commit, that **`pnpm run build:pdf` (all languages)** exits 0.
- [ ] Page count and outline-entry count of the PDF artifacts before/after the merge match the baseline, or any difference is justified in the PR description.
- [ ] Buckets that change the `book.config.yaml` schema (F1: title normalization, F3: navigation grouping, F6: `versions` key) must **explicitly check** that PDF builds pass under both the new and the legacy flat schema.
- [ ] Any PR that touches `markdown-processor.ts` (the shared core) must pass *both* web and PDF builds before merge.

## Constraints

- Stay within `backend.ai-docs-toolkit` (Option A; no SSG migration).
- Air-gapped offline operation must keep working (no CDN, no runtime API calls).
- Existing PDF pipeline must not regress; PDF and web pipelines share `markdown-processor.ts` core. Every PR verifies both web and PDF builds pre-merge (see Cross-cutting acceptance).
- Total JS shipped per page ≤ 25 KB minified (search index excluded).
- Build wall-clock time per language ≤ 50% increase vs current baseline (~1.5s for 1 lang / 29 pages).

## Out of Scope

- Markdown content changes / rewriting documentation prose.
- Search-relevance overhaul (current bigram tokenizer stays).
- Dark mode — split into a separate follow-up effort.
- Migration to Docusaurus / VitePress / Starlight.
- PWA service worker (web app manifest only).
- Cross-language redirect beyond the root index.
- WebP/AVIF image generation in the main scope (stretch only; may become a follow-up epic).
- Algolia DocSearch integration.

## Risks

- **Shiki build cost**: Shiki increases build time and bundle size — mitigated by keeping highlighting build-time only and caching by code-block hash.
- **Sidebar schema migration**: The grouped-nav schema could break the PDF pipeline (which also reads `book.config.yaml`). Backward-compat with the flat form is mandatory.
- **PNG dimension parsing**: Best-effort parsing can fail on unusual PNG variants. Skip-on-error policy ensures no build break.
- **Language-picker UX**: A naive `navigator.language` redirect on `/` could trap users in the wrong language; the picker must always be reachable and `localStorage` must override the inferred default.
- **Version directory layout change (F6)**: shifting from `dist/web/<lang>/...` to `dist/web/<version>/<lang>/...` ripples into every asset path, the search script (F5), the sitemap (F2), edit-this-page links (FR-2160), and the PDF pipeline entry points. Mitigation: keep the flat layout when `versions` is not declared so other buckets are not blocked.
- **Version ↔ search index isolation (F6)**: failing to partition the index per version leaks results from other versions. Build pipeline must enforce the version scope explicitly.
- **Past-minor build compatibility (F6)**: markdown structure of older minors may diverge from what the current toolkit accepts. Every candidate minor must be vetted with `build:web --strict` before being added to the selector; minors that break must be patched or explicitly excluded.
- **Past-artifact storage — orphan branches (decided)**: past-minor artifacts are stored on this repo's orphan branches (`docs-archive/<version>`) as static files built with the toolkit-of-their-day. The hosting / deploy pipeline (AWS Amplify or otherwise) — how these archives are merged and exposed publicly — is **out of scope for this spec** and lives in a separate deployment spec.

## Implementation Strategy Notes (for dev-planner)

The 6 buckets become 6 sub-tasks under FR-2710. Suggested ordering:

1. **F1** — cheap, stops the bleeding (root 404 + title bug)
2. **F5** — build hygiene; unblocks asset references and CI gating used by other buckets
3. **F6** — versioned directory layout touches asset paths, sitemap, and search index, so it lands before IA / theming / SEO. Implement the `versions`-not-declared compatibility mode first so it does not block the other buckets.
4. **F3** — IA shifts CSS/layout; precedes theming
5. **F4** — theming on top of new IA
6. **F2** — SEO; lightest churn, can be last (canonical/hreflang/sitemap must be aware of F6's version scope)

Ordering is advisory — buckets are designed to merge in any reasonable order with light coordination.

## Related Issues

- **FR-2710** — Epic: Backend.AI WebUI Docs — Static Site Production Uplift (this work)
- **FR-2711** — Define feature spec (this task)
- **FR-2159** — Predecessor: docs-toolkit Static Website Generation (build:web) — Done
- **FR-2160** — Predecessor: docs-toolkit Website UX Features — Done
