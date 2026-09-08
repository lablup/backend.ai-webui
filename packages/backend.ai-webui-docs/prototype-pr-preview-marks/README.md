# PROTOTYPE — docs PR preview change marks (FR-3882)

Throwaway UI prototype for the wayfinder ticket
[FR-3882 / #9533](https://github.com/lablup/backend.ai-webui/issues/9533):
*which way of showing a PR's changes on the live docs page reads best, and
what does the hover view contain?* Nothing here is production code; the
durable block-diff method is the research ticket's job (FR-3883 / #9534).

## Run

```bash
pnpm --filter backend.ai-webui-docs proto:pr-preview:build   # ~1 min: builds base + head sites, diffs them
pnpm --filter backend.ai-webui-docs proto:pr-preview         # http://localhost:4174
```

`proto:pr-preview:build` temporarily swaps `src/` to two commits (it refuses to
run with uncommitted edits under `src/`) and writes `dist/proto-base` and
`dist/proto-head` (~215 MB each, gitignored).

## Material

The "PR" is the range of real docs PRs merged 2026-09-01/02 —
`53fce136f7^..6b1ef56c69` (#9310 dashboard, #9313 login, #9312 header,
#9311/#9374 deployment, #9307 admin_menu, #9383 vfolder): 4 pages × 4
languages, +70/−91 md lines, ~50 replaced screenshots per language. Two
states have no recent real example and are **simulated** (flagged `demo` in
the UI): `agent_summary` is treated as a NEW page, `statistics` as DELETED.

## What to look at

Open <http://localhost:4174> — it lands on `en/vfolder` with the first text
change focused. Everything is switchable in place:

| Control | Does |
|---|---|
| floating bottom bar, `←` / `→` | cycle the mark variant: **A** highlighter · **B** gutter bar · **C** track changes (`?variant=`) |
| `marks` toggle on the bar | marks on/off (`?marks=off`) |
| `‹` `›` on the navigator badge, `[` / `]` | previous / next change; hops to the neighbouring changed page at the ends |
| `☰` on the badge | changed-page list (NEW / DELETED tags, per-page counts) + per-language totals |
| hover a mark (A, B) | popover: word-level inline diff, **Inline / Side by side** toggle (auto side-by-side for long list items, table rows, code); images old/new side by side, click to enlarge |
| click a mark | pins the popover; `Esc` closes |
| sidebar | per-page change-count badges, NEW / DEL badges |
| `#bai-change-<n>` | deep link to the n-th change on a page (what the PR comment would link to) |

Pages worth comparing: `en/vfolder` (paragraph edits inside admonitions +
images), `en/deployment` (list items + a removed paragraph), `en/dashboard`
(added list items), `en/admin_menu` (34 screenshot swaps), `ko/vfolder`
(CJK word diff), `en/agent_summary` (NEW banner).

## Files

- `build-pair.sh` — builds the two sites from two revs.
- `build-changes.mjs` — dependency-free block tokenizer + LCS diff; writes
  `<page>.changes.json` per page and `next/changes-manifest.json`, stamps
  `data-bai-block` anchors and the overlay tags into the head build.
- `overlay.js` / `overlay.css` — the marks, popover, navigator and the
  prototype switcher. Served straight from this directory by `serve.mjs`,
  so edits show on reload.
- `serve.mjs` — static server: `/head/…` = PR build, `/base/…` = base build
  (old images are loaded from there).
