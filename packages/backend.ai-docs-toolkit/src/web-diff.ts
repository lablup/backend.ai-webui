/**
 * Markdown-block level diff between two `dist/web` builds (FR-3879).
 *
 * Compares a base build with a head (PR) build, stamps every block of the
 * head pages with `data-bai-block="<n>"`, writes a `<slug>.changes.json`
 * sidecar per page plus a `changes-manifest.json` per channel, and injects
 * the `pr-preview` overlay tags so the published preview can mark the
 * changed blocks in place.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { ResolvedDocConfig } from "./config.js";
import { loadVersions } from "./versions.js";

/** Pairing threshold: below this a delete/insert pair stays two changes. */
const SIM_THRESHOLD = 0.4;
/** LCS bail-out — above this the diff degrades to whole-block replace. */
const MAX_DP_CELLS = 6_000_000;

export type BlockKind =
  | "paragraph"
  | "heading"
  | "list-item"
  | "table-row"
  | "image"
  | "code"
  | "admonition-title"
  | "summary"
  | "other";

export type ChangeType = "added" | "modified" | "removed";
export type PageStatus = "unchanged" | "modified" | "new" | "deleted";

export interface BlockAnchor {
  start: number;
  tagEnd: number;
  openEnd: number;
  closeStart: number;
  end: number;
}

export interface Block {
  idx: number;
  kind: BlockKind;
  tag: string;
  anchor: BlockAnchor;
  text: string;
  inner: string;
  key: string;
  hid: string | null;
  level?: number;
  cells?: string[];
  src?: string;
  hash?: string;
  width?: string;
  height?: string;
}

export interface SectionRef {
  text: string;
  id: string | null;
  level?: number;
}

export interface SerializedChange {
  id: number;
  type: ChangeType;
  blockKind: BlockKind;
  tag: string;
  anchor: number | null;
  insertAfter: number | null;
  fingerprint: string;
  section: SectionRef | null;
  line: number | null;
  oldText: string;
  newText: string;
  oldHtml?: string;
  newHtml?: string;
  diffHtml?: string;
  similarity?: number;
  /** The rendered text is unchanged — only markup or a link target moved. */
  formattingOnly?: boolean;
  words?: number;
  oldImage?: string | null;
  newImage?: string | null;
  width?: string;
  height?: string;
  oldCells?: string[] | null;
  newCells?: string[] | null;
}

export interface ChangeCounts {
  added: number;
  modified: number;
  removed: number;
  images: number;
  total: number;
}

export interface PageSidecar {
  slug: string;
  lang: string;
  title: string;
  status: PageStatus;
  sourcePath: string;
  counts: ChangeCounts;
  changes: SerializedChange[];
}

export interface ManifestPage {
  slug: string;
  title: string;
  status: Exclude<PageStatus, "unchanged">;
  url: string | null;
  sourcePath: string;
  counts: ChangeCounts;
  fingerprints: string[];
  baseUrl?: string;
}

export interface LangTotals {
  pages: number;
  changes: number;
  added: number;
  modified: number;
  removed: number;
  images: number;
  newPages: number;
  deletedPages: number;
}

export interface ChangesManifest {
  version: 1;
  channel: string;
  label: string;
  generatedAt: string;
  languages: string[];
  langs: Record<string, { totals: LangTotals; pages: ManifestPage[] }>;
}

export interface WebDiffOptions {
  /** `dist/web` root of the base (target-branch) build. */
  base: string;
  /** `dist/web` root of the head (PR) build — written into. */
  head: string;
  /** `all` (default) or a comma list such as `en,ko`. */
  lang?: string;
  /** Free-text PR label carried into the manifest. */
  label?: string;
  /** Markdown source root of the head build, for `file:line` references. */
  src?: string;
  /** Suppress the summary lines (the CLI's `--json` mode). */
  quiet?: boolean;
}

// ──────────────────────────────────────────── HTML tree

const VOID = new Set([
  "img",
  "br",
  "hr",
  "input",
  "meta",
  "link",
  "source",
  "wbr",
  "col",
  "area",
  "base",
  "embed",
  "param",
  "track",
]);

interface TextNode {
  type: "text";
  text: string;
  start: number;
  end: number;
}

export interface ElementNode {
  type: "el";
  tag: string;
  attrs: string;
  start: number;
  tagEnd: number;
  openEnd: number;
  closeStart: number;
  end: number;
  children: HtmlNode[];
}

type HtmlNode = TextNode | ElementNode;

/** Offset-preserving HTML parser: every node keeps its slice of the source. */
export function parseHtml(html: string): ElementNode {
  const re =
    /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)([^>]*?)(\/?)>|[^<]+|</g;
  const root: ElementNode = {
    type: "el",
    tag: "#root",
    attrs: "",
    start: 0,
    tagEnd: 0,
    openEnd: 0,
    closeStart: html.length,
    end: html.length,
    children: [],
  };
  const stack: ElementNode[] = [root];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const s = m.index;
    const e = s + m[0].length;
    if (m[0].startsWith("<!--")) continue;
    if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          for (let k = stack.length - 1; k > i; k--) {
            stack[k].closeStart = s;
            stack[k].end = s;
          }
          stack[i].closeStart = s;
          stack[i].end = e;
          stack.length = i;
          break;
        }
      }
      continue;
    }
    if (m[2]) {
      const tag = m[2].toLowerCase();
      const node: ElementNode = {
        type: "el",
        tag,
        attrs: m[3] || "",
        start: s,
        tagEnd: s + 1 + m[2].length,
        openEnd: e,
        closeStart: e,
        end: e,
        children: [],
      };
      stack[stack.length - 1].children.push(node);
      if (!(m[4] === "/" || VOID.has(tag))) stack.push(node);
      continue;
    }
    stack[stack.length - 1].children.push({
      type: "text",
      text: m[0],
      start: s,
      end: e,
    });
  }
  return root;
}

const classOf = (n: ElementNode): string =>
  (n.attrs.match(/\bclass="([^"]*)"/) || [])[1] || "";
const hasClass = (n: ElementNode, c: string): boolean =>
  classOf(n).split(/\s+/).includes(c);
const attrOf = (n: ElementNode, a: string): string | undefined =>
  (n.attrs.match(new RegExp(`\\b${a}="([^"]*)"`)) || [])[1];

function decode(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function textOf(node: HtmlNode): string {
  if (node.type === "text") return decode(node.text);
  if (node.tag === "a" && hasClass(node, "hash-link")) return "";
  if (hasClass(node, "admonition-icon") || node.tag === "svg") return "";
  if (node.tag === "figcaption") return "";
  return node.children.map(textOf).join("");
}

const norm = (s: string): string => s.replace(/\s+/g, " ").trim();

function innerHtml(html: string, node: ElementNode): string {
  return html
    .slice(node.openEnd, node.closeStart)
    .replace(/<a class="hash-link"[^>]*>#<\/a>/g, "")
    .trim();
}

function findAll(
  node: ElementNode,
  pred: (n: ElementNode) => boolean,
  out: ElementNode[] = [],
): ElementNode[] {
  for (const ch of node.children) {
    if (ch.type !== "el") continue;
    if (pred(ch)) out.push(ch);
    else findAll(ch, pred, out);
  }
  return out;
}

// ──────────────────────────────────────────── blocks

/**
 * Flatten the page's `<section class="chapter">` into comparable blocks.
 * Returns null for pages without a chapter body (redirect stubs).
 */
export function extractBlocks(html: string, pageDir: string): Block[] | null {
  const secStart = html.indexOf('<section class="chapter"');
  if (secStart < 0) return null;
  const mainEnd = html.indexOf("</main>", secStart);
  const secEnd = html.lastIndexOf(
    "</section>",
    mainEnd < 0 ? html.length : mainEnd,
  );
  const secHtml = html.slice(secStart, secEnd);
  const tree = parseHtml(secHtml);
  const section = tree.children.find(
    (c): c is ElementNode => c.type === "el" && c.tag === "section",
  );
  if (!section) return null;

  const blocks: Block[] = [];
  const shift = (n: ElementNode): BlockAnchor => ({
    start: n.start + secStart,
    tagEnd: n.tagEnd + secStart,
    openEnd: n.openEnd + secStart,
    closeStart: n.closeStart + secStart,
    end: n.end + secStart,
  });

  const push = (
    kind: BlockKind,
    anchor: ElementNode,
    text: string,
    inner: string,
    extra: Partial<Block> = {},
  ): void => {
    const t = norm(text);
    if (!t) return;
    blocks.push({
      idx: blocks.length,
      kind,
      tag: anchor.tag,
      anchor: shift(anchor),
      text: t,
      inner,
      // Keyed on markup, so a bold-only or link-target-only edit is a change.
      key: `${kind}:${norm(inner)}`,
      hid: attrOf(anchor, "id") ?? null,
      ...extra,
    });
  };

  const pushImage = (imgNode: ElementNode): void => {
    const img =
      imgNode.tag === "img"
        ? imgNode
        : findAll(imgNode, (n) => n.tag === "img")[0];
    if (!img) return;
    const src = attrOf(img, "src") || "";
    const file = path.resolve(pageDir, src);
    const hash = fs.existsSync(file)
      ? crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex").slice(0, 12)
      : "missing";
    // The anchor is the <figure>, never the wrapping <p> — browsers split
    // `<p><figure>` into two paragraphs and the mark would land off-target.
    const anchor = imgNode.tag === "figure" ? imgNode : img;
    blocks.push({
      idx: blocks.length,
      kind: "image",
      tag: anchor.tag,
      anchor: shift(anchor),
      text: src,
      inner: "",
      key: `image:${src}:${hash}`,
      hid: attrOf(anchor, "id") ?? null,
      src,
      hash,
      width: attrOf(img, "width"),
      height: attrOf(img, "height"),
    });
  };

  const walk = (node: { children: HtmlNode[] }): void => {
    for (const ch of node.children) {
      if (ch.type !== "el") continue;
      const t = ch.tag;
      if (/^h[1-6]$/.test(t)) {
        push("heading", ch, textOf(ch), innerHtml(secHtml, ch), {
          level: Number(t[1]),
        });
      } else if (t === "p") {
        const figs = findAll(ch, (n) => n.tag === "figure" || n.tag === "img");
        const txt = norm(textOf(ch));
        if (figs.length && !txt) figs.forEach(pushImage);
        else if (txt) push("paragraph", ch, txt, innerHtml(secHtml, ch));
      } else if (t === "ul" || t === "ol") {
        for (const li of ch.children) {
          if (li.type === "el" && li.tag === "li") {
            push("list-item", li, textOf(li), innerHtml(secHtml, li));
          }
        }
      } else if (t === "table") {
        for (const tr of findAll(ch, (n) => n.tag === "tr")) {
          const cells = tr.children
            .filter((c): c is ElementNode => c.type === "el")
            .map((c) => norm(textOf(c)));
          push("table-row", tr, cells.join(" | "), innerHtml(secHtml, tr), {
            cells,
          });
        }
      } else if (t === "figure" || t === "img") {
        pushImage(ch);
      } else if (t === "div" && hasClass(ch, "admonition")) {
        for (const sub of ch.children) {
          if (sub.type !== "el") continue;
          if (hasClass(sub, "admonition-heading")) {
            push("admonition-title", sub, textOf(sub), innerHtml(secHtml, sub));
          } else if (hasClass(sub, "admonition-content")) {
            walk(sub);
          }
        }
      } else if (t === "div" && hasClass(ch, "code-block-wrapper")) {
        const pre = findAll(ch, (n) => n.tag === "pre")[0] ?? ch;
        push("code", ch, textOf(pre), innerHtml(secHtml, pre));
      } else if (t === "pre") {
        push("code", ch, textOf(ch), innerHtml(secHtml, ch));
      } else if (t === "details") {
        for (const sub of ch.children) {
          if (sub.type !== "el") continue;
          if (sub.tag === "summary") {
            push("summary", sub, textOf(sub), innerHtml(secHtml, sub));
          } else walk({ children: [sub] });
        }
      } else if (
        t === "blockquote" ||
        t === "div" ||
        t === "section" ||
        t === "nav"
      ) {
        walk(ch);
      } else if (
        t === "hr" ||
        t === "br" ||
        t === "a" ||
        t === "script" ||
        t === "style"
      ) {
        continue;
      } else {
        push("other", ch, textOf(ch), innerHtml(secHtml, ch));
      }
    }
  };
  walk(section);
  return blocks;
}

// ──────────────────────────────────────────── diffing

interface LcsOp {
  type: "eq" | "del" | "ins";
  i?: number;
  j?: number;
}

function lcsOps<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): LcsOp[] {
  const n = a.length;
  const m = b.length;
  const W = m + 1;
  const dp = new Uint32Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * W + j] = eq(a[i], b[j])
        ? dp[(i + 1) * W + j + 1] + 1
        : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
    }
  }
  const ops: LcsOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) {
      ops.push({ type: "eq", i, j });
      i++;
      j++;
    } else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) {
      ops.push({ type: "del", i });
      i++;
    } else {
      ops.push({ type: "ins", j });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", i: i++ });
  while (j < m) ops.push({ type: "ins", j: j++ });
  return ops;
}

function lcsLen<T>(a: T[], b: T[], eq: (x: T, y: T) => boolean): number {
  const n = a.length;
  const m = b.length;
  if (n * m > MAX_DP_CELLS) return 0;
  let prev = new Uint32Array(m + 1);
  let cur = new Uint32Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      cur[j] = eq(a[i - 1], b[j - 1])
        ? prev[j - 1] + 1
        : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[m];
}

/** Fallback when `Intl.Segmenter` is missing: CJK / Thai split per character. */
const WORD_RE =
  /\s+|[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}\p{sc=Thai}]|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}]/gu;

interface Token {
  t: "tag" | "ws" | "w";
  v: string;
}

const segmenters = new Map<string, Intl.Segmenter | null>();

function segmenterFor(lang: string): Intl.Segmenter | null {
  if (!segmenters.has(lang)) {
    let seg: Intl.Segmenter | null = null;
    try {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        seg = new Intl.Segmenter(lang, { granularity: "word" });
      }
    } catch {
      seg = null;
    }
    segmenters.set(lang, seg);
  }
  return segmenters.get(lang) ?? null;
}

/** Locale-aware word segmentation; punctuation and whitespace stay separate. */
export function segmentText(s: string, lang = "en"): Token[] {
  const seg = segmenterFor(lang);
  if (!seg) {
    return (s.match(WORD_RE) || []).map((v) => ({
      t: /^\s+$/.test(v) ? "ws" : "w",
      v,
    }));
  }
  const out: Token[] = [];
  for (const { segment } of seg.segment(s)) {
    out.push({ t: /^\s+$/.test(segment) ? "ws" : "w", v: segment });
  }
  return out;
}

export function words(s: string, lang = "en"): string[] {
  return segmentText(s, lang)
    .filter((t) => t.t === "w")
    .map((t) => t.v);
}

function tokenizeHtml(inner: string, lang: string): Token[] {
  const toks: Token[] = [];
  for (const part of inner.match(/<[^>]+>|[^<]+/g) || []) {
    if (part.startsWith("<")) toks.push({ t: "tag", v: part });
    else toks.push(...segmentText(part, lang));
  }
  return toks;
}

const tokEq = (x: Token, y: Token): boolean =>
  x.t === y.t && (x.t === "ws" || x.v === y.v);

/** Word-level inline diff. Tags stay atomic so the markup survives. */
export function diffInlineHtml(
  oldInner: string,
  newInner: string,
  lang = "en",
): string {
  const a = tokenizeHtml(oldInner, lang);
  const b = tokenizeHtml(newInner, lang);
  if (a.length * b.length > MAX_DP_CELLS) {
    return `<del class="bai-del">${oldInner}</del><ins class="bai-ins">${newInner}</ins>`;
  }
  const ops = lcsOps(a, b, tokEq);
  let out = "";
  let delBuf = "";
  let insBuf = "";
  const flush = (): void => {
    if (delBuf) out += `<del class="bai-del">${delBuf}</del>`;
    if (insBuf) out += `<ins class="bai-ins">${insBuf}</ins>`;
    delBuf = "";
    insBuf = "";
  };
  for (const op of ops) {
    if (op.type === "eq") {
      flush();
      out += b[op.j as number].v;
      continue;
    }
    const tok = op.type === "del" ? a[op.i as number] : b[op.j as number];
    if (tok.t === "tag") {
      flush();
      out += tok.v;
      continue;
    }
    if (op.type === "del") delBuf += tok.v;
    else insBuf += tok.v;
  }
  flush();
  return out;
}

/** Pairing score on plain text — markup differences never lower it. */
export function similarity(d: Block, h: Block, lang = "en"): number {
  if (d.kind !== h.kind) return 0;
  if (d.kind === "image") return d.src === h.src ? 1 : 0;
  const a = words(d.text, lang);
  const b = words(h.text, lang);
  if (!a.length || !b.length) return 0;
  return (2 * lcsLen(a, b, (x, y) => x === y)) / (a.length + b.length);
}

export interface RawChange {
  type: ChangeType;
  base?: Block;
  head?: Block;
  sim?: number;
  insertAfter?: number;
}

/**
 * Block-level LCS, then within each del/ins run pair the most similar
 * survivors into `modified` and leave the rest as added / removed.
 */
export function diffBlocks(
  baseBlocks: Block[],
  headBlocks: Block[],
  lang = "en",
): RawChange[] {
  const ops = lcsOps(baseBlocks, headBlocks, (x, y) => x.key === y.key);
  const changes: RawChange[] = [];
  let lastHead = -1;
  let run: { dels: Block[]; inss: Block[] } | null = null;

  const flushRun = (): void => {
    if (!run) return;
    const { dels, inss } = run;
    let j = 0;
    for (const d of dels) {
      let best = -1;
      let bestSim = 0;
      for (let k = j; k < inss.length; k++) {
        const s = similarity(d, inss[k], lang);
        if (s > bestSim) {
          bestSim = s;
          best = k;
        }
      }
      if (best >= 0 && bestSim >= SIM_THRESHOLD) {
        for (let k = j; k < best; k++) {
          changes.push({ type: "added", head: inss[k] });
          lastHead = inss[k].idx;
        }
        changes.push({ type: "modified", base: d, head: inss[best], sim: bestSim });
        lastHead = inss[best].idx;
        j = best + 1;
      } else {
        changes.push({ type: "removed", base: d, insertAfter: lastHead });
      }
    }
    for (; j < inss.length; j++) {
      changes.push({ type: "added", head: inss[j] });
      lastHead = inss[j].idx;
    }
    run = null;
  };

  for (const op of ops) {
    if (op.type === "eq") {
      flushRun();
      lastHead = headBlocks[op.j as number].idx;
      continue;
    }
    run ??= { dels: [], inss: [] };
    if (op.type === "del") run.dels.push(baseBlocks[op.i as number]);
    else run.inss.push(headBlocks[op.j as number]);
  }
  flushRun();
  return changes;
}

// ──────────────────────────────────────────── page metadata

/** Repo-relative markdown path, read off the page's "Edit this page" link. */
export function sourcePathOf(html: string, lang: string, slug: string): string {
  const m = html.match(/href="[^"]*\/edit\/[^"/]+\/([^"]+\.md)"/);
  return m ? m[1] : `src/${lang}/${slug}/${slug}.md`;
}

export function pageTitle(html: string, slug: string): string {
  const m =
    html.match(/breadcrumb__item--current"[^>]*>([^<]*)</) ||
    html.match(/<h1[^>]*>([^<]*)</);
  return m ? decode(m[1]).trim() : slug;
}

const stripMd = (s: string): string =>
  s
    .replace(/!\[[^\]]*\]\(([^)]*)\)/g, "$1")
    .replace(/[*_`~]|\[([^\]]*)\]\([^)]*\)|<[^>]+>|^\s*(?:[-*+]|\d+\.|#+|>|\|)\s*/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const alnum = (s: string): string =>
  s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Pre-normalized markdown lines; index + 1 is the reported line number. */
export function markdownProbeLines(source: string): string[] {
  return source.split("\n").map((l) => alnum(stripMd(l)));
}

/** Best-effort: first source line containing the block's opening words. */
export function lineOf(
  mdLines: string[] | null,
  text: string,
  kind: BlockKind,
): number | null {
  if (!mdLines || !text) return null;
  const probe = alnum(kind === "image" ? path.basename(text) : text).slice(0, 24);
  if (probe.length < 6) return null;
  const i = mdLines.findIndex((l) => l.includes(probe));
  return i >= 0 ? i + 1 : null;
}

function sectionOf(
  change: RawChange,
  headBlocks: Block[],
  baseBlocks: Block[],
): SectionRef | null {
  const blocks = change.head ? headBlocks : baseBlocks;
  const upto = (change.head ?? change.base)!.idx;
  for (let i = upto - 1; i >= 0; i--) {
    if (blocks[i].kind === "heading") {
      return { text: blocks[i].text, id: blocks[i].hid, level: blocks[i].level };
    }
  }
  return null;
}

export function fingerprintOf(change: RawChange): string {
  const blk = (change.head ?? change.base)!;
  return crypto
    .createHash("sha1")
    .update(
      [
        change.type,
        blk.kind,
        change.base?.text ?? "",
        change.head?.text ?? "",
        change.base?.hash ?? "",
        change.head?.hash ?? "",
      ].join(""),
    )
    .digest("hex")
    .slice(0, 12);
}

// ──────────────────────────────────────────── stamping

const PREVIEW_ASSET_LINE = /^.*assets\/pr-preview\.(?:css|js).*\n/gm;

/** Undo a previous run so re-running the diff is idempotent. */
export function stripInjected(html: string): string {
  return html.replace(/ data-bai-block="\d+"/g, "").replace(PREVIEW_ASSET_LINE, "");
}

export function injectHead(
  html: string,
  blocks: Block[],
  slug: string,
  assetPrefix: string,
): string {
  // Stamp from the end so the earlier offsets stay valid.
  const sorted = [...blocks].sort((a, b) => b.anchor.tagEnd - a.anchor.tagEnd);
  let out = html;
  for (const b of sorted) {
    out =
      out.slice(0, b.anchor.tagEnd) +
      ` data-bai-block="${b.idx}"` +
      out.slice(b.anchor.tagEnd);
  }
  const tags =
    `  <link rel="stylesheet" href="${assetPrefix}pr-preview.css" />\n` +
    `  <script defer src="${assetPrefix}pr-preview.js" data-page="${slug}"></script>\n`;
  return out.replace("</head>", `${tags}</head>`);
}

function countChanges(changes: SerializedChange[]): ChangeCounts {
  const c: ChangeCounts = {
    added: 0,
    modified: 0,
    removed: 0,
    images: 0,
    total: changes.length,
  };
  for (const ch of changes) {
    c[ch.type]++;
    if (ch.blockKind === "image") c.images++;
  }
  return c;
}

function listPages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html"))
    .map((f) => f.replace(/\.html$/, ""));
}

/**
 * The channel directory the pages live under — the workspace version's
 * label. Null when the head build has no channel directory (flat layout).
 */
export function resolveChannel(
  config: ResolvedDocConfig,
  headRoot: string,
): string | null {
  let candidates: string[] = [];
  try {
    const loaded = loadVersions(config);
    const workspace = loaded.entries.find((v) => v.source.kind === "workspace");
    candidates = [workspace?.outDir, loaded.latest?.outDir].filter(
      (v): v is string => typeof v === "string",
    );
  } catch {
    candidates = [];
  }
  for (const c of candidates) {
    if (fs.existsSync(path.join(headRoot, c))) return c;
  }
  return null;
}

function resolveOverlayAsset(name: string): string {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "..", "templates", "assets", name);
}

/** Copy a base-build image next to the head page so the popover can show it. */
function copyBaseImage(
  baseDir: string,
  headLangDir: string,
  src: string,
): string | null {
  const from = path.resolve(baseDir, src);
  if (!fs.existsSync(from)) return null;
  const outDir = path.join(headLangDir, "base-images");
  fs.mkdirSync(outDir, { recursive: true });
  const bytes = fs.readFileSync(from);
  let name = path.basename(src);
  const to = path.join(outDir, name);
  if (fs.existsSync(to) && !fs.readFileSync(to).equals(bytes)) {
    const ext = path.extname(name);
    const hash = crypto.createHash("md5").update(bytes).digest("hex").slice(0, 8);
    name = `${name.slice(0, name.length - ext.length)}.${hash}${ext}`;
  }
  fs.writeFileSync(path.join(outDir, name), bytes);
  return `./base-images/${name}`;
}

interface SerializeContext {
  headBlocks: Block[];
  baseBlocks: Block[];
  mdLines: string[] | null;
  baseDir: string;
  headLangDir: string;
  lang: string;
}

function serializeChange(
  change: RawChange,
  id: number,
  ctx: SerializeContext,
): SerializedChange {
  const blk = (change.head ?? change.base)!;
  const out: SerializedChange = {
    id,
    type: change.type,
    blockKind: blk.kind,
    tag: blk.tag,
    anchor: change.head ? change.head.idx : null,
    insertAfter: change.insertAfter ?? null,
    fingerprint: fingerprintOf(change),
    section: sectionOf(change, ctx.headBlocks, ctx.baseBlocks),
    line: lineOf(ctx.mdLines, (change.head ?? change.base)!.text, blk.kind),
    oldText: change.base ? change.base.text : "",
    newText: change.head ? change.head.text : "",
  };

  if (blk.kind === "image") {
    out.newImage = change.head?.src ?? null;
    out.oldImage = change.base?.src
      ? copyBaseImage(ctx.baseDir, ctx.headLangDir, change.base.src)
      : null;
    out.width = blk.width;
    out.height = blk.height;
    return out;
  }

  out.oldHtml = change.base ? change.base.inner : "";
  out.newHtml = change.head ? change.head.inner : "";
  out.words = words(out.newText || out.oldText, ctx.lang).length;
  if (change.type === "modified") {
    out.diffHtml = diffInlineHtml(
      change.base!.inner,
      change.head!.inner,
      ctx.lang,
    );
    out.similarity = Number((change.sim ?? 0).toFixed(2));
    // Only tag tokens differed — no word was added or deleted.
    if (!/class="bai-(?:del|ins)"/.test(out.diffHtml)) out.formattingOnly = true;
  }
  if (blk.kind === "table-row") {
    out.oldCells = change.base?.cells ?? null;
    out.newCells = change.head?.cells ?? null;
  }
  return out;
}

// ──────────────────────────────────────────── entry point

export async function generateWebDiff(
  config: ResolvedDocConfig,
  opts: WebDiffOptions,
): Promise<ChangesManifest> {
  const baseRoot = path.resolve(config.projectRoot, opts.base);
  const headRoot = path.resolve(config.projectRoot, opts.head);
  const srcRoot = path.resolve(config.projectRoot, opts.src ?? config.srcDir);
  const log = (msg: string): void => {
    if (opts.quiet) console.error(msg);
    else console.log(msg);
  };

  const channel = resolveChannel(config, headRoot);
  const baseChannelDir = channel ? path.join(baseRoot, channel) : baseRoot;
  const headChannelDir = channel ? path.join(headRoot, channel) : headRoot;
  const assetPrefix = channel ? "../../assets/" : "../assets/";
  const urlPrefix = channel ? `${channel}/` : "";

  const known = Object.keys(config.languageLabels);
  const langArg = opts.lang ?? "all";
  const languages =
    langArg === "all"
      ? known.filter((l) =>
          fs.existsSync(path.join(headChannelDir, l)),
        )
      : langArg
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean);

  const manifest: ChangesManifest = {
    version: 1,
    channel: channel ?? "",
    label: opts.label ?? "",
    generatedAt: new Date().toISOString(),
    languages,
    langs: {},
  };

  for (const lang of languages) {
    const baseDir = path.join(baseChannelDir, lang);
    const headDir = path.join(headChannelDir, lang);
    const basePages = new Set(listPages(baseDir));
    const headPages = new Set(listPages(headDir));
    const pages: ManifestPage[] = [];
    const totals: LangTotals = {
      pages: 0,
      changes: 0,
      added: 0,
      modified: 0,
      removed: 0,
      images: 0,
      newPages: 0,
      deletedPages: 0,
    };

    for (const slug of [...headPages].sort()) {
      const headFile = path.join(headDir, `${slug}.html`);
      const headHtml = stripInjected(fs.readFileSync(headFile, "utf-8"));
      const headBlocks = extractBlocks(headHtml, headDir);
      if (!headBlocks) continue;

      const title = pageTitle(headHtml, slug);
      const sourcePath = sourcePathOf(headHtml, lang, slug);
      const relMd = sourcePath.replace(/^.*?(?:^|\/)src\//, "");
      const mdFile = path.join(srcRoot, relMd);
      const mdLines = fs.existsSync(mdFile)
        ? markdownProbeLines(fs.readFileSync(mdFile, "utf-8"))
        : null;

      let changes: SerializedChange[] = [];
      let status: PageStatus = "unchanged";
      if (!basePages.has(slug)) {
        status = "new";
      } else {
        const baseHtml = fs.readFileSync(
          path.join(baseDir, `${slug}.html`),
          "utf-8",
        );
        const baseBlocks = extractBlocks(baseHtml, baseDir) ?? [];
        const ctx: SerializeContext = {
          headBlocks,
          baseBlocks,
          mdLines,
          baseDir,
          headLangDir: headDir,
          lang,
        };
        changes = diffBlocks(baseBlocks, headBlocks, lang).map((c, i) =>
          serializeChange(c, i + 1, ctx),
        );
        // The same image swapped in several places shares a fingerprint.
        const seen = new Map<string, number>();
        for (const ch of changes) {
          const n = (seen.get(ch.fingerprint) ?? 0) + 1;
          seen.set(ch.fingerprint, n);
          if (n > 1) ch.fingerprint += `-${n}`;
        }
        if (changes.length) status = "modified";
      }

      const counts = countChanges(changes);
      const sidecar: PageSidecar = {
        slug,
        lang,
        title,
        status,
        sourcePath,
        counts,
        changes,
      };
      fs.writeFileSync(
        path.join(headDir, `${slug}.changes.json`),
        JSON.stringify(sidecar),
      );
      fs.writeFileSync(
        headFile,
        injectHead(headHtml, headBlocks, slug, assetPrefix),
      );

      if (status === "unchanged") continue;
      pages.push({
        slug,
        title,
        status,
        url: `${urlPrefix}${lang}/${slug}.html`,
        sourcePath,
        counts,
        fingerprints: changes.map((c) => c.fingerprint),
      });
      totals.pages++;
      totals.changes += counts.total;
      totals.added += counts.added;
      totals.modified += counts.modified;
      totals.removed += counts.removed;
      totals.images += counts.images;
      if (status === "new") totals.newPages++;
    }

    for (const slug of [...basePages].filter((s) => !headPages.has(s)).sort()) {
      const baseHtml = fs.readFileSync(
        path.join(baseDir, `${slug}.html`),
        "utf-8",
      );
      if (!extractBlocks(baseHtml, baseDir)) continue;
      pages.push({
        slug,
        title: pageTitle(baseHtml, slug),
        status: "deleted",
        url: null,
        sourcePath: sourcePathOf(baseHtml, lang, slug),
        counts: countChanges([]),
        fingerprints: [],
        baseUrl: `${urlPrefix}${lang}/${slug}.html`,
      });
      totals.pages++;
      totals.deletedPages++;
    }

    pages.sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));
    manifest.langs[lang] = { totals, pages };
    log(
      `[${lang}] ${totals.pages} pages · ${totals.changes} changes ` +
        `(+${totals.added} ~${totals.modified} -${totals.removed}, ${totals.images} images, ` +
        `new ${totals.newPages}, deleted ${totals.deletedPages})`,
    );
    for (const p of pages) {
      log(`    ${p.status.padEnd(9)} ${p.slug.padEnd(20)} ${p.counts.total}`);
    }
  }

  fs.mkdirSync(headChannelDir, { recursive: true });
  fs.writeFileSync(
    path.join(headChannelDir, "changes-manifest.json"),
    JSON.stringify(manifest, null, 2),
  );
  const outAssets = path.join(headRoot, "assets");
  fs.mkdirSync(outAssets, { recursive: true });
  for (const name of ["pr-preview.js", "pr-preview.css"]) {
    const from = resolveOverlayAsset(name);
    if (!fs.existsSync(from)) {
      throw new Error(
        `Bundled ${name} not found at ${from}. ` +
          `Reinstall backend.ai-docs-toolkit or include templates/assets/${name}.`,
      );
    }
    fs.copyFileSync(from, path.join(outAssets, name));
  }
  log(`manifest: ${path.join(headChannelDir, "changes-manifest.json")}`);
  return manifest;
}
