# Build the 26.8 coverage matrix

Part of [Map: 26.8 user manual refresh](../map.md)

Type: research
Status: resolved

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

Matrix written to [`../coverage-matrix.md`](../coverage-matrix.md) (552 lines).

**105 triaged → 72 included / 33 excluded. 17 of 26 chapters affected.**
103 in `origin/26.8`; 2 post-cut (both FR-3332, Chat).
Kinds: `modify` 41, `add` 22, `rename-label` 7, `remove` 2. Confidence: high 44 /
medium 18 / low 10.

**Identity dedup resolved — 9 git author names are 5 people**, confirmed 1:1 and
unanimously via a batched `gh api graphql` over 105 PR lookups plus
`gh api users/<handle>`:

| handle | git names | commits |
|---|---|---|
| `ironAiken2` | `ironAiken2`, `SungChul Hong` | 30 |
| `yomybaby` | `yomybaby`, `Jong Eun Lee` | 28 |
| `agatha197` | `agatha197`, `Sujin Kim` | 26 |
| `nowgnuesLee` | `nowgnuesLee`, `Seungwon Lee` | 19 |
| `rapsealk` | `Jeongseok Kang` | 2 |

The suspected `yomybaby` / "Jong Eun Lee" duplicate is confirmed as one person —
had it gone unresolved it would have split 28 commits across two reviewer entries.
Caveat recorded by the research: two commits carry `kimsujin@lablup.com` while
naming a different person, so **never resolve identity from `%ae` on this range**.

### Flag decisions

All 11 flags decided here under map standing decision 9 (no HITL). None blocked
the write phase.

- **F1 cosmetic-only exclusions (7 rows) — UPHELD, with a routing change.** The
  rule (colour/padding/fill/wrapping only, no label or behaviour change ⇒ not
  user-facing) is right *because* screenshot capture is out of this map's scope,
  so these rows produce no prose. But they are not worthless: they are exactly the
  driving-commit list the capture effort needs. **Routed into
  `screenshot-manifest.md` as recapture candidates** rather than discarded.
- **F2 routing/error has no home chapter — CORRECT IN PLACE, no new chapter.** A
  new chapter needs a `book.config.yaml` nav entry in all four languages, which is
  outside what a per-page PR is scoped to do and is a product IA decision, not a
  docs-gap fix. The two *verified* falsehoods get fixed in their existing pages:
  `session_page.md:38` ("(`/session`)") and `admin_menu.md:365`
  ("`/admin-deployments/:id`"). A dedicated URLs/scopes/403 chapter is recorded on
  the map as a follow-up candidate.
- **F3 removals — CONFIRMED, six of them.** This graduates the map's open "how are
  removals handled" fog. Removals are handled *inside the owning page's PR*: delete
  the section, fix inbound cross-references, and check whether any image under
  `src/<lang>/images/` was referenced only by the deleted section (orphan images
  are a docs-lint finding waiting to happen). No chapter dies entirely, so
  `book.config.yaml` nav is untouched.
- **F4 `rbac_management` version-conditional prose — OVERRULED.** The flag proposes
  "on managers older than 26.8.0 …" notes for FR-3406/FR-3424. That would
  reintroduce precisely what two merged PRs deliberately removed: FR-3208 (#8038)
  states *"Since Backend.AI ships continuously, the manual should not gate features
  behind specific Backend.AI / Manager / WebUI version numbers"* and drove residual
  version gates to **0**; FR-3203 (#8027) stripped the 26.4.4-era gates for the same
  reason. **Document the 26.8 behaviour as the baseline; write no version gate.**
  The rest of F4 stands — `rbac_management` is a rewrite, not a patch, and is sized
  as its own write ticket.
- **F5 `admin_menu` 27-row fan-in — KEEP ONE PR.** Splitting by section would put
  several PRs on one file, which is the conflict-and-stacking outcome map decision 1
  chose per-page slicing to avoid. The mitigation is presentational, not structural:
  the attribution table is ordered by document section, and the PR body carries a
  per-reviewer "your sections" list so none of the four reviewers reads all 27 rows.
- **F6 `agent_summary` placement — VERIFY, THEN LIKELY DROP.** Both rows already
  appear under `admin_menu`. The write ticket must first confirm whether the agent
  watcher drawer is reachable from the Agent Summary page; if it is not, the page is
  fully covered by `admin_menu` and **no `agent_summary` PR is opened**. Expected
  outcome: 16 PRs, not 17.
- **F7 nuqs exclusion — UPHELD, deferred spot-check.** Parameter names and semantics
  were preserved, so the shareable-link promise at `deployment_presets.md:130` should
  hold. It needs a live server to confirm, which this map does not have — recorded
  for the screenshot effort, which will.
- **F8 `chat` mixes 26.8 and 26.9 — KEEP THE ROW, MARK IT.** Base branch is `main`,
  which will ship 26.9, so `b2a125f7c` (FR-3332) belongs there. It is tagged
  `post-cut (26.9)` in the `chat` attribution table so the out-of-scope back-port
  strips it rather than re-deriving the fact.
- **F9 ten low-confidence rows — ACCEPTED as included.** Consistent with the ticket's
  own rule that a false positive costs a paragraph of review while a false negative
  ships a wrong manual. Reviewers are the backstop.
- **F10 two rows delete FAQ claims — HANDLED IN `trouble_shooting`'s PR.** FR-3179
  makes the "Indicated resources do not match with actual allocation" entry's premise
  obsolete; FR-3359 requires the "SFTP disconnection" entry to be re-read against the
  new `ProxyNotReady` / `ProxyDirectTCPNotSupported` / `InvalidRedirectURL` errors.
- **F11 `deployment` two-file chapter — WRITE TO THE RIGHT FILE; NAV IS OUT OF SCOPE.**
  Each row names its target file explicitly. The separate finding that
  `deployment_presets.md` is in **no** language's nav is a genuine pre-existing bug,
  but adding it is an IA change, not a 26.8 docs gap — recorded as a follow-up
  candidate on the map.

Status: resolved
