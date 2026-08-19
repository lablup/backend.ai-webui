# searchIndex.json Conflict Resolution Rule

When `react/src/generated/searchIndex.json` conflicts during a merge, rebase,
`gh stack sync`, or `gh stack rebase`, **never hand-merge it**. Take either
side, then regenerate:

```bash
git checkout --ours react/src/generated/searchIndex.json   # or --theirs; it does not matter
pnpm run search-index
git add react/src/generated/searchIndex.json
# then continue: git rebase --continue / gh stack rebase --continue / git commit
```

## Why

`react/src/generated/searchIndex.json` is a build artifact, not source. It is a
deterministic function of:

- `react/src/routes.tsx` (which routes exist, and their `handle` metadata)
- every `t()` / `<Trans i18nKey>` call in the modules those routes transitively
  render
- `react/scripts/build-search-index.mjs` (the extractor and its CONFIG block)

Which side of a conflict you start from is irrelevant — `pnpm run search-index`
overwrites the whole file from the post-merge source tree. Hand-merging its
conflict regions, by contrast, produces an index that parses but does not
correspond to any real source state: the palette then deep-links to routes that
moved, or silently stops finding pages that exist. Because the file is one large
sorted JSON array of per-route key lists, a single new route or a renamed i18n
key rewrites hundreds of lines, so conflicts here are routine and large.

`scripts/verify.sh` (`Search index` step) rebuilds the index and fails if
`git status` shows it dirty — mirroring the Relay gate. So a hand-merged index
fails verification anyway; regenerating is both the correct fix and the faster one.

## Rules

1. **Never resolve conflict markers by hand** in `react/src/generated/searchIndex.json`.
2. **Take either side, then run `pnpm run search-index`** and stage the result.
   There is no "safer" side to prefer.
3. **Never edit the file directly** for any reason — to add a page, fix a label,
   or drop a key, change `routes.tsx`, the component's `t()` calls, or
   `react/scripts/build-search-index.mjs`.
4. **If the regenerated index looks wrong, the bug is in the extractor**, not in
   the artifact. `build-search-index.mjs` throws on a stale CONFIG path or a
   `TAB_OVERRIDES` key that no longer matches an indexed route — read the error
   before touching anything else.
5. **Don't escalate routine conflicts here** — this recipe resolves them.
   Escalate only if `pnpm run search-index` itself fails afterwards, which points
   at a real `routes.tsx` / extractor problem.

## Related

- `react/scripts/build-search-index.mjs` — the extractor; its CONFIG block is the
  hand-maintained part.
- `scripts/verify.sh` — the `Search index` step (rebuild + `git status` diff).
- `react/src/components/GlobalSearchPalette/searchIndex.test.ts` — asserts route
  coverage, tab/setting inventory, the depth-aware key placement, and that the
  committed artifact is byte-identical to a fresh build.
- `pnpm-lockfile-conflicts.md` — the same "regenerate, never hand-merge" rule for
  the other large generated file in this repo.
