# Backend.AI WebUI Docs

PDF generation tool for the Backend.AI WebUI User Guide. Converts multilingual Markdown documentation into production-ready PDF with cover page, table of contents, headers/footers, and themeable styling.

## Prerequisites

- Node.js 18+
- pnpm (workspace is managed from the monorepo root)
- Playwright Chromium (installed automatically on first run)

```bash
# Install dependencies from the monorepo root
pnpm install
```

## Quick Start

```bash
cd packages/backend.ai-webui-docs

# Generate PDF for all languages
pnpm run pdf

# Generate PDF for a specific language
pnpm run pdf:en
pnpm run pdf:ko
pnpm run pdf:ja
pnpm run pdf:th
```

Output files are written to `dist/`:

```
# Release build (26.2.0)
dist/Backend.AI_WebUI_User_Guide_v26.2.0_en.pdf

# Pre-release build (26.2.0-alpha.0, commit abc1234)
dist/Backend.AI_WebUI_User_Guide_v26.2.0-alpha.0+abc1234_en.pdf
```

## Preview Server

The preview server generates real PDFs through the same Playwright pipeline as production, with live-reload on file changes.

```bash
# Sample content preview (~1s generation)
pnpm run preview

# Style catalog with theme reference (~1s)
pnpm run preview:catalog

# Full document preview (~15-30s)
pnpm run preview:doc        # English
pnpm run preview:doc:ko     # Korean
pnpm run preview:doc:ja     # Japanese
pnpm run preview:doc:th     # Thai
```

Open `http://localhost:3456` to view the PDF in the browser. The page auto-refreshes when the PDF is rebuilt.

### Preview Modes

| Mode | Command | Content | Speed |
|------|---------|---------|-------|
| `sample` | `pnpm run preview` | Sample chapters exercising all styling elements | ~1s |
| `catalog` | `pnpm run preview:catalog` | Theme variable reference + sample chapters | ~1s |
| `document` | `pnpm run preview:doc` | Real Markdown content from `src/{lang}/` | ~15-30s |

In `document` mode, editing any `.md` file under `src/{lang}/` triggers an automatic PDF rebuild.

### CLI Options

```bash
tsx scripts/preview-server.ts --mode <mode> --lang <lang> --theme <name> --port <port>
```

| Option | Default | Description |
|--------|---------|-------------|
| `--mode` | `sample` | `sample`, `catalog`, or `document` |
| `--lang` | `en` | Language code (`en`, `ko`, `ja`, `th`) |
| `--theme` | `default` | Theme name |
| `--port` | `3456` | HTTP server port |

## Style Catalog (HTML)

A standalone HTML page showing all PDF styling elements. Useful for quick visual checks without Playwright rendering.

```bash
pnpm run catalog
# Output: dist/preview/style-catalog.html
```

## Theme System

Themes control all visual aspects of the PDF: colors, typography, cover page, code blocks, tables, blockquotes, and header/footer templates.

The theme interface is defined in `scripts/theme.ts`:

```typescript
interface PdfTheme {
  name: string;

  // Colors
  brandColor: string;        // Accent color (default: #ff9d00)
  textPrimary: string;       // Main text (default: #1a1a1a)
  textSecondary: string;     // Secondary text (default: #666)
  linkColor: string;         // Link color (default: #0066cc)
  borderColor: string;       // General borders (default: #e0e0e0)

  // Typography
  baseFontSize: string;      // Body text (default: 11pt)
  headingH1Size: string;     // H1 (default: 22pt)
  headingH2Size: string;     // H2 (default: 16pt)
  // ... and more (code, table, blockquote, cover, TOC)

  // Header/Footer (Playwright displayHeaderFooter templates)
  headerHtml: string;
  footerHtml: string;
}
```

Currently only the `default` theme is built-in. Custom theme loading from disk (e.g., `themes/customer-blue.json`) is planned for future implementation. To customize styling, edit the `defaultTheme` values in `scripts/theme.ts` directly.

## Versioning

The document version is derived from the monorepo root `package.json` version field.

| Package Version | Cover Page | Filename |
|----------------|------------|----------|
| `26.2.0` (release) | `v26.2.0` | `..._v26.2.0_en.pdf` |
| `26.2.0-alpha.0` (pre-release) | `v26.2.0-alpha.0 (abc1234)` | `..._v26.2.0-alpha.0+abc1234_en.pdf` |

For pre-release versions, the git short hash is appended so that PDFs generated from different commits are distinguishable even when the package version has not been bumped. The version logic is defined in `scripts/version.ts`.

## Project Structure

```
packages/backend.ai-webui-docs/
├── src/
│   ├── book.config.yaml          # Book metadata, languages, navigation
│   ├── en/                       # English Markdown source
│   ├── ko/                       # Korean
│   ├── ja/                       # Japanese
│   └── th/                       # Thai
├── scripts/
│   ├── generate-pdf.ts           # Main entry point (pnpm run pdf)
│   ├── markdown-processor.ts     # Markdown → HTML conversion
│   ├── html-builder.ts           # Assembles cover + TOC + chapters
│   ├── pdf-renderer.ts           # Playwright PDF rendering (3-pass)
│   ├── styles.ts                 # CSS generation from theme
│   ├── theme.ts                  # Theme interface and defaults
│   ├── version.ts                # Version resolution (semver + git hash)
│   ├── preview-server.ts         # Dev server with live-reload
│   ├── sample-content.ts         # Sample chapters for preview
│   └── style-catalog.ts          # Standalone HTML catalog
├── dist/                         # Generated output (gitignored)
├── TERMINOLOGY.md                # Standardized terms across languages
├── DOCUMENTATION-STYLE-GUIDE.md  # Writing conventions
├── TRANSLATION-GUIDE.md          # Translation rules per language
└── SCREENSHOT-GUIDELINES.md      # Image conventions
```

## PDF Generation Pipeline

The PDF is generated through a multi-stage pipeline:

1. **Markdown Processing** (`markdown-processor.ts`) — Parses `.md` files, extracts headings, resolves image paths, generates chapter-scoped heading IDs.

2. **HTML Assembly** (`html-builder.ts`) — Builds a single HTML document containing:
   - Cover page with logo, title, version, date
   - Table of Contents with placeholder page numbers
   - All chapter content with section breaks

3. **PDF Rendering** (`pdf-renderer.ts`) — 3-pass Playwright rendering:
   - **Pass 1**: Render to PDF, extract page numbers from named destinations
   - **Pass 2**: Inject real page numbers into TOC, render again
   - **Pass 3**: Final render with header/footer enabled
   - **Post-processing**: Mask header/footer on cover page using pdf-lib

## Writing Documentation

### Adding a New Page

1. Create a Markdown file under `src/{lang}/` (e.g., `src/en/new_feature/new_feature.md`)
2. Add a navigation entry in `src/book.config.yaml` for **all 4 languages**
3. Create the corresponding files in `src/ko/`, `src/ja/`, `src/th/`

### Markdown Conventions

- One `# H1` per file as the page title
- `## H2` for major sections, `### H3` for subsections
- Images: `![](images/filename.png)` — place image files in `src/{lang}/images/`
- Cross-references: `[Link Text](#heading-id)`
- Inline code for UI elements: `` `Settings` ``, `` `config.toml` ``

Refer to the following guides for detailed conventions:

- [TERMINOLOGY.md](TERMINOLOGY.md) — Standardized terms across languages
- [DOCUMENTATION-STYLE-GUIDE.md](DOCUMENTATION-STYLE-GUIDE.md) — Formatting rules
- [TRANSLATION-GUIDE.md](TRANSLATION-GUIDE.md) — Translation guidelines
- [SCREENSHOT-GUIDELINES.md](SCREENSHOT-GUIDELINES.md) — Image conventions

## Supported Languages

| Code | Language |
|------|----------|
| `en` | English |
| `ko` | Korean (한국어) |
| `ja` | Japanese (日本語) |
| `th` | Thai (ภาษาไทย) |

All languages must have identical page structure and navigation entries in `book.config.yaml`.
