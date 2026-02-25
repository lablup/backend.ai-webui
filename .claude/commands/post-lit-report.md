---
description: Log post Lit-to-React migration issues (bugs or verification requests) as Jira issues
argument-hint: [--assign 승원] <description of bug or verification need>
model: sonnet
---

# Post Lit-to-React Migration Issue Reporter

Log post-migration problems as Jira issues. Does NOT analyze code or modify files.

## Arguments

`$ARGUMENTS` contains the user's report, optionally prefixed with `--assign <name>`.

**Assignee parsing:**
- If `$ARGUMENTS` starts with `--assign <name>`, extract the name and use it for `--assignee` in jira.sh.
- Supported names: `종은`/`jongeun`, `승원`/`seungwon`, `성철`/`sungchul`, `수진`/`sujin`, `me`
- If no `--assign`, default to `--assignee me`.
- The remaining text after `--assign <name>` is the issue description.

Examples:
- `/post-lit-report --assign 승원 PluginLoader sidebar menu 검증 필요`
- `/post-lit-report PluginLoader sidebar menu 검증 필요` (assigns to me)

## Two Issue Types

| Type | When | Jira Type | Extra Label |
|------|------|-----------|-------------|
| **Bug** | Something is clearly broken | Bug | (none) |
| **Verification** | Needs human eyes to confirm correctness | Task | `needs-verification` |

**How to distinguish:**
- Bug: broken, not working, erroring, crashing, missing
- Verification: "not sure if", "needs checking", "verify that", "confirm whether"
- If ambiguous, use `AskUserQuestion` to ask: "Is this broken, or does it need verification?"

## Process

### Step 1: Parse the Report

Extract from `$ARGUMENTS`:
- **Component name** (e.g., LoginView, SessionLauncher)
- **Problem summary** (in the user's words)
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

Use `AskUserQuestion` to get confirmation. Include clickable Jira links for any duplicates found in the description.

Format:
```
AskUserQuestion({
  questions: [{
    question: "Create these Jira issues?",
    header: "Post-Migration Issues",
    multiSelect: false,
    options: [
      {
        label: "Create All",
        description: "1. [Bug] Title — comp:X\n2. [Task] Verify: Title — comp:Y, needs-verification\n\nDuplicates: (none)"
      },
      {
        label: "Skip — Duplicate Exists",
        description: "Existing issues cover this:\n- FR-2099: https://lablup.atlassian.net/browse/FR-2099"
      },
      {
        label: "Cancel",
        description: "Don't create any issues"
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

Then assign and set sprint (use the name from `--assign` or default to `me`):
```bash
bash scripts/jira.sh update FR-XXXX --assignee [name_or_me] --sprint current
```

### Step 5: Summary

Show the created issues with clickable Jira links (format: `[FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX)`):

```
Created:
| # | Key | Type | Title | Assignee | Labels |
|---|-----|------|-------|----------|--------|
| 1 | [FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX) | Bug | LoginView notification broken | 승원 | lit-cleanup, comp:LoginView |
| 2 | [FR-YYYY](https://lablup.atlassian.net/browse/FR-YYYY) | Task | Verify: SessionLauncher env passing | 승원 | lit-cleanup, needs-verification, comp:SessionLauncher |

Next: Run `/fiber-do FR-XXXX` to fix bugs. Verification tasks need manual checking.
```

## Labels

- `lit-cleanup` — Always. Groups all post-migration issues.
- `comp:[ComponentName]` — Always. Groups issues by component.
- `needs-verification` — Only for verification tasks.
