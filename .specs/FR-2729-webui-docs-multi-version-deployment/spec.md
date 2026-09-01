# Multi-version Deployment for WebUI Docs Site Spec (v1 — Minimal)

> **Epic**: FR-2729 ([link](https://lablup.atlassian.net/browse/FR-2729))
> **Spec Task**: FR-2730 ([link](https://lablup.atlassian.net/browse/FR-2730))
> **Predecessors (Done)**: FR-2710 (`docs-site-production-uplift`), FR-2719 (per-language User Guide PDFs in CI release workflow)
> **Status**: Draft
> **Created**: 2026-04-26

## Overview

This spec defines the **v1 deployment pipeline** for `packages/backend.ai-webui-docs/`, hosted on AWS Amplify, with two simultaneously live channels: a **latest stable** channel pinned to the most recent release minor (initially `26.4`, sourced from tag `v26.4.7`) and a **`next`** channel built from `main`. It is the direct follow-up to **FR-2710** (`docs-site-production-uplift`), which delivered the toolkit, the `dist/web/<version>/<lang>/...` output layout, the header version selector, and version-aware SEO metadata, but explicitly deferred the deployment of those artefacts to a hosting platform.

This v1 deliberately **stays inside FR-2710 F6's existing model** — archive branches hold built site artefacts produced with the toolkit-of-their-day, and the deploy pipeline merges them. The two upstream pieces this depends on are already merged to `main`: FR-2710 delivered the toolkit and `dist/web/<version>/<lang>/...` layout, and FR-2719 added the `build_docs` job to `.github/workflows/package.yml` so every published release ships per-language User Guide PDFs (en/ko/ja/th) as release assets. The third related concern — applying *current* toolkit features to old release content (overlay build) — remains out of scope here and is tracked as a follow-up spec.

## Goals

- Versioned hosting on AWS Amplify with two channels live concurrently: **latest stable** (initially `26.4` from tag `v26.4.7`) and **`next`** (built from `main`).
- One-time use of the existing `docs-archive-orphan-branch.yml` workflow to publish the `26.4` archive branch.
- **Per-version PDF download** for releases whose `release: published` event has run the FR-2719 `build_docs` job and uploaded PDFs as release assets (initially `v26.4.7`). The site renders a card linking directly to the GitHub Release CDN — no PDF pipeline work in this spec, FR-2719 already produces them.
- **"Previous versions"** entry in the version selector linking out to a legacy docs hostname (target URL configurable; hidden if unset for v1 launch).
- **`next` is reachable but never advertised as latest** — root never redirects to `next`, canonical/sitemap never points to `next`, the version selector marks `next` as "pre-release".
- Future toolkit/docs changes on `main` rebuild `next` automatically via paths-filter.

## Non-goals (v1)

- **Overlay build** (applying current toolkit to tagged content) — deferred to a follow-up spec. v1 uses FR-2710 F6's archive-branch-as-built-artefact model.
- **PDF generation pipeline** — already delivered by FR-2719 (merged). This spec only consumes its outputs.
- **Backfilling 26.3 and earlier minors as archives** — those minors fall under the "Previous versions" link. Backfill, if desired, is a separate follow-up effort that requires `--strict` build vetting per FR-2710 F6.
- **Patch-level deep links in the selector** — FR-2710 F6 mandates minor-only granularity (`26.4`, not `26.4.7`). The patch tag appears only inside the PDF filename.
- Cross-version search (search index per version only).
- Legacy URL redirect map — legacy is just a link out.
- Auto-generated changelog inside the PDF.
- Backporting docs fixes to old archives — once a version is published, its archive is immutable.
- Enforcing i18n key parity across versions — each version's translations are frozen at its archive time.

## User Stories

- **As a release manager** publishing tag `v26.4.7`, I run the existing `docs-archive-orphan-branch.yml` workflow once with `source_ref=v26.4.7` and `minor_label=26.4`. The workflow builds with the toolkit-of-its-day and pushes the orphan branch `docs-archive/26.4`. The deployed site picks up `26.4` from this branch.
- **As a release manager** publishing a future tag `vX.Y.Z`, I follow the same one-step archive workflow. The FR-2719 release workflow has already attached the per-language PDFs to the GitHub Release automatically. I update `versions:` in `docs-toolkit.config.yaml` on `main` to add the new minor (with `pdfTag: "vX.Y.Z"`) and shift `latest: true` to it. The site picks up both the archive content and the new PDF links at the next Amplify build.
- **As a docs reader** visiting `https://webui.docs.backend.ai/`, I land on `/26.4/<my-language>/`.
- **As a docs reader** switching versions via the header selector, the URL, content, and (when available) PDF download card update for the chosen version.
- **As a docs reader needing pre-toolkit content** (anything before 26.4 in v1), I pick **"Previous versions"** at the bottom of the selector and am navigated to the legacy hostname.
- **As a docs maintainer** pushing a docs or toolkit change to `main` (under `packages/backend.ai-webui-docs/**` or `packages/backend.ai-docs-toolkit/**`), the `next` channel rebuilds automatically. Pushes outside those paths do not rebuild.
- **As a curious reader**, I can opt into `next` by selecting it from the selector; I never land there from the root URL or from a search-engine canonical link.

## Functional Requirements

### FR-1 — AWS Amplify app and production hostname

A single AWS Amplify app serves the entire site at `https://webui.docs.backend.ai` over HTTPS. Source: this GitHub repo's `main` branch. The Amplify app is configured as a **monorepo deployment** with the App root set to `packages/backend.ai-webui-docs`, so Amplify reads `packages/backend.ai-webui-docs/amplify.yml` (NOT a repo-root file). Amplify build phase runs `pnpm install` (which walks up to find the workspace `pnpm-workspace.yaml` and installs the whole monorepo) and then `pnpm --filter backend.ai-webui-docs run build:web`, publishing the package's `dist/web/` directory.

### FR-2 — Initial `26.4` archive branch

The existing `docs-archive-orphan-branch.yml` workflow is run once with `source_ref=v26.4.7` and `minor_label=26.4`, producing the orphan branch `docs-archive/26.4`. No code changes to that workflow are made in v1.

### FR-3 — `versions:` declaration in toolkit config

`packages/backend.ai-webui-docs/docs-toolkit.config.yaml` adds a `versions:` list:

```yaml
versions:
  - label: "26.4"
    source: { kind: archive-branch, ref: docs-archive/26.4 }
    latest: true
    pdfTag: "v26.4.7"
  - label: "next"
    source: { kind: workspace }
```

`pdfTag` is a new optional field (FR-7). The toolkit's existing FR-2710 F6 implementation already handles `archive-branch` and `workspace` source kinds.

### FR-4 — Root redirect to latest stable

The site root (`/`) redirects to the `latest: true` minor's default-language landing page. Initially `/` → `/26.4/<default-lang>/`. Whenever the deployed `versions:` list points `latest: true` at a different minor (next release), the redirect target follows automatically — no Amplify dashboard edit.

### FR-5 — `next` is opt-in

No URL under the site root resolves to `next` content unless the path explicitly contains `/next/`. The root redirect, canonical links, and sitemap never reference `next`.

### FR-6 — Version selector ordering

The header version selector renders entries in this order:

1. `next` — top of the dropdown, with a "pre-release" badge.
2. Released minors in semver-descending order (initially just `26.4`).
3. **"Previous versions"** — bottom of the dropdown, links out (target `_blank`) to a hostname configured via Amplify environment variable `LEGACY_DOCS_URL`. If the env var is unset, the entry is hidden.

### FR-7 — Per-version PDF card via GitHub Release link

For any minor in `versions:` whose entry has `pdfTag: "vX.Y.Z"` set, the toolkit renders a "Download PDF (this version)" card on that minor's per-language landing page. The card's href is constructed deterministically:

```
https://github.com/lablup/backend.ai-webui/releases/download/{pdfTag}/Backend.AI_WebUI_User_Guide_{pdfTag}_{lang}.pdf
```

Minors without `pdfTag` (including `next`) render no card. The existing `pdfFilenameTemplate` in `docs-toolkit.config.yaml` (`Backend.AI_WebUI_User_Guide_{version}_{lang}.pdf`) is **left unchanged** — the toolkit's `getDocVersion()` substitutes `{version}` with a value that already includes the `v` prefix (e.g., `v26.4.7`), so the produced filename matches the GitHub Release convention without a literal `v` in the template. This was discovered during in-house review; an earlier draft of this spec incorrectly prescribed adding a literal `v` to the template, which would have produced double-`v` filenames (e.g., `..._vv26.4.7_en.pdf`) at the next release. The PDF card href in FR-2732 builds the URL from `pdfTag` (which already starts with `v`), keeping the URL and the released asset name in sync.

### FR-8 — paths-filter rebuild trigger

Amplify's GitHub-app integration is configured with a paths-filter so that pushes to `main` rebuild only when at least one changed file matches:

```
packages/backend.ai-webui-docs/**
packages/backend.ai-docs-toolkit/**
```

No cron / scheduled rebuilds. If a build fails, Amplify keeps the last-successful deployment serving — no manual rollback.

### FR-9 — Release runbook update

The release runbook (where releases are documented in this repo) is updated to require, for every new release tag:

1. Run `docs-archive-orphan-branch.yml` with `source_ref=<tag>` and `minor_label=<MAJOR.MINOR>`. (Manual workflow_dispatch — FR-2710 F6 design.)
2. Verify FR-2719's `build_docs` job in `package.yml` succeeded for that release (PDFs are uploaded automatically as release assets — no manual step).
3. Update `versions:` in `docs-toolkit.config.yaml` on `main` to add the new minor entry with `pdfTag: "v<version>"`, and move `latest: true` to it.

## Acceptance Criteria

### FR-1 — Amplify app & domain
- Visiting `https://webui.docs.backend.ai/` over HTTPS returns a 200 (after redirect chain) for at least the latest minor's default-language landing page. No mixed-content warnings; valid certificate.
- The Amplify console shows exactly one app whose source is this GitHub repo's `main` branch.

### FR-2 — `26.4` archive branch
- A branch `docs-archive/26.4` exists on the remote, contains the rendered site (no source files), and includes the `.archive-info.txt` sentinel produced by the workflow.
- Local `git ls-remote origin docs-archive/26.4` returns a non-empty SHA.

### FR-3 — `versions:` declared
- `packages/backend.ai-webui-docs/docs-toolkit.config.yaml` parses successfully and contains the `versions:` list with both `26.4` (with `pdfTag`) and `next` entries.
- `pnpm --filter backend.ai-webui-docs run build:web` produces `dist/web/26.4/<lang>/...` and `dist/web/next/<lang>/...` with content for all four locales.

### FR-4 — Root redirect
- `curl -I https://webui.docs.backend.ai/` returns a 3xx whose `Location` points to `/26.4/<some-lang>/` (the language-picker logic from FR-2710 F1 chooses the lang).
- After a hypothetical future change of `latest: true` to a higher-semver minor and a redeploy, the redirect target updates without Amplify dashboard edits.

### FR-5 — `next` opt-in
- No path under `https://webui.docs.backend.ai/` other than `/next/...` resolves to `next` content.
- `<link rel="canonical">` on shared-slug pages and the sitemap's "latest" entries never point to `/next/...`.

### FR-6 — Selector
- Opening the version selector shows `next` first with a "pre-release" badge.
- Released minors are listed in semver-descending order below `next`.
- The bottom entry is **"Previous versions"**. When `LEGACY_DOCS_URL` is set in Amplify env, clicking it opens that URL in a new tab. When unset, the entry is not rendered.

### FR-7 — PDF card
- Visiting `/26.4/en/` renders a "Download PDF (this version)" card whose link targets `https://github.com/lablup/backend.ai-webui/releases/download/v26.4.7/Backend.AI_WebUI_User_Guide_v26.4.7_en.pdf`. Same shape for `ko`, `ja`, `th`.
- A `HEAD` request to that URL returns 200 (asset exists in the GitHub Release).
- Visiting `/next/<lang>/` renders no PDF card (no disabled control, no tooltip).
- `pdfFilenameTemplate` value matches the produced/uploaded filename convention.

### FR-8 — Build trigger
- A push to `main` modifying only files outside `packages/backend.ai-webui-docs/**` and `packages/backend.ai-docs-toolkit/**` does not trigger an Amplify build.
- A push touching at least one file inside either path triggers an Amplify build.
- Inducing a build failure (e.g., a `--strict` link breakage) leaves the previous successful deployment serving — Amplify does not roll forward to the broken build.

### FR-9 — Runbook update
- The repo's release runbook (e.g., `docs/release-runbook.md` or whichever file the team uses) lists the three steps under FR-9 and is referenced from the release process documentation.

## Architecture Decisions

- **Stay inside FR-2710 F6's existing model in v1.** Archive branches hold built artefacts produced with the toolkit-of-their-day. Overlay (current toolkit + tagged content) is deferred to a follow-up spec. Rationale: lets v1 ship without redefining `archive-branch` semantics or rewriting `docs-archive-orphan-branch.yml`.
- **Single Amplify app + path-based routing.** All archive branches plus `next` are merged at build time into one `dist/web/<minor>/<lang>/...` tree. Rationale: matches FR-2710 F6 output 1:1, keeps DNS/SSL setup minimal, centralizes redirect rules.
- **PDF via direct GitHub Release CDN link.** Reuses FR-2719's already-merged release pipeline that uploads `Backend.AI_WebUI_User_Guide_v<version>_<lang>.pdf` per release. Rationale: zero new infrastructure on this side; future releases automatically have downloadable PDFs once `pdfTag` is set in `versions:`.
- **Minor granularity in selector.** Patch suffix appears only in the PDF filename; the URL and selector use minor labels. Rationale: FR-2710 F6 decision; selector stays short and scannable.
- **`next` from `main`, paths-filter, no cron.** `next` rebuilds only when docs/toolkit packages actually change. Rationale: avoids noisy rebuilds; keeps `next` content meaningful.
- **Last-successful-build fallback for `next`.** Amplify's default behaviour is sufficient — no extra build gate. Rationale: keeps `next` always reachable; broken builds do not propagate.

## Dependencies / Open Items

- **AWS Amplify account & IAM ownership.** Confirm who owns the AWS account hosting the Amplify app, and which team members have console / CLI access to configure builds, environment variables, and custom domains.
- **DNS for `webui.docs.backend.ai`.** Production hostname must be set up and pointed at the Amplify app's CloudFront distribution. Confirm whether this record already exists or needs to be created. **Block on this before launch.**
- **`LEGACY_DOCS_URL` env var value.** The "Previous versions" link target. Until set, the entry is hidden — v1 can launch without it. The team is responsible for confirming whether to stand up a new hostname (e.g., `webui.legacy-docs.backend.ai`) or repoint to an existing legacy URL.
- **Release runbook file location.** The runbook update under FR-9 needs to land in whatever file the team currently uses to document the release process. Confirm path before merging.
- **Follow-up spec — Overlay build.** Track separately. Captures: archive-branch schema redefinition (built artefact → source snapshot), `docs-archive-orphan-branch.yml` rewrite, build-time application of current toolkit to tagged content.

## Out of Scope

- Cross-version search.
- Legacy URL redirect map — legacy is just a link out.
- Auto-changelog in PDF.
- Backporting docs fixes to old archives — versions are immutable once published.
- Enforcing i18n key parity across versions.
- Overlay build (current toolkit on tagged content) — separate follow-up spec.
- PDF generation pipeline — already delivered by FR-2719; this spec only consumes.
- Backfilling 26.3 and earlier minors as archives — covered by "Previous versions" link in v1.
- Patch-level deep links in the selector — FR-2710 F6 mandates minor-only granularity.

## Related Issues

- **FR-2710** — Predecessor (Done): `docs-site-production-uplift` (toolkit + versioned output layout). This v1 spec consumes its output directly without redefining its semantics.
- **FR-2719** — Predecessor (Done): per-language User Guide PDFs in CI release workflow. This v1 spec consumes its release assets via direct CDN link.
- **Future** — Overlay build spec (current toolkit on tagged content).
