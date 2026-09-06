#!/usr/bin/env node
// Regenerate the gh-pages landing page from whatever `pr/<n>/` directories are
// currently on disk. Both the deploy and the cleanup job call this after they
// change the tree, so the index never claims a preview that is gone.
//
// Usage: node write-index.mjs --root <gh-pages checkout>

import { existsSync, readdirSync, writeFileSync } from "node:fs";
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
const previews = existsSync(prRoot)
  ? readdirSync(prRoot)
      .filter((name) => /^\d+$/.test(name))
      .map(Number)
      .sort((a, b) => b - a)
  : [];

const items = previews
  .map(
    (n) =>
      `      <li><a href="./pr/${n}/storybook/">PR #${n}</a> ` +
      `<a class="src" href="https://github.com/lablup/backend.ai-webui/pull/${n}">source ↗</a></li>`,
  )
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
    <h1>Backend.AI WebUI — Storybook previews</h1>
    <p>
      One build of <code>packages/backend.ai-ui</code> per open pull request.
      Previews are removed when their PR is merged or closed.
    </p>
${previews.length > 0 ? `    <ul>\n${items}\n    </ul>` : "    <p>No live previews right now.</p>"}
  </body>
</html>
`;

writeFileSync(join(root, "index.html"), html);
console.log(`Wrote index.html listing ${previews.length} preview(s).`);
