# Create the Jira epic and per-page sub-tasks

Part of [Map: 26.8 user manual refresh](../map.md)

Type: task
Status: open
Blocked by: 01

## Question

Stand up the Jira issues every per-page PR needs for its title and `Resolves`
line, per map standing decision 6.

Blocked by [Build the 26.8 coverage matrix](01-coverage-matrix.md) because the
sub-task set is exactly the page set, which that ticket determines. Creating them
earlier would mean guessing the page list.

### What to create

- One **epic**: "26.8 user manual refresh". Body should state the baseline
  (`#8056`, 2026-06-29), the commit range (105 commits), the inclusion criterion,
  and link back to this map.
- One **sub-task per affected page**, titled for the chapter as the manual names
  it (use the page's H1 / nav label, not the directory slug).

### Constraints

- **Jira only.** Per `fw:jira-github-bridge`, follow-up issues are authored in
  Jira and a webhook clones them to GitHub. Do **not** `gh issue create` — that
  produces a duplicate that then has to be closed as such.
- The webhook has lag. Each PR needs the *GitHub* issue number for its
  `Resolves #NNNN (FR-XXXX)` line, so the clone must have landed before the PR
  body is written. Poll for the clone rather than assuming it is instant.
- The space in `Resolves #NNNN (FR-XXXX)` is required — without it GitHub does
  not auto-link and `.github/workflows/project-status-sync.yml` fails to detect
  the link.
- Use the `fw:jira-workflow` skill and the project config in `.jira.config`.

### Record in the answer

The epic key, and a `page → {jira key, github issue number}` table. Later tickets
read that table; they must not have to re-query Jira.

## Answer

_(pending)_
