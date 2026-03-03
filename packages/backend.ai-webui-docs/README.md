# Backend.AI WebUI Docs

Multilingual user manual for Backend.AI WebUI. Uses [backend.ai-docs-toolkit](../backend.ai-docs-toolkit/) to convert Markdown documentation into production-ready PDF with cover page, table of contents, headers/footers, and themeable styling.

## Prerequisites

- Node.js 18+
- pnpm (workspace is managed from the monorepo root)
- Playwright Chromium (installed automatically on first run)

```bash
# Install dependencies from the monorepo root
pnpm install

# Build the toolkit (required before first use)
cd packages/backend.ai-docs-toolkit && pnpm run build
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

### PDF Preview

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

### HTML Preview

A lightweight HTML preview without Playwright rendering. Faster iteration for content editing.

```bash
pnpm run preview:html       # English
pnpm run preview:html:ko    # Korean
pnpm run preview:html:ja    # Japanese
pnpm run preview:html:th    # Thai
pnpm run preview:html:catalog
```

Open `http://localhost:3457` to view.

### Preview Modes

| Mode | Command | Content | Speed |
|------|---------|---------|-------|
| `sample` | `pnpm run preview` | Sample chapters exercising all styling elements | ~1s |
| `catalog` | `pnpm run preview:catalog` | Theme variable reference + sample chapters | ~1s |
| `document` | `pnpm run preview:doc` | Real Markdown content from `src/{lang}/` | ~15-30s |

In `document` mode, editing any `.md` file under `src/{lang}/` triggers an automatic rebuild.

## AI Agent Workflow

Four Claude Code agents handle the documentation lifecycle. Generate or update them with:

```bash
pnpm run agents          # generate (skip existing)
pnpm run agents:force    # regenerate all
```

| Agent | Purpose |
|-------|---------|
| `docs-update-planner` | Analyzes PR changes to create documentation update plans |
| `docs-update-writer` | Writes documentation content across all 4 languages |
| `docs-update-reviewer` | Reviews for accuracy, consistency, and translation quality |
| `docs-screenshot-capturer` | Captures screenshots using Playwright MCP |

Agent files are stored in `.claude/agents/` and can be customized after generation. Configuration is in the `agents` section of `docs-toolkit.config.yaml`.

## Configuration

All engine settings are defined in [`docs-toolkit.config.yaml`](docs-toolkit.config.yaml):

- Title, company, logo path
- Language labels
- PDF filename template and metadata
- Agent template variables (languages, i18n paths, guide file references, app routes)

## Theme System

Themes control all visual aspects of the PDF: colors, typography, cover page, code blocks, tables, blockquotes, and header/footer templates. The theme interface is defined in the toolkit package (`backend.ai-docs-toolkit/src/theme.ts`). Currently only the `default` theme is built-in.

## Versioning

The document version is derived from the monorepo root `package.json` version field.

| Package Version | Cover Page | Filename |
|----------------|------------|----------|
| `26.2.0` (release) | `v26.2.0` | `..._v26.2.0_en.pdf` |
| `26.2.0-alpha.0` (pre-release) | `v26.2.0-alpha.0 (abc1234)` | `..._v26.2.0-alpha.0+abc1234_en.pdf` |

For pre-release versions, the git short hash is appended so that PDFs generated from different commits are distinguishable.

## Project Structure

```
packages/backend.ai-webui-docs/
├── docs-toolkit.config.yaml      # Engine configuration
├── src/
│   ├── book.config.yaml          # Book metadata, languages, navigation
│   ├── en/                       # English Markdown source
│   ├── ko/                       # Korean
│   ├── ja/                       # Japanese
│   └── th/                       # Thai
├── .claude/agents/               # Generated Claude Code agent files
├── dist/                         # Generated output (gitignored)
├── CLAUDE.md                     # AI agent instructions
├── TERMINOLOGY.md                # Standardized terms across languages
├── DOCUMENTATION-STYLE-GUIDE.md  # Writing conventions
├── TRANSLATION-GUIDE.md          # Translation rules per language
└── SCREENSHOT-GUIDELINES.md      # Image conventions
```

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
