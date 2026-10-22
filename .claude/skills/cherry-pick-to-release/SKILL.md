---
name: cherry-pick-to-release
description: >
  Backport PRs already merged to `main` onto a release branch (`26.9`, …):
  cherry-pick each merge commit with `-x`, resolve conflicts by this
  repository's rules, verify, open the backport PR, and merge it when the pick
  was clean and CI is green. A pick whose conflicts had to be resolved is left
  open for a human to approve; a pick that needs a PR the release branch does
  not have stops and says which one. Trigger on "#N 26.9에 체리픽해줘",
  "이 PR 26.9 브랜치에 넣어줘", "릴리스 브랜치에 백포트", "cherry-pick #N into
  26.9", "backport #N", `/cherry-pick-to-release <PR...>`. It never creates a
  release branch, tag, or GitHub release — that is `create-release`.
argument-hint: "<PR> [<PR> ...] [--to <branch>] [--batch] [--no-merge]"
---

# Cherry-pick to a release branch

`$ARGUMENTS`: one or more PR numbers (or URLs) merged to `main`.

- `--to <branch>` — target release branch. Default: the highest `origin/<major>.<minor>` branch.
- `--batch` — one PR for all picks (`chore/cherry-picks-<branch>`) instead of one per PR. Use it for a pre-RC sweep.
- `--no-merge` — open the PR(s) but never merge, even when clean.

The procedure takes no interactive input, so a CI job can run it unchanged. The
only point where it waits for a person is the merge gate in §6.

## 1. Preflight

For each PR:

```bash
gh pr view <N> --json number,title,state,mergeCommit,mergedAt,baseRefName,body
```

- It must be `MERGED` into `main`. Otherwise report it and skip it.
- Skip it if it is already on the target. Two checks:
  - `git log origin/<branch> --grep "cherry picked from commit <sha>"`
  - `git cherry origin/<branch> <sha> <sha>~1`: a line starting with `-` means an equivalent patch is already there.
- Order the picks by `mergedAt`, oldest first, so dependent fixes apply in the order they landed.

## 2. Branch

Work in a worktree, never in the user's checkout. Branch from the release branch:

```bash
git fetch origin <branch> main
git switch -c chore/cherry-pick-<N>-<branch> origin/<branch>   # --batch: chore/cherry-picks-<branch>
```

## 3. Pick

```bash
git cherry-pick -x <mergeCommitSha>
```

This repository squash- or rebase-merges, so `mergeCommit` is a single
non-merge commit. If it ever is a merge commit, pick the PR's own commits
(`gh pr view <N> --json commits`) instead of using `-m`.

## 4. Resolve conflicts

Resolve by the rules below and record every resolution for §7. In a
cherry-pick, `--ours` is the **release branch** and `--theirs` is the pick.

| Conflict | Resolution |
|---|---|
| Relay `**/__generated__/**` | Take either side, run `pnpm relay`, stage the output. |
| `react/src/generated/searchIndex.json` | Take either side, run `pnpm run search-index` (`.claude/rules/search-index-conflicts.md`). |
| `pnpm-lock.yaml` | `git checkout --ours pnpm-lock.yaml`, then `pnpm install`. The release branch's lockfile is the base here, not main's. |
| `resources/i18n/*.json`, BUI `locale/*.json` | Keep both sides' keys; never drop the release branch's keys. |
| modify/delete: the pick edits a file that does not exist on the release branch | If the file belongs to a feature that is only on main (a test or story for it, its docs page), drop the hunk and record it. Otherwise treat it as missing-prerequisite. |
| Source conflict whose two sides express the same intent | Port the pick's change onto the release branch's version of the code. Do not import surrounding main-only refactors. |
| The pick calls an API, component, hook, or schema field the release branch lacks | **Missing prerequisite, stop.** Find the PR that introduced it (`git log -S'<symbol>' origin/main`, then `gh pr list --search <sha> --state merged`). Abort this pick (`git cherry-pick --abort`) and report the prerequisite PR. Never pull it in on your own initiative. |

A change of more than about 200 lines of hand-resolved source also stops at the
merge gate, however clean it looks after the fix.

## 5. Verify

```bash
pnpm install --frozen-lockfile            # a fresh worktree has no node_modules
VERIFY_BASE=origin/<branch> VERIFY_TESTS=1 bash scripts/verify.sh   # must end in === ALL PASS ===
git range-diff <sha>~1..<sha> <picked>~1..<picked>   # per pick
```

`range-diff` must show only the added `(cherry picked from commit …)` line
for a clean pick. For a resolved pick, every other hunk it shows must be one
of the resolutions you recorded. A failing `verify.sh` that also fails on
`origin/<branch>` without the pick is pre-existing; say so instead of fixing it.

Classify each pick:

- **clean** — applied without conflict, verify passes, and range-diff is identical.
- **resolved** — conflicts resolved by §4, and verify passes.
- **blocked** — missing prerequisite, an unresolvable conflict, or verify fails because of the pick.

## 6. PR and merge gate

```bash
git push -u origin <branch-name>
gh pr create --base <branch> --head <branch-name> --title "<title>" --body-file <body.md>
```

- Title, single PR: `<original title> (<branch>)`, e.g. `fix(FR-4143): keep the login-check session id for cookie-only logins (26.9)`.
- Title, batch: `chore: cherry-pick <what> into <branch>`.
- Open a PR only for clean and resolved picks. Blocked picks go into the report, not a PR.

Merge gate:

| Outcome | Action |
|---|---|
| all picks clean, CI green, no `--no-merge` | `gh pr checks <PR> --watch`, then `gh pr merge <PR> --rebase`. Use `--admin` only when the user authorized it in this session. |
| any pick resolved | Do not merge. Request review from the original PR authors (`gh pr edit <PR> --add-reviewer <login>`) and report the PR as waiting on a human. |
| CI fails | Do not merge. Report the failing check and its log excerpt. |

Never push to the release branch directly, never force-push, and never tag or
release.

## 7. PR body

```markdown
## Summary

Cherry-picks onto the **<branch>** release line (`cherry-pick -x`; each commit keeps its original PR number).

| PR | Jira | Change | Pick |
|---|---|---|---|
| #10120 | FR-4143 | <one line> | clean |

## Conflict resolutions (differ from the original commits)

- `<path>` — <what conflicted> → <what was kept and why>

## Not taken

- #N — needs #M (<what it introduces>), which is not on <branch>.

## Verification

- `VERIFY_BASE=origin/<branch> VERIFY_TESTS=1 bash scripts/verify.sh` → `=== ALL PASS ===`
- `git range-diff`: identical to the original except the cherry-pick trailer, or the resolutions listed above
```

Omit the sections that are empty. Put no Claude attribution anywhere.

## 8. Report

Report in this order:

1. **Blocked on you** — resolved PRs awaiting approval, and blocked picks with their prerequisite PR.
2. **Changed** — PR links and merge state.
3. **Found** — anything else, such as pre-existing failures.

Link every PR and Jira key.
