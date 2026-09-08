#!/usr/bin/env node
// PROTOTYPE (FR-3882) — throwaway, not production.
//
// Diffs a base docs build against a head build at markdown-block level
// (paragraph / heading / list item / table row / image / code / admonition
// title) and injects the result into the head build:
//   - `data-bai-block="<n>"` on every block's anchor element
//   - `<slug>.changes.json` sidecar per page, `changes-manifest.json` per site
//   - the overlay <link>/<script> tags (served from ./overlay.{css,js})
//
// Zero dependencies on purpose: the durable extraction method is the research
// ticket's job (FR-3883); this only has to be good enough to react to.
//
// Usage: node build-changes.mjs [--base dist/proto-base] [--head dist/proto-head]
//          [--version next] [--langs en,ko,ja,th] [--base-url /base]
//          [--pretend-new slug,...] [--pretend-deleted slug,...] [--label "…"]

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, '..');
const args = parseArgs(process.argv.slice(2));

const BASE = path.resolve(docsRoot, args.base ?? 'dist/proto-base');
const HEAD = path.resolve(docsRoot, args.head ?? 'dist/proto-head');
const VERSION = args.version ?? 'next';
const LANGS = (args.langs ?? 'en,ko,ja,th').split(',').filter(Boolean);
const BASE_URL = args['base-url'] ?? '/base';
const PRETEND_NEW = new Set((args['pretend-new'] ?? '').split(',').filter(Boolean));
const PRETEND_DELETED = new Set((args['pretend-deleted'] ?? '').split(',').filter(Boolean));
const LABEL = args.label ?? '';
const SIM_THRESHOLD = 0.4;
const MAX_DP_CELLS = 6_000_000;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------- HTML tree

const VOID = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'wbr', 'col', 'area', 'base', 'embed', 'param', 'track']);

function parseHtml(html) {
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)([^>]*?)(\/?)>|[^<]+|</g;
  const root = { type: 'el', tag: '#root', attrs: '', start: 0, openEnd: 0, closeStart: html.length, end: html.length, children: [] };
  const stack = [root];
  let m;
  while ((m = re.exec(html))) {
    const s = m.index;
    const e = s + m[0].length;
    if (m[0].startsWith('<!--')) continue;
    if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].tag === tag) {
          for (let k = stack.length - 1; k > i; k--) { stack[k].closeStart = s; stack[k].end = s; }
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
      const node = { type: 'el', tag, attrs: m[3] || '', start: s, tagEnd: s + 1 + m[2].length, openEnd: e, closeStart: e, end: e, children: [] };
      stack[stack.length - 1].children.push(node);
      if (!(m[4] === '/' || VOID.has(tag))) stack.push(node);
      continue;
    }
    stack[stack.length - 1].children.push({ type: 'text', text: m[0], start: s, end: e });
  }
  return root;
}

const classOf = (n) => (n.attrs.match(/\bclass="([^"]*)"/) || [])[1] || '';
const hasClass = (n, c) => classOf(n).split(/\s+/).includes(c);
const attrOf = (n, a) => (n.attrs.match(new RegExp(`\\b${a}="([^"]*)"`)) || [])[1];

function decode(s) {
  return s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function textOf(node) {
  if (node.type === 'text') return decode(node.text);
  if (node.type !== 'el') return '';
  if (node.tag === 'a' && hasClass(node, 'hash-link')) return '';
  if (hasClass(node, 'admonition-icon') || node.tag === 'svg') return '';
  if (node.tag === 'figcaption') return '';
  return node.children.map(textOf).join('');
}
const norm = (s) => s.replace(/\s+/g, ' ').trim();

function innerHtml(html, node) {
  let inner = html.slice(node.openEnd, node.closeStart);
  inner = inner.replace(/<a class="hash-link"[^>]*>#<\/a>/g, '');
  return inner.trim();
}

function findAll(node, pred, out = []) {
  for (const ch of node.children || []) {
    if (ch.type !== 'el') continue;
    if (pred(ch)) out.push(ch);
    else findAll(ch, pred, out);
  }
  return out;
}

// ---------------------------------------------------------------- blocks

function extractBlocks(html, pageDir) {
  const secStart = html.indexOf('<section class="chapter"');
  if (secStart < 0) return null;
  const mainEnd = html.indexOf('</main>', secStart);
  const secEnd = html.lastIndexOf('</section>', mainEnd);
  const secHtml = html.slice(secStart, secEnd);
  const tree = parseHtml(secHtml);
  const section = tree.children.find((c) => c.type === 'el' && c.tag === 'section');
  const blocks = [];
  const shift = (n) => ({ ...n, start: n.start + secStart, tagEnd: n.tagEnd + secStart, openEnd: n.openEnd + secStart, closeStart: n.closeStart + secStart, end: n.end + secStart });

  const push = (kind, anchor, text, inner, extra = {}) => {
    const t = norm(text);
    if (!t && kind !== 'image') return;
    blocks.push({ idx: blocks.length, kind, tag: anchor.tag, anchor: shift(anchor), text: t, inner, key: `${kind}:${t}`, ...extra });
  };
  const pushImage = (imgNode) => {
    const img = imgNode.tag === 'img' ? imgNode : findAll(imgNode, (n) => n.tag === 'img')[0];
    if (!img) return;
    const src = attrOf(img, 'src') || '';
    const file = path.resolve(pageDir, src);
    const hash = fs.existsSync(file) ? crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 12) : 'missing';
    const anchor = imgNode.tag === 'figure' ? imgNode : img;
    blocks.push({ idx: blocks.length, kind: 'image', tag: anchor.tag, anchor: shift(anchor), text: src, inner: '', key: `image:${src}:${hash}`, src, hash, width: attrOf(img, 'width'), height: attrOf(img, 'height') });
  };

  const walk = (node) => {
    for (const ch of node.children) {
      if (ch.type !== 'el') continue;
      const t = ch.tag;
      const cls = classOf(ch);
      if (/^h[1-6]$/.test(t)) push('heading', ch, textOf(ch), innerHtml(secHtml, ch), { level: Number(t[1]) });
      else if (t === 'p') {
        const figs = findAll(ch, (n) => n.tag === 'figure' || n.tag === 'img');
        const txt = norm(textOf(ch));
        if (figs.length && !txt) figs.forEach(pushImage);
        else if (txt) push('paragraph', ch, txt, innerHtml(secHtml, ch));
      } else if (t === 'ul' || t === 'ol') {
        for (const li of ch.children) if (li.type === 'el' && li.tag === 'li') push('list-item', li, textOf(li), innerHtml(secHtml, li));
      } else if (t === 'table') {
        for (const tr of findAll(ch, (n) => n.tag === 'tr')) {
          const cells = tr.children.filter((c) => c.type === 'el').map((c) => norm(textOf(c)));
          push('table-row', tr, cells.join(' | '), innerHtml(secHtml, tr), { cells });
        }
      } else if (t === 'figure' || t === 'img') pushImage(ch);
      else if (t === 'div' && hasClass(ch, 'admonition')) {
        for (const sub of ch.children) {
          if (sub.type !== 'el') continue;
          if (hasClass(sub, 'admonition-heading')) push('admonition-title', sub, textOf(sub), innerHtml(secHtml, sub));
          else if (hasClass(sub, 'admonition-content')) walk(sub);
        }
      } else if (t === 'div' && hasClass(ch, 'code-block-wrapper')) {
        const pre = findAll(ch, (n) => n.tag === 'pre')[0] || ch;
        push('code', ch, textOf(pre), innerHtml(secHtml, pre));
      } else if (t === 'pre') push('code', ch, textOf(ch), innerHtml(secHtml, ch));
      else if (t === 'details') {
        for (const sub of ch.children) {
          if (sub.type !== 'el') continue;
          if (sub.tag === 'summary') push('summary', sub, textOf(sub), innerHtml(secHtml, sub));
          else walk({ children: [sub] });
        }
      } else if (t === 'blockquote' || t === 'div' || t === 'section' || t === 'nav') walk(ch);
      else if (t === 'hr' || t === 'br' || t === 'a' || t === 'script' || t === 'style') continue;
      else push('other', ch, textOf(ch), innerHtml(secHtml, ch));
    }
  };
  walk(section);
  return blocks;
}

// ---------------------------------------------------------------- diffing

function lcsOps(a, b, eq) {
  const n = a.length, m = b.length, W = m + 1;
  const dp = new Uint32Array((n + 1) * W);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * W + j] = eq(a[i], b[j]) ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
    }
  }
  const ops = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (eq(a[i], b[j])) { ops.push({ type: 'eq', i, j }); i++; j++; }
    else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) { ops.push({ type: 'del', i }); i++; }
    else { ops.push({ type: 'ins', j }); j++; }
  }
  while (i < n) ops.push({ type: 'del', i: i++ });
  while (j < m) ops.push({ type: 'ins', j: j++ });
  return ops;
}

function lcsLen(a, b, eq) {
  const n = a.length, m = b.length;
  if (n * m > MAX_DP_CELLS) return 0;
  let prev = new Uint32Array(m + 1), cur = new Uint32Array(m + 1);
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) cur[j] = eq(a[i - 1], b[j - 1]) ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    [prev, cur] = [cur, prev];
  }
  return prev[m];
}

// Word tokens: CJK / Thai scripts split per character (no spaces), the rest per word.
const WORD_RE = /\s+|[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Thai}]|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}]/gu;
const words = (s) => (s.match(WORD_RE) || []).filter((w) => !/^\s+$/.test(w));

function tokenizeHtml(inner) {
  const toks = [];
  for (const part of inner.match(/<[^>]+>|[^<]+/g) || []) {
    if (part.startsWith('<')) toks.push({ t: 'tag', v: part });
    else for (const w of part.match(WORD_RE) || []) toks.push({ t: /^\s+$/.test(w) ? 'ws' : 'w', v: w });
  }
  return toks;
}
const tokEq = (x, y) => x.t === y.t && (x.t === 'ws' || x.v === y.v);

function diffInlineHtml(oldInner, newInner) {
  const a = tokenizeHtml(oldInner), b = tokenizeHtml(newInner);
  if (a.length * b.length > MAX_DP_CELLS) return `<del class="bai-del">${oldInner}</del><ins class="bai-ins">${newInner}</ins>`;
  const ops = lcsOps(a, b, tokEq);
  let out = '', delBuf = '', insBuf = '';
  const flush = () => {
    if (delBuf) out += `<del class="bai-del">${delBuf}</del>`;
    if (insBuf) out += `<ins class="bai-ins">${insBuf}</ins>`;
    delBuf = insBuf = '';
  };
  for (const op of ops) {
    if (op.type === 'eq') { flush(); out += b[op.j].v; continue; }
    const tok = op.type === 'del' ? a[op.i] : b[op.j];
    if (tok.t === 'tag') { flush(); out += tok.v; continue; }
    if (op.type === 'del') delBuf += tok.v; else insBuf += tok.v;
  }
  flush();
  return out;
}

function similarity(d, h) {
  if (d.kind !== h.kind) return 0;
  if (d.kind === 'image') return d.src === h.src ? 1 : 0;
  const a = words(d.text), b = words(h.text);
  if (!a.length || !b.length) return 0;
  return (2 * lcsLen(a, b, (x, y) => x === y)) / (a.length + b.length);
}

function diffBlocks(baseBlocks, headBlocks) {
  const ops = lcsOps(baseBlocks, headBlocks, (x, y) => x.key === y.key);
  const changes = [];
  let lastHead = -1;
  let run = null;
  const flushRun = () => {
    if (!run) return;
    const { dels, inss } = run;
    let j = 0;
    for (const d of dels) {
      let best = -1, bestSim = 0;
      for (let k = j; k < inss.length; k++) { const s = similarity(d, inss[k]); if (s > bestSim) { bestSim = s; best = k; } }
      if (best >= 0 && bestSim >= SIM_THRESHOLD) {
        for (let k = j; k < best; k++) { changes.push({ type: 'added', head: inss[k] }); lastHead = inss[k].idx; }
        changes.push({ type: 'modified', base: d, head: inss[best], sim: bestSim });
        lastHead = inss[best].idx;
        j = best + 1;
      } else changes.push({ type: 'removed', base: d, insertAfter: lastHead });
    }
    for (; j < inss.length; j++) { changes.push({ type: 'added', head: inss[j] }); lastHead = inss[j].idx; }
    run = null;
  };
  for (const op of ops) {
    if (op.type === 'eq') { flushRun(); lastHead = headBlocks[op.j].idx; continue; }
    run ??= { dels: [], inss: [] };
    if (op.type === 'del') run.dels.push(baseBlocks[op.i]); else run.inss.push(headBlocks[op.j]);
  }
  flushRun();
  return changes;
}

// ---------------------------------------------------------------- per page

function pageTitle(html, slug) {
  const m = html.match(/breadcrumb__item--current"[^>]*>([^<]*)</) || html.match(/<h1[^>]*>([^<]*)</);
  return m ? decode(m[1]).trim() : slug;
}

function serializeChange(c, lang, id) {
  const blk = c.head ?? c.base;
  const out = { id, type: c.type, blockKind: blk.kind, tag: blk.tag, anchor: c.head ? c.head.idx : null, insertAfter: c.insertAfter ?? null };
  if (blk.kind === 'image') {
    const src = blk.src;
    out.newImage = c.head ? src : null;
    out.oldImage = c.base ? `${BASE_URL}/${VERSION}/${lang}/${src.replace(/^\.\//, '')}` : null;
    out.width = blk.width; out.height = blk.height;
    out.oldText = c.base ? src : ''; out.newText = c.head ? src : '';
    return out;
  }
  out.oldHtml = c.base ? c.base.inner : '';
  out.newHtml = c.head ? c.head.inner : '';
  out.oldText = c.base ? c.base.text : '';
  out.newText = c.head ? c.head.text : '';
  out.words = words(out.newText || out.oldText).length;
  if (c.type === 'modified') { out.diffHtml = diffInlineHtml(c.base.inner, c.head.inner); out.similarity = Number(c.sim.toFixed(2)); }
  if (blk.kind === 'table-row') { out.oldCells = c.base?.cells ?? null; out.newCells = c.head?.cells ?? null; }
  return out;
}

function injectHead(html, blocks, slug) {
  // stamp anchors from the end so earlier offsets stay valid
  const sorted = [...blocks].sort((a, b) => b.anchor.tagEnd - a.anchor.tagEnd);
  let out = html;
  for (const b of sorted) out = out.slice(0, b.anchor.tagEnd) + ` data-bai-block="${b.idx}"` + out.slice(b.anchor.tagEnd);
  const tags = `  <link rel="stylesheet" href="../../assets/bai-pr-preview.css" />\n  <script defer src="../../assets/bai-pr-preview.js" data-page="${slug}"></script>\n`;
  return out.replace('</head>', `${tags}</head>`);
}

function counts(changes) {
  const c = { added: 0, modified: 0, removed: 0, images: 0, total: changes.length };
  for (const ch of changes) { c[ch.type]++; if (ch.blockKind === 'image') c.images++; }
  return c;
}

function listPages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.html')).map((f) => f.replace(/\.html$/, ''));
}

const manifest = { generatedAt: new Date().toISOString(), label: LABEL, version: VERSION, baseUrl: BASE_URL, langs: {} };

for (const lang of LANGS) {
  const baseDir = path.join(BASE, VERSION, lang);
  const headDir = path.join(HEAD, VERSION, lang);
  const basePages = new Set(listPages(baseDir));
  const headPages = new Set(listPages(headDir));
  const pages = [];
  const totals = { pages: 0, changes: 0, added: 0, modified: 0, removed: 0, images: 0, newPages: 0, deletedPages: 0 };

  for (const slug of [...headPages].sort()) {
    const headFile = path.join(headDir, `${slug}.html`);
    const headHtml = fs.readFileSync(headFile, 'utf8');
    const headBlocks = extractBlocks(headHtml, headDir);
    if (!headBlocks) continue; // redirect stubs, index without chapter
    const title = pageTitle(headHtml, slug);
    const isNew = !basePages.has(slug) || PRETEND_NEW.has(slug);
    const isDeleted = PRETEND_DELETED.has(slug);
    let changes = [];
    let status = 'unchanged';
    if (isDeleted) status = 'deleted';
    else if (isNew) status = 'new';
    else {
      const baseHtml = fs.readFileSync(path.join(baseDir, `${slug}.html`), 'utf8');
      const baseBlocks = extractBlocks(baseHtml, baseDir) ?? [];
      changes = diffBlocks(baseBlocks, headBlocks).map((c, i) => serializeChange(c, lang, i + 1));
      if (changes.length) status = 'modified';
    }
    const sidecar = { slug, lang, title, status, demo: PRETEND_NEW.has(slug) || PRETEND_DELETED.has(slug) || undefined, counts: counts(changes), changes };
    fs.writeFileSync(path.join(headDir, `${slug}.changes.json`), JSON.stringify(sidecar));
    fs.writeFileSync(headFile, injectHead(headHtml, headBlocks, slug));
    const entry = { slug, title, status, url: `./${slug}.html`, counts: sidecar.counts, demo: sidecar.demo };
    if (status === 'deleted') entry.baseUrl = `${BASE_URL}/${VERSION}/${lang}/${slug}.html`;
    if (status !== 'unchanged') {
      pages.push(entry);
      totals.pages++;
      totals.changes += changes.length;
      totals.added += sidecar.counts.added; totals.modified += sidecar.counts.modified; totals.removed += sidecar.counts.removed; totals.images += sidecar.counts.images;
      if (status === 'new') totals.newPages++;
      if (status === 'deleted') totals.deletedPages++;
    }
  }
  for (const slug of [...basePages].filter((s) => !headPages.has(s)).sort()) {
    const baseHtml = fs.readFileSync(path.join(baseDir, `${slug}.html`), 'utf8');
    if (!extractBlocks(baseHtml, baseDir)) continue;
    pages.push({ slug, title: pageTitle(baseHtml, slug), status: 'deleted', baseUrl: `${BASE_URL}/${VERSION}/${lang}/${slug}.html`, counts: counts([]) });
    totals.pages++; totals.deletedPages++;
  }
  manifest.langs[lang] = { totals, pages };
  console.log(`[${lang}] ${totals.pages} pages · ${totals.changes} changes (+${totals.added} ~${totals.modified} -${totals.removed}, ${totals.images} images, new ${totals.newPages}, deleted ${totals.deletedPages})`);
  for (const p of pages) console.log(`    ${p.status.padEnd(9)} ${p.slug.padEnd(20)} ${p.counts.total}${p.demo ? '  (demo)' : ''}`);
}

fs.writeFileSync(path.join(HEAD, VERSION, 'changes-manifest.json'), JSON.stringify(manifest, null, 2));
fs.mkdirSync(path.join(HEAD, 'assets'), { recursive: true });
fs.copyFileSync(path.join(here, 'overlay.js'), path.join(HEAD, 'assets', 'bai-pr-preview.js'));
fs.copyFileSync(path.join(here, 'overlay.css'), path.join(HEAD, 'assets', 'bai-pr-preview.css'));
console.log(`manifest: ${path.join(HEAD, VERSION, 'changes-manifest.json')}`);
