# Build the 26.8 coverage matrix

Part of [Map: 26.8 user manual refresh](../map.md)

Type: research
Status: claimed

## Question

Which of the 105 UI commits since the docs content baseline actually require a
user-manual change, which manual page does each one land on, and who should
review that page?

The answer is a matrix at `.scratch/26-8-docs/coverage-matrix.md`. Everything
downstream — how many Jira sub-tasks exist, how many PRs exist, who is assigned
to each — is a projection of this one artifact. It is the map's load-bearing
ticket.

### Scope

Baseline `#8056` (FR-3219, 2026-06-29), the last content-bearing docs commit.
Commit range: everything touching `react/` or `packages/backend.ai-ui/src/`
since that date — 105 commits, 46 `feat` / 43 `fix` / 6 `style` / 4 `refactor` /
4 `chore`.

### Inclusion criterion

Per map standing decision 3, **"visible change of any kind"**:

- INCLUDE user-visible `feat` — new or changed surface a reader can see.
- INCLUDE UI label / terminology renames, whatever their commit prefix. This is
  the cheap-to-miss class: FR-3331 switched edit-form submit buttons to "Save",
  silently invalidating every documented button name.
- INCLUDE `fix` **only** where behavior a user observes changed. A fix that
  restores already-documented behavior is excluded — the manual was right.
- INCLUDE removals. A removed feature means *deleting* docs.
- EXCLUDE dev-only tooling (FR-3214 type checker, FR-3352 dev login pre-fill,
  FR-3309 review overlay), internal refactors, perf, test-only.

When genuinely ambiguous, include the row and mark confidence `low` with a
one-line reason. A false positive costs a paragraph of review; a false negative
ships a wrong manual.

### Required columns

| Column | Notes |
|---|---|
| `commit` | short SHA |
| `pr` | `#NNNN` from the squash-merge subject |
| `fr` | `FR-XXXX` if present in the subject, else `—` |
| `title` | commit subject |
| `author_git` | git author name |
| `author_gh` | GitHub handle — see identity dedup below |
| `user_facing` | yes / no |
| `reason` | why included or excluded, one line |
| `pages` | affected manual chapter dir(s), e.g. `admin_menu`; may be several |
| `change_kind` | `add` / `modify` / `rename-label` / `remove` |
| `confidence` | high / medium / low |
| `in_26_8` | yes / no — 103 are in `origin/26.8`, 2 are post-cut (26.9) |

### Identity dedup — do not skip

Git author names are not GitHub handles, and at least one person appears under
two identities: **`yomybaby` (14 commits) and `Jong Eun Lee` (14 commits) are
almost certainly the same person** (repo git user is "Jongeun", the `gh` account
is `yomybaby`). Resolve every git author to a GitHub handle before the matrix is
usable for reviewer assignment — a duplicate identity would split one person's
28 commits across two reviewer entries.

Resolve via `gh pr view <N> --json author` per PR where possible; fall back to
`git log --format='%an %ae'` plus `gh api users/<handle>` to confirm. Record the
mapping in a `## Identity map` section so later tickets do not redo the work.

### Also produce

1. **`## Page index`** — inverted view: page → list of driving rows. This is what
   the per-page write tickets and their attribution tables consume directly.
2. **`## Reviewer index`** — page → deduped set of GitHub handles.
3. **`## Excluded`** — every excluded commit with its one-line reason, so the
   exclusion call is auditable rather than invisible.

### Constraints

- Read-only. Do not modify anything under `packages/backend.ai-webui-docs/src/`.
- The chapter list is `packages/backend.ai-webui-docs/src/en/*/` — use those exact
  directory names as page identifiers. Do not invent pages.
- Cross-check candidate pages against `src/book.config.yaml` navigation; a change
  with no home page is a signal worth flagging, not a reason to drop the row.

## Answer

_(pending)_
