# Backend.AI Docs Toolkit & Site — Test Coverage Uplift Spec

> **Epic**: FR-2781 ([link](https://lablup.atlassian.net/browse/FR-2781))
> **Spec Task**: FR-2782 ([link](https://lablup.atlassian.net/browse/FR-2782)) — gh#7176
> **Predecessor Epics**: FR-2710 (production uplift), FR-2729 (multi-version deployment)
> **Status**: Draft
> **Created**: 2026-04-30

## Overview

Recent docs work has landed substantial changes across both `backend.ai-docs-toolkit` (the engine) and `backend.ai-webui-docs` (the consumer). The engine grew ~17 modules over the FR-2710 / FR-2729 epics, but **only 6 modules** carry unit tests today. The rendered docs site has **zero E2E coverage**. This Epic lifts both to a maintainable baseline by adding (A) a small example/boilerplate package that doubles as a test fixture, (B) targeted unit-test coverage for the uncovered toolkit modules, and (C) example-driven E2E + PDF integration tests.

The example package in (A) is intentionally dual-purpose — it is the boilerplate a downstream consumer would copy as a starting point, *and* it is the fixture against which (C) runs its integration suite. Building tests against the example (instead of `backend.ai-webui-docs`, which is huge and Lablup-specific) keeps the suite fast, hermetic, and meaningful: a regression in the toolkit shows up as a failure in (B) or (C) without dragging the full WebUI manual into the loop.

## Problem Statement

Inspecting `packages/backend.ai-docs-toolkit/src/` on 2026-04-30:

- 38 source modules (`*.ts`, excluding tests). 6 carry tests: `config`, `image-optimizer`, `markdown-extensions`, `seo`, `versions`, `website-builder`.
- 12+ modules are uncovered, including build-critical ones: `html-builder*`, `markdown-processor*`, `pdf-renderer`, `og-image-renderer`, `sitemap`, `robots-txt`, `asset-hasher`, `search-index-builder`, `image-meta`, `book-config`, `theme`, `shiki-highlighter`, `website-generator`, `preview-server*`.
- `e2e/` exists for the WebUI app but contains **no** docs-site coverage. Any UX regression on the docs site (broken redirect, missing language switcher, mis-rendered version selector, mobile drawer breakage) is caught only by manual smoke-checking the next deploy.
- `backend.ai-docs-toolkit/README.md` has no concrete starter project — new consumers must reverse-engineer `packages/backend.ai-webui-docs/` (heavy, Lablup-specific, ~30 chapters × 4 languages) to learn the toolkit.

These gaps were verified against the current `main` (commit `786086e10`).

## Goals

- Establish a **runnable example/boilerplate** that a new consumer of `backend.ai-docs-toolkit` can copy and start from.
- Reach **meaningful unit-test coverage** of the uncovered toolkit modules — not 100% line coverage, but at least one test per module exercising its primary contract.
- Add **example-driven integration tests** (Playwright web E2E + PDF artifact verification) that run against the example's build output, hermetic from `backend.ai-webui-docs`.
- Keep the change set as a **single-branch linear Graphite stack** — no fan-out, easy to maintain.

## Non-goals

- Refactoring or rewriting toolkit production code beyond what tests reveal as broken.
- Migrating away from `tsx --test` (node:test) to Jest / Vitest. The existing pattern stays.
- Visual-regression testing of docs pages (screenshots / pixel diff). Out of scope; tests assert on DOM and computed-style attributes only.
- Translation review of the example's `ko` content. The `ko` content exists to exercise CJK code paths, not to model production-quality translation.
- Adding new toolkit features. If a feature is missing for the example, it is filed as a follow-up rather than expanded into this Epic.
- Backfilling tests for `pdf-renderer` and `generate-pdf` at the unit level — they are exercised by the integration tests in C against the example's PDF output.
- Replacing `backend.ai-webui-docs` itself with the example. The two coexist.

## User Stories

- As a **toolkit maintainer**, I want a small fixture I can re-run after every change so I know whether I broke the engine without rebuilding the entire WebUI manual.
- As a **new consumer of `backend.ai-docs-toolkit`**, I want a copy-paste starter project so that I can stand up my own docs site in minutes instead of reverse-engineering a 30-chapter manual.
- As a **CI engineer**, I want unit tests that run in seconds without docker / sharp / playwright peer-deps so that toolkit CI stays cheap.
- As a **release engineer**, I want PDF artifacts validated for page count, embedded fonts (Latin + CJK), and metadata so that font-selection regressions (FR-2745 class) are caught before publish.
- As a **docs reader on mobile**, I want the docs site E2E suite to assert the hamburger drawer works so that FR-2758-class regressions are not shipped.

## Requirements

The work is grouped into **3 buckets**, exactly one PR each. The buckets land as a single-branch linear Graphite stack: `main → A → B → C`.

### A — `packages/backend.ai-docs-toolkit-example/`

A new workspace package that serves as both a **starter boilerplate** and the **test fixture** for C.

#### Must Have
- [ ] New workspace package directory: `packages/backend.ai-docs-toolkit-example/`.
- [ ] `package.json`:
  - `"name": "backend.ai-docs-toolkit-example"`, `"private": true`, `"type": "module"`
  - Scripts mirroring `packages/backend.ai-webui-docs/package.json` shape: `build:web`, `build:web:en`, `build:web:ko`, `pdf`, `pdf:en`, `pdf:ko`, `preview`, `serve:web`
  - `devDependencies.backend.ai-docs-toolkit: workspace:*`
  - `devDependencies.playwright`
- [ ] Two languages: `en` + `ko` only (Latin + CJK font path coverage; keeps build cheap).
- [ ] Minimal content per language — 3-5 chapters total, hand-written, exercising:
  - Headings (H1/H2/H3) for TOC + scroll-spy
  - Code blocks in at least 2 languages including `shellsession` (FR-2756)
  - Admonitions: note + warn + danger
  - At least one image with declared width/height (image-meta path)
  - Internal links across pages (broken-link detection / `--strict`)
  - One cross-language link via the language switcher
- [ ] Customization examples (boilerplate value):
  - Custom logo SVG inside the package (small)
  - `branding.primaryColor` override in `docs-toolkit.config.yaml` (FR-2726)
  - `book.config.yaml` uses the **grouped** navigation form (F3) — at least 2 categories
  - `versions:` declares **two entries** so the version selector renders in tests:
    - `{ label: "next", source: { kind: "workspace" }, latest: true }`
    - `{ label: "0.1", source: { kind: "workspace" } }` — same content, different label, exercises the per-version routing without needing an archive branch
  - Optional: a `pdfTag` on one entry to exercise the PDF download card (FR-2731 / FR-2732)
- [ ] `README.md`: what this is, "how to clone as a starter", what each customization knob does.
- [ ] `packages/backend.ai-docs-toolkit/README.md` is updated with a "Getting started" section linking to the example package.
- [ ] Workspace inclusion: confirm `pnpm-workspace.yaml` already globs `packages/*` (no change needed) or add the entry explicitly.

#### Acceptance
- [ ] `pnpm --filter backend.ai-docs-toolkit-example build:web` exits 0 and writes `dist/web/`.
- [ ] `pnpm --filter backend.ai-docs-toolkit-example pdf` exits 0 and writes one PDF per language.
- [ ] Custom logo + brand color visibly applied (smoke-checked screenshot in PR description).
- [ ] `bash scripts/verify.sh` passes (Relay/Lint/Format/TS).

### B — Toolkit unit test coverage expansion

Add `*.test.ts` files for currently uncovered modules in `packages/backend.ai-docs-toolkit/src/`. Use the existing `tsx --test` (node:test) pattern.

#### Currently covered (no change)
`config`, `image-optimizer`, `markdown-extensions`, `seo`, `versions`, `website-builder`.

#### Must Have — Priority 1 (pure / cheap)
- [ ] `asset-hasher.test.ts` — content-hash stability, filename collision-free, hash length contract.
- [ ] `robots-txt.test.ts` — generated content includes sitemap reference; respects `robots` config keys if any.
- [ ] `sitemap.test.ts` — covers all `versions × languages × pages`; URL structure correct; `lastmod` populated.
- [ ] `image-meta.test.ts` — PNG dimension parse on a valid fixture; graceful skip on a malformed/empty PNG (no throw).
- [ ] `book-config.test.ts` — flat nav form parses; grouped (F3) nav form parses; mixing throws or falls back per documented behavior.
- [ ] `theme.test.ts` — theme resolution / merging.

#### Must Have — Priority 2 (integration-light)
At least **4 of the following 6** must ship in this PR; the rest may be filed as follow-ups inside the same Epic:
- [ ] `shiki-highlighter.test.ts` — highlights a known snippet; cache-hit on identical input; theme override respected.
- [ ] `html-builder.test.ts` and/or `html-builder-web.test.ts` — head/body assembly, meta tag injection.
- [ ] `markdown-processor.test.ts` and/or `markdown-processor-web.test.ts` — admonition rendering, shellsession (FR-2756) round-trip, description-extraction-from-first-paragraph (F2).
- [ ] `og-image-renderer.test.ts` — SVG → PNG happy path; **must** skip (not fail) when `sharp` peer-dep is absent.
- [ ] `search-index-builder.test.ts` — bigram index built from a small fixture; query lookup returns expected ids.
- [ ] `website-generator.test.ts` — full small-fixture build smoke (single language, no `versions`); files emitted; broken link in `--strict` mode exits 1.

#### Out of scope (in this bucket)
- `pdf-renderer`, `generate-pdf` (covered by integration tests in C).
- `preview-server*` (dev-time only; covered indirectly by C if at all).
- `styles-web` / `styles` (CSS strings; trivial).
- `cli.ts` (covered by C invoking the CLI end-to-end).

#### Acceptance
- [ ] All 6 Priority 1 modules carry a `*.test.ts` with ≥ 3 meaningful cases each.
- [ ] At least 4 of the 6 Priority 2 modules carry a `*.test.ts`.
- [ ] `pnpm --filter backend.ai-docs-toolkit test` exits 0 with all new tests passing.
- [ ] Tests are **self-contained** — no test reads from `packages/backend.ai-webui-docs/`. Inline fixtures only.
- [ ] Optional peer-dep paths (`sharp`, `playwright`) are **skipped, not failed**, when the dep is absent.

### C — Example-driven integration E2E + PDF tests

Run integration suites against the example package built in A. Two suites, both living inside the example package.

#### Suite 1 — Web E2E (Playwright)
Test layout: `packages/backend.ai-docs-toolkit-example/tests/web/*.spec.ts`. Playwright `webServer` boots a static file server against `dist/web/` for hermetic CI execution.

##### Must Have
- [ ] **Root index** — visiting `/` resolves to the latest version × default language without 404 (FR-2753).
- [ ] **Language switcher** — every page exposes a switcher; clicking navigates to the same slug in the peer language; `<link rel="alternate" hreflang>` covers both languages + `x-default` (F1).
- [ ] **Version selector** — at least 2 entries shown; switching navigates to the same slug; falls back to the version's index when the slug is missing (FR-2733 / FR-2770).
- [ ] **Sidebar (grouped)** — categories render collapsibly; the active page's group auto-expands on initial load (F3).
- [ ] **Right-rail TOC + scroll-spy** — the active heading is highlighted as the page scrolls (FR-2758).
- [ ] **Mobile drawer** — at viewport width ≤ 768px the sidebar is hidden and a hamburger drawer toggles it (FR-2758).
- [ ] **Code blocks** — Shiki tokens present in DOM; Copy button present and copies the source on click (F4).
- [ ] **PDF download card** — per-version PDF link present on the language landing page (FR-2732). For versions without a `pdfTag`, the card is absent or shows the documented placeholder.
- [ ] **Internal navigation** — a sample chapter→chapter link click does not 404; breadcrumb updates.

#### Suite 2 — PDF artifact verification
Test layout: `packages/backend.ai-docs-toolkit-example/tests/pdf/*.test.ts`, using `tsx --test` + `pdf-lib`.

##### Must Have
- [ ] Build PDFs for `en` + `ko` as a setup step (or assume `pnpm pdf` ran first; documented in test README).
- [ ] **Page count** — non-zero, and within ±20% of a baseline recorded in a JSON fixture inside the package. Baseline is committed and updated by hand.
- [ ] **Text extraction** — `pdf-lib` extracts text containing known fixture strings (e.g., the example's quickstart H1).
- [ ] **Embedded fonts** — the en PDF embeds at least one Latin font; the ko PDF embeds at least one CJK-capable font (FR-2745).
- [ ] **Metadata** — `Title`, `Author`, `Subject`, `Creator` match `pdfMetadata` declared in the example's `docs-toolkit.config.yaml`.

#### Wiring
- [ ] `package.json` adds: `"test:e2e": "playwright test --config tests/web/playwright.config.ts"`, `"test:pdf": "tsx --test tests/pdf/*.test.ts"`, `"test": "pnpm test:pdf && pnpm test:e2e"`.
- [ ] Playwright config builds `dist/web/` if absent and serves it via `webServer`.
- [ ] PR description records the recorded baseline page counts so future drift is visible.

#### Acceptance
- [ ] Web E2E suite covers the 9 categories above with at least one assertion each.
- [ ] PDF suite covers en + ko, asserts text + fonts + metadata.
- [ ] All tests run from a clean state via `pnpm --filter backend.ai-docs-toolkit-example test`.
- [ ] No test depends on `packages/backend.ai-webui-docs/` content.

## Constraints

- Stay within the existing test framework (`tsx --test` / node:test) for unit tests; Playwright for E2E.
- Tests must run on the standard Linux CI runner without docker.
- No new top-level repo dev-dependencies — peer-deps (`sharp`, `playwright`) live inside the relevant package.
- Total CI wall-clock cost added by this Epic should stay under ~3 minutes on the docs-toolkit job (rough budget: 30s for B, 90s for C web, 60s for C pdf).
- Linear Graphite stack only — `main → A → B → C`. No fan-out.

## Out of Scope

- Refactoring toolkit production code beyond test-revealed bugs.
- Migrating away from `tsx --test`.
- Visual-regression / pixel-diff testing.
- Translation review of example `ko` content.
- New toolkit features.
- `pdf-renderer` / `generate-pdf` unit tests (covered by C integration).
- `preview-server*` unit tests.
- Replacing `backend.ai-webui-docs` with the example.

## Risks

- **Example drift from real consumer (`backend.ai-webui-docs`)** — the example may over- or under-exercise toolkit features compared to the real consumer. Mitigation: each new toolkit feature should consider whether the example needs an update; this is enforced by review, not tooling.
- **Playwright peer-dep weight** — Playwright pulls browsers (~250 MB). Mitigation: keep Playwright as a `devDependency` of the example package only; CI installs once per job.
- **PDF baseline brittleness** — page count baselines may drift on every content tweak. Mitigation: use a wide ±20% tolerance; baseline is hand-edited and reviewed.
- **CJK font availability on CI** — the ko PDF font test assumes the toolkit can resolve a CJK font on the CI runner. Mitigation: rely on the toolkit's existing font-resolution logic (FR-2745); if it fails on CI, the example should ship the required font under `assets/fonts/`.
- **Version selector test without a real archive branch** — declaring a second `versions[]` entry pointing at the workspace re-uses the same content. Acceptable for testing the **selector** behavior; orphan-branch logic is exercised by the real consumer's CI, not the example.
- **Webhook lag for cloned issues** — Jira → GitHub clone is async. Mitigation: spec/dev-plan use Jira keys; GitHub numbers are filled in once observed.

## Implementation Strategy Notes (for dev-planner)

- Start with **A** because B and C both reference example artifacts.
- B and C are independent in code, but the linear-stack constraint (per the request) means B lands before C. Reviewers can read B in isolation and then C reads naturally as "now plug the example in".
- The stack base is `main`. Each PR is `gt create` on top of the previous.
- Every PR runs `bash scripts/verify.sh` before push.
- C requires running `pnpm --filter backend.ai-docs-toolkit-example build:web` and `pdf` before its tests; bake that into Playwright `webServer` and a setup script for PDF.

## Related Issues

- **FR-2781** — Epic (this work)
- **FR-2782** — spec sub-task (this document) — gh#7176
- **FR-2783** — A: example/boilerplate package — gh#7177
- **FR-2784** — B: toolkit unit test coverage expansion — gh#7178
- **FR-2785** — C: example-driven E2E + PDF tests — gh#7179
- **FR-2710** — Predecessor Epic: Static Site Production Uplift (Done)
- **FR-2729** — Predecessor Epic: Multi-version Deployment (Done)
