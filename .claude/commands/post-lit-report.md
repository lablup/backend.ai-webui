---
description: Log post Lit-to-React migration issues (bugs or verification requests) as Jira issues
argument-hint: [--assign 승원] <description of bug or verification need>
model: sonnet
---

# Post Lit-to-React Migration Issue Reporter

Log post-migration problems as Jira issues. Does NOT analyze code or modify files.

## Arguments

`$ARGUMENTS` contains the user's report with an optional assignee.

**Assignee parsing:**

Supported names and their jira.sh values:
| Korean | English | jira.sh `--assignee` value |
|--------|---------|---------------------------|
| 종은 | jongeun | jongeun |
| 승원 | seungwon | seungwon |
| 성철 | sungchul | sungchul |
| 수진 | sujin | sujin |
| 나/me | me | me |

Detection methods (checked in order):
1. **Flag format**: `--assign <name>` at the start → extract name, rest is description
2. **Natural language (Korean)**: patterns like `승원님께 할당`, `승원에게 할당`, `승원 할당` anywhere in text → extract name, remove the assignment phrase
3. **Natural language (English)**: patterns like `assign to seungwon`, `for seungwon` anywhere in text → extract name, remove the assignment phrase
4. **No match**: default to `--assignee me`

Examples:
- `/post-lit-report --assign 승원 PluginLoader sidebar menu 검증 필요`
- `/post-lit-report PluginLoader sidebar menu 검증 필요. 승원님께 할당`
- `/post-lit-report PluginLoader sidebar menu needs checking` (assigns to me)

## Two Issue Types

| Type | When | Jira Type | Extra Label |
|------|------|-----------|-------------|
| **Bug** | Something is clearly broken | Bug | (none) |
| **Verification** | Needs human eyes to confirm correctness | Task | `needs-verification` |

**How to distinguish:**
- Bug: broken, not working, erroring, crashing, missing
- Verification: "not sure if", "needs checking", "verify that", "confirm whether"
- If ambiguous, use `AskUserQuestion` to ask: "Is this broken, or does it need verification?"

## Language Rule

**All Jira issue titles and descriptions MUST be written in English**, regardless of the input language.
If the user writes in Korean or another language, translate the content to English before creating the issue.

## Process

### Step 1: Parse the Report

Extract from `$ARGUMENTS`:
- **Component name** (e.g., LoginView, SessionLauncher)
- **Problem summary** (translate to English if needed)
- **Type** (Bug or Verification)
- **Affected files** (only if the user mentions them — don't go looking)

### Step 2: Duplicate Check

Search Jira for existing issues on the same component:

```bash
bash scripts/jira.sh search "project = FR AND labels = lit-cleanup AND text ~ \"[ComponentName]\" AND statusCategory != Done" --limit 10
```

If duplicates are found, show them as clickable links before asking for confirmation:

```
Found existing issues for [ComponentName]:
- [FR-2099](https://lablup.atlassian.net/browse/FR-2099) — LoginView notification broken (To Do)
```

### Step 3: Confirm Before Creating

Use `AskUserQuestion` to get confirmation. **Show the English-translated title and description** so the user can verify the translation before creation. Include clickable Jira links for any duplicates found.

Format:
```
AskUserQuestion({
  questions: [{
    question: "Create this Jira issue?",
    header: "Jira Issue",
    multiSelect: false,
    options: [
      {
        label: "Create",
        description: "[Type] English Title — labels: lit-cleanup, comp:X\nAssignee: 승원\n\nDescription preview:\n> English description that will be used...\n\nDuplicates: (none)"
      },
      {
        label: "Skip — Duplicate Exists",
        description: "Existing issues cover this:\n- FR-2099: https://lablup.atlassian.net/browse/FR-2099"
      },
      {
        label: "Cancel",
        description: "Don't create the issue"
      }
    ]
  }]
})
```

### Step 4: Create Issue

**For Bug:**
```bash
bash scripts/jira.sh create \
  --type Bug \
  --title "[concise title]" \
  --desc "## Problem
[User's description of the bug]

## Affected Component
[ComponentName]

## Affected Files
[If mentioned by user, otherwise omit this section]

## References
- Epic: Post-migration cleanup (#5364)
- Logged by: post-lit-report" \
  --labels "lit-cleanup,comp:[ComponentName]"
```

**For Verification:**
```bash
bash scripts/jira.sh create \
  --type Task \
  --title "Verify: [what needs checking]" \
  --desc "## What to Verify
[User's description of what needs human confirmation]

## Affected Component
[ComponentName]

## Affected Files
[If mentioned by user, otherwise omit this section]

## References
- Epic: Post-migration cleanup (#5364)
- Logged by: post-lit-report" \
  --labels "lit-cleanup,needs-verification,comp:[ComponentName]"
```

Then assign and set sprint (use the parsed assignee name or default to `me`):
```bash
bash scripts/jira.sh update FR-XXXX --assignee [name_or_me] --sprint current
```

**If `--sprint current` fails** (e.g., no active sprint), retry without it:
```bash
bash scripts/jira.sh update FR-XXXX --assignee [name_or_me]
```
Do not treat sprint failure as a blocking error. Note it in the summary.

### Step 5: Summary

Show the created issues with clickable Jira links (format: `[FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX)`):

```
Created:
| Key | Type | Title | Assignee | Labels |
|-----|------|-------|----------|--------|
| [FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX) | Bug | LoginView notification broken | 승원 | lit-cleanup, comp:LoginView |

(Sprint: assigned / or "Sprint: skipped — no active sprint")

Next: Run `/fiber-do FR-XXXX` to fix bugs. Verification tasks need manual checking.
```

## Labels

- `lit-cleanup` — Always. Groups all post-migration issues.
- `comp:[ComponentName]` — Always. Groups issues by component.
- `needs-verification` — Only for verification tasks.
