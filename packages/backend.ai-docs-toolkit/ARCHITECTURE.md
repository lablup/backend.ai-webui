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
