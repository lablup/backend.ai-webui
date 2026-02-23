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
0. Verify MCP authentication
1. Verify existing PR context
2. Analyze staged changes with gt absorb --dry-run
3. Determine optimal commit placement (absorb vs amend)
4. User confirmation with absorb analysis
5. Apply changes (absorb or amend)
6. Push updated commits
7. Update PR description (if needed)
8. Display summary
```

## Detailed Process

### Step 0: Verify MCP Authentication (MUST BE FIRST)

> **CRITICAL**: This step MUST be executed BEFORE any other operation. Do NOT skip or defer this step. Do NOT read files, check git status, or perform any other action until MCP authentication is verified.

Verify that Atlassian MCP is authenticated before starting the workflow.

```
# Test Atlassian MCP authentication - THIS MUST BE THE VERY FIRST TOOL CALL
mcp__Atlassian__atlassianUserInfo
```

**If authentication fails:**
- **STOP IMMEDIATELY** - Do not proceed with any other steps
- Inform the user that Atlassian MCP needs re-authentication
- Provide guidance on how to re-authenticate:
  ```
  MCP Authentication Required

  Atlassian MCP needs re-authentication.
  Please re-authenticate via MCP settings and run the command again.
  ```
- Exit the workflow without making any changes

**If authentication succeeds:**
- Proceed to Step 1

### Step 1: Verify Existing PR Context

```bash
# Check current branch
git branch --show-current

# Check if branch has an associated PR
gh pr view --json number,title,url,body

# Check current stack state
mcp__graphite__run_gt_cmd with args: ["log", "short"]

# Check staged changes
git diff --cached --stat
```

**If no PR exists for current branch:**
```
No PR Found

Current branch does not have an associated PR.
Use /submit-staged-changes to create a new Jira issue and PR.
```
- Exit the workflow

**If PR exists:**
- Extract PR number, title, URL, and current body
- Proceed to Step 2

### Step 2: Analyze Changes with gt absorb

```bash
# View staged changes
git diff --cached

# Run gt absorb in dry-run mode to analyze where changes could go
mcp__graphite__run_gt_cmd with args: ["absorb", "--dry-run"]
```

**gt absorb Analysis:**
- `gt absorb` analyzes staged hunks and determines which commits in the stack they logically belong to
- It considers the blame of modified lines to find the original commit that introduced them
- Dry-run shows which changes would go to which commits WITHOUT making changes

**If no staged changes and `--update-desc` not provided:**
```
No Staged Changes

No staged changes to amend. Use --update-desc flag to update PR description only.
Or stage your changes first:
  git add <files>
```
- Exit the workflow

### Step 3: Evaluate Absorb Results

Analyze the `gt absorb --dry-run` output and determine the best approach:

**Scenario A: All changes belong to current commit**
- No cross-PR dependencies
- Simple amend is appropriate

**Scenario B: Changes can be absorbed into different commits**
- Some hunks belong to commits in other PRs in the stack
- Consider separation of concerns between PRs
- Evaluate if absorbing maintains clean PR boundaries

**Scenario C: Mixed - some absorb, some amend**
- Some changes fit better in downstack PRs
- Some changes are new to current PR

**Decision Criteria:**
1. **Separation of Concerns**: Does absorbing maintain clean PR boundaries?
2. **PR Dependencies**: Will absorbing create unintended dependencies?
3. **Review Impact**: How will absorbed changes affect PRs already under review?
4. **Logical Grouping**: Do the changes logically belong together?

### Step 4: User Confirmation with Absorb Analysis

**IMPORTANT**: Present confirmation with detailed absorb analysis:

**If absorb candidates exist:**
```
AskUserQuestion({
  questions: [{
    question: "How would you like to apply the staged changes?",
    header: "Change Placement",
    multiSelect: false,
    options: [
      {
        label: "Absorb to Best Fit (Recommended)",
        description: "gt absorb analysis:\n\n[Absorb dry-run output]\n\nThis distributes changes to the commits where they logically belong, maintaining clean PR separation."
      },
      {
        label: "Amend Current Only",
        description: "Add all changes to current commit only.\nUse when changes are specific to this PR regardless of file history."
      },
      {
        label: "Review Details First",
        description: "Show detailed analysis of each hunk and its target commit before deciding."
      },
      {
        label: "Cancel",
        description: "Don't make any changes"
      }
    ]
  }]
})
```

**If no absorb candidates (all changes for current commit):**
```
AskUserQuestion({
  questions: [{
    question: "Ready to amend changes to existing PR?",
    header: "Confirm Amendment",
    multiSelect: false,
    options: [
      {
        label: "Amend & Push (Recommended)",
        description: "PR: #YYYY - [PR title]\n\nChanges to amend:\n  - file1.ts (modified)\n  - file2.ts (added)\n\nThis will amend the current commit and force-push."
      },
      {
        label: "Amend & Update Description",
        description: "Same as above, plus update PR description with new changes"
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
Present detailed breakdown:
```
Absorb Analysis Details:

Commit abc1234 (PR #1001 - feat: add user settings)
  └── e2e/user/user-settings.spec.ts:45-52 (test fix)

Commit def5678 (PR #1002 - fix: login validation) [CURRENT]
  └── src/components/LoginForm.tsx:23-30 (new code)
  └── src/utils/validation.ts:15-20 (modification)

Commit ghi9012 (PR #1003 - refactor: auth flow)
  └── No changes would be absorbed

Considerations:
- PR #1001 is already approved - absorbing may require re-review
- Changes to user-settings.spec.ts originated from PR #1001's original work
```

### Step 5: Apply Changes

**If user selected "Absorb to Best Fit":**
```
# Apply absorb
mcp__graphite__run_gt_cmd with args: ["absorb"]
```

This will:
- Distribute staged hunks to their logically appropriate commits
- Automatically restack affected branches
- Prepare for pushing multiple PRs if needed

**If user selected "Amend Current Only":**
```
# Amend staged changes to current commit
mcp__graphite__run_gt_cmd with args: ["modify", "--all"]
```

This will:
- Add all staged changes to the current commit
- Keep the existing commit message
- Prepare for pushing

### Step 6: Push Updated Commits

```
# Push amended/absorbed commits (force push)
mcp__graphite__run_gt_cmd with args: ["submit", "--stack", "--no-interactive"]
```

**Note**: If absorb was used, multiple PRs may be updated.

### Step 7: Update PR Description (Optional)

If user selected "Amend & Update Description" or used `--update-desc` flag:

Extract Jira issue from branch name or PR title (e.g., `FR-XXXX`), then update.

**IMPORTANT**: The `Resolves` link MUST be placed at the TOP of the PR description body, before the Summary section. This ensures proper issue tracking and linking.

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

### Step 8: Display Summary

**For Absorb:**
```
Absorb Complete!

Changes distributed across stack:

PR #1001 (feat: add user settings)
  Branch: feat/FR-1001-user-settings
  Files: e2e/user/user-settings.spec.ts
  Commit: abc1234 → abc5678 (amended)

PR #1002 (fix: login validation) [CURRENT]
  Branch: fix/FR-1002-login-validation
  Files: src/components/LoginForm.tsx, src/utils/validation.ts
  Commit: def1234 → def5678 (amended)

All affected PRs have been pushed.
```

**For Simple Amend:**
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
If `gh pr view` fails:
```
No PR Found

Current branch 'branch-name' does not have an associated PR.

Options:
1. Use /submit-staged-changes to create a new Jira issue and PR
2. Manually create a PR first with: gh pr create
```

### Graphite Sync Issues
If `gt absorb` or `gt modify` fails due to sync issues:
```
mcp__graphite__run_gt_cmd with args: ["sync"]
```
Then retry the operation.

### Absorb Conflicts
If `gt absorb` encounters conflicts:
```
Absorb Conflict

Some hunks could not be cleanly absorbed:
  - file.ts:23-30 conflicts with existing changes

Options:
1. Resolve conflicts manually and re-run
2. Use "Amend Current Only" to keep all changes in current commit
```

### Push Conflicts
If `gt submit` fails due to conflicts:
```
Push Failed

There may be conflicts with the remote branch.
Please resolve conflicts manually:
  git fetch origin
  git rebase origin/main
```

## Important Notes

### Do's
- Always run `gt absorb --dry-run` first to analyze change placement
- Consider PR boundaries and separation of concerns
- Confirm with user before making changes, especially when absorbing
- Keep PR description updated with amendment summary
- Use Graphite MCP tools for git operations

### Don'ts
- Never absorb without user confirmation
- Don't absorb into PRs that are already approved without warning
- Don't amend/absorb if no staged changes (unless --update-desc)
- Don't use direct `git push --force` commands
- Don't modify commits that are not part of the current stack

## Usage Examples

```bash
# Amend/absorb staged changes to existing PR(s)
/amend-staged-changes

# Update PR description only (no code changes)
/amend-staged-changes --update-desc
```

## Comparison with /submit-staged-changes

| Aspect | /submit-staged-changes | /amend-staged-changes |
|--------|------------------------|----------------------|
| Purpose | Create new Jira issue + PR | Update existing PR(s) |
| Jira | Creates new issue | No Jira changes |
| Branch | Creates new branch | Uses current branch/stack |
| Commit | New commit | Amends/absorbs to existing |
| Stack | Single PR | Can affect multiple PRs |
| Use when | Starting new work | Adding to existing work |

## gt absorb vs gt modify

| Aspect | gt absorb | gt modify |
|--------|-----------|-----------|
| Scope | Analyzes entire stack | Current commit only |
| Placement | Auto-determines best commit | Always current commit |
| Use when | Changes span multiple PRs | Changes specific to current PR |
| Consideration | Maintains PR separation | Simpler, single-PR focused |
