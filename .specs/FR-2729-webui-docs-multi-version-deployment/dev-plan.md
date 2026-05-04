# Multi-version Deployment for WebUI Docs Site — Dev Plan

> **Epic**: FR-2729 ([link](https://lablup.atlassian.net/browse/FR-2729))
> **Spec Task**: FR-2730 ([link](https://lablup.atlassian.net/browse/FR-2730))
> **Spec**: `.specs/FR-2729-webui-docs-multi-version-deployment/spec.md`
> **Predecessors (Done, in `main`)**: FR-2710, FR-2719
> **Created**: 2026-04-26

## How to read this plan

The 9 FRs in the spec split cleanly into **two kinds of work**:

- **Code sub-tasks** (FR-2731–FR-2736) — each becomes its own branch off `main` (sibling of the spec PR #7045) and its own PR. They are **not** stacked on the spec PR; the spec is a planning artefact, not a dependency.
- **Operational sub-tasks** (FR-2737–FR-2739) — tracked as Jira issues for visibility but produce no code PR. AWS console / GitHub Actions UI work.

Each code sub-task is small enough for one PR. Toolkit changes live in `packages/backend.ai-docs-toolkit/` (the schema owner); the consumer-side `versions:` declaration lives in `packages/backend.ai-webui-docs/docs-toolkit.config.yaml`. We deliberately do **not** introduce `pdfTag` parsing in two places.

`next` content already builds via `kind: workspace` (FR-2710 F6). No new source-kind logic is added in v1.

## Sub-tasks

### Code sub-tasks (each → one PR, sibling of spec PR off `main`)

#### 1. FR-2731 — Toolkit: add `pdfTag` field to versions schema

- **Type**: code
- **Owner**: dev (toolkit author)
- **Files touched**:
  - `packages/backend.ai-docs-toolkit/src/config.ts` (add `pdfTag?: string` to `VersionEntry`)
  - `packages/backend.ai-docs-toolkit/src/versions.ts` (validate shape, expose on runtime `Version`)
  - `packages/backend.ai-docs-toolkit/src/versions.test.ts` (schema tests)
  - `packages/backend.ai-docs-toolkit/src/website-generator.ts` (thread into per-page context)
- **Dependencies**: none
- **Blocks**: FR-2732, FR-2734
- **Acceptance check**: `pnpm --filter backend.ai-docs-toolkit run test` passes; well-formed `vX.Y.Z` accepted, malformed (`26.4.7` no `v`, `v26.4` no patch) rejected; no behavior change for consumers without `pdfTag`.
- **Review complexity**: Medium (new schema + validation, but small surface).

#### 2. FR-2732 — Toolkit: render per-version PDF download card on landing page

- **Type**: code
- **Owner**: dev (toolkit author)
- **Files touched**:
  - `packages/backend.ai-docs-toolkit/src/website-builder.ts` (card render on language-landing template only)
  - `packages/backend.ai-docs-toolkit/src/website-generator.ts` (pass `pdfTag` + `lang` into the builder)
  - `packages/backend.ai-docs-toolkit/src/styles-web.ts` (BAI-token CSS, no new colors)
  - new test for the URL builder across en/ko/ja/th
  - new i18n strings (card label + sub-text) in en/ko/ja/th
- **Dependencies**: blocked by **FR-2731**
- **Blocks**: FR-2734 (config wiring lights up the card)
- **Acceptance check**: built `/26.4/en/` page contains an anchor with href exactly `https://github.com/lablup/backend.ai-webui/releases/download/v26.4.7/Backend.AI_WebUI_User_Guide_v26.4.7_en.pdf` (verified by string match in build output, given consumer config sets `pdfTag: "v26.4.7"`); `/next/<lang>/` contains no card markup at all (no disabled control, no tooltip).
- **Review complexity**: Medium.

#### 3. FR-2733 — Toolkit: "Previous versions" selector tail with `LEGACY_DOCS_URL` env var

- **Type**: code
- **Owner**: dev (toolkit author)
- **Files touched**:
  - `packages/backend.ai-docs-toolkit/src/config.ts` (add `legacyDocsUrl?: string`)
  - `packages/backend.ai-docs-toolkit/src/website-builder.ts` (extend `buildVersionSwitcher`; extend inline script to handle the legacy-URL branch)
  - `packages/backend.ai-docs-toolkit/src/website-generator.ts` (thread value into page context)
  - new tests (URL set → entry rendered + handler triggers `window.open`; URL unset → entry hidden)
- **Dependencies**: none (independent of the `pdfTag` chain — different render path)
- **Blocks**: FR-2739 (operational env-var sub-task)
- **Acceptance check**: with `legacyDocsUrl: "https://example.test/legacy"` in config, the selector renders the entry at the bottom and selecting it opens the URL in a new tab; with the field unset, no entry rendered (no empty option, no separator); existing version-switch behavior unchanged.
- **Review complexity**: Medium (touches the inline-script budget; keep total < 1 KB).

#### 4. FR-2734 — webui-docs: declare `versions:` in `docs-toolkit.config.yaml`

- **Type**: code (config-only)
- **Owner**: dev (consumer maintainer)
- **Files touched**:
  - `packages/backend.ai-webui-docs/docs-toolkit.config.yaml` only
- **Dependencies**: blocked by **FR-2731**, **FR-2732**; soft-blocked by **FR-2733** (only if also wiring `legacyDocsUrl` here)
- **Blocks**: live deployment of the new artefacts (paired with FR-2735 and FR-2738)
- **Acceptance check**: `pnpm --filter backend.ai-webui-docs run build:web` produces `dist/web/26.4/<lang>/...` and `dist/web/next/<lang>/...` for all four locales; `/26.4/<lang>/` landing renders the PDF card with the v26.4.7 GitHub Release URL; `/next/<lang>/` renders no card; `scripts/verify.sh` passes.
- **Review complexity**: Low (config-only, no logic).

#### 5. FR-2735 — Package: add `amplify.yml` with build, paths-filter, and root redirect rules

- **Type**: code
- **Owner**: dev (with DevOps coordination for any console-side settings)
- **Files touched**:
  - `packages/backend.ai-webui-docs/amplify.yml` (new) — co-located with the deployed package, NOT at the repo root, since this is a monorepo and the docs site is just one package's deployment. Requires Amplify console "App root" set to `packages/backend.ai-webui-docs`.
  - `packages/backend.ai-webui-docs/amplify-redirects.json` (new) — versioned source-of-truth for console-managed redirect rules.
  - possibly a small toolkit helper that emits `_redirects` from `versions[latest=true]` if approach 1 (build-time-generated redirect map) is chosen — see sub-task description for the alternatives.
- **Dependencies**: independent of toolkit code sub-tasks; coordinated with FR-2737
- **Blocks**: end-to-end acceptance of FR-1 / FR-4 / FR-5 / FR-8
- **Acceptance check**: a push to `main` modifying only files outside the two filtered paths does **not** trigger an Amplify build; a push touching either path does; `curl -I https://webui.docs.backend.ai/` returns a 3xx whose `Location` is `/26.4/<some-lang>/`; `sitemap.xml` lists no `/next/...` URL as a canonical entry; an induced build failure leaves the previous successful deployment serving.
- **Review complexity**: Medium (build config; mistakes here can break deploys).

#### 6. FR-2736 — Docs: update release runbook with multi-version deployment steps

- **Type**: code (markdown)
- **Owner**: dev (with release manager review)
- **Files touched**:
  - `docs/release-runbook.md` (new file — the repo currently has no release runbook; only `docs/DOCUMENTATION_GUIDE.md` exists)
  - small pointer from `docs/DOCUMENTATION_GUIDE.md` or `README.md`
- **Dependencies**: none
- **Blocks**: nothing on this launch; gates *next* release accuracy
- **Acceptance check**: the file lists the three FR-9 steps verbatim and is referenced from existing release process documentation.
- **Review complexity**: Low.

### Operational sub-tasks (Jira-tracked, no code PR)

#### 7. FR-2737 — Operational: provision AWS Amplify app, custom domain, HTTPS cert

- **Type**: operational
- **Owner**: DevOps
- **Tasks**: create the Amplify app pointing at `lablup/backend.ai-webui` `main`; **set "App root" to `packages/backend.ai-webui-docs` in App settings → General** (monorepo configuration — required so Amplify reads `amplify.yml` from inside the package, not the repo root); provision custom domain `webui.docs.backend.ai`; bind ACM cert; verify HTTPS 200 at the domain. Also copy the redirect rules from `packages/backend.ai-webui-docs/amplify-redirects.json` into the Amplify console (Rewrites and redirects), and set "Watched paths" to `packages/backend.ai-webui-docs/**` and `packages/backend.ai-docs-toolkit/**`.
- **Open items**: AWS account ownership; DNS record for `webui.docs.backend.ai` (block on this before launch).
- **Dependencies**: soft-blocked by FR-2735 (use `amplify.yml` once it lands; can start provisioning before)
- **Blocks**: FR-2739, end-to-end acceptance of FR-1
- **Acceptance check**: `https://webui.docs.backend.ai/` returns 200 with valid cert; Amplify console shows exactly one app for this repo's `main`.

#### 8. FR-2738 — Operational: dispatch `docs-archive-orphan-branch.yml` for `v26.4.7` → `docs-archive/26.4`

- **Type**: operational
- **Owner**: release manager
- **Tasks**: trigger the existing workflow (`source_ref=v26.4.7`, `minor_label=26.4`, `dry_run=false`) once; verify orphan branch on origin.
- **Dependencies**: independent (workflow already exists from FR-2710 F6); meaningful only once FR-2734 (consumer config) is merged so the deploy actually consumes `docs-archive/26.4`.
- **Blocks**: FR-2 acceptance criterion.
- **Acceptance check**: `git ls-remote origin docs-archive/26.4` returns a non-empty SHA; branch contains `.archive-info.txt` and a built site.

#### 9. FR-2739 — Operational: set `LEGACY_DOCS_URL` env var in Amplify (deferrable)

- **Type**: operational
- **Owner**: DevOps (with team agreement on the URL value)
- **Tasks**: decide legacy hostname; set `LEGACY_DOCS_URL` in Amplify env; rebuild; verify selector entry.
- **Dependencies**: blocked by FR-2733 and FR-2737
- **Blocks**: nothing on launch path — purely post-launch enhancement; the spec explicitly allows v1 to launch with the entry hidden.
- **Acceptance check**: 'Previous versions' renders at the bottom of the selector and opens the configured URL in a new tab.

## Wave order

All code sub-tasks branch off `main` as **siblings** (not stacked on the spec PR #7045). The spec PR is a planning artefact; code reviewers should be able to view each implementation PR independently.

```
Wave 1 (parallel — start immediately)
  ├── FR-2731  toolkit: pdfTag schema                    (code)
  ├── FR-2733  toolkit: legacy URL selector tail         (code, independent path)
  ├── FR-2735  repo: amplify.yml                          (code, build infra)
  ├── FR-2736  docs: release runbook                     (code, docs only)
  └── FR-2737  operational: provision Amplify app        (operational, DevOps)

Wave 2 (after FR-2731 merges)
  └── FR-2732  toolkit: PDF download card render        (code)

Wave 3 (after FR-2731 + FR-2732 merge)
  └── FR-2734  webui-docs: declare versions:             (code, config-only)

Wave 4 (after FR-2737 exists + FR-2734 merged)
  └── FR-2738  operational: dispatch archive workflow    (operational, release manager)

Post-launch (deferrable)
  └── FR-2739  operational: set LEGACY_DOCS_URL          (operational, DevOps)
```

End-to-end launch readiness requires: FR-2731 + FR-2732 + FR-2734 + FR-2735 + FR-2737 + FR-2738 all complete. FR-2733 + FR-2739 are nice-to-have for v1 launch (hidden if absent). FR-2736 is required for *next* release hygiene but not for this launch.

## Dependency graph

```
FR-2731 ──blocks──→ FR-2732 ──blocks──→ FR-2734
FR-2731 ─────────────blocks────────────→ FR-2734
FR-2733 ──blocks──→ FR-2739
FR-2735 ──relates──→ FR-2737
FR-2737 ──blocks──→ FR-2739
FR-2738 ──relates──→ FR-2734
FR-2736 (independent)
```

## Anti-patterns to avoid (carried forward from spec / planning notes)

- **Do NOT introduce `pdfTag` parsing in two places.** The toolkit owns the schema (FR-2731); the webui-docs config consumes it (FR-2734).
- **Toolkit code lives in `packages/backend.ai-docs-toolkit/`**, not in `packages/backend.ai-webui-docs/`. The latter is a *consumer*; only its config + content live there.
- **`next` already builds via `kind: workspace`** (FR-2710 F6). Sub-tasks must NOT add new source-kind logic.
- **Minor-only granularity** is mandated by FR-2710 F6 — do not add patch-level entries to `versions:`.
- Code sub-tasks are **siblings off `main`**, not stacked on the spec PR — they should be reviewable independently.

## Risks / concerns

- **Amplify monorepo paths-filter mechanism**: depending on whether Amplify's GitHub-app integration reads filter config from `amplify.yml` itself or only from the console, FR-2735 may need a console-side counterpart. Surface during the FR-2735 PR review and document the chosen mechanism.
- **Redirect rules source of truth**: FR-2735 has two acceptable approaches (build-time-generated `_redirects` vs static rule). The build-time path is preferred because it follows the `versions[latest=true]` flip automatically, but if it's non-trivial in this PR, file a follow-up sub-task and ship the static rule for v1.
- **Open spec items**: AWS account ownership, DNS record existence for `webui.docs.backend.ai`, `LEGACY_DOCS_URL` value, and final runbook file location — all need confirmation outside this dev plan. Track in spec "Dependencies / Open Items" section.
