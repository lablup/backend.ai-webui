---
description: When resolving pnpm-lock.yaml merge/rebase conflicts, always take main's version and re-run pnpm install instead of hand-merging
---

# pnpm-lock.yaml Conflict Resolution Rule

When `pnpm-lock.yaml` conflicts during a merge, rebase, `gt sync`, or `gt restack`, **always take the main branch's version** rather than hand-merging the lockfile. Then run `pnpm install` to let pnpm reconcile any new dependencies from your branch's `package.json` / `pnpm-workspace.yaml`.

## Why

`pnpm-lock.yaml` is a large, auto-generated artifact. It is effectively a deterministic function of:

- `package.json` (in each workspace)
- `pnpm-workspace.yaml` (catalog, overrides, patched dependencies, minimum release age policy)
- pnpm's resolver

Hand-merging two versions of this file is error-prone — humans regularly miss transitive dependency mismatches, integrity hashes, or peer dependency notes, producing a lockfile that parses but doesn't correspond to a valid resolution state. CI then fails on `pnpm install --frozen-lockfile`, often in ways that point at the wrong root cause.

Since FR-2866 disabled `gitBranchLockfile`, every branch writes to the same canonical `pnpm-lock.yaml`. The cleanest resolution path is: take main's lockfile, then let pnpm re-resolve any new deps your branch added. pnpm will deterministically rewrite the file to match the post-merge `package.json` state — you don't lose your branch's dep changes, they're just re-derived.

## Pattern

### ✅ Recommended — `git restore --source=main` (context-independent)

```bash
# Works the same in merge, rebase, gt sync, gt restack
git restore --source=main pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
# then continue: git rebase --continue / gt continue / git commit
```

`--source=main` explicitly names the source, so the command behaves identically whether you're in a merge or a rebase. Memorize this one form.

### ✅ Also correct — `git checkout --theirs` (during `git merge`)

```bash
# After: git merge main → conflict in pnpm-lock.yaml
git checkout --theirs pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit
```

In a **merge**, `--theirs` = the branch being merged in (main).

### ⚠️ Correct but reversed semantics — `git checkout --ours` (during rebase / `gt sync` / `gt restack`)

```bash
# After: gt sync, gt restack, or git rebase main → conflict in pnpm-lock.yaml
git checkout --ours pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git rebase --continue   # or: gt continue
```

In a **rebase**, `--ours` and `--theirs` are swapped relative to merge: `--ours` = the base you're rebasing onto (main), `--theirs` = the commit being replayed (your branch). This is a well-known Git footgun. If you're unsure which context you're in, fall back to `git restore --source=main pnpm-lock.yaml` from the recommended pattern.

### ❌ Wrong — hand-merging the conflict markers

```yaml
# DO NOT do this
<<<<<<< HEAD
  '@some/pkg':
    version: 1.0.0
=======
  '@some/pkg':
    version: 1.1.0
>>>>>>> main
```

Lockfile conflict regions can span hundreds of lines and reference interconnected `packages:`, `snapshots:`, and `importers:` sections. Hand-editing them produces lockfiles that pass parsing but fail `pnpm install --frozen-lockfile` in CI.

### ❌ Wrong — taking main's lockfile and skipping `pnpm install`

```bash
git restore --source=main pnpm-lock.yaml
git add pnpm-lock.yaml
git commit   # ← problem: if your branch added new deps to package.json,
             #    they aren't in main's lockfile yet, so CI will fail on
             #    pnpm install --frozen-lockfile.
```

Always run `pnpm install` after restoring. pnpm will re-resolve any new deps your branch introduced and write a coherent lockfile.

## Rules

1. **Default**: `git restore --source=main pnpm-lock.yaml` — same command for merge and rebase.
2. **Always follow up with `pnpm install`** so pnpm reconciles any new deps from your branch's `package.json` / `pnpm-workspace.yaml`.
3. **Never hand-merge `pnpm-lock.yaml`** — the file is auto-generated; let the tool that owns it (pnpm) regenerate it.
4. **Mind the rebase / merge swap** when using `--ours` / `--theirs`. In rebase, `--ours` is main; in merge, `--theirs` is main. When in doubt, use `--source=main`.
5. **Same rule applies during `gt sync` and `gt restack`** — both use rebase semantics under the hood. Resolve with `git restore --source=main pnpm-lock.yaml`, run `pnpm install`, then `gt continue`.
6. **Don't escalate routine lockfile conflicts** — they almost always resolve via this recipe. Escalate only if `pnpm install` itself fails after taking main's lockfile (which typically points at a real `package.json` / `pnpm-workspace.yaml` problem, not a lockfile problem).

## Related

- `pnpm-workspace.yaml` — the canonical source of truth for catalog, overrides, patched dependencies, and the `minimumReleaseAge` policy.
- FR-2866 (PR #7359) — disabled `gitBranchLockfile`, making `pnpm-lock.yaml` the single shared lockfile across all branches.
- pnpm docs on lockfile conflicts: <https://pnpm.io/git#dealing-with-merge-conflicts>
