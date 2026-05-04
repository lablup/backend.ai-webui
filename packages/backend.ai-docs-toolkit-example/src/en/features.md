# Features

This chapter walks through the content blocks the toolkit knows how to
render, so you can copy any of them straight into your own pages.

## Admonitions

Three flavors are built in: `note`, `warn`, `danger`. They render with
distinct icons and accent colors in both the web site and the PDF.

> [!NOTE]
> A note block calls out information that is helpful but optional —
> background, history, or a pointer to deeper material.

> [!WARNING]
> A warning highlights something that can bite you if you skip it. Read
> the rest of the section before acting.

> [!DANGER]
> Danger blocks describe operations that destroy data or are otherwise
> irreversible. Always require an explicit confirmation.

## Code blocks

The web build runs Shiki at build time, so code blocks ship pre-tokenized
with no runtime highlighter shipped to the reader.

### TypeScript

```ts
import { resolveConfig, loadToolkitConfig } from "backend.ai-docs-toolkit";

const config = loadToolkitConfig(process.cwd());
const resolved = resolveConfig(config);

console.log(`Building ${resolved.title} v${resolved.version}`);
```

### Shellsession (FR-2756)

The `shellsession` pseudo-language is for transcripts that mix prompts,
commands, and output. Prompts (`$`, `#`) are stripped from the
copied-to-clipboard text so a reader can paste-and-run.

```shellsession
$ docs-toolkit build:web --lang en
Building Docs Toolkit Example v0.1.0 (en)…
Wrote dist/web/0.1/en/quickstart.html
Wrote dist/web/0.1/en/features.html
$ ls dist/web/0.1/en
about.html  customization.html  features.html  index.html  quickstart.html
```

### Plain bash

```bash
docs-toolkit build:web --lang en --strict
```

## Images

Images get `loading="lazy"` and a best-effort `width`/`height` from the
PNG header. The image below is intentionally tiny — the toolkit's
image-meta module will read its real dimensions and emit them as
attributes so the page does not jank as it scrolls.

![Sample placeholder image](images/sample.png)

## Cross-language links

Every page exposes a language switcher in the header that takes you to the
same chapter slug in the peer language. Try it now: switch to **한국어** and
you will land on `features.md` in Korean, not the home page.
