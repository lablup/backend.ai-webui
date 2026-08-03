# Map: 26.8 user manual refresh

<!-- wayfinder:map -->

## Destination

Every manual page affected by the 26.8 release has an **open, ready-for-review PR
against `main`** carrying: prose complete in all four languages (en/ko/ja/th),
screenshot needs recorded as TODO markers (not captured), an attribution table in
the PR body, all driving authors assigned as reviewers, and green docs CI.

The map is done when no page still needs a PR and nothing is left to decide
before screenshots can be captured. **Screenshot capture, review turnaround, and
merge are explicitly not part of reaching the destination.**

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
8. **No further human-in-the-loop.** Directed 2026-08-03: every remaining decision
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

- [Define the screenshot hand-off artifact and the reviewer-conflict rule](issues/02-screenshot-handoff.md)
  — Keep the existing `<!-- TODO: Capture ... -->` marker verbatim, joined by PNG
  filename; aggregate into **one** `screenshot-manifest.md` on the map branch (not
  in the docs PRs, where the same path across N branches would always conflict) so
  the capture effort is a single branch-grouped pass. Reviewers = driving authors
  **minus the PR author** (`yomybaby`, who drove ~28 commits and would otherwise
  self-review several pages and make them unapprovable); fall back to the original
  driving PR's reviewer, then to the highest-volume non-self contributor.

## Not yet specified

Fog toward the destination. Graduates into tickets as the frontier advances.

- **The per-page write + PR tickets.** One per affected page, but the page set is
  unknown until [Build the 26.8 coverage matrix](issues/01-coverage-matrix.md)
  resolves. Cannot be sliced before then — guessing the page list would pre-slice
  the fog wrongly.
- **How removals are handled.** Some 26.8 changes removed UI surface. Deleting a
  section is not symmetric with adding one: it may orphan cross-references, strand
  images, and break nav entries in `book.config.yaml`. The shape of this only
  becomes clear once the matrix says whether any removals actually landed.
- **Whether pre-existing docs debt rides along.** `docs-lint` reports terminology
  drift and translation-parity gaps independent of 26.8. Folding a page's existing
  debt into its 26.8 PR is cheap (the file is already open) but widens each diff
  and muddies the attribution table. Decide once the matrix shows how many pages
  are touched and how large the debt per page is.

## Out of scope

Ruled beyond this destination. Never graduates; returns only as a fresh effort.

- **Screenshot capture.** Blocked on server access the human will supply later, and
  deliberately excluded from the destination so PRs are not held hostage to it.
  Becomes its own effort, consuming the hand-off artifact defined by
  [Define the screenshot hand-off artifact](issues/02-screenshot-handoff.md).
- **Batched back-port to `26.8`.** After the per-page PRs merge *and* screenshots
  land, one sync commit goes to the `26.8` release branch, which auto-refreshes
  `docs-archive/26.8` and the live `/26.8/` site via FR-3242. Must exclude the 2
  post-cut commits (26.9 features). Precedent: `26.7` received exactly this
  treatment — 7 commits including `docs(26.7): sync manual source with main`.
- **The 96 pre-existing screenshot TODO markers** already in the manual, unrelated
  to 26.8. The capture effort may choose to clear them opportunistically; that is
  its call, not this map's.
- **Review turnaround and merge.** The destination is *open draft PRs*. What
  reviewers do next is outside the map.
