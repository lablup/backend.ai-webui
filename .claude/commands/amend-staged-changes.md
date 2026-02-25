---
description: Amend staged changes to existing PR and update PR description.
argument-hint: [--update-desc]
model: opus
---

# Amend Staged Changes

Amend staged changes to an existing PR and optionally update the PR description.

## Arguments

The `$ARGUMENTS` specifies optional flags:
- `--update-desc`: Force update PR description even if no new changes

If no argument is provided, PR description will only be updated if there are staged changes.

## Workflow Overview

```
1. Verify existing PR context + analyze staged changes (parallel)
2. Determine strategy: modify (single target) vs absorb (multi target)
3. User confirmation
4. Apply changes + push
5. Update PR description (if requested)
6. Display summary
```

## Detailed Process

### Step 1: Gather Context (all parallel)

Run these commands in a **single parallel batch**:

```bash
# Branch and PR info
git branch --show-current
gh pr view --json number,title,url,body

# Staged changes
git diff --cached

# Stack state + absorb analysis
mcp__graphite__run_gt_cmd with args: ["log", "short"]
mcp__graphite__run_gt_cmd with args: ["absorb", "--dry-run"]
```

**Exit conditions:**
- No PR exists → "Use /submit-staged-changes to create a new Jira issue and PR." → exit
- No staged changes and no `--update-desc` → "No staged changes. Use `--update-desc` to update description only." → exit

### Step 2: Determine Strategy

Parse the `gt absorb --dry-run` output to count distinct target commits.

**Scenario A: Single target (all changes → current commit)**
→ Strategy: `gt modify --all` (fast path, no absorb needed)

**Scenario B: Multiple targets (changes span different commits in stack)**
→ Strategy: `gt absorb` (distributes to appropriate commits)
→ But present both options to user

### Step 3: User Confirmation

**Scenario A (single target) — simplified prompt:**
```
AskUserQuestion({
  questions: [{
    question: "Ready to amend changes to existing PR?",
    header: "Amendment",
    multiSelect: false,
    options: [
      {
        label: "Amend & Push (Recommended)",
        description: "PR: #YYYY - [PR title]\n\nChanges:\n  - file1.ts (modified)\n  - file2.ts (added)\n\nAll changes target the current commit. Will amend and force-push."
      },
      {
        label: "Amend & Update Description",
        description: "Same as above, plus update PR description to reflect new changes"
      },
      {
        label: "Cancel",
        description: "Don't make any changes"
      }
    ]
  }]
})
```

**Scenario B (multiple targets) — full prompt:**
```
AskUserQuestion({
  questions: [{
    question: "How would you like to apply the staged changes?",
    header: "Placement",
    multiSelect: false,
    options: [
      {
        label: "Absorb to Best Fit (Recommended)",
        description: "Distributes changes to the commits where they logically belong:\n\n[summary of dry-run: which hunks → which commits]"
      },
      {
        label: "Amend Current Only",
        description: "Add all changes to current commit only."
      },
      {
        label: "Review Details First",
        description: "Show detailed per-hunk breakdown before deciding."
      },
      {
        label: "Cancel",
        description: "Don't make any changes"
      }
    ]
  }]
})
```

**If user selects "Review Details First":**
Present per-commit breakdown, then re-ask with Absorb/Amend/Cancel options.

### Step 4: Apply Changes + Push

**Single target or "Amend Current Only":**
```
mcp__graphite__run_gt_cmd with args: ["modify", "--all"]
mcp__graphite__run_gt_cmd with args: ["submit", "--stack", "--no-interactive"]
```

**"Absorb to Best Fit":**
```
# gt absorb in non-interactive mode may only dry-run.
# Use gt modify --all as reliable fallback for single-target.
# For multi-target, stage per-commit hunks manually if gt absorb doesn't apply.
mcp__graphite__run_gt_cmd with args: ["absorb"]
```
If absorb output ends with "Dry run complete" (did not apply):
→ Fall back to `gt modify --all` and inform user that all changes went to current commit.
Then push:
```
mcp__graphite__run_gt_cmd with args: ["submit", "--stack", "--no-interactive"]
```

### Step 5: Update PR Description (if requested)

Only when user selected "Amend & Update Description" or used `--update-desc` flag.

**Jira auth is checked here (not earlier):**
```bash
bash scripts/jira.sh myself
```
If auth fails, skip Jira-specific fields but still update PR description.

Extract Jira issue from branch name or PR title (e.g., `FR-XXXX`), then update.

**IMPORTANT**: The `Resolves` link MUST be placed at the TOP of the PR description body.

**GitHub Issue Number**: Get the GitHub Issue number (`#YYYY`) from the Jira issue's "GitHub Issue URL" custom field (`customfield_10169`).

```bash
gh pr edit [PR_NUMBER] --body "$(cat <<'EOF'
Resolves #YYYY ([FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX))

## Summary
- [Original summary points]
- [New changes added in this amendment]

## Test plan
- [ ] [testing steps]
EOF
)"
```

### Step 6: Display Summary

```
Amendment Complete!

Pull Request: #YYYY
  https://github.com/lablup/backend.ai-webui/pull/YYYY

Branch: prefix/FR-XXXX-description

Files Amended:
  - file1.ts (modified)
  - file2.ts (added)

Commit: abc1234 → def5678 (amended)
```

## Error Handling

### No Existing PR
```
No PR Found

Current branch 'branch-name' does not have an associated PR.
Use /submit-staged-changes to create a new Jira issue and PR.
```

### Graphite Sync Issues
If `gt modify` or `gt absorb` fails due to sync:
```
mcp__graphite__run_gt_cmd with args: ["sync"]
```
Then retry.

### Push Conflicts
If `gt submit` fails:
```
Push Failed — resolve conflicts manually:
  git fetch origin
  git rebase origin/main
```

## Important Notes

### Do's
- Run all context-gathering in a single parallel batch (Step 1)
- Use dry-run output to decide strategy BEFORE asking user
- Use `gt modify --all` for single-target (skip absorb entirely)
- Defer Jira auth to Step 5 (only when description update is needed)
- Use Graphite MCP tools for git operations

### Don'ts
- Don't call `gt absorb` when all changes target current commit — use `gt modify --all`
- Don't check Jira auth upfront when it's not needed
- Don't run `git diff --cached --stat` separately (redundant with `git diff --cached`)
- Don't call `gt absorb` after dry-run shows single target — it may only re-run dry-run
- Don't use direct `git push --force` commands

## Comparison with /submit-staged-changes

| Aspect | /submit-staged-changes | /amend-staged-changes |
|--------|------------------------|----------------------|
| Purpose | Create new Jira issue + PR | Update existing PR(s) |
| Jira | Creates new issue | No Jira changes (unless --update-desc) |
| Branch | Creates new branch | Uses current branch/stack |
| Commit | New commit | Amends/absorbs to existing |
| Stack | Single PR | Can affect multiple PRs |
| Use when | Starting new work | Adding to existing work |

## gt absorb vs gt modify

| Aspect | gt absorb | gt modify |
|--------|-----------|-----------|
| Scope | Analyzes entire stack | Current commit only |
| Placement | Auto-determines best commit | Always current commit |
| Use when | Changes span multiple PRs | All changes target current commit |
| Caveat | May only dry-run in non-interactive mode | Always applies reliably |
