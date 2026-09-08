import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  captionTextOf,
  diffBlocks,
  diffInlineHtml,
  extractBlocks,
  fingerprintOf,
  generateWebDiff,
  injectHead,
  lineOf,
  markdownProbeLines,
  parseHtml,
  similarity,
  sourcePathOf,
  stripInjected,
  segmentText,
  words,
  type Block,
  type ChangesManifest,
  type ElementNode,
  type PageSidecar,
} from "./web-diff.js";
import type { ResolvedDocConfig } from "./config.js";

// ── fixtures ────────────────────────────────────────────────────

const EDIT_BASE =
  "https://github.com/lablup/backend.ai-webui/edit/main/packages/backend.ai-webui-docs/src";

function page(body: string, opts: { lang?: string; slug?: string; title?: string } = {}): string {
  const lang = opts.lang ?? "en";
  const slug = opts.slug ?? "vfolder";
  const title = opts.title ?? "Folders";
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <link rel="stylesheet" href="../../assets/styles.abcd1234.css" />
</head>
<body>
  <aside><ul class="doc-sidebar-nav"><li><a href="./${slug}.html">1. ${title}</a></li></ul></aside>
  <nav><ol><li class="breadcrumb__item breadcrumb__item--current" aria-current="page">${title}</li></ol></nav>
  <main>
<section class="chapter" id="chapter-${slug}">
${body}
</section>
<div class="page-metadata"><a class="edit-link" href="${EDIT_BASE}/${lang}/${slug}/${slug}.md">Edit this page</a></div>
  </main>
</body>
</html>`;
}

const heading = (text: string, id: string): string =>
  `<h2 id="${id}">${text}<a class="hash-link" href="#${id}">#</a></h2>`;
const figure = (src: string, alt = "shot", figNum = "Figure 1.1"): string =>
  `<p><figure class="doc-figure"><img src="${src}" alt="${alt}" class="doc-image" /><figcaption>${figNum}${alt ? ` &mdash; ${alt}` : ""}</figcaption></figure></p>`;

function tmpdir(name: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), `web-diff-${name}-`));
}

function makeConfig(root: string, srcDir = "src"): ResolvedDocConfig {
  return {
    projectRoot: root,
    srcDir: path.join(root, srcDir),
    distDir: path.join(root, "dist"),
    languageLabels: { en: "English", ko: "한국어" },
    versions: [
      { label: "next", source: { kind: "workspace" } },
      {
        label: "26.8",
        source: { kind: "archive-branch", ref: "docs-archive/26.8" },
        latest: true,
      },
    ],
  } as unknown as ResolvedDocConfig;
}

/** Write `<root>/next/<lang>/<slug>.html`, creating parents. */
function writePage(
  root: string,
  lang: string,
  slug: string,
  html: string,
): void {
  const dir = path.join(root, "next", lang);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${slug}.html`), html);
}

function writeImage(root: string, lang: string, name: string, bytes: string): void {
  const dir = path.join(root, "next", lang, "images");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), Buffer.from(bytes, "utf-8"));
}

const readSidecar = (root: string, lang: string, slug: string): PageSidecar =>
  JSON.parse(
    fs.readFileSync(
      path.join(root, "next", lang, `${slug}.changes.json`),
      "utf-8",
    ),
  ) as PageSidecar;

// ── block extraction ────────────────────────────────────────────

test("extractBlocks — returns null for a page without a chapter body", () => {
  const html = "<html><head></head><body><p>redirecting…</p></body></html>";
  assert.equal(extractBlocks(html, "/nowhere"), null);
});

test("extractBlocks — recognizes each block kind, and drops the heading's hash link", () => {
  const html = page(
    [
      heading("Create a folder", "create-a-folder"),
      "<p>Open the Data page.</p>",
      "<ul><li>First item</li><li>Second item</li></ul>",
      '<table><tbody><tr><td>Name</td><td>Size</td></tr></tbody></table>',
      '<div class="admonition"><div class="admonition-heading"><span class="admonition-icon">i</span>Note</div><div class="admonition-content"><p>Inside the note.</p></div></div>',
      '<div class="code-block-wrapper"><pre><code>echo hi</code></pre></div>',
    ].join("\n"),
  );
  const blocks = extractBlocks(html, "/nowhere")!;
  assert.deepEqual(
    blocks.map((b) => b.kind),
    [
      "heading",
      "paragraph",
      "list-item",
      "list-item",
      "table-row",
      "admonition-title",
      "paragraph",
      "code",
    ],
  );
  assert.equal(blocks[0].text, "Create a folder");
  assert.equal(blocks[0].hid, "create-a-folder");
  assert.equal(blocks[4].text, "Name | Size");
  assert.deepEqual(blocks[4].cells, ["Name", "Size"]);
  assert.equal(blocks[5].text, "Note");
});

test("extractBlocks — anchors an image on the <figure>, not the wrapping <p>", () => {
  const dir = tmpdir("figure");
  try {
    fs.mkdirSync(path.join(dir, "images"));
    fs.writeFileSync(path.join(dir, "images", "a.png"), Buffer.from("AAA"));
    const html = page(figure("./images/a.png"));
    const blocks = extractBlocks(html, dir)!;
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].kind, "image");
    assert.equal(blocks[0].tag, "figure");
    assert.equal(blocks[0].src, "./images/a.png");
    assert.match(blocks[0].hash!, /^[0-9a-f]{12}$/);
    // The stamped attribute lands on the <figure> open tag.
    const stamped = injectHead(html, blocks, "vfolder", "../../assets/");
    assert.match(stamped, /<figure data-bai-block="0" class="doc-figure"/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("extractBlocks — a missing image file hashes as `missing` rather than throwing", () => {
  const blocks = extractBlocks(page(figure("./images/gone.png")), "/nowhere")!;
  assert.equal(blocks[0].hash, "missing");
});

test("extractBlocks — the image key covers alt text and caption, not the figure number", () => {
  const same = (alt: string, figNum: string) =>
    extractBlocks(page(figure("./images/a.png", alt, figNum)), "/nowhere")![0];
  // Renumbering happens whenever an earlier image is inserted; it is not a change.
  assert.equal(same("folder list", "Figure 1.1").key, same("folder list", "Figure 9.4").key);
  assert.notEqual(same("folder list", "Figure 1.1").key, same("folder tree", "Figure 1.1").key);
  assert.equal(same("folder list", "Figure 1.1").alt, "folder list");
  assert.equal(same("folder list", "Figure 1.1").caption, "folder list");
});

test("captionTextOf — keeps a hand-written caption but drops a bare figure number", () => {
  const capOf = (html: string) => {
    const tree = parseHtml(html);
    return captionTextOf(tree.children[0] as ElementNode);
  };
  assert.equal(capOf("<figure><figcaption>Figure 15.1</figcaption></figure>"), "");
  assert.equal(capOf("<figure><figcaption>A hand-written caption</figcaption></figure>"), "A hand-written caption");
  assert.equal(capOf("<figure><figcaption>รูปที่ 2.3 &mdash; หน้าจอ</figcaption></figure>"), "หน้าจอ");
});

test("similarity — a renamed image still pairs, an identical src scores higher", () => {
  const blocks = (src: string) =>
    extractBlocks(page(figure(src, "")), "/nowhere")![0];
  assert.equal(similarity(blocks("./images/old.png"), blocks("./images/new.png")), 0.5);
  assert.equal(similarity(blocks("./images/a.png"), blocks("./images/a.png")), 1);
});

test("diffBlocks — a renamed image is one modified change, not removed + added", () => {
  const base = extractBlocks(page(figure("./images/old.png", "")), "/nowhere")!;
  const head = extractBlocks(page(figure("./images/new.png", "")), "/nowhere")!;
  const changes = diffBlocks(base, head);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, "modified");
  assert.equal(changes[0].base?.src, "./images/old.png");
  assert.equal(changes[0].head?.src, "./images/new.png");
});

test("diffBlocks — two renamed images in one run pair positionally", () => {
  const src = (a: string, b: string) =>
    extractBlocks(page([figure(a, ""), figure(b, "")].join("\n")), "/nowhere")!;
  const changes = diffBlocks(src("./a1.png", "./b1.png"), src("./a2.png", "./b2.png"));
  assert.deepEqual(
    changes.map((c) => [c.base?.src, c.head?.src]),
    [
      ["./a1.png", "./a2.png"],
      ["./b1.png", "./b2.png"],
    ],
  );
});

test("extractBlocks — records the container a removed li / tr has to go back into", () => {
  const blocks = extractBlocks(
    page("<ol><li>Step one</li></ol><ul><li>Bullet</li></ul><table><tbody><tr><td>Cell</td></tr></tbody></table>"),
    "/nowhere",
  )!;
  assert.deepEqual(
    blocks.map((b) => b.container ?? null),
    ["ol", "ul", "table"],
  );
});

// ── pairing ─────────────────────────────────────────────────────

const textBlocks = (texts: string[]): Block[] =>
  texts.map((t, idx) => ({
    idx,
    kind: "paragraph" as const,
    tag: "p",
    anchor: { start: 0, tagEnd: 0, openEnd: 0, closeStart: 0, end: 0 },
    text: t,
    inner: t,
    key: `paragraph:${t}`,
    hid: null,
  }));

test("diffBlocks — a similar replacement pairs into one `modified` change", () => {
  const base = textBlocks(["Open the Data page and click Create."]);
  const head = textBlocks(["Open the Data page and click New folder."]);
  const changes = diffBlocks(base, head);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, "modified");
  assert.ok((changes[0].sim ?? 0) >= 0.4);
});

test("diffBlocks — a dissimilar replacement stays a removed + added pair", () => {
  const base = textBlocks(["Alpha beta gamma delta epsilon."]);
  const head = textBlocks(["Completely unrelated sentence here now."]);
  assert.ok(similarity(base[0], head[0]) < 0.4);
  const changes = diffBlocks(base, head);
  assert.deepEqual(
    changes.map((c) => c.type),
    ["removed", "added"],
  );
  assert.equal(changes[0].insertAfter, -1);
});

test("diffBlocks — a pure insertion is `added` and carries the preceding block in insertAfter for later removals", () => {
  const base = textBlocks(["One.", "Three."]);
  const head = textBlocks(["One.", "Two.", "Three."]);
  const changes = diffBlocks(base, head);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, "added");
  assert.equal(changes[0].head?.text, "Two.");
});

test("diffBlocks — a removal records the head block it should be drawn after", () => {
  const base = textBlocks(["One.", "Two.", "Three."]);
  const head = textBlocks(["One.", "Three."]);
  const changes = diffBlocks(base, head);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, "removed");
  assert.equal(changes[0].insertAfter, 0);
});

test("diffBlocks — identical blocks produce no changes", () => {
  const base = textBlocks(["Same.", "Also same."]);
  assert.deepEqual(diffBlocks(base, textBlocks(["Same.", "Also same."])), []);
});

test("similarity — blocks of different kinds never pair", () => {
  const [p] = textBlocks(["Open the Data page."]);
  const li: Block = { ...p, kind: "list-item", key: "list-item:Open the Data page." };
  assert.equal(similarity(p, li), 0);
});

// ── word diff ───────────────────────────────────────────────────

test("diffInlineHtml — marks only the changed words and leaves tags atomic", () => {
  const out = diffInlineHtml(
    "Click <strong>Create</strong> to start.",
    "Click <strong>New folder</strong> to start.",
  );
  assert.match(out, /<del class="bai-del">Create<\/del>/);
  assert.match(out, /<ins class="bai-ins">New folder<\/ins>/);
  // The <strong> tags survive as whole tokens on both sides of the change.
  assert.equal(out.match(/<strong>/g)?.length, 1);
  assert.equal(out.match(/<\/strong>/g)?.length, 1);
  assert.ok(out.startsWith("Click <strong>"));
  assert.ok(out.endsWith("</strong> to start."));
});

test("diffInlineHtml — emits only the head side's markup, so the output is balanced", () => {
  const out = diffInlineHtml("<strong>Same</strong>", "<em>Same</em>");
  assert.equal(out, "<em>Same</em>");
  assert.ok(!out.includes("<strong>"));
});

test("diffInlineHtml — a link-target edit leaves exactly one anchor", () => {
  const out = diffInlineHtml(
    'See <a href="./one.html">the guide</a>.',
    'See <a href="./two.html">the guide</a>.',
  );
  assert.equal(out.match(/<a /g)?.length, 1);
  assert.equal(out.match(/<\/a>/g)?.length, 1);
  assert.ok(out.includes('href="./two.html"'));
  assert.ok(!out.includes('href="./one.html"'));
});

test("diffInlineHtml — a mixed markup + wording edit still marks the words", () => {
  const out = diffInlineHtml(
    "Click <strong>Create</strong> to start.",
    "Click <em>New folder</em> to start.",
  );
  assert.match(out, /<del class="bai-del">Create<\/del>/);
  // The <em> boundary splits the inserted run, but every new word is marked.
  assert.match(out, /<ins class="bai-ins">New<\/ins>/);
  assert.match(out, /<ins class="bai-ins">folder<\/ins>/);
  assert.equal(out.match(/<em>/g)?.length, 1);
  assert.equal(out.match(/<\/em>/g)?.length, 1);
  assert.ok(!out.includes("<strong>"));
  // A bare space is spacing, never a marked insertion.
  assert.ok(!/<ins class="bai-ins">\s+<\/ins>/.test(out));
});

test("words — segments by locale, not by whitespace alone", () => {
  assert.deepEqual(words("create a folder", "en"), ["create", "a", "folder"]);
  assert.deepEqual(words("폴더 생성", "ko"), ["폴더", "생성"]);
  // Thai has no word spacing; the segmenter still finds the word boundary.
  assert.deepEqual(words("สวัสดีครับ", "th"), ["สวัสดี", "ครับ"]);
});

test("segmentText — keeps whitespace and punctuation as their own tokens", () => {
  const toks = segmentText("Open the page.", "en");
  assert.deepEqual(
    toks.map((t) => `${t.t}:${t.v}`),
    ["w:Open", "ws: ", "w:the", "ws: ", "w:page", "w:."],
  );
});

test("segmentText — falls back to the per-character regex without Intl.Segmenter", () => {
  const original = Intl.Segmenter;
  // @ts-expect-error — exercising the no-Segmenter environment
  delete Intl.Segmenter;
  try {
    // An otherwise-unused locale tag, so no cached segmenter short-circuits it.
    assert.deepEqual(words("폴더 생성", "ko-x-nosegmenter"), [
      "폴",
      "더",
      "생",
      "성",
    ]);
  } finally {
    Intl.Segmenter = original;
  }
});

test("diffInlineHtml — a CJK edit marks the changed word", () => {
  const out = diffInlineHtml("폴더를 만듭니다", "폴더를 지웁니다", "ko");
  assert.match(out, /<del class="bai-del">만듭니다<\/del>/);
  assert.match(out, /<ins class="bai-ins">지웁니다<\/ins>/);
  assert.ok(out.startsWith("폴더를"));
});

test("extractBlocks — whitespace reflow alone is not a change", () => {
  const a = extractBlocks(page("<p>Open the Data\n   page.</p>"), "/nowhere")!;
  const b = extractBlocks(page("<p>Open the Data page.</p>"), "/nowhere")!;
  assert.equal(a[0].key, b[0].key);
  assert.deepEqual(diffBlocks(a, b), []);
});

test("extractBlocks — the block key carries markup, so a bold-only edit differs", () => {
  const a = extractBlocks(page("<p>Click <strong>Create</strong> now.</p>"), "/nowhere")!;
  const b = extractBlocks(page("<p>Click <em>Create</em> now.</p>"), "/nowhere")!;
  assert.equal(a[0].text, b[0].text);
  assert.notEqual(a[0].key, b[0].key);
});

test("extractBlocks — the block key covers the element tag and the container", () => {
  const keyOf = (html: string) => extractBlocks(page(html), "/nowhere")![0].key;
  assert.notEqual(keyOf("<h2>Same wording</h2>"), keyOf("<h3>Same wording</h3>"));
  assert.notEqual(
    keyOf("<ul><li>Same item</li></ul>"),
    keyOf("<ol><li>Same item</li></ol>"),
  );
});

test("extractBlocks — the image key covers the authored title and size hint", () => {
  const shot = (extra: string) =>
    extractBlocks(
      page(`<p><figure class="doc-figure"><img src="./a.png" alt="" class="doc-image"${extra} /><figcaption>Figure 1.1</figcaption></figure></p>`),
      "/nowhere",
    )![0];
  const plain = shot("");
  assert.notEqual(plain.key, shot(' title="Hover me"').key);
  assert.notEqual(plain.key, shot(' style="width:50%"').key);
  assert.equal(shot(' title="Hover me"').title, "Hover me");
  assert.equal(shot(' style="width:50%"').style, "width:50%");
});

test("extractBlocks — a link-target-only edit also changes the block key", () => {
  const a = extractBlocks(page('<p>See <a href="./one.html">the guide</a>.</p>'), "/nowhere")!;
  const b = extractBlocks(page('<p>See <a href="./two.html">the guide</a>.</p>'), "/nowhere")!;
  assert.equal(a[0].text, b[0].text);
  assert.notEqual(a[0].key, b[0].key);
});

test("diffBlocks — a formatting-only edit pairs as modified at similarity 1", () => {
  const base = extractBlocks(page("<p>Click <strong>Create</strong> now.</p>"), "/nowhere")!;
  const head = extractBlocks(page("<p>Click <em>Create</em> now.</p>"), "/nowhere")!;
  const changes = diffBlocks(base, head);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, "modified");
  assert.equal(changes[0].sim, 1);
});

// ── source references ───────────────────────────────────────────

test("extractBlocks — nested list items and images become their own blocks", () => {
  const blocks = extractBlocks(
    page(
      [
        "<ul><li>Outer item leads in:",
        "<ul><li>Nested one</li><li>Nested two</li></ul>",
        figure("./images/nested.png", ""),
        "</li></ul>",
      ].join("\n"),
    ),
    "/nowhere",
  )!;
  assert.deepEqual(
    blocks.map((b) => [b.kind, b.container ?? null]),
    [
      ["list-item", "ul"],
      ["list-item", "ul"],
      ["list-item", "ul"],
      ["image", null],
    ],
  );
  // The parent keeps only its own words — nested content is not attributed to it.
  assert.equal(blocks[0].text, "Outer item leads in:");
  assert.ok(!blocks[0].inner.includes("Nested one"));
  assert.ok(!blocks[0].inner.includes("nested.png"));
  assert.equal(blocks[3].src, "./images/nested.png");
});

test("diffBlocks — an edit to a nested item marks only that item", () => {
  const build = (second: string) =>
    extractBlocks(
      page(`<ul><li>Outer item:<ul><li>Nested one</li><li>${second}</li></ul></li></ul>`),
      "/nowhere",
    )!;
  const changes = diffBlocks(build("Nested two"), build("Nested three"));
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, "modified");
  assert.equal(changes[0].head?.text, "Nested three");
});

test("sourcePathOf — reads the repo-relative path off the Edit this page link", () => {
  assert.equal(
    sourcePathOf(page("<p>x</p>"), "en", "vfolder"),
    "packages/backend.ai-webui-docs/src/en/vfolder/vfolder.md",
  );
});

test("sourcePathOf — falls back to the conventional path when there is no edit link", () => {
  assert.equal(
    sourcePathOf("<html><body></body></html>", "ko", "deployment"),
    "src/ko/deployment/deployment.md",
  );
});

test("lineOf — finds the markdown line a block came from, ignoring markup", () => {
  const md = ["# Folders", "", "Open the **Data** page and click Create.", ""].join("\n");
  const lines = markdownProbeLines(md);
  assert.equal(lineOf(lines, "Open the Data page and click Create.", "paragraph"), 3);
  assert.equal(lineOf(lines, "Nothing like this on the page", "paragraph"), null);
  assert.equal(lineOf(null, "anything at all", "paragraph"), null);
});

test("lineOf — matches an image by its file name", () => {
  const lines = markdownProbeLines("![shot](images/folder_create.png)\n");
  assert.equal(lineOf(lines, "./images/folder_create.png", "image"), 1);
});

// ── fingerprints ────────────────────────────────────────────────

test("fingerprintOf — is stable for the same change and differs when the text does", () => {
  const [b1] = textBlocks(["Old text here."]);
  const [h1] = textBlocks(["New text here."]);
  const a = fingerprintOf({ type: "modified", base: b1, head: h1 });
  const b = fingerprintOf({ type: "modified", base: b1, head: h1 });
  assert.equal(a, b);
  assert.match(a, /^[0-9a-f]{12}$/);
  const [h2] = textBlocks(["Newer text here."]);
  assert.notEqual(a, fingerprintOf({ type: "modified", base: b1, head: h2 }));
});

test("fingerprintOf — a second formatting-only edit re-fingerprints", () => {
  const blockOf = (html: string) => extractBlocks(page(html), "/nowhere")![0];
  const base = blockOf("<p>Read the <strong>guide</strong>.</p>");
  const first = blockOf("<p>Read the <em>guide</em>.</p>");
  const second = blockOf("<p>Read the <b>guide</b>.</p>");
  // The three share their text, so a text-only fingerprint would collide and
  // the overlay would restore "viewed" for an edit nobody has looked at.
  assert.equal(base.text, first.text);
  assert.notEqual(
    fingerprintOf({ type: "modified", base, head: first }),
    fingerprintOf({ type: "modified", base, head: second }),
  );
});

test("fingerprintOf — a caption-only image edit re-fingerprints", () => {
  const shot = (alt: string) =>
    extractBlocks(page(figure("./images/a.png", alt)), "/nowhere")![0];
  assert.notEqual(
    fingerprintOf({ type: "modified", base: shot("old"), head: shot("new") }),
    fingerprintOf({ type: "modified", base: shot("old"), head: shot("newer") }),
  );
});

// ── end to end ──────────────────────────────────────────────────

test("generateWebDiff — modified page: sidecar, manifest, stamping and idempotence", async () => {
  const root = tmpdir("e2e");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    writePage(
      base,
      "en",
      "vfolder",
      page(
        [
          heading("Folders", "folders"),
          "<p>Open the Data page and click Create.</p>",
          "<p>This paragraph is deleted by the PR.</p>",
        ].join("\n"),
      ),
    );
    writePage(
      head,
      "en",
      "vfolder",
      page(
        [
          heading("Folders", "folders"),
          "<p>Open the Data page and click New folder.</p>",
          "<p>A brand new paragraph.</p>",
        ].join("\n"),
      ),
    );
    fs.mkdirSync(path.join(root, "src", "en", "vfolder"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "src", "en", "vfolder", "vfolder.md"),
      ["# Folders", "", "Open the Data page and click New folder.", "", "A brand new paragraph.", ""].join("\n"),
    );

    const config = makeConfig(root);
    const manifest = await generateWebDiff(config, {
      base,
      head,
      lang: "en",
      label: "docs PR #1",
      quiet: true,
    });

    assert.equal(manifest.version, 1);
    assert.equal(manifest.channel, "next");
    assert.equal(manifest.label, "docs PR #1");
    assert.deepEqual(manifest.languages, ["en"]);
    const en = manifest.langs.en;
    assert.equal(en.totals.pages, 1);
    assert.equal(en.pages[0].url, "next/en/vfolder.html");
    assert.equal(
      en.pages[0].sourcePath,
      "packages/backend.ai-webui-docs/src/en/vfolder/vfolder.md",
    );

    const sidecar = readSidecar(head, "en", "vfolder");
    assert.equal(sidecar.status, "modified");
    assert.deepEqual(
      sidecar.changes.map((c) => c.type),
      ["modified", "removed", "added"],
    );
    assert.equal(sidecar.counts.total, 3);
    assert.deepEqual(en.pages[0].counts, sidecar.counts);
    assert.deepEqual(
      en.pages[0].fingerprints,
      sidecar.changes.map((c) => c.fingerprint),
    );

    const modified = sidecar.changes[0];
    assert.match(modified.diffHtml!, /<del class="bai-del">Create<\/del>/);
    assert.deepEqual(modified.section, { text: "Folders", id: "folders", level: 2 });
    assert.equal(modified.line, 3);
    // The removed block is drawn after the head block that precedes it.
    assert.equal(sidecar.changes[1].anchor, null);
    assert.equal(sidecar.changes[1].insertAfter, 1);

    const stamped = fs.readFileSync(
      path.join(head, "next", "en", "vfolder.html"),
      "utf-8",
    );
    assert.equal(stamped.match(/data-bai-block="/g)?.length, 3);
    assert.equal(stamped.match(/pr-preview\.js/g)?.length, 1);
    assert.match(stamped, /href="\.\.\/\.\.\/assets\/pr-preview\.css"/);
    assert.match(stamped, /data-page="vfolder"/);
    assert.ok(fs.existsSync(path.join(head, "assets", "pr-preview.js")));
    assert.ok(fs.existsSync(path.join(head, "assets", "pr-preview.css")));

    // Re-running against the already-stamped build changes nothing.
    const again = await generateWebDiff(config, {
      base,
      head,
      lang: "en",
      label: "docs PR #1",
      quiet: true,
    });
    const stamped2 = fs.readFileSync(
      path.join(head, "next", "en", "vfolder.html"),
      "utf-8",
    );
    assert.equal(stamped2, stamped);
    assert.deepEqual(again.langs.en.totals, en.totals);
    assert.deepEqual(
      readSidecar(head, "en", "vfolder").changes.map((c) => c.fingerprint),
      sidecar.changes.map((c) => c.fingerprint),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("generateWebDiff — flags a formatting-only change and leaves text edits unflagged", async () => {
  const root = tmpdir("formatting");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    writePage(
      base,
      "en",
      "login",
      page(
        [
          "<p>Click <strong>Sign in</strong> to continue.</p>",
          '<p>Read the <a href="./one.html">guide</a>.</p>',
          "<p>The old wording of this sentence.</p>",
        ].join("\n"),
        { slug: "login" },
      ),
    );
    writePage(
      head,
      "en",
      "login",
      page(
        [
          "<p>Click <em>Sign in</em> to continue.</p>",
          '<p>Read the <a href="./two.html">guide</a>.</p>',
          "<p>The new wording of this sentence.</p>",
        ].join("\n"),
        { slug: "login" },
      ),
    );

    await generateWebDiff(makeConfig(root), { base, head, lang: "en", quiet: true });
    const sidecar = readSidecar(head, "en", "login");
    assert.equal(sidecar.counts.modified, 3);
    const [bold, link, text] = sidecar.changes;
    assert.equal(bold.formattingOnly, true);
    assert.equal(bold.similarity, 1);
    assert.equal(link.formattingOnly, true);
    assert.match(link.newHtml!, /two\.html/);
    assert.equal(text.formattingOnly, undefined);
    assert.match(text.diffHtml!, /<ins class="bai-ins">new<\/ins>/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("generateWebDiff — an image is compared by bytes, and the old file is copied next to the page", async () => {
  const root = tmpdir("image");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    // Identical figures, so the two swaps are the same change twice over.
    const body = [figure("./images/a.png", ""), figure("./images/a.png", "")].join("\n");
    writePage(base, "en", "admin_menu", page(body, { slug: "admin_menu" }));
    writePage(head, "en", "admin_menu", page(body, { slug: "admin_menu" }));
    writeImage(base, "en", "a.png", "OLD-BYTES");
    writeImage(head, "en", "a.png", "NEW-BYTES");

    const manifest = await generateWebDiff(makeConfig(root), {
      base,
      head,
      lang: "en",
      quiet: true,
    });
    const sidecar = readSidecar(head, "en", "admin_menu");
    assert.equal(sidecar.counts.images, 2);
    assert.deepEqual(
      sidecar.changes.map((c) => c.type),
      ["modified", "modified"],
    );
    assert.equal(sidecar.changes[0].oldImage, "./base-images/a.png");
    assert.equal(sidecar.changes[0].newImage, "./images/a.png");
    assert.equal(
      fs.readFileSync(path.join(head, "next", "en", "base-images", "a.png"), "utf-8"),
      "OLD-BYTES",
    );
    // Same swap twice on one page: the repeat fingerprint is suffixed.
    const [f1, f2] = sidecar.changes.map((c) => c.fingerprint);
    assert.equal(f2, `${f1}-2`);
    assert.match(f1, /^[0-9a-f]{12}$/);
    assert.deepEqual(manifest.langs.en.pages[0].fingerprints, [f1, f2]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("generateWebDiff — an untouched page is `unchanged`, gets an empty sidecar and stays out of the manifest", async () => {
  const root = tmpdir("unchanged");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    const html = page("<p>Nothing moved here.</p>", { slug: "login", title: "Login" });
    writePage(base, "en", "login", html);
    writePage(head, "en", "login", html);

    const manifest = await generateWebDiff(makeConfig(root), {
      base,
      head,
      lang: "en",
      quiet: true,
    });
    assert.deepEqual(manifest.langs.en.pages, []);
    assert.equal(manifest.langs.en.totals.changes, 0);
    const sidecar = readSidecar(head, "en", "login");
    assert.equal(sidecar.status, "unchanged");
    assert.deepEqual(sidecar.changes, []);
    assert.equal(sidecar.counts.total, 0);
    // Even an unchanged page carries the overlay, so the navigator works there.
    const out = fs.readFileSync(path.join(head, "next", "en", "login.html"), "utf-8");
    assert.match(out, /pr-preview\.js/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("generateWebDiff — detects new and deleted pages across two languages", async () => {
  const root = tmpdir("pages");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    for (const lang of ["en", "ko"]) {
      writePage(base, lang, "gone", page("<p>Old page.</p>", { lang, slug: "gone" }));
      writePage(base, lang, "kept", page("<p>Kept page.</p>", { lang, slug: "kept" }));
      writePage(head, lang, "kept", page("<p>Kept page.</p>", { lang, slug: "kept" }));
      writePage(head, lang, "fresh", page("<p>Fresh page.</p>", { lang, slug: "fresh" }));
    }

    const manifest = await generateWebDiff(makeConfig(root), {
      base,
      head,
      lang: "all",
      quiet: true,
    });
    assert.deepEqual(manifest.languages, ["en", "ko"]);
    for (const lang of ["en", "ko"]) {
      const summary = manifest.langs[lang];
      assert.deepEqual(
        summary.pages.map((p) => [p.slug, p.status]),
        [
          ["fresh", "new"],
          ["gone", "deleted"],
        ],
      );
      assert.equal(summary.totals.pages, 2);
      assert.equal(summary.totals.newPages, 1);
      assert.equal(summary.totals.deletedPages, 1);
      assert.equal(summary.totals.changes, 0);
      const deleted = summary.pages.find((p) => p.status === "deleted")!;
      assert.equal(deleted.url, null);
      assert.equal(deleted.baseUrl, `next/${lang}/gone.html`);
      assert.equal(readSidecar(head, lang, "fresh").status, "new");
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("generateWebDiff — falls back to the head root when there is no channel directory", async () => {
  const root = tmpdir("flat");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    for (const [root_, text] of [
      [base, "Before."],
      [head, "After the edit."],
    ] as const) {
      const dir = path.join(root_, "en");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "quickstart.html"), page(`<p>${text}</p>`, { slug: "quickstart" }));
    }
    const manifest = await generateWebDiff(makeConfig(root), {
      base,
      head,
      lang: "en",
      quiet: true,
    });
    assert.equal(manifest.channel, "");
    assert.equal(manifest.langs.en.pages[0].url, "en/quickstart.html");
    assert.ok(fs.existsSync(path.join(head, "changes-manifest.json")));
    const out = fs.readFileSync(path.join(head, "en", "quickstart.html"), "utf-8");
    assert.match(out, /href="\.\.\/assets\/pr-preview\.css"/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test("stripInjected — removes the previous run's attributes and asset tags", () => {
  const html = [
    "<head>",
    '  <link rel="stylesheet" href="../../assets/pr-preview.css" />',
    '  <script defer src="../../assets/pr-preview.js" data-page="x"></script>',
    "</head>",
    '<p data-bai-block="0">Hi</p>',
  ].join("\n");
  const out = stripInjected(html);
  assert.ok(!out.includes("pr-preview"));
  assert.ok(!out.includes("data-bai-block"));
  assert.match(out, /<p>Hi<\/p>/);
});

test("manifest — is valid JSON on disk with the documented top-level shape", async () => {
  const root = tmpdir("shape");
  try {
    const base = path.join(root, "base");
    const head = path.join(root, "head");
    writePage(base, "en", "x", page("<p>One.</p>", { slug: "x" }));
    writePage(head, "en", "x", page("<p>One and two.</p>", { slug: "x" }));
    await generateWebDiff(makeConfig(root), { base, head, lang: "en", quiet: true });
    const onDisk = JSON.parse(
      fs.readFileSync(path.join(head, "next", "changes-manifest.json"), "utf-8"),
    ) as ChangesManifest;
    assert.deepEqual(Object.keys(onDisk).sort(), [
      "channel",
      "generatedAt",
      "label",
      "langs",
      "languages",
      "version",
    ]);
    assert.match(onDisk.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
