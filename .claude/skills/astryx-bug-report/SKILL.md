---
name: astryx-bug-report
description: >
  File a UI/UX observation about the Astryx UI into the reporting epic FR-3491
  — capture only, never fix. Classifies it as visual (layout/spacing/color
  drift), behavioral (a component does not work), or discussion (it may be
  intended, or a better alternative is proposed — needs a team decision),
  enforces the minimum context (where + observed + expected, or the open
  question), asks the reporter once for anything missing, does a bounded
  read-only lookup, scans for duplicates and links related reports. Use when
  someone reports something wrong with — or questionable about — the UI and
  wants it recorded rather than fixed: "이거 리포팅해줘", "버그 등록해줘",
  "이 페이지 UI가 틀어졌어", "이 버튼이 안 눌려", "이거 원래 이런 건가요?",
  "이게 맞는 동작인지 논의하고 싶어요", "astryx 버그", "file this UI bug",
  "log this regression", "open a discussion about this UI",
  "/astryx-bug-report". If the ask is to fix it *now*, use `astryx-fix`.
---

# astryx-bug-report — capture an Astryx UI/UX observation

Post-migration QA turns up more defects than anyone can fix one at a time, plus
a steady stream of "is this even wrong?" questions. This skill exists to make
each report **cheap to file and expensive-free to investigate**: it collects
exactly the context a later batch fix — or a later decision — will need, and
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
- launch a browser to reproduce, unless the user explicitly asks for it;
- **settle a discussion report yourself.** Recording "is this intended?" or "we
  should do X instead" is the whole job; ruling on it is the team's. Do not
  answer the question in the issue, and do not downgrade it to "not a bug" and
  drop it.

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

| Category | Issue type | Label | It is this when… | Location is pinned by |
|---|---|---|---|---|
| **Visual** | Bug | `astryx-visual` | spacing, alignment, size, color, typography, border, truncation, overflow, dark-mode drift — it *looks* wrong | the **page** (route + menu path) and the region inside it |
| **Behavioral** | Bug | `astryx-behavior` | no response, wrong state, broken keyboard/focus, stale value, opens/closes wrongly, validation misfires — it *acts* wrong | the **component** and at least one page where it is reachable |
| **Discussion** | Task | `astryx-discussion` | nobody can say it is *wrong* yet: it may be intended and the reporter wants that confirmed, or it works as designed but a better alternative is being proposed — it needs a **decision**, not a fix | whatever the reporter saw it on: a page, a component, or a pattern that recurs across several |

### Bug or discussion?

The dividing line is **whether the expectation is established**, not how
confident the reporter sounds and not how big the change would be.

- The reporter can name what it *should* do, and that comes from somewhere
  outside their preference — a prior release, a design spec, a sibling screen
  that still does it right, a plain functional contract ("a dropdown closes when
  you pick an option") → **Bug** (visual or behavioral).
- The expectation is the thing in question — "is this intended?", "which of
  these two is right?", "I'd rather it worked like X" — → **Discussion**.

Signals in the report itself: "원래 이런 건가요", "이게 맞나요", "의도된 건지",
"이렇게 하는 게 낫지 않나", "is this intended", "should this be…", "I'd prefer",
"we might want to". A bug report states a defect; a discussion asks a question
or makes a proposal.

Two ways to get this wrong, both worth avoiding:

- **Filing a real regression as a discussion** because the reporter hedged
  ("이거 좀 이상한 것 같은데…"). If a prior release or a sibling screen settles
  it, it is a Bug — say so and file it as one.
- **Filing a design proposal as a Bug** because it is easier. That puts a
  decision into a queue that is triaged for fixes, and it gets closed as
  "works as designed" instead of being decided.

If it is genuinely a coin flip after one clarifying question, file it as a
**discussion** — a Task that turns out to be a defect is re-typed in one
command, while a Bug that was never a defect burns triage time.

### Mixed and multiple reports

A report that is both (e.g. "the dropdown is too narrow *and* it does not close
on Escape") is **two issues**, filed separately and linked with `relates`. Say so
before filing.

The same split applies across categories: "the header is 64px tall *and* by the
way, should this even be a table?" is one visual Bug plus one discussion Task,
linked with `relates` — not one issue carrying both.

Several defects reported in one message → one issue each, but batch the intake
questions into a single round.

## Step 2 — Intake gate

These are required. Anything else is a bonus.

**All three categories**

1. **Observed** — what is actually happening/showing *today*. For a discussion
   this is the current behaviour, stated neutrally, not as a complaint.

**Visual, additionally**

2. **Expected** — what should show instead. If the reporter only says "it's
   broken", ask; do not invent the expectation.
3. **Page** — the route or the menu path ("Admin → Users", `/admin/users`).
4. **Region** — which part of the page (card title, table header, modal footer,
   sidebar item). "The page is broken" is not a region.

**Behavioral, additionally**

2. **Expected** — what should happen instead, same rule as above.
3. **Component** — a `BAI*` name, an Astryx name, or a plain description
   ("the project selector in the header") that you can resolve to a file.
4. **A page where it happens** — at least one route where the reporter saw it.

**Discussion, additionally**

2. **The question or the proposal** — stated as one sentence the team can answer
   yes/no or pick a side on. "Is the checkbox intentional here, or should it be
   a switch?" / "Propose: move the refresh button into the card header." A
   discussion with no answerable question is a complaint, and it will sit in the
   epic forever — this field is the one that cannot be `Unknown`.
3. **Why it is being raised** — one line: what made the reporter stop on it
   (inconsistent with another screen, differs from the legacy UI, slows a task,
   looked accidental). This is what a decision-maker needs and it is the field
   reporters most often omit.
4. **Where** — a page, a component, or "several places" with at least one
   concrete example. A discussion may legitimately be about a pattern rather
   than one screen; it still needs one place someone can go look at.

Note what is *not* required for a discussion: **Expected**. If the reporter can
state a settled expectation, re-check Step 1 — it is probably a Bug.

### Asking

Ask **once**, batching every missing field into a single `AskUserQuestion` call
(≤4 questions; use options where the answer is a choice — category, page from
the route list, light/dark/both — and let free text come through "Other").

When the category itself is unclear, make that one of the questions and offer
the three options in the reporter's own terms — "동작이 잘못됐다 / 보이는 게
틀어졌다 / 이게 맞는지 논의하고 싶다" — rather than the label names.

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

**A discussion does not raise the budget.** The temptation is to go and find the
answer — read the component, check `git log` for whether the current shape was
deliberate, compare three sibling screens. That is the decision work, and it
belongs to whoever picks the issue up. Record the question; do not pre-answer
it. The one exception is the cheap version of "where else does this pattern
appear", which is already allowed above and makes the decision's blast radius
visible.

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

Two extra checks when the new report is a **discussion**:

- **An open discussion asking the same question → duplicate**, even when the
  wording differs a lot; two people asking "should this be a switch?" about the
  same control is one decision, not two. Comment the second reporter's reasoning
  onto the existing Task.
- **A *decided* discussion (Done/Closed) that already answered it → do not
  re-file.** Tell the user the decision and point at the key. If they disagree
  with the outcome, that is a new discussion that `relates` to the closed one —
  filed on that basis, not as a fresh question.

And when a discussion turns out to overlap an open **Bug** on the same surface,
link them rather than merging: the fix and the decision have different owners
and different done-conditions.

Related links are for batching, so keep them meaningful: **at most 5** per issue,
and skip a link whose only commonality is "also an Astryx report".

## Step 5 — Create the issue

Title and description in **English** (project rule), whatever language the report
came in. Talk to the reporter in *their* language — the questions in Step 2 and
the wrap-up in Step 6 follow the language they reported in.

**Title (Bug):** `<Page or Component>: <the defect in one line>`

- ✅ `Admin → Users: table header labels overflow their column at ≤1280px`
- ✅ `BAISelect: dropdown stays open after selecting an option (Sessions page)`
- ❌ `UI broken` · ❌ `Fix the user table` (a title is an observation, not a task)

**Title (Discussion):** `<Page, Component, or pattern>: <the question or the
proposal in one line>` — phrased as the question, or as `Proposal: …`.

- ✅ `Admin → Configurations: should boolean settings be switches or checkboxes?`
- ✅ `BAICard: proposal — move the refresh button into the header extra slot`
- ❌ `Checkbox weirdness` (names no decision) · ❌ `Change it to a switch`
  (an instruction, not a question the team can answer)

Description: use the matching template in
`references/issue-templates.md` — read it before writing.

```bash
# Visual / behavioral → a Bug
$FW_JIRA create --type Bug --parent "$EPIC" \
  --title "<title>" \
  --desc "$(cat <path-to-description.md>)" \
  --labels "astryx-report,frontend,astryx-visual"     # or astryx-behavior

# Discussion → a Task, same epic
$FW_JIRA create --type Task --parent "$EPIC" \
  --title "<title>" \
  --desc "$(cat <path-to-description.md>)" \
  --labels "astryx-report,frontend,astryx-discussion"
```

The `astryx-report` label stays on all three, so the epic's queue and every
duplicate scan keep working across categories; the category label and the issue
type are what separate a fix queue from a decision queue.

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

For a discussion, add one line setting the expectation: it is recorded as a
**decision** to be made, not as work queued for a fix, and the reporter is the
person best placed to push it onto a sync agenda if it matters soon.

## Quality bar

Before `create`, re-read the description and confirm:

- someone who has never seen the UI could get to the defect from the **Where**
  section alone;
- **Expected** is stated, not implied (Bug), or **the question is answerable as
  written** (Discussion — read it back as if you had to reply "yes" or "option
  B" to it);
- no root-cause claim, no proposed fix, no file-level "the bug is in X" —
  observations only (a *suspicion* may live in **Notes**, one line, hedged). On
  a discussion, a *proposal* is the point and belongs in **Proposal**, but the
  issue still must not decide the outcome or start listing implementation steps;
- title names the page or component, not "the UI";
- parent is `$EPIC`, the issue type matches the category (Bug / Bug / Task), and
  the category label is present alongside `astryx-report`.

## Related

- `astryx-fix` — the fixing counterpart. Reach for it when the ask is "fix this",
  not "record this". A `astryx-discussion` Task is **not** fix-ready: it goes to
  `astryx-fix` only after the team has answered it, at which point the decision
  is usually written into the Task and either that Task or a spun-off Bug
  carries the work.
- `fw:jira-workflow` — full `$FW_JIRA` command reference.
- FR-3482 — the Ant Design → Astryx migration.
- FR-3486 — an example of a report that outgrew a QA-sized fix and was split out
  of this epic. Reports that clearly need architecture work still get filed here
  first; splitting them out is a triage decision, not a reporting one.
