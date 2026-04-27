# Release Runbook

Operational checklist for the release manager. This file documents what to
do *during* a release that goes beyond "tag the commit". Background and
design decisions live in the spec docs under `.specs/`; this file is the
short, testable checklist.

---

## Docs site multi-version deployment

From v1 of the multi-version docs site (Epic
[FR-2729](https://lablup.atlassian.net/browse/FR-2729)) onward, every
`vMAJOR.MINOR.PATCH` release tag triggers three steps on the docs side. Run
them in order. The PDFs are produced automatically by CI — there is no
manual upload step.

### 1. Run `docs-archive-orphan-branch.yml`

Trigger the workflow manually (`workflow_dispatch`) so the released minor
gets immortalized on its own orphan branch. The orphan-branch design is
specified in FR-2710 F6 — past minors are built ONCE with the toolkit they
shipped with and parked on `docs-archive/<minor>`.

Inputs:

- `source_ref` — the release tag, e.g. `v26.5.0`
- `minor_label` — the `MAJOR.MINOR` of that tag, e.g. `26.5`

Example invocation via `gh`:

```bash
gh workflow run docs-archive-orphan-branch.yml \
  -f source_ref=v26.5.0 \
  -f minor_label=26.5
```

Verify success: a new commit appears on `docs-archive/26.5` containing the
built site files (not the source tree). If the workflow fails, fix the
root cause before continuing — do **not** edit the orphan branch by hand.

Workflow file: `.github/workflows/docs-archive-orphan-branch.yml`.

### 2. Verify FR-2719's `build_docs` job in `package.yml` succeeded

The `build_docs` job in `.github/workflows/package.yml` runs automatically
on the release tag and uploads four PDFs as release assets:

- `Backend.AI_WebUI_User_Guide_v<version>_en.pdf`
- `Backend.AI_WebUI_User_Guide_v<version>_ko.pdf`
- `Backend.AI_WebUI_User_Guide_v<version>_ja.pdf`
- `Backend.AI_WebUI_User_Guide_v<version>_th.pdf`

Verify by opening the release page on GitHub and confirming all four PDFs
are attached. There is **no manual upload step** — if any PDF is missing,
investigate the `build_docs` job logs for that workflow run and rerun the
job once the underlying issue is fixed.

> **Note on the `v` prefix in PDF filenames.** The literal `v` in
> `Backend.AI_WebUI_User_Guide_v<version>_<lang>.pdf` does **not** come
> from the template literal in `docs-toolkit.config.yaml`. The template
> there is `Backend.AI_WebUI_User_Guide_{version}_{lang}.pdf` (no
> literal `v`); the `v` is injected by `getDocVersion()` in
> `backend.ai-docs-toolkit`, which substitutes `{version}` with
> `v<MAJOR.MINOR.PATCH>`. **Do not add a literal `v` to the template** —
> doing so produces double-`v` filenames
> (`Backend.AI_WebUI_User_Guide_vv26.5.0_en.pdf`). This was the regression
> reverted in PR #7061 (FR-2734); keep the template as-is.

Workflow file: `.github/workflows/package.yml` (job: `build_docs`).

### 3. Update `versions:` in `docs-toolkit.config.yaml` on `main`

Open a small PR against `main` that edits
`packages/backend.ai-webui-docs/docs-toolkit.config.yaml`:

- Add a new entry under `versions:` for the new minor, with
  `pdfTag: "v<version>"` set to the **patch-level** release tag (e.g.
  `v26.5.0`, not `v26.5`).
- Move `latest: true` to the new entry so the new minor becomes the
  default `/latest/` route.

Each entry uses `label:` (the `MAJOR.MINOR` string) and a `source:` block
that points the renderer at where to read that version's docs from. For
archived minors that means `kind: archive-branch` plus the
`docs-archive/<MAJOR.MINOR>` ref produced in step 1. The `next` entry
(unreleased trunk) uses `kind: workspace` and is left alone during a
release.

Example diff (publishing 26.5):

```yaml
 versions:
   - label: "26.4"
     source:
       kind: archive-branch
       ref: docs-archive/26.4
-    latest: true
     pdfTag: "v26.4.3"
+  - label: "26.5"
+    source:
+      kind: archive-branch
+      ref: docs-archive/26.5
+    latest: true
+    pdfTag: "v26.5.0"
   - label: "next"
     source:
       kind: workspace
```

PR title format: `feat(FR-XXXX): publish 26.5 to docs site` (replace
`FR-XXXX` with the Jira ticket created for the release-publish task and
`26.5` with the actual minor).

---

## What is NOT a runbook step

Do not add the following back into the runbook — they were considered and
rejected as part of FR-2729 / FR-2710 F6:

- **Do not manually upload PDFs to the GitHub release.** The
  `build_docs` job in `package.yml` does this automatically (see step 2).
- **Do not manually edit a `docs-archive/<minor>` branch after it is
  pushed.** The orphan branch is the immutable record of that minor's
  documentation. If the archived site is wrong, fix the source on the
  release tag, retag (or hot-fix), and rerun
  `docs-archive-orphan-branch.yml` — overwriting the branch from the
  workflow, never by hand.
- **Do not add patch-level entries to `versions:`.** The site exposes
  minors only (FR-2710 F6). `pdfTag` inside an entry is the patch-level
  tag used to fetch the right PDFs, but `versions:` itself is a list of
  minors.

---

## See also

- Spec: `.specs/FR-2729-webui-docs-multi-version-deployment/spec.md` (FR-9)
- Workflow: `.github/workflows/docs-archive-orphan-branch.yml`
- Workflow: `.github/workflows/package.yml` (job `build_docs`)
- Config: `packages/backend.ai-webui-docs/docs-toolkit.config.yaml`
