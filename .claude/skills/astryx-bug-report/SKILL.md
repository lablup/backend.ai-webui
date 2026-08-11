---
name: astryx-bug-report
description: >
  File a UI/UX defect observed on the Astryx UI as a Jira Bug under the
  reporting epic FR-3491 — capture only, never fix. Classifies the report as
  visual (layout/spacing/color drift on a page) or behavioral (a component
  does not work), enforces the minimum context (where + observed + expected),
  asks the reporter once for anything missing, does a strictly bounded
  read-only lookup, scans for duplicates and links related reports with
  "relates to". Use whenever someone reports something wrong with the UI and
  wants it recorded rather than fixed — "이거 리포팅해줘", "버그 등록해줘",
  "이 페이지 UI가 틀어졌어", "이 버튼이 안 눌려", "astryx 버그", "file this UI
  bug", "log this regression", "/astryx-bug-report". If the user instead wants
  the defect *fixed now*, use the `astryx-fix` skill.
---

# astryx-bug-report — capture an Astryx UI/UX defect

Post-migration QA turns up more defects than anyone can fix one at a time. This
skill exists to make each report **cheap to file and expensive-free to
investigate**: it collects exactly the context a later batch fix will need, and
stops there. The batch fix comes later, over many issues at once, through
`astryx-fix`.

## Hard boundaries

**Do:** ask, classify, look up where things live, search for duplicates, write
the issue.

**Do not:**

- diagnose root cause, read Astryx internals, probe computed styles, or compare
  theme artifacts — that is `astryx-fix`'s "measure before you fix" step, and it
  belongs at fix time, not report time;
- propose or apply a fix, edit any file in the repository, create a branch, or
  open a PR — the only file you write is the scratchpad the description is
  drafted in (Step 5);
- run `scripts/verify.sh`, tests, or a build;
- launch a browser to reproduce, unless the user explicitly asks for it.

A report that says "Unknown" in a field is fine. A report that cost twenty
tool calls is not.

## Step 0 — Setup

```bash
FW_JIRA=$(find ~/.claude/plugins -path '*fw*/skills/jira-workflow/scripts/jira.sh' 2>/dev/null | head -1)
EPIC=FR-3491   # "Astryx UI/UX regression reports"
```

If `$EPIC` no longer resolves, find it instead of inventing one:

```bash
$FW_JIRA search "project = FR AND issuetype = Epic AND summary ~ 'Astryx UI/UX regression'" --limit 5
```

Jira is the system of record. **Do not create a GitHub issue** — Jira automation
clones every FR issue to `lablup/backend.ai-webui` on its own (it lands in the
issue's `github_issue_url` within a minute or two).

## Step 1 — Classify

| Category | Label | It is this when… | Location is pinned by |
|---|---|---|---|
| **Visual** | `astryx-visual` | spacing, alignment, size, color, typography, border, truncation, overflow, dark-mode drift — it *looks* wrong | the **page** (route + menu path) and the region inside it |
| **Behavioral** | `astryx-behavior` | no response, wrong state, broken keyboard/focus, stale value, opens/closes wrongly, validation misfires — it *acts* wrong | the **component** and at least one page where it is reachable |

A report that is both (e.g. "the dropdown is too narrow *and* it does not close
on Escape") is **two issues**, filed separately and linked with `relates`. Say so
before filing.

Several defects reported in one message → one issue each, but batch the intake
questions into a single round.

## Step 2 — Intake gate

These are required. Anything else is a bonus.

**Both categories**

1. **Observed** — what is actually happening/showing.
2. **Expected** — what should happen/show instead. If the reporter only says
   "it's broken", ask; do not invent the expectation.

**Visual, additionally**

3. **Page** — the route or the menu path ("Admin → Users", `/admin/users`).
4. **Region** — which part of the page (card title, table header, modal footer,
   sidebar item). "The page is broken" is not a region.

**Behavioral, additionally**

3. **Component** — a `BAI*` name, an Astryx name, or a plain description
   ("the project selector in the header") that you can resolve to a file.
4. **A page where it happens** — at least one route where the reporter saw it.

### Asking

Ask **once**, batching every missing field into a single `AskUserQuestion` call
(≤4 questions; use options where the answer is a choice — category, page from
the route list, light/dark/both — and let free text come through "Other").

Do not ask for anything you can determine yourself (Step 3), and do not ask for
the optional fields below. If a required field is still missing after that one
round, file the issue anyway with `**Missing:** <field>` in the description and
the `needs-info` label — a thin report in Jira beats a lost one.

Optional, recorded when volunteered, never demanded: screenshot, light/dark,
viewport, browser/OS, branch or release version, repro steps beyond "open the
page", how often it happens.

## Step 3 — Bounded lookup

Budget: **≤6 read-only tool calls.** Stop when the budget is out and write
"Unknown".

Allowed, because it makes the issue actionable later:

- resolve the menu path the reporter used to a real route in
  `react/src/routes.tsx`, and the route to its page component;
- locate the component file (`react/src/components/**`,
  `packages/backend.ai-ui/src/components/**`) and note the Astryx primitive it
  renders, if it is visible in the first screenful;
- count how many files import that component (`grep -rl`) and list up to 5 of
  them. This records **usage breadth**, not defect scope: the report is not
  reproduced at each usage, so the count never becomes "it happens everywhere".
  Scope stays what the reporter saw — `this page only` / `every usage` /
  `Unknown`;
- look up the exact UI string in `resources/i18n/en.json` when the reporter
  paraphrased a label.

Everything else is out of scope at report time.

## Step 4 — Duplicate and related scan

Run before creating. Search the epic's children and the wider project:

```bash
$FW_JIRA subtasks "$EPIC"
$FW_JIRA search "project = FR AND labels = astryx-report AND text ~ '<keyword>'" --limit 20
$FW_JIRA search "project = FR AND text ~ '<component or page>' AND created > -180d" --limit 20
```

Use two or three keywords: the component name, the page name, and the symptom
noun ("overflow", "dark mode", "not clickable").

Then decide:

- **Same page/component + same element + same symptom → duplicate.** Do not file.
  Add the new evidence as a comment on the existing issue
  (`$FW_JIRA comment KEY "..."`) and tell the user which issue absorbed it.
- **Same component, or same page, or the same plausible surface (a shared
  wrapper, the same token, the same layout primitive) but a different symptom →
  related.** File the new issue, then link it (Step 6).
- Nothing matches → file it clean.

Related links are for batching, so keep them meaningful: **at most 5** per issue,
and skip a link whose only commonality is "also an Astryx bug".

## Step 5 — Create the issue

Title and description in **English** (project rule), whatever language the report
came in. Talk to the reporter in *their* language — the questions in Step 2 and
the wrap-up in Step 6 follow the language they reported in.

**Title:** `<Page or Component>: <the defect in one line>`

- ✅ `Admin → Users: table header labels overflow their column at ≤1280px`
- ✅ `BAISelect: dropdown stays open after selecting an option (Sessions page)`
- ❌ `UI broken` · ❌ `Fix the user table` (a title is an observation, not a task)

Description: use the matching template in
`references/issue-templates.md` — read it before writing.

```bash
$FW_JIRA create --type Bug --parent "$EPIC" \
  --title "<title>" \
  --desc "$(cat <path-to-description.md>)" \
  --labels "astryx-report,frontend,astryx-visual"     # or astryx-behavior
```

Write the description to a scratchpad file first and pass it with `$(cat …)` —
the templates are long and quoting them inline breaks on backticks.

## Step 6 — After creating

```bash
$FW_JIRA link --from <NEW-KEY> --to <RELATED-KEY> --type relates     # per related issue
$FW_JIRA weblink <NEW-KEY> --url "<teams/github/PR url>" --title "Original report"
```

Add the weblink whenever the report originated from a Teams message, a GitHub
comment, or a PR review thread.

Screenshots: the CLI cannot attach files. If the reporter gave you an image,
record its path/URL in the **Evidence** section and hand them the issue URL so
they can drop it in — or, for a shareable link, use the `fw:github-image-upload`
skill (public URLs; never for anything sensitive).

Then report back, in the reporter's language: issue key + URL, category, which
fields you had to mark Unknown, and any duplicate/related links you made.

## Quality bar

Before `create`, re-read the description and confirm:

- someone who has never seen the UI could get to the defect from the **Where**
  section alone;
- **Expected** is stated, not implied;
- no root-cause claim, no proposed fix, no file-level "the bug is in X" —
  observations only (a *suspicion* may live in **Notes**, one line, hedged);
- title names the page or component, not "the UI";
- parent is `$EPIC` and the category label is present.

## Related

- `astryx-fix` — the fixing counterpart. Reach for it when the ask is "fix this",
  not "record this".
- `fw:jira-workflow` — full `$FW_JIRA` command reference.
- FR-3482 — the Ant Design → Astryx migration.
- FR-3486 — an example of a report that outgrew a QA-sized fix and was split out
  of this epic. Reports that clearly need architecture work still get filed here
  first; splitting them out is a triage decision, not a reporting one.
