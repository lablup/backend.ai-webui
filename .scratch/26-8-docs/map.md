# Map: 26.8 user manual refresh

<!-- wayfinder:map -->

## Destination

Every manual page affected by the 26.8 release has an **open, ready-for-review PR
against `main`** carrying: prose complete in all four languages (en/ko/ja/th),
**screenshots captured and committed**, an attribution table in the PR body, all
driving authors assigned as reviewers, and green docs CI.

The map is done when every affected page has such a PR sitting immediately before
human review. **Review turnaround and merge remain outside the destination.**

> **Destination widened 2026-08-03.** Screenshot capture was originally excluded
> because no server was available. A capture server was then provided
> (`10.82.0.119:8090`, e2e default credentials), so capture moved from a
> follow-up effort *into* this map. Consequence: the per-page write tickets now
> have a capture stage after the prose stage, and PRs are not ready for review
> until their TODO markers are discharged.

## Notes

**Domain.** Backend.AI WebUI user manual (`packages/backend.ai-webui-docs/`) —
4 languages × ~28 chapters. The gap being closed is release 26.8.0 against a docs
content baseline of `#8056` (FR-3219 review pass, 2026-06-29): **105 commits**
touching `react/` or `packages/backend.ai-ui/src/`, of which **103 shipped in
26.8** and 2 landed post-cut (they belong to 26.9).

**Skills every session should consult.**

- `docs-lead` — the **only** sanctioned entry point for docs work. The docs package
  CLAUDE.md forbids invoking `docs-update-planner` / `docs-update-writer` /
  `docs-update-reviewer` / `docs-screenshot-capturer` directly. Go through
  `docs-lead` so lint findings and worker hand-offs stay coherent.
- `fw:jira-workflow` + `fw:jira-github-bridge` — issues are authored in **Jira
  only**; a webhook clones them to GitHub. Never `gh issue create` for product work.
- `fw:docs-writing-guide`, `i18n-patterns` — prose and translation conventions.
- `gh-stack` / `fw:stacked-pr-workflow` — *not expected here*: per-page PRs have
  disjoint file sets, so they are independent PRs off `main`, not a stack.

**Standing decisions for this effort** (settled at charting; do not relitigate):

1. **Slicing is per manual page.** File sets are disjoint across PRs → zero
   conflicts, all parallel off `main`, mergeable in any order.
2. **Reviewers are every driving author**, not one owner. Each PR body carries an
   attribution table mapping changed section → FR → original PR → author, so a
   reviewer can find their hunk without reading the whole diff.
3. **Inclusion criterion is "visible change of any kind"**: user-visible `feat`,
   UI label / terminology renames, `fix` that changed behavior users see, and
   **removals** (which mean deleting docs, not adding them). Excluded: dev-only
   tooling (FR-3214, FR-3352, FR-3309), internal refactors, perf, test-only.
4. **Base branch is `main`.** The batched back-port to `26.8` is a separate
   follow-up effort (see Out of scope).
5. **No triage gate.** Triage flows straight into writing, unattended. Judgement
   calls are mine; they surface to the human as PR diffs.
6. **Issue linkage**: one Jira epic ("26.8 user manual refresh") + one sub-task per
   page. PR title `docs(FR-XXXX): update <Page> for 26.8`, body opening
   `Resolves #NNNN (FR-XXXX)` — the space before `(` is required or
   `project-status-sync.yml` fails to detect the link.
7. **Execution is carried into this map** (overriding wayfinder's plan-only
   default). Writing prose and opening PRs happen as tickets here, not in a
   handed-off effort.
8. **The Jira→GitHub webhook clone never blocks progress.** Directed 2026-08-03.
   If the clone does not arrive: first check whether GitHub already has the issue
   (`gh issue list --search "FR-XXXX"`); if it exists, reconcile the Jira fields
   rather than creating anything; if it does not exist either, proceed without it
   and backfill the `Resolves` line later. Never `gh issue create` as a
   workaround. Detail in [Create the Jira epic and per-page sub-tasks](issues/03-jira-scaffold.md).
9. **No further human-in-the-loop.** Directed 2026-08-03: every remaining decision
   is made autonomously and *recorded* on this map rather than put to the human,
   and PRs are driven to **ready for review**, not left as drafts. Consequence:
   there are no `grilling` or `prototype` tickets on this map — every ticket is
   `research` or `task`, AFK. A decision that would previously have been a
   grilling ticket becomes a `task` ticket whose answer documents the call made
   and the reasoning, so it can be audited or reversed later.

**Verification.** Every PR must leave `docs-checks.yml` green: terminology table
in sync, nav labels relate to page H1s, terminology drift strict. Translation
parity is **not** CI-gated — it is only checked by the `docs-lint` agent, so
parity is a reviewer responsibility, not a machine guarantee.

## Decisions so far

<!-- one line per closed ticket: gist + link. Zoom the ticket for detail. -->

- [Build the 26.8 coverage matrix](issues/01-coverage-matrix.md) — **105 triaged →
  72 included, 17 chapters affected.** Identity dedup collapsed 9 git author names
  to **5 people** (the suspected `yomybaby` / "Jong Eun Lee" duplicate confirmed as
  one person; never resolve identity from `%ae` on this range). Six removals landed,
  so docs get deleted as well as added. Two manual statements are *verifiably* false
  today — `session_page.md:38` and `admin_menu.md:365`. All 11 flags decided in the
  ticket; the load-bearing one: **no version-gated prose**, because FR-3208 and
  FR-3203 deliberately drove version gates to zero and the flag proposed
  reintroducing them.

- **Collision with PR #8521 — the coverage matrix had a structural blind spot.**
  Discovered 2026-08-03 while listing pushed branches. PR **#8521**
  (`docs/FR-3431-rbac-manual-update`, @ironAiken2, open, updated the same day)
  already rewrites **`rbac_management.md` AND `project_admin.md`** in all four
  languages, with **44 captured screenshots**.

  Root cause: [ticket 01](issues/01-coverage-matrix.md) triaged **code commits**
  and never asked whether a docs PR was already in flight for the same chapter.
  A commit-only triage cannot see that. `docs-lint` has a "PR coverage gap" check
  that would have caught it — it should run *before* the matrix next time, not
  after. Confirmed by `gh pr list` that #8521 is the **only** open docs PR, so the
  damage is bounded to two chapters.

  Resolution: **#8521 is authoritative for the overlap** — its author wrote the
  RBAC features and it already has real screenshots.
  - `rbac_management` (FR-3448 / #8541): fully superseded. Writing agent stopped
    mid-flight; no PR will be opened. Closed as duplicate.
  - `project_admin` (FR-3456 / #8549): partial overlap. #8521 covers FR-3317 /
    FR-3320 / FR-3333 / FR-3383; it does **not** cover FR-2948 (session table
    columns) or FR-3147 (auto-refresh), which we do. Rebuilt as a **stack on top
    of #8521** carrying only the unique content.

  Unraised review point on #8521, recorded rather than acted on: its body
  advertises **version-gated prose** ("on 26.8.0+", "legacy fallback on older
  managers", "Auto Assign gated to 26.4.4+"), which is exactly what FR-3208
  (#8038) and FR-3203 (#8027) removed from this manual. That is a conversation for
  its author — not a silent edit by this effort.

- [Create the Jira epic and per-page sub-tasks](issues/03-jira-scaffold.md) — Epic
  **FR-3445 / #8538** plus **16** page tasks (FR-3446…FR-3461 → #8539…#8554), each
  with its `Resolves` line resolved. **16, not 17**: `agent_summary` dropped because
  the watcher drawer is reachable only from the admin `AgentList`, so flag F6's two
  rows were mis-routed and `admin_menu` already covers them. Children are `Task`,
  not `Subtask` — a level-−1 `Subtask` cannot parent to a level-1 `Epic`. The
  webhook clone arrived promptly, so the fallback never fired.

- [Define the screenshot hand-off artifact and the reviewer-conflict rule](issues/02-screenshot-handoff.md)
  — Keep the existing `<!-- TODO: Capture ... -->` marker verbatim, joined by PNG
  filename; aggregate into **one** `screenshot-manifest.md` on the map branch (not
  in the docs PRs, where the same path across N branches would always conflict) so
  the capture effort is a single branch-grouped pass. Reviewers = driving authors
  **minus the PR author** (`yomybaby`, who drove ~28 commits and would otherwise
  self-review several pages and make them unapprovable); fall back to the original
  driving PR's reviewer, then to the highest-volume non-self contributor.

## Destination reached — 2026-08-04

**15 PRs open and ready for review**, one per affected chapter, all non-draft with
attribution tables and reviewers. `agent_summary` was dropped (mis-routed rows) and
`rbac_management` closed as a duplicate of #8521, so 16 chapters yielded 15 PRs.

| PR | chapter | screenshots |
|---|---|---|
| #8555 | Dashboard | live |
| #8556 | Login | live |
| #8557 | Getting Started | live |
| #8558 | Share Storage Folder | none needed |
| #8559 | Header | live (16 files) |
| #8560 | SFTP to Container | live |
| #8561 | Chat | **all mocked** |
| #8562 | Session Page | 2 live, 1 mocked |
| #8563 | User Settings | 4 live, 1 mocked gate |
| #8564 | Storage Folders | **both mocked** |
| #8567 | Compute Sessions | **all mocked** |
| #8568 | Project Admin | 1 live, 1 mocked — **stacked on #8521** |
| #8569 | Troubleshooting | mocked |
| #8575 | Model Deployment | 1 live, 8 mocked |
| #8579 | Admin Menu | **all 15 live** |

Mocking was approved mid-effort because the capture server was reset 2026-08-03
12:05Z and holds no folders, sessions or deployments. Every mocked capture carries
a disclosure banner naming the exact operations mocked and what stayed real.

### Follow-ups this effort surfaced

- **Back-port automation.** The core `backend.ai` repo has a mature
  `backport.yml` + `maintained-versions.yml` + `decide-backport-targets.sh`;
  webui has none, and 26.7 was back-ported by hand. Porting it is recommended, as
  its own FR. Note its default rule (`fix:` only, others via a `Backport:` trailer)
  is *correct* for docs — an automatic `docs:` rule would push #8561's
  FR-3332 prose to 26.8, where it is factually wrong.
- **Capture specs are deleted after each run**, so mocked images cannot be
  regenerated; the mock data survives only in commit messages. Consider committing
  them under `e2e/`.
- **i18n defects found** (each wants its own FR, none are docs bugs):
  `<Trans>` inside `'use memo'` goes stale on in-place language switch;
  `word-break: keep-all` on `:lang(ja)` (`index.css:8-11`) overflows Japanese text;
  ko `webui.menu.Architecture` = 운영체제, ja = 建築; ja `button.Generate` = 生む;
  ja `ThemeAccentColor` = 原色; th Host/Port = เจ้าภาพ/ท่าเรือ;
  ja/th `RecentHistory` = "history, the academic subject";
  en `session.ExpiresAfter` missing a space; `chatui.CannotFindModel` embeds
  English "Refresh Models" in ja/th.
- **Manual defects predating 26.8**: `PUSH SESSION TO CUSTOMIZED IMAGE` exists in
  no i18n file; `deployment_presets.md` is in no language's nav and documents a
  tag filter and Rank field that do not exist; `SSH_SFTP_connection.png` and
  `idle_checks_column.png` had locale copies that were byte-identical to English.

## Not yet specified

Fog toward the destination. Graduates into tickets as the frontier advances.

- _(graduated 2026-08-03)_ ~~The per-page write + PR tickets~~ → the page set is
  now known: **17 chapters, expected to yield 16 PRs** once `agent_summary` is
  confirmed redundant (F6). Specs in
  [Per-page write specs](issues/04-page-write-specs.md).
- _(graduated 2026-08-03)_ ~~How removals are handled~~ → six removals landed;
  resolved in [ticket 01](issues/01-coverage-matrix.md) flag F3. Handled inside the
  owning page's PR: delete the section, fix inbound cross-refs, check for images
  orphaned by the deletion. No chapter dies entirely, so nav is untouched.
- **Whether pre-existing docs debt rides along.** Still fog. `docs-lint` reports
  terminology drift and translation-parity gaps independent of 26.8. Now sharper in
  one respect — `admin_menu` carries 27 driving rows on a 1655-line chapter, so
  *that* page's PR is already large enough that folding extra debt into it is
  clearly wrong; the question remains open for the smaller pages. Decide when a
  `docs-lint` run is available per page.

## Out of scope

Ruled beyond this destination. Never graduates; returns only as a fresh effort.

- ~~**Screenshot capture.**~~ _Moved INTO scope 2026-08-03_ once a capture server
  was provided. See the destination note above and
  [Capture screenshots](issues/05-screenshot-capture.md).
- **Batched back-port to `26.8`.** After the per-page PRs merge *and* screenshots
  land, one sync commit goes to the `26.8` release branch, which auto-refreshes
  `docs-archive/26.8` and the live `/26.8/` site via FR-3242. Must exclude the 2
  post-cut commits (26.9 features). Precedent: `26.7` received exactly this
  treatment — 7 commits including `docs(26.7): sync manual source with main`.
- **The 96 pre-existing screenshot TODO markers** already in the manual, unrelated
  to 26.8. Still out of scope even though a capture server is now available: the
  brief is the capture needs *of these PRs*, and folding 96 unrelated recaptures in
  would balloon every diff and bury the 26.8 changes under noise. Cheap to opt into
  later as its own effort now that the server exists.
- **Review turnaround and merge.** The destination is *open, ready-for-review PRs*.
  What reviewers do next is outside the map.

Follow-up candidates surfaced by [ticket 01](issues/01-coverage-matrix.md) — real
findings, but IA/product decisions rather than 26.8 docs-gap fixes. Each wants its
own FR:

- **A URLs / scopes / 403-404 chapter.** FR-3055 rewrote the whole URL scheme and
  FR-3383 added a Forbidden page, but no chapter documents routing or error pages
  and `book.config.yaml` has no such entry. This map corrects only the two
  *verifiably false* sentences in place (F2); a real chapter needs nav entries in
  four languages.
- **`deployment_presets.md` is in no language's nav** (F11) — a 160-line page
  reachable from nothing in `book.config.yaml`, yet four 26.8 rows land on it.
  Pre-existing orphan, not a 26.8 regression.
- **Spot-check the nuqs migration's shareable links** (F7) — needs a live server, so
  it belongs to the screenshot effort, which will have one.
