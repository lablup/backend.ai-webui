#!/usr/bin/env node
// Regenerate the gh-pages landing page from whatever `pr/<n>/` directories are
// currently on disk. Both the deploy and the cleanup job call this after they
// change the tree, so the index never claims a preview that is gone.
//
// Usage: node write-index.mjs --root <gh-pages checkout>

import { existsSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const getArg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};

const root = getArg("root");
if (!root) {
  console.error("usage: write-index.mjs --root <dir>");
  process.exit(1);
}

const prRoot = join(root, "pr");
const isDir = (path) => existsSync(path) && statSync(path).isDirectory();

// `next/` has no index of its own, so the docs link points at a language
// directory — whichever ones this PR built, English first when it is there.
const docsEntry = (n) => {
  const docsDir = join(prRoot, String(n), "docs");
  if (!isDir(docsDir)) return null;
  const langs = isDir(join(docsDir, "next"))
    ? readdirSync(join(docsDir, "next"))
        .filter((name) => /^[a-z]{2}(-[a-z0-9]+)?$/.test(name))
        .filter((name) => isDir(join(docsDir, "next", name)))
        .sort((a, b) => (a === "en" ? -1 : b === "en" ? 1 : a.localeCompare(b)))
    : [];
  return langs.length > 0
    ? `./pr/${n}/docs/next/${langs[0]}/`
    : `./pr/${n}/docs/`;
};

const previews = isDir(prRoot)
  ? readdirSync(prRoot)
      .filter((name) => /^\d+$/.test(name))
      .map(Number)
      .sort((a, b) => b - a)
      .map((n) => ({
        n,
        storybook: isDir(join(prRoot, String(n), "storybook"))
          ? `./pr/${n}/storybook/`
          : null,
        docs: docsEntry(n),
      }))
      .filter((entry) => entry.storybook || entry.docs)
  : [];

const items = previews
  .map(({ n, storybook, docs }) => {
    const links = [
      storybook && `<a href="${storybook}">Storybook</a>`,
      docs && `<a href="${docs}">Docs</a>`,
    ]
      .filter(Boolean)
      .join(" · ");
    return (
      `      <li>PR #${n} — ${links} ` +
      `<a class="src" href="https://github.com/lablup/backend.ai-webui/pull/${n}">source ↗</a></li>`
    );
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Backend.AI WebUI — PR previews</title>
    <style>
      :root { color-scheme: light dark; }
      body {
        font: 16px/1.6 ui-sans-serif, system-ui, sans-serif;
        margin: 0 auto; max-width: 42rem; padding: 3rem 1.5rem;
      }
      h1 { font-size: 1.4rem; margin-bottom: .25rem; }
      p { color: color-mix(in srgb, currentColor 65%, transparent); margin-top: 0; }
      ul { padding-left: 1.1rem; }
      li { margin: .3rem 0; }
      .src { font-size: .8em; opacity: .6; margin-left: .5rem; }
    </style>
  </head>
  <body>
    <h1>Backend.AI WebUI — PR previews</h1>
    <p>
      One build of <code>packages/backend.ai-ui</code> and of the user manual
      per open pull request, whichever the PR changed. Previews are removed when
      their PR is merged or closed.
    </p>
${previews.length > 0 ? `    <ul>\n${items}\n    </ul>` : "    <p>No live previews right now.</p>"}
  </body>
</html>
`;

writeFileSync(join(root, "index.html"), html);
console.log(`Wrote index.html listing ${previews.length} preview(s).`);
