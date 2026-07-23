# Quickstart

Welcome to the **Docs Toolkit Example** — a minimal boilerplate that shows
you how to use `backend.ai-docs-toolkit` in your own project. This page is
deliberately short so you can read it end-to-end in a minute and start
experimenting.

## What you get from the toolkit

The toolkit takes a small directory of Markdown files and produces:

- A static, multilingual website with a sidebar, right-rail "On this page"
  table of contents, search, and a version selector.
- A printable PDF per language with embedded fonts (Latin and CJK).
- An HTML preview server with live reload, useful while authoring.

## Layout of this example

```
packages/backend.ai-docs-toolkit-example/
├── docs-toolkit.config.yaml   # toolkit configuration (theme, branding, versions)
├── src/
│   ├── book.config.yaml       # navigation, languages, document title
│   ├── en/                    # English content
│   └── ko/                    # Korean content (CJK font test fixture)
└── assets/
    └── logo.svg               # custom brand logo
```

## Try it

Build the site and the PDFs:

```shellsession
$ pnpm --filter backend.ai-docs-toolkit-example build:web
$ pnpm --filter backend.ai-docs-toolkit-example pdf
```

Or boot the live preview:

```shellsession
$ pnpm --filter backend.ai-docs-toolkit-example serve:web
Server listening on http://localhost:3458
```

## Where to next

Read the [Features](features.md) chapter for a walkthrough of the toolkit's
content blocks (admonitions, code-blocks, images), then
[Customization](customization.md) to see how to override the brand color,
logo, and version list.
