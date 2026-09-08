# Research: block-level before/after diff for the docs PR preview (FR-3883)

Scope: how to produce block-level before→after pairs per page × language from a base
build and a PR build of `packages/backend.ai-webui-docs`, and how to address each pair in
the rendered HTML so an overlay can mark it. Line numbers are from `origin/main` at
61171cf83 (cited files identical at 2f96019d9). All paths are repo-relative.

## TL;DR

- Diff at the **markdown-block (marked token) level**, not the rendered HTML. The toolkit
  already lexes every page with marked (`precomputeShikiBlocks`,
  `packages/backend.ai-docs-toolkit/src/markdown-processor-web.ts:521-534`); top-level
  tokens carry `.raw`, which is the block unit the ticket asks for.
- **Blocks have no ids or source positions today.** Stamp `data-block="<8-hex sha256 of
  normalized token.raw>"` at build time by replacing the single `marked.parse(markdown)`
  call (`markdown-processor-web.ts:679`) with a lexer → per-token `marked.parser([tok])`
  loop that injects the attribute into the fragment's first opening tag; list items and
  table rows get ids through `listitem`/`tablerow` renderer overrides in
  `buildWebRenderer` (`:342`). ~40 lines plus a `blocks` field on `Chapter`.
- Compute **both sides with the head checkout's toolkit in one CI run** (base = merge-base
  sources swapped in, as `pr-preview.yml:97-107` already does), emit `blocks.json` per
  language, align with jsdiff `diffArrays` on ids, word-diff pairs at build time.
- Images are **not** content-hashed by the builder (copied by name); a replaced screenshot
  is "same reference, different bytes" — take it from `git diff --name-status` and serve
  the old bytes from `git show <merge-base>:<path>` copied under `__base__/`.
- Output: site-wide `changes-manifest.json` (PR comment + overlay gate) + per-page
  `<slug>.changes.json` sidecar (hover payload); no inline JSON.

## 1. Rendering pipeline — what a block becomes, where an id can be stamped

- Per language, `buildLanguage` calls `processMarkdownFilesForWeb(lang, navigation,
  srcDir, version, config, { multiPage: true })`
  (`packages/backend.ai-docs-toolkit/src/website-generator.ts:1052-1059`) and writes
  `<langDir>/<slug>.html` (`:1412-1413`). `slug = slugFromNavPath(nav.path)` = lowercase
  basename of the nav path (`markdown-processor.ts:173-200`), so the page identity is
  language-stable — the join key across en/ko/ja/th and across base/head.
- Per chapter: frontmatter strip (`markdown-processor-web.ts:645-647`), then the
  preprocessing chain `deduplicateH1 → substituteTemplateVars → rewriteImagePathsForWeb →
  normalizeRstTables → convertIndentedNotes → processAdmonitions → processCodeBlockMeta`
  (`:652-660`), then `marked.parse(markdown)` (`:679`) with the custom renderer from
  `buildWebRenderer` (`:342`). Everything after that is string rewriting of attributes
  only: `rewriteCrossPageLinks` (`href`, `:221-311`), `rewriteImagePathsForStaticSite`
  (`website-generator.ts:191-198`), `applyImageAttributes`, `rewriteImageTagsToPicture`
  (`:1401-1408`). A `data-block` attribute survives all of them untouched.
- DOM today: `<section class="chapter" id="chapter-<slug>">${htmlContent}</section>`
  (`website-builder.ts:665-668`) inside `<main class="doc-main">` (`:1714`). Only headings
  carry ids: `<h{n} id="<chapterSlug>-<slugify(text)>">` (`markdown-processor-web.ts:359-364`).
  Paragraphs, lists, tables, `<pre>`/`<div class="code-block-wrapper">` (`:461`) and
  `<figure class="doc-figure">` (`:381`) have no id and no source position.
- marked is **12.0.2** (`packages/backend.ai-docs-toolkit/package.json` `marked: ^12.0.2`;
  `pnpm-lock.yaml:8226`). Its renderer is the old text-only API: `heading(text, level,
  raw)`, `listitem(text, task, checked)`, `tablerow(content)` (marked 12
  `lib/marked.esm.js:1657,1669,1690`) — the renderer never sees a token, so the id must
  be computed outside and handed in.
- Hook: `marked.lexer(src)` (`marked.esm.js:2286`) returns top-level tokens with `.raw`;
  `marked.parser([tok])` (`:2289`) renders one token; `Parser.parse` skips `space`
  tokens (`:1829`). Reference-style links are resolved at lex time (`tokens.links`,
  `:1209`, `:1471`), so per-token parsing is safe. The loop replaces line `:679`:
  lex → for each non-space token: `id = contentHash(normalize(tok.raw))`
  (`asset-hasher.ts:18-20`, 8-hex sha256) → `frag = marked.parser([tok])` → inject
  ` data-block="id"` into the first `<tag` of `frag` → push `{id, type, text, raw, src?}`
  to `chapter.blocks`. `Chapter` (`markdown-processor.ts:101-106`) gains `blocks`;
  `buildLanguage` writes `<langDir>/blocks.json` next to `search-index.json`
  (`website-generator.ts:1494-1499`).
- List items / table rows are children, not top-level tokens. marked renders a list
  **post-order**: `itemBody += this.parse(item.tokens, loose); body +=
  this.renderer.listitem(itemBody, …)` (`marked.esm.js:1904-1905`), so nested `<li>`s are
  emitted before their parent. Build the id queue for `listitem` in the same post-order
  walk of `token.items[].tokens`; `tablerow` fires once for the header row, then body rows
  in order (`:1854-1862`). The renderer override pops the next id and stamps `<li
  data-block>` / `<tr data-block>`.
- Gotcha — image-only paragraphs: marked wraps the figure in `<p>…</p>` (default
  `paragraph(text)`), and the figure renderer emits `<figure>` (`:381`). The HTML
  parser closes an open `<p>` on `<figure>` and turns the trailing `</p>` into an empty
  `<p></p>` (WHATWG "in body" rules,
  https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inbody). Stamping the
  `<p>` marks an empty element. Either override `paragraph()` to return the figure
  unwrapped when `text` starts with `<figure`, or stamp the `<figure>` itself.
- Corpus size (en, 30 files, raw source lexed with marked 12): 4240 top-level tokens —
  1657 paragraph (367 image-only), 372 heading, 246 list (977 items, 55 nested), 8 table
  (77 rows), 26 code, 20 html, 1 blockquote, 1910 space. Admonitions in the real pipeline
  become `html` open/close tokens (`markdown-extensions.ts:96-102`) whose inner paragraphs
  stay separate top-level tokens — treat `html` tokens as containers, not blocks.
- Ids: content hash alone collides on repeated blocks ("Click **Save**."); position alone
  shifts on every insert. Use the hash plus an ordinal suffix for repeats (`<hash>-2`)
  and keep the index in `blocks.json`. `normalize` = trim + collapse whitespace, so a
  reflowed paragraph hashes identically.

## 2. Where to diff — markdown-block level (recommended) vs rendered HTML

| Concern | Token level | HTML level |
|---|---|---|
| Reflowed text | equal after whitespace collapse | equal, but only after text extraction |
| Shared includes | none exist (no include/snippet mechanism in toolkit `src/`); only `\|version\|`, `\|date\|`, `\|year\|` template vars (`markdown-processor.ts:321-336`) | same |
| Hashed assets | irrelevant (source only) | every page differs when `styles.css`/`*.js` re-hash (`website-generator.ts:296-400`) → noise |
| Replaced screenshot | reference unchanged → needs §4 byte check | `<img src>` unchanged → **missed** entirely (images copied by name, `:1233`) |
| Figure captions | generated, not in source | `Figure <ch>.<n>` (`markdown-processor-web.ts:377`) renumbers every later figure when one is inserted → cascade of false positives |
| Pages added/deleted | slug sets from `book.config.yaml` per language (`website-generator.ts:1039`) | directory listing; same |
| `next` tree | n/a | see below |

- `<p><figure>` invalid nesting, Shiki spans, chapter-prefixed heading ids and
  `.hash-link` anchors all make a DOM diff (parse5/jsdom) re-derive block boundaries the
  lexer already knows. HTML-level diff also cannot tell "text changed" from "renderer
  changed" when the PR touches the toolkit.
- Template vars are **date-dependent**: `|date|` / `|version_date|` substitute today's
  date, so base and head must be processed in the same run; a cached base manifest from
  another day would mark every block containing them. A version bump in `package.json`
  legitimately changes every `|version|` block.
- `next` tree: `docs-toolkit.config.yaml:52-78` declares `next` (workspace) + `26.8`
  (latest) + `26.7` + `26.4` (archive branches). Without `.docs-archive/` worktrees (only
  Amplify creates them, `amplify.yml:173-208`) archives are skipped with a warning
  (`versions.ts:323-334`, `website-generator.ts:646-652`), so a PR build emits only
  `dist/web/next/<lang>/<slug>.html` (rootDepth 3, `:972-973`). The root `index.html`
  still redirects to `latestVersion` 26.8 (`:855-861`) → 404 on the preview; the PR
  comment must deep-link into `next/`. The version switcher's other options 404 too.
- Recommendation: token level, both sides via the head toolkit. The base side needs only
  `blocks.json`, not HTML: a lexer-only path (preprocessing chain + lexer, no Shiki, no
  image copy) exposed as `docs-toolkit blocks --src <dir>` is seconds per language.
  Fallback with zero new CLI surface: run `build:web` twice into two dist dirs.

## 3. Libraries

- Toolkit markdown stack: **marked** only (plus handlebars, shiki, yaml). remark/mdast
  exist in the lockfile solely as transitives of `react-markdown@10.1.0`
  (`pnpm-lock.yaml:20993`, `:21258`); a remark structural diff would add a second parser
  whose block boundaries need not match marked's. Not recommended.
- **jsdiff `diff@8.0.4`** is already locked (`pnpm-lock.yaml:6282`) as a dev transitive of
  `@microsoft/api-extractor` (`:13881`). Declaring `diff: 8.0.4` in the toolkit reuses
  that resolution; only a newer, not-yet-locked version would meet the
  `minimumReleaseAge: 10080` window (`pnpm-workspace.yaml:82`). Verified API (package
  README): `diffArrays(old, new, { comparator })` for id alignment (README:101-104);
  `diffWords(old, new, { intlSegmenter })` where the segmenter must have
  `granularity: 'word'` (README:56-66) — needed for ko/ja/th, which the default regex
  tokenizer splits poorly; `oneChangePerToken` (README:211). Browser build measured:
  `dist/diff.min.js` 30.5 KB, `dist/diff.js` 84 KB (`browser` field →
  `./dist/diff.js`). Node 20+ ships `Intl.Segmenter`, so word diff can run at build time
  and the overlay ships zero dependencies (the existing `templates/assets/*.js` are
  5-22 KB vanilla files).
- diff-match-patch, htmldiff, diff-dom, htmlparser2, cheerio, linkedom: none in the
  lockfile; all would be new resolutions subject to the 7-day window. diff-match-patch is
  char-based with semantic cleanup — no advantage over jsdiff here. htmldiff/diff-dom only
  matter for the rejected HTML-level route. `jsdom@29.1.1` (`:7840`, via vitest) and
  `parse5@8.0.1` (`:8881`) are present if that route were ever needed.
- Not checked against upstream docs: whether pnpm's release-age policy exempts versions
  already in the lockfile in every install mode — confirm with `pnpm install
  --frozen-lockfile` in CI before relying on it.

## 4. Images

- The builder copies images by name (`website-generator.ts:1233`) into
  `<langDir>/images/` or `<langDir>/<chapter>/images/` (`:1259-1293`); `--optimize-images`
  writes `foo.webp` beside `foo.png` (`image-optimizer.ts:107,168`) and is off in
  production (`amplify.yml`: `build:web --lang all --no-strict`).
- Replaced screenshot = image-only block with unchanged text whose resolved `src` appears
  as `M` in `git diff --name-status <merge-base>...HEAD --
  packages/backend.ai-webui-docs/src/**/images/`. Reuse the three-dot + `--deepen=200`
  retry from `.github/scripts/pr-preview/analyze-pr.mjs:38-84`. Join by the URL the
  processor derives: `rewriteImagePathsForWeb` (`markdown-processor-web.ts:76-108`) maps
  the reference to `/<rel-to-lang-dir>`; record that in the block as `src`. A sha256 of
  both trees (`contentHash`) gives the same answer without git if the base source tree
  is on disk anyway.
- Old image URL: do **not** publish the base build — ~40 MB/language, ~198 MB total, on a
  gh-pages branch that already needs `compact-gh-pages-history.sh`. Extract only the
  changed images: `git show <merge-base>:<path>` → `dist/web/next/<lang>/__base__/<rel>`
  and store `oldSrc` in the change record. A typical docs PR replaces a handful of
  ~100-500 KB PNGs.
- Alt/size-hint edits (`parseImageSizeHint`, `markdown-extensions.ts:171`) change
  `token.raw` and surface as ordinary text changes.

## 5. Output shape for the overlay and the PR comment

- **Site-wide** `dist/web/next/changes-manifest.json` (small): per language, the changed
  slugs with `{ slug, url, status: 'modified'|'added'|'deleted', added, removed,
  modified, firstBlock }`. This is what `generate-pr-comment.mjs` needs
  (`.github/scripts/pr-preview/generate-pr-comment.mjs:54-110` shows the table idiom:
  Page | Lang | +/−/~ | Open, capped at 30 rows) and what the overlay fetches first to
  decide whether to do anything on the current page.
- **Per-page** `<slug>.changes.json` beside the page: `[{ id, type, status, before:
  { text, md, src? }, after: { text, md, src? }, oldSrc?, words: [{added?, removed?,
  value}] }]`. Fetched only when the manifest lists the page, so unchanged pages cause
  no 404s. Deleted pages get a stub `<slug>.html` listing their base blocks (or the
  manifest row alone; v1 decision for the prototype ticket).
- Inline `<script type="application/json">` is the alternative: no fetch, but it forces
  page emission to happen after the diff and bloats every page. Sidecars keep the toolkit
  output production-identical and let the diff step stay a CI script.
- Deep link: `next/<lang>/<slug>.html#<id>` works only if the block also gets
  `id="<id>"`; safer to keep `data-block` and let the overlay honour `?block=<id>`
  (scroll + open hover). `firstBlock` in the manifest carries the first changed id in
  document order.
- Overlay script: add `templates/assets/diff-overlay.js` through the optional-asset
  pattern (`website-generator.ts:340-360`, `code-copy.js`) and the `defer` script-tag
  helper (`website-builder.ts:1263-1269`), emitted only under a build flag (e.g.
  `--changes`), or injected by the CI post-pass before `</body>` — the latter keeps the
  toolkit's production output byte-identical.

## Open risks

1. marked 12's renderer is token-blind; the id queue relies on marked's render order
   (post-order lists). marked ≥13 passes tokens to `listitem(token)` /
   `tablerow({text})` (react workspace's marked 16.4.2, `lib/marked.esm.js:61,67`;
   catalog `marked: ^16.4.2`) but changes every renderer signature the toolkit uses —
   a separate migration, not a v1 prerequisite.
2. Moved/duplicated blocks appear as delete+add (accepted); hash+ordinal ids stay
   deterministic only if the ordinal walk is identical on both sides (same code path).
3. `|date|` substitution: never cache the base manifest across runs.
4. Preview size (~198 MB per PR) belongs to the deploy ticket, but it constrains "serve
   the base build" answers here — hence `__base__/` for changed images only.
5. Fork PRs: the diff runs in the unprivileged `pull_request` workflow and only emits
   artifacts; the `workflow_run` publisher copies them (`pr-preview.yml` header,
   `pr-preview-publish.yml:11-27`). The manifest must not be trusted for the PR number.
6. Preview root `index.html` redirects to 26.8, which the PR build does not produce.
7. `html` tokens (admonition wrappers, explicit `<a id>` anchors) and `space` tokens must
   be excluded from block lists on both sides, or they appear as spurious changes.

## Suggested build-time flow

1. Trigger on `packages/backend.ai-webui-docs/**` (+ toolkit) in a docs variant of
   `pr-preview.yml`; `fetch-depth: 50` + `git fetch` base as today.
2. `pnpm --filter backend.ai-docs-toolkit build`; run `build:web --lang all --no-strict`
   on HEAD → `dist/web/next/<lang>/{<slug>.html, blocks.json}` (blocks stamped).
3. Swap `packages/backend.ai-webui-docs/src` to the merge-base tree (pattern
   `pr-preview.yml:102-103`); run `docs-toolkit blocks --src … --out base-blocks/` (lexer
   only) with the same toolkit; restore `src`.
4. `git diff --name-status <merge-base>...HEAD -- packages/backend.ai-webui-docs/src` →
   changed markdown + image paths (analyze-pr.mjs helper, reused).
5. Per language, compare slug sets from both `book.config.yaml`s → added/deleted pages.
6. Per common page: `diffArrays(baseIds, headIds)`; pair adjacent removed/added runs
   positionally; for each pair `diffWords(before.text, after.text, { intlSegmenter:
   new Intl.Segmenter(lang, { granularity: 'word' }) })`.
7. Image-only blocks whose `src` is in the changed-image set → `modified` with
   `oldSrc`; write `git show <merge-base>:<path>` bytes to `next/<lang>/__base__/…`.
8. Write `next/<lang>/<slug>.changes.json` for changed pages and
   `next/changes-manifest.json`; inject `diff-overlay.js` tag into changed pages (or
   build with `--changes`).
9. Upload `dist/web` + `changes-manifest.json` as artifacts; the publisher copies
   `dist/web` to `gh-pages/pr/<n>/docs/` and feeds the manifest to
   `generate-pr-comment.mjs` for a "Docs preview" section (per-language table, counts,
   NEW/DELETED flags, `?block=<firstBlock>` links into `next/`).
10. Unit-test the stamping in `markdown-processor-web.test.ts`-style tests: stable ids
    across reflow, post-order `<li>` ids, `<figure>` stamping, admonition exclusion.
