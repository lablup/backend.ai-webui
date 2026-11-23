#!/usr/bin/env node
/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Serves the user manual's Markdown source as static files (ADR 0032): every
 page `book.config.yaml` publishes is copied to resources/manual/<lang>/<slug>.md,
 with resources/manual/<lang>/index.json listing them. A build artifact
 (gitignored); `pnpm run build` and `pnpm run dev` run this.
*/
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_SRC = join(ROOT, "packages/backend.ai-webui-docs/src");
const OUT_DIR = join(ROOT, "resources/manual");

/**
 * Port of the docs toolkit's `slugFromNavPath`
 * (packages/backend.ai-docs-toolkit/src/markdown-processor.ts), so `<slug>.md`
 * here and `<slug>.html` on the hosted site name the same page.
 */
export function slugFromNavPath(navPath) {
  const base = basename(navPath, extname(navPath)).toLowerCase();
  let cleaned = "";
  let lastWasDash = false;
  for (const ch of base) {
    if (/[a-z0-9_]/.test(ch)) {
      cleaned += ch;
      lastWasDash = false;
    } else if (!lastWasDash && cleaned.length > 0) {
      cleaned += "-";
      lastWasDash = true;
    } else {
      lastWasDash = true;
    }
  }
  cleaned = cleaned.replace(/[-_]+$/, "");
  if (!cleaned) throw new Error(`Cannot derive a slug from "${navPath}"`);
  return cleaned;
}

/** `navigation.<lang>[].items[].path` from book.config.yaml, read line by line. */
export function readNavigation(yamlText) {
  const byLang = {};
  let inNavigation = false;
  let lang;
  for (const line of yamlText.split("\n")) {
    if (/^\s*(#|$)/.test(line)) continue;
    if (/^\S/.test(line)) {
      inNavigation = /^navigation:\s*$/.test(line);
      lang = undefined;
      continue;
    }
    if (!inNavigation) continue;
    const langKey = /^ {2}([A-Za-z-]+):\s*$/.exec(line);
    if (langKey) {
      lang = langKey[1];
      byLang[lang] = [];
      continue;
    }
    if (!lang) continue;
    // A flow line (`- { title: A, path: a.md }`) can hold several paths; quoted
    // values other than a path are blanked so a title cannot read as one.
    const paths = /^\s*-\s*\{/.test(line)
      ? [
          ...line
            .replace(/(path:\s*)?("[^"]*"|'[^']*')/g, (m, key) =>
              key ? m : '""',
            )
            .matchAll(/[{,]\s*path:\s*["']?([^"'\s#,}\]]+)/g),
        ].map((m) => m[1])
      : [/^\s*-?\s*path:\s*["']?([^"'\s#]+)/.exec(line)?.[1]].filter(Boolean);
    byLang[lang].push(...paths);
  }
  return byLang;
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const navigation = readNavigation(
    readFileSync(join(DOCS_SRC, "book.config.yaml"), "utf8"),
  );
  rmSync(OUT_DIR, { recursive: true, force: true });
  for (const [lang, paths] of Object.entries(navigation)) {
    const outLang = join(OUT_DIR, lang);
    mkdirSync(outLang, { recursive: true });
    const seen = new Map();
    const pages = paths.map((navPath) => {
      const page = slugFromNavPath(navPath);
      if (seen.has(page)) {
        throw new Error(
          `${lang}: "${navPath}" and "${seen.get(page)}" share the slug "${page}"`,
        );
      }
      seen.set(page, navPath);
      copyFileSync(join(DOCS_SRC, lang, navPath), join(outLang, `${page}.md`));
      return { page, file: `${page}.md` };
    });
    writeFileSync(join(outLang, "index.json"), JSON.stringify({ lang, pages }));
    console.log(`manual: ${relative(ROOT, outLang)} (${pages.length} pages)`);
  }
}
