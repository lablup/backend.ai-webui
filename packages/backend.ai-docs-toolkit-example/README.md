# `backend.ai-docs-toolkit-example`

A minimal example/boilerplate project that uses
[`backend.ai-docs-toolkit`](../backend.ai-docs-toolkit/) to render a
multilingual static documentation site and matching PDFs.

This package serves two purposes inside the monorepo:

1. **Boilerplate** for new consumers of the toolkit — copy this directory
   as a starting point and edit the content + config to taste.
2. **Test fixture** for the toolkit's integration tests. The `tests/`
   directory is added by FR-2785 (PR #7186, stacked on top of this PR);
   it is not present yet at this commit. Keeping the fixture inside the
   same repo means a toolkit change that breaks the example surfaces
   immediately, not on the next downstream consumer's deploy.

## Layout

```
packages/backend.ai-docs-toolkit-example/
├── package.json               # workspace package; depends on toolkit via workspace:*
├── README.md                  # you are here
├── docs-toolkit.config.yaml   # toolkit configuration (theme, branding, versions)
├── src/
│   ├── book.config.yaml       # navigation, languages, document title
│   ├── en/                    # English content (4 chapters)
│   │   ├── quickstart.md
│   │   ├── features.md        # admonitions, code blocks, shellsession, image
│   │   ├── customization.md
│   │   ├── about.md
│   │   └── images/
│   │       └── sample.png     # 240×120 PNG, exercises image-meta header parse
│   └── ko/                    # Korean content (CJK font test fixture)
│       ├── quickstart.md
│       ├── features.md
│       ├── customization.md
│       ├── about.md
│       └── images/
│           └── sample.png     # same 240×120 PNG (per-language images dir)
└── assets/
    └── logo.svg               # docs-toolkit example logo (replace with your own)
```

## How to use it as a starter

Run these from the **monorepo root** (`backend.ai-webui/`):

```shellsession
$ cp -r packages/backend.ai-docs-toolkit-example/ ../my-docs/
$ cd ../my-docs
# Edit docs-toolkit.config.yaml — rename title, company, brand color, logo.
# Edit src/book.config.yaml — list your chapters and languages.
# Edit src/<lang>/*.md — write your content.
$ pnpm install
$ pnpm build:web
```

### Using the example outside this monorepo

The toolkit is published as a regular npm package
(`backend.ai-docs-toolkit`). To run a copy of the example in a standalone
repo, two `package.json` edits are required (the `workspace:*` swap alone
is not enough — the scripts also reach into the workspace):

1. Replace the `workspace:*` dependency with a real version range:

   ```jsonc
   "devDependencies": {
     "backend.ai-docs-toolkit": "^0.1.0"
   }
   ```

2. Drop the `build:toolkit` indirection from every script — the published
   `docs-toolkit` CLI is already built. So `"build:web": "pnpm run build:toolkit && docs-toolkit build:web --lang all"` becomes `"build:web": "docs-toolkit build:web --lang all"`, and so on for `pdf`, `preview`, `serve:web`.

## Build commands

| Script                  | What it does                                  |
| ----------------------- | --------------------------------------------- |
| `pnpm build:web`        | Build the static site for all languages       |
| `pnpm build:web:en`     | Build English-only                            |
| `pnpm build:web:ko`     | Build Korean-only                             |
| `pnpm pdf`              | Generate PDFs for all languages               |
| `pnpm pdf:en`           | English PDF only                              |
| `pnpm pdf:ko`           | Korean PDF only (exercises CJK font path)     |
| `pnpm preview`          | Live-reload PDF preview server                |
| `pnpm serve:web`        | Serve the built site locally (English)        |
| `pnpm serve:web:ko`     | Serve the built site locally (Korean)         |

## Customization knobs demonstrated here

- Custom brand color palette (`branding.primaryColor*` — teal so the
  override is visually obvious).
- Custom logo (`logoPath` + `branding.logoLight` pointing at
  `assets/logo.svg`).
- Per-language sub-label next to the topbar logo
  (`branding.subLabel.{en,ko,default}`).
- Grouped sidebar navigation (`book.config.yaml` → `navigation.<lang>` as
  `[{category, items}]`).
- Multi-version selector (`versions[]` with two entries — both pointing
  at the workspace because the example does not maintain real archive
  branches).
- Shiki syntax highlighting theme (`code.lightTheme`).
- PDF metadata (`pdfMetadata.{author,subject,creator}`) and filename
  template (`pdfFilenameTemplate`).

## Tests

Two suites live under `tests/` and are intentionally **local / manual** —
they are **not wired into CI** today (they need Playwright browsers
installed via `playwright install chromium`, ~250 MB, and CI cost is not
yet justified for this example fixture). Run them by hand from the
example directory:

```shellsession
$ pnpm install
$ pnpm exec playwright install chromium   # one-time, downloads browsers
$ pnpm build:web && pnpm pdf
$ pnpm test:pdf      # 18 tests via tsx --test + pdf-lib (<1s)
$ pnpm test:e2e      # 26 Playwright tests against dist/web/ (~30s)
$ pnpm test          # both, in order
```

If you opt into CI later, the recipe is:
1. cache `~/.cache/ms-playwright/`
2. run `pnpm exec playwright install --with-deps chromium`
3. run `pnpm test`

## Why en + ko (and not all four languages)

Two languages are enough to exercise both the **Latin** and **CJK** font
selection paths in the PDF pipeline (FR-2745) without inflating CI build
time. Add `ja` / `th` / etc. to your own copy by extending
`src/book.config.yaml` `languages:` and creating the matching content
directories.
