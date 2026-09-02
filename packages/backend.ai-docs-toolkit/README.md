# backend.ai-docs-toolkit

Reusable documentation engine for converting multilingual Markdown into production-ready PDF and HTML. Provides a CLI (`docs-toolkit`), config-driven pipeline, and Handlebars-based Claude AI agent template system.

## Getting started — copy the example

The fastest way to evaluate the toolkit is to copy the [example/boilerplate package](https://github.com/lablup/backend.ai-webui/tree/main/packages/backend.ai-docs-toolkit-example) and edit it. It is a minimal, runnable project that exercises every consumer-tunable knob (custom logo, brand color, multi-version selector, grouped sidebar, en + ko content for CJK font verification).

Run the commands below **from the monorepo root** (`backend.ai-webui/`):

```bash
cp -r packages/backend.ai-docs-toolkit-example/ ../my-docs/
cd ../my-docs
# Edit docs-toolkit.config.yaml, src/book.config.yaml, src/<lang>/*.md
pnpm install
pnpm build:web
```

> See the example's [`README.md`](https://github.com/lablup/backend.ai-webui/blob/main/packages/backend.ai-docs-toolkit-example/README.md#using-the-example-outside-this-monorepo) for the standalone-repo recipe (the `pnpm --filter` build step needs to be replaced).

### Troubleshooting: `docs-toolkit: not found`

`docs-toolkit` is the `bin` of this workspace package. pnpm creates the `node_modules/.bin/docs-toolkit` symlink **at install time**, and only if the toolkit's compiled entrypoint (`dist/cli.js`) already exists. In a fresh clone or new git worktree, `pnpm install` usually runs *before* the toolkit is built, so pnpm skips the symlink. Building the toolkit afterwards (`pnpm --filter backend.ai-docs-toolkit build`) produces `dist/cli.js` but does **not** re-link the bin — so every `docs-toolkit …` invocation (including the `preview:html`, `build:web`, `serve:web` scripts) fails with `docs-toolkit: not found`.

A plain `pnpm install` (even `pnpm install --force`) reports *"Already up to date"* and skips bin-linking, so it does not fix this. Re-link the bin by rebuilding the **consumer** package that depends on the toolkit:

```bash
# from the monorepo root — replace the package name with your docs package
pnpm --filter backend.ai-webui-docs rebuild
```

Verify the command resolves:

```bash
pnpm --filter backend.ai-webui-docs exec docs-toolkit --help
```

## Quick Start

```bash
# Initialize a new documentation project
docs-toolkit init

# Generate PDFs
docs-toolkit pdf --lang all
docs-toolkit pdf --lang en

# Preview (PDF, live-reload)
docs-toolkit preview
docs-toolkit preview --mode document --lang ko

# Preview (HTML, live-reload)
docs-toolkit preview:html --lang en

# Build a static multi-page website
docs-toolkit build:web --lang all
docs-toolkit build:web --lang en --optimize-images

# Serve the static website (live-reload)
docs-toolkit serve:web --lang en

# Generate Claude AI agent files
docs-toolkit agents
docs-toolkit agents --force   # overwrite existing
```

## Configuration

All settings are defined in `docs-toolkit.config.yaml` at the project root:

```yaml
title: "My Documentation"
company: "My Company"
logoPath: "assets/logo.svg"

srcDir: "src"
distDir: "dist"
versionSource: "./package.json"

languageLabels:
  en: "English"
  ko: "한국어"

pdfFilenameTemplate: "{title}_{version}_{lang}.pdf"
pdfMetadata:
  author: "My Company"
  subject: "Documentation"
  creator: "docs-toolkit PDF Generator"

# Optional: register @font-face fonts for the PDF and reference them from
# the theme override (`cjkFontPaths` above covers header/footer stamping).
pdfFontFaces:
  - family: "MyFont"
    path: "assets/fonts/MyFont-Regular.ttf"
    weight: 400
  - family: "MyFont"
    path: "assets/fonts/MyFont-Bold.ttf"
    weight: 700
theme: # partial override merged over the default PDF theme
  fontFamily: "MyFont" # body text
  coverTitleFontFamily: "MyFont" # cover H1

# Claude AI agent template variables (optional)
agents:
  projectTitle: "My Project"
  docsRoot: "."
  languages:
    - code: en
      label: English
  terminologyFile: "TERMINOLOGY.md"
  styleGuideFile: "STYLE-GUIDE.md"
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `docs-toolkit pdf` | Generate PDF documents |
| `docs-toolkit preview` | PDF preview server with live-reload |
| `docs-toolkit preview:html` | HTML preview server with live-reload (no PDF) |
| `docs-toolkit build:web` | Generate a static multi-page website |
| `docs-toolkit serve:web` | Static website dev server with live-reload |
| `docs-toolkit init` | Scaffold a new documentation project |
| `docs-toolkit agents` | Generate Claude AI agent files from templates |
| `docs-toolkit help` | Show the CLI help message |

### Common Options

```bash
# PDF generation
docs-toolkit pdf --lang <all|en|ko|...> --theme <name> \
  --chapters <comma,separated,names> --note <cover-page note>

# PDF preview
docs-toolkit preview --mode <sample|catalog|document> --lang <lang> --port <port>

# HTML preview
docs-toolkit preview:html --mode <document|catalog> --lang <lang> --port <port>

# Static website build
docs-toolkit build:web --lang <all|en|ko|...> \
  --strict|--no-strict --optimize-images --optimize-images-avif

# Static website dev server
docs-toolkit serve:web --lang <lang> --port <port>

# Agent generation
docs-toolkit agents --force   # overwrite existing files
```

Notes:

- `pdf --chapters` limits the build to the listed chapter names (default: all chapters).
- `pdf --note` prints a short note on the cover page (e.g. `"Draft — internal review"`).
- `build:web --strict` (default) fails the build on broken links; `--no-strict` downgrades them to warnings.
- `build:web --optimize-images` generates `.webp` variants for PNGs over 50 KB and wraps them in `<picture>`; `--optimize-images-avif` adds `.avif` variants. Both require the optional `sharp` peer dependency.
- Default ports: `preview` → `3456`, `preview:html` → `3457`, `serve:web` → `3458`.

## Agent Template System

The `agents` command generates Claude Code agent files (`.claude/agents/`) and `CLAUDE.md` from Handlebars templates. Templates use variables from the `agents` section of `docs-toolkit.config.yaml`.

Generated agents:

| Agent | Purpose |
|-------|---------|
| `docs-update-planner` | Analyzes PR changes to create documentation update plans |
| `docs-update-writer` | Writes documentation content across all languages |
| `docs-update-reviewer` | Reviews for accuracy, consistency, and translation quality |
| `docs-screenshot-capturer` | Captures screenshots using Playwright MCP |

Generated files include a marker comment and can be customized after generation:

```markdown
<!-- Generated by docs-toolkit. You may customize this file. -->
<!-- Re-run `docs-toolkit agents` to regenerate from template. -->
```

## PDF Pipeline

The PDF is generated through a multi-stage pipeline:

1. **Markdown Processing** — Parses `.md` files, extracts headings, resolves image paths, processes admonitions, generates chapter-scoped heading IDs
2. **HTML Assembly** — Builds a single HTML document with cover page, TOC, and all chapters
3. **PDF Rendering** — Multi-pass Playwright rendering with TOC page number injection and layout stabilization
4. **Post-processing** — pdf-lib stamps headers/footers on all pages, sets PDF metadata, and embeds CJK fonts

## Project Structure

```
packages/backend.ai-docs-toolkit/
├── src/
│   ├── cli.ts                    # CLI entry point
│   ├── config.ts                 # DocConfig interface + YAML loader
│   ├── index.ts                  # Public API exports
│   ├── generate-pdf.ts           # PDF generation orchestrator
│   ├── markdown-processor.ts     # Markdown → HTML (PDF)
│   ├── markdown-processor-web.ts # Markdown → HTML (web preview)
│   ├── markdown-extensions.ts    # Admonitions, figures, code blocks
│   ├── html-builder.ts           # Cover + TOC + chapters (PDF)
│   ├── html-builder-web.ts       # Sidebar + content (web)
│   ├── pdf-renderer.ts           # Playwright PDF rendering
│   ├── preview-server.ts         # PDF preview with live-reload
│   ├── preview-server-web.ts     # HTML preview with live-reload
│   ├── styles.ts                 # PDF CSS generation
│   ├── styles-web.ts             # Web CSS generation
│   ├── theme.ts                  # Theme interface and defaults
│   ├── version.ts                # Version resolution (semver + git)
│   ├── sample-content.ts         # Sample chapters for preview
│   └── sample-content-markdown.ts
├── templates/                    # Handlebars templates for scaffolding
│   ├── CLAUDE.md.hbs
│   ├── docs-toolkit.config.yaml.hbs
│   └── agents/
│       ├── docs-update-planner.md.hbs
│       ├── docs-update-writer.md.hbs
│       ├── docs-update-reviewer.md.hbs
│       └── docs-screenshot-capturer.md.hbs
├── package.json
└── tsconfig.json
```

## Programmatic API

```typescript
import {
  loadToolkitConfig,
  resolveConfig,
  generatePdf,
  generateWebsite,
  startPreviewServer,
  startHtmlPreviewServer,
} from 'backend.ai-docs-toolkit';

const config = resolveConfig(loadToolkitConfig(process.cwd()));

// PDF (CLI equivalent: docs-toolkit pdf --lang en)
await generatePdf(config, { lang: 'en' });

// Static website (CLI equivalent: docs-toolkit build:web --lang all)
await generateWebsite(config, { lang: 'all', optimizeImages: true });
```

## Consumer Project Structure

A project using this toolkit looks like:

```
my-docs/
├── docs-toolkit.config.yaml    # Engine configuration
├── src/
│   ├── book.config.yaml        # Navigation config
│   ├── en/                     # English content
│   │   ├── quickstart.md
│   │   └── images/
│   └── ko/                     # Korean content
├── assets/
│   └── logo.svg
├── CLAUDE.md                   # Generated by docs-toolkit agents
├── .claude/agents/             # Generated agent files
└── package.json                # devDep: backend.ai-docs-toolkit
```
