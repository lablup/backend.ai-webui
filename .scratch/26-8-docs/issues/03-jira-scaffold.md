# Create the Jira epic and per-page sub-tasks

Part of [Map: 26.8 user manual refresh](../map.md)

Type: task
Status: resolved
Blocked by: 01 (resolved)

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

### Webhook-clone fallback (directed 2026-08-03)

**The clone must never block progress.** If polling does not produce a GitHub
issue within a reasonable window, escalate in this order:

1. **Check whether GitHub already has it.** The webhook may have fired before the
   poll started, or created the issue under a title that the poll's search missed.
   Search by the Jira key and by the issue title:
   `gh issue list --repo lablup/backend.ai-webui --state all --search "FR-XXXX"`.
2. **If it exists → reconcile Jira, do not create anything.** Update the Jira
   issue's fields so the linkage is correct (notably `customfield_10173`, the
   GitHub Repository field, plus a remote issue link to the GitHub issue if
   absent). The GitHub issue is authoritative once it exists — creating a second
   one produces the exact duplicate that `fw:jira-github-bridge` warns about and
   then has to be closed as such.
3. **If it does not exist on GitHub either → stop waiting and proceed.** Do not
   block the effort on the webhook. Open the PR with the Jira key in the title
   (`docs(FR-XXXX): update <Page> for 26.8`) and, in place of the `Resolves` line,
   a plain reference to the Jira issue. Record the affected pages in this
   ticket's answer under a `## Pending Resolves lines` heading so the
   `Resolves #NNNN (FR-XXXX)` line can be backfilled into those PR bodies once the
   clone eventually appears.

Never `gh issue create` as a workaround — that is the duplicate-authoring path the
project explicitly forbids.
- The space in `Resolves #NNNN (FR-XXXX)` is required — without it GitHub does
  not auto-link and `.github/workflows/project-status-sync.yml` fails to detect
  the link.
- Use the `fw:jira-workflow` skill and the project config in `.jira.config`.

### Pre-resolved facts (checked 2026-08-03, so this ticket does not have to)

The `jira` CLI referenced by `fw:jira-workflow` is **not installed** in this
environment (`which jira` → nothing). Use the Atlassian Rovo MCP instead:

| fact | value |
|---|---|
| `cloudId` | `a28786f5-5410-4c2d-ae2d-9833cf63eb3f` (or pass `lablup.atlassian.net`) |
| project | `FR` — "Frontend" |
| Epic issue type | `Epic`, id `10101` |
| Sub-task issue type | `Subtask`, id `10102` (note: singular, no hyphen — the `IR` project's is `Sub-task`, do not copy that) |
| required custom field | `customfield_10173 = {"id":"10232"}` → GitHub Repository `lablup/webui`. Pass via `additional_fields`; the webhook clone depends on it. |
| assignee (jongeun) | `63240f6729083bbe8cc4d07d` |

Sub-tasks attach to the epic via the `parent` parameter on `createJiraIssue`.

### Record in the answer

The epic key, and a `page → {jira key, github issue number}` table. Later tickets
read that table; they must not have to re-query Jira.

## Answer

Epic **FR-3445** → GitHub **#8538** — "26.8 user manual refresh".

**16 page tasks, not 17.** `agent_summary` was dropped: flag F6 asked whether the
agent watcher drawer is reachable from the Agent Summary page, and it is not —
`AgentDetailDrawer` is referenced only by `AgentList.tsx` (the admin list), and
neither `AgentSummaryPage.tsx` nor `AgentSummaryList.tsx` contains any
`FetchKeyButton` / auto-update reference. Both rows routed there were mis-placed
and are already covered by `admin_menu`.

**Hierarchy note.** Sub-tasks were created as **`Task`**, not `Subtask`. In this
team-managed project `Subtask` sits at hierarchy level −1 and cannot parent to an
`Epic` at level 1; `Task` (level 0) is the correct child type.

**The webhook clone arrived promptly** — the fallback in the section above was not
needed, and no `## Pending Resolves lines` entries exist.

| page | Jira | GitHub | `Resolves` line |
|---|---|---|---|
| `admin_menu` | FR-3446 | #8539 | `Resolves #8539 (FR-3446)` |
| `deployment` | FR-3447 | #8540 | `Resolves #8540 (FR-3447)` |
| `rbac_management` | FR-3448 | #8541 | `Resolves #8541 (FR-3448)` |
| `sessions_all` | FR-3449 | #8542 | `Resolves #8542 (FR-3449)` |
| `user_settings` | FR-3450 | #8543 | `Resolves #8543 (FR-3450)` |
| `header` | FR-3451 | #8544 | `Resolves #8544 (FR-3451)` |
| `dashboard` | FR-3452 | #8545 | `Resolves #8545 (FR-3452)` |
| `trouble_shooting` | FR-3453 | #8546 | `Resolves #8546 (FR-3453)` |
| `chat` | FR-3454 | #8547 | `Resolves #8547 (FR-3454)` |
| `vfolder` | FR-3455 | #8548 | `Resolves #8548 (FR-3455)` |
| `project_admin` | FR-3456 | #8549 | `Resolves #8549 (FR-3456)` |
| `session_page` | FR-3457 | #8550 | `Resolves #8550 (FR-3457)` |
| `login` | FR-3458 | #8551 | `Resolves #8551 (FR-3458)` |
| `start` | FR-3459 | #8552 | `Resolves #8552 (FR-3459)` |
| `share_vfolder` | FR-3460 | #8553 | `Resolves #8553 (FR-3460)` |
| `sftp_to_container` | FR-3461 | #8554 | `Resolves #8554 (FR-3461)` |

### Trap for anyone re-deriving this table

Do **not** resolve the mapping with `gh issue list --search "FR-XXXX"`. The search
matches issue *bodies*, and several of these issues cite other FR keys in
cross-chapter notes — `FR-3448` resolved to #8549 (Project Admin) because that
issue's body references the RBAC rewrite. The table above was built by matching
issue **titles**, which is unambiguous.

Status: resolved
