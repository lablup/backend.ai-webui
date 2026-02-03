---
description: Amend staged changes to existing PR and update PR description.
argument-hint: [--update-desc]
model: claude-sonnet-4-5
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
2. Amend changes to current commit
3. Push updated commit
4. Update PR description (if needed)
5. Display summary
```

## Detailed Process

### Step 0: Verify MCP Authentication (MUST BE FIRST)

> **⚠️ CRITICAL**: This step MUST be executed BEFORE any other operation. Do NOT skip or defer this step. Do NOT read files, check git status, or perform any other action until MCP authentication is verified.

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
  ⚠️ MCP Authentication Required

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
⚠️ No PR Found

Current branch does not have an associated PR.
Use /submit-staged-changes to create a new Jira issue and PR.
```
- Exit the workflow

**If PR exists:**
- Extract PR number, title, URL, and current body
- Proceed to Step 2

### Step 2: Analyze Changes

```bash
# View staged changes
git diff --cached

# View current commit message
git log -1 --format="%B"
```

- Review staged changes to understand what's being amended
- If no staged changes and `--update-desc` not provided:
  ```
  ℹ️ No Staged Changes

  No staged changes to amend. Use --update-desc flag to update PR description only.
  Or stage your changes first:
    git add <files>
  ```
  - Exit the workflow

### Step 3: User Confirmation

**IMPORTANT**: Present confirmation before making changes:

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

### Step 4: Amend Commit

```
# Amend staged changes to current commit
mcp__graphite__run_gt_cmd with args: ["modify", "--all"]
```

This command:
- Adds staged changes to the current commit
- Keeps the existing commit message
- Prepares for pushing

### Step 5: Push Updated Commit

```
# Push amended commit (force push)
mcp__graphite__run_gt_cmd with args: ["submit"]
```

### Step 6: Update PR Description (Optional)

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

### Step 7: Display Summary

Present a clear summary:

```
✅ Amendment Complete!

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
⚠️ No PR Found

Current branch 'branch-name' does not have an associated PR.

Options:
1. Use /submit-staged-changes to create a new Jira issue and PR
2. Manually create a PR first with: gh pr create
```

### Graphite Sync Issues
If `gt modify` fails due to sync issues:
```
mcp__graphite__run_gt_cmd with args: ["sync"]
```
Then retry the modify operation.

### Push Conflicts
If `gt submit` fails due to conflicts:
```
⚠️ Push Failed

There may be conflicts with the remote branch.
Please resolve conflicts manually:
  git fetch origin
  git rebase origin/main
```

## Important Notes

### Do's
- Always verify PR exists before amending
- Confirm with user before force-pushing
- Keep PR description updated with amendment summary
- Use Graphite MCP tools for git operations

### Don'ts
- Never amend without user confirmation
- Don't amend if no staged changes (unless --update-desc)
- Don't use direct `git push --force` commands
- Don't modify commits that are not the HEAD of the current branch

## Usage Examples

```bash
# Amend staged changes to existing PR
/amend-staged-changes

# Update PR description only (no code changes)
/amend-staged-changes --update-desc
```

## Comparison with /submit-staged-changes

| Aspect | /submit-staged-changes | /amend-staged-changes |
|--------|------------------------|----------------------|
| Purpose | Create new Jira issue + PR | Update existing PR |
| Jira | Creates new issue | No Jira changes |
| Branch | Creates new branch | Uses current branch |
| Commit | New commit | Amends existing commit |
| Use when | Starting new work | Adding to existing work |
