# docs-toolkit Architecture Reference

Technical reference for the `backend.ai-docs-toolkit` package internals.
This document helps developers and AI agents understand the codebase before making changes.

## Overview

A TypeScript-based documentation engine that transforms Markdown into PDF and HTML output.
Two rendering pipelines share a common markdown processing core.

```
book.config.yaml  ──┐
                    ├── markdown-processor.ts ──→ PDF pipeline
docs-toolkit.config.yaml                        (Playwright → pdf-lib)
                    ├── markdown-processor-web.ts ──→ HTML preview
                    │                                 (single-page, live-reload)
src/{lang}/*.md ────┘
```

## File Map

| File | Purpose |
|------|---------|
| `cli.ts` | CLI entry point. Routes commands: `pdf`, `preview`, `preview:html`, `init`, `agents` |
| `config.ts` | Config loading (`docs-toolkit.config.yaml`), defaults, type definitions |
| `markdown-processor.ts` | PDF markdown pipeline. Shared utilities: `slugify`, `deduplicateH1`, `substituteTemplateVars`, `normalizeRstTables`, `convertIndentedNotes`, `resolveMarkdownPath` |
| `markdown-processor-web.ts` | Web HTML pipeline. Two-pass rendering with anchor registry. **Has `multiPage` flag already** |
| `markdown-extensions.ts` | Admonition processing, code block title/highlight parsing, figure labels, image size hints |
| `html-builder.ts` | PDF HTML template (cover page, TOC, chapters with page breaks) |
| `html-builder-web.ts` | Web HTML template (sidebar + content, single-page layout, live-reload script) |
| `styles.ts` | PDF CSS (A4 print layout, CJK typography) |
| `styles-web.ts` | Web CSS (Infima variables, responsive layout, admonition styles) |
| `generate-pdf.ts` | PDF orchestrator. Reads config, processes markdown, renders via Playwright |
| `pdf-renderer.ts` | Playwright PDF rendering, multi-pass page number injection |
| `preview-server.ts` | PDF preview dev server (live-reload) |
| `preview-server-web.ts` | HTML preview dev server (live-reload, image serving) |
| `version.ts` | Version resolution from `package.json` |
| `theme.ts` | PDF theme definitions |
| `sample-content.ts` / `sample-content-markdown.ts` | Style catalog sample content |
| `index.ts` | Public API exports |

## Core Data Types

```typescript
// A processed markdown chapter ready for rendering
interface Chapter {
  title: string;        // From book.config.yaml nav entry
  slug: string;         // slugify(title), e.g. "session-page"
  htmlContent: string;  // Rendered HTML
  headings: Heading[];  // Collected during rendering
}

interface Heading {
  level: number;   // 1-6
  text: string;    // Plain text (tags stripped)
  id: string;      // e.g. "session-page-resource-summary-panels"
}
```

## Anchor ID System

All heading IDs follow the pattern: `{chapterSlug}-{headingSlug}`

- Chapter slug: `slugify(nav.title)` from `book.config.yaml`
  - Example: `"Session Page"` → `"session-page"`
- Heading slug: `slugify(headingText)`
  - Example: `"Resource Summary Panels"` → `"resource-summary-panels"`
- Final ID: `"session-page-resource-summary-panels"`

Explicit anchors (`<a id="custom-id">`) keep their raw ID without chapter prefix.

### Anchor Registry (Web pipeline only)

Built in `markdown-processor-web.ts`:

```typescript
interface AnchorRegistry {
  anchors: Map<string, AnchorEntry[]>;  // rawId → entries across chapters
  resolvedIds: Set<string>;              // all final IDs for quick lookup
}
```

**Two-pass rendering**:
1. Pass 1: Render all chapters, collect headings and explicit anchors into registry
2. Pass 2: Rewrite `href="#anchor"` links using the registry

**Cross-page link resolution** (`rewriteCrossPageLinks`):
- Same-chapter links: rewrite to chapter-prefixed resolved ID
- Cross-chapter links (single-page mode): rewrite to `#resolvedId`
- Cross-chapter links (**multi-page mode**): rewrite to `./{targetSlug}.html#resolvedId`
- The `multiPage` parameter already exists but is currently always `false`

## Markdown Processing Pipeline

Both PDF and Web pipelines share these preprocessing steps (in order):

1. `deduplicateH1` — Remove duplicate H1 headings (RST migration artifact)
2. `substituteTemplateVars` — Replace `|year|`, `|version|`, `|date|` etc.
3. Image path rewriting — Resolve relative paths for the target environment
4. `normalizeRstTables` — Convert RST grid tables to Markdown tables
5. `convertIndentedNotes` — Convert 3-space indented blocks to blockquotes
6. `processAdmonitions` — Convert `:::note` blocks to HTML divs with icons
7. `processCodeBlockMeta` — Extract `title="..."` and `{1,3-5}` from code fences

Then `marked` renders with a custom renderer that handles headings, images, and code blocks.

## Configuration

### `docs-toolkit.config.yaml` (toolkit-level)

Controls engine behavior: title, company, paths, PDF settings, language labels, agent templates.

Key fields for website feature:
- `languageLabels` — Display names per language
- `localizedStrings` — "User Guide", "Table of Contents" per language
- `admonitionTitles` — Localized admonition type labels
- `figureLabels` — "Figure" label per language

### `src/book.config.yaml` (content-level)

Defines navigation structure per language. Each entry has `title` and `path`:

```yaml
navigation:
  en:
    - title: Session Page
      path: session_page/session_page.md
```

The `path` is relative to `src/{lang}/`.

## Preview Server Architecture

`preview-server-web.ts`:
- Node.js `http.createServer` (no Express or framework)
- Routes: `/` (HTML page), `/__reload` (live-reload polling), `/images/*` (static files)
- File watching with debounced rebuild (300ms)
- Serves images from `src/{lang}/` directory

## Extension Points for Website Feature

### Already prepared

1. **`multiPage` flag** in `rewriteCrossPageLinks()` — enables `./slug.html#id` link format
2. **`AnchorRegistry`** — global anchor index usable for search index building
3. **`Chapter` type** — contains all data needed for individual page generation
4. **`styles-web.ts`** — Infima-based CSS, ready to extend

### Needs to be built

1. **`website-builder.ts`** — Multi-page HTML generator (page template with sidebar, prev/next nav, footer)
2. **`website-generator.ts`** — Build orchestrator (read → process → write individual files + assets)
3. **`search-index-builder.ts`** — Extract text content, build inverted index JSON
4. **`styles-website.ts`** or extend `styles-web.ts` — Additional CSS for pagination, search UI, footer
5. **`cli.ts`** — New `build:web` command
6. **`config.ts`** — New `website` config section (editBaseUrl, GitHub repo info)

### Key design considerations

- **Image path resolution**: Currently resolves to absolute file URLs (PDF) or server-relative paths (preview). Static website needs paths relative to each page's location.
- **CSS delivery**: Currently inlined in `<style>` tag. Static website should use a shared `.css` file to avoid duplication across pages.
- **Search index**: Must support CJK languages (Korean, Japanese, Thai). Bigram tokenization is effective for CJK. The index must work entirely client-side (no server, no CDN) for air-gapped deployments.
- **Last updated date**: `git log -1 --format=%aI -- {filepath}` is the most accurate source. Fallback to `fs.statSync().mtime` for non-git environments. This data should be collected during build and embedded in each page.

## Versioned docs (F6 / FR-2718)

The toolkit supports an OPTIONAL minor-grained version model. When the
optional `versions` key is present in `docs-toolkit.config.yaml`, the
build emits a per-version directory layout. When `versions` is absent,
the legacy flat layout is preserved unchanged (fully backward
compatible).

### Version model

- The selector lists one row per **minor** version. Within a minor,
  the highest patch represents that minor (e.g., `25.16.5` is shown as
  `25.16`). This is enforced at config-load time: `versions.ts` rejects
  labels that match `/^\d+\.\d+\.\d+/`.
- Eligibility is gated by the build itself: a minor is admitted to the
  selector only if its docs build cleanly under the current toolkit
  with `--strict` (F5). A minor that breaks the strict build must be
  patched, deferred via a follow-up issue, or explicitly excluded —
  the choice is documented in the PR that adds the entry.
- Past-minor build artifacts live on **orphan branches**
  (`docs-archive/<minor>`). Past minors are built ONCE with the
  toolkit-of-its-day and pushed to the archive branch by the
  `docs-archive-orphan-branch.yml` workflow; they are NOT re-built with
  the current toolkit on every deploy.

### Output directory layout

| Mode | Page URL pattern | rootDepth |
|---|---|---|
| Flat (`versions` absent) | `dist/web/<lang>/<slug>.html` | 2 |
| Versioned (`versions` declared) | `dist/web/<minor>/<lang>/<slug>.html` | 3 |

Site-shared assets always live at `dist/web/assets/...` (one set, content-hashed).
The page builder derives a `../`-prefix from `rootDepth` so the same template
works in both layouts.

In versioned mode, the root `dist/web/index.html` is a tiny meta-refresh
that points at the latest version's default-language landing page. F1
(language picker) may later replace this with a richer entry.

### `versions` schema

```yaml
versions:
  - label: "25.16"          # minor label only — never include patch
    source:
      kind: workspace        # build from current checkout
    latest: true             # exactly one entry must carry latest:true
  - label: "25.10"
    source:
      kind: archive-branch
      ref: docs-archive/25.10  # orphan branch holding pre-built artifacts
```

Validation rules (enforced by `loadVersions` in `versions.ts`):

- `versions` is OPTIONAL. When omitted (or empty), the build runs in
  single-version compatibility mode and emits the flat layout.
- `versions[].label` must be a non-empty string of the shape
  `MAJOR.MINOR`. Three-segment "patch-shaped" labels are rejected.
- `versions[].source.kind` must be `workspace` or `archive-branch`.
- For `archive-branch`, `versions[].source.ref` is required.
- Exactly **one** entry must carry `latest: true`.
- Labels must be unique within `versions[]`.

### Source kinds

- **`workspace`** — build from the current checkout. Used for the
  `latest` entry in normal day-to-day deploys.
- **`archive-branch`** — build by reading from a sibling worktree at
  `<projectRoot>/.docs-archive/<sanitized-ref>`. The CI workflow that
  PUSHES the orphan branch ships in this PR
  (`.github/workflows/docs-archive-orphan-branch.yml`); the workflow /
  operator that PULLS the orphan branch into a worktree before rebuild
  is operational scope. If the worktree does not exist when the build
  runs, the version is logged and skipped (NOT a hard failure) so CI
  doesn't break before the archive infrastructure is materialized.

### Header version selector

Every page in versioned mode emits a `<header class="page-header-bar">`
with a `<select class="version-switcher">` listing every minor label.
On change, an inline JS handler navigates to the same slug in the
target version. If the slug doesn't exist there, the browser hits a
404 → operators serve an index page redirect, OR (preferred) the
build's per-version slug-availability map (recorded in
`VersionPageRegistry`) drives the link to the version's `index.html`
directly.

The dropdown lists minors only — patches are never shown. The data
needed by the inline script is embedded as `data-` attributes on the
`<select>`, keeping the script body tiny (well under the 25 KB
per-page JS budget).

### Version scope isolation

- **Sidebar / right-rail TOC / internal links** operate within the
  current version only — the markdown processor reads only the
  current version's `book.config.yaml` and `<lang>/...` tree.
- **Search index** is partitioned per `(version, lang)` and lives at
  `dist/web/<version>/<lang>/search-index.json`. Search results never
  leak across versions.
- **canonical URL** (built by F2): always points at the same slug in
  the latest version (`dist/web/<latest-label>/<lang>/<slug>.html`).
  `canonicalPathFor()` in `versions.ts` returns the canonical relative
  path; F2 wraps it in the absolute base URL.
- **hreflang** (built by F1): cross-links languages WITHIN the same
  version, never across versions.

### API surface for F2 (sitemap + canonical)

`generateWebsite()` returns a `GenerateWebsiteResult` containing:

```typescript
{
  versioned: boolean;            // false in flat mode
  pages: PageEnumerationRow[];   // one row per (version, lang, slug)
  versionsBuilt: Version[];      // entries that actually rendered
}
```

Each `PageEnumerationRow` has `{ version, lang, slug, path, isLatest }`.
F2 iterates `pages` to emit `sitemap.xml`. `canonicalPathFor(loaded, lang, slug)`
returns the per-page canonical URL relative to the website output root.

### Single-version compatibility mode

When `versions` is not declared, the build behaves exactly as before
F6: flat `dist/web/<lang>/...` layout, no version selector, no
per-version subdirs, no root redirect. This is the default path in
`backend.ai-webui-docs` today; the operator opts into versioned mode
by adding `versions:` to `docs-toolkit.config.yaml`.

### PDF pipeline interaction

The PDF pipeline (`generate-pdf.ts`) reads ONLY `book.config.yaml`,
not the `versions` key in `docs-toolkit.config.yaml`. Adding a
`versions` block has zero effect on PDF output: `pnpm run pdf:en`
continues to build the current checkout's content, regardless of
whether `versions` is declared. This is intentional — past-minor PDFs
are likewise produced by their toolkit-of-its-day, not by re-rendering
through the current toolkit.
