#!/usr/bin/env node
/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Splits the user manual (packages/backend.ai-webui-docs/src/<lang>/**.md) into
 heading-level sections and writes resources/webui-assistant/manual.<lang>.json,
 the knowledge the WebUI Assistant retrieves from in the browser. The output is
 a build artifact (gitignored); `pnpm run build` and `pnpm run dev` run this.
*/
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_SRC = join(ROOT, "packages/backend.ai-webui-docs/src");
const OUT_DIR = join(ROOT, "resources/webui-assistant");
const LANGUAGES = ["en", "ko", "ja", "th"];

/** Same rule as the docs toolkit's `slugFromNavPath`, so links land on real pages. */
export const slugFromPath = (path) =>
  basename(path, extname(path))
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const listMarkdown = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (name === "images") return [];
    if (statSync(full).isDirectory()) return listMarkdown(full);
    return name.endsWith(".md") ? [full] : [];
  });

const cleanLine = (line) =>
  line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/^:::(\w+)\[(.*)\]\s*$/, (_, kind, title) => `${kind}: ${title}`)
    .replace(/^:::\w*\s*$/, "")
    .replace(/<\/?[a-zA-Z][^>]*>/g, "");

/** Splits one markdown page into `{ heading, anchor, text }` sections at h1–h3. */
export function splitSections(markdown) {
  let body = markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
  const navTitle = /^---\n[\s\S]*?navTitle:\s*(.+)\n[\s\S]*?---\n/
    .exec(markdown)?.[1]
    ?.trim();
  const sections = [];
  let current = { heading: "", anchor: undefined, lines: [] };
  let pendingAnchor;
  let inFence = false;
  let pageTitle = navTitle;

  for (const raw of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(raw)) inFence = !inFence;
    const anchor = !inFence && /^\s*<a id="([^"]+)"><\/a>\s*$/.exec(raw);
    if (anchor) {
      pendingAnchor = anchor[1];
      continue;
    }
    const heading = !inFence && /^(#{1,3})\s+(.+?)\s*#*\s*$/.exec(raw);
    if (heading) {
      sections.push(current);
      const title = heading[2].replace(/<[^>]+>/g, "").trim();
      if (heading[1].length === 1 && !pageTitle) pageTitle = title;
      current = { heading: title, anchor: pendingAnchor, lines: [] };
      pendingAnchor = undefined;
      continue;
    }
    if (raw.trim() !== "") pendingAnchor = undefined;
    current.lines.push(inFence ? raw : cleanLine(raw));
  }
  sections.push(current);

  return {
    pageTitle: pageTitle ?? "",
    sections: sections
      .map(({ heading, anchor, lines }) => ({
        heading,
        anchor,
        text: lines
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim(),
      }))
      .filter((s) => s.text.length > 0),
  };
}

export function buildManual(lang) {
  const langDir = join(DOCS_SRC, lang);
  const sections = [];
  for (const file of listMarkdown(langDir).sort()) {
    const page = slugFromPath(file);
    const { pageTitle, sections: pageSections } = splitSections(
      readFileSync(file, "utf8"),
    );
    for (const s of pageSections) {
      sections.push({
        page,
        pageTitle,
        heading: s.heading || pageTitle,
        anchor: s.anchor,
        text: s.text,
      });
    }
  }
  return { lang, sections };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  mkdirSync(OUT_DIR, { recursive: true });
  for (const lang of LANGUAGES) {
    const manual = buildManual(lang);
    const out = join(OUT_DIR, `manual.${lang}.json`);
    writeFileSync(out, JSON.stringify(manual));
    console.log(
      `assistant manual: ${relative(ROOT, out)} (${manual.sections.length} sections)`,
    );
  }
}
