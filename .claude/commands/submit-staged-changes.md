---
description: Create Jira issue and submit PR for staged changes in one workflow.
argument-hint: [feat, fix, refactor, style, chore, e2e, docs]
model: opus
---

# Submit Staged Changes

Create a Jira issue and submit a PR for staged changes in a single, streamlined workflow.

## Arguments

The `$ARGUMENTS` specifies the commit prefix type:
- `feat`: New features or improvements
- `fix`: Bug fixes
- `refactor`: Code refactoring
- `style`: Design/UI changes
- `chore`: Other maintenance tasks
- `e2e`: Add E2E test cases
- `docs`: Documentation changes

If no argument is provided, the prefix will be inferred from the changes.

## Workflow Overview

```
1. Analyze staged changes
2. Create Jira issue
3. Create branch and commit
4. Submit PR
5. Update Jira issue (sprint, assignee)
6. Display summary
```

## Detailed Process

### Step 1: Pre-flight Checks

```bash
# Verify staged changes exist
git diff --cached --stat

# Check current stack state
mcp__graphite__run_gt_cmd with args: ["log", "short"]

# Sync with trunk
mcp__graphite__run_gt_cmd with args: ["sync"]
```

If no staged changes exist, inform the user and exit.

### Step 2: Analyze Changes

- Review `git diff --cached` to understand changes
- Determine appropriate:
  - Commit prefix (from argument or inferred)
  - Issue title (concise, no prefix)
  - Issue description (WHY, not HOW)
  - PR summary

### Step 3: User Confirmation (Single Prompt)

**IMPORTANT**: Present all information in ONE confirmation prompt:

```
AskUserQuestion({
  questions: [{
    question: "Ready to create Jira issue and submit PR?",
    header: "Confirm Submission",
    multiSelect: false,
    options: [
      {
        label: "Create Issue & Submit PR (Recommended)",
        description: "Jira Issue:\n  Type: Task\n  Title: [issue title]\n\nPR:\n  Branch: prefix/FR-XXXX-description\n  Commit: prefix(FR-XXXX): description\n\nFiles:\n  - file1.ts\n  - file2.ts"
      },
      {
        label: "Edit Details",
        description: "Modify title, description, or prefix before proceeding"
      },
      {
        label: "Cancel",
        description: "Don't create anything"
      }
    ]
  }]
})
```

### Step 4: Create Jira Issue

```bash
bash scripts/jira.sh create \
  --type "Task" \
  --title "[issue title without prefix]" \
  --desc "[WHY this work is needed + Expected outcomes]"
```

The script handles project key, GitHub repo custom field, and other required fields internally. Capture the issue key (first line of output) for subsequent steps.

### Step 5: Create Branch and Commit

```
mcp__graphite__run_gt_cmd with args: ["create", "--all", "--message", "prefix(FR-XXXX): description"]
```

**Branch Naming Convention**:
- Pattern: `prefix/FR-XXXX-short-description`
- Examples: `feat/FR-1234-add-user-api`, `fix/FR-1234-null-check`

If branch name is auto-generated incorrectly, rename it:
```
mcp__graphite__run_gt_cmd with args: ["branch", "rename", "correct-branch-name"]
```

### Step 6: Submit PR

```
mcp__graphite__run_gt_cmd with args: ["submit"]
```

### Step 7: Update PR Description

Use `gh pr edit` to set the PR description.

**IMPORTANT**: The `Resolves` link MUST be placed at the TOP of the PR description body, before the Summary section. This ensures proper issue tracking and linking.

**GitHub Issue Number**: After creating the Jira issue, a GitHub issue is automatically created via Jira automation. Get the GitHub Issue number (`#YYYY`) from the Jira issue's "GitHub Issue URL" custom field (`customfield_10169`).

```bash
gh pr edit [PR_NUMBER] --body "$(cat <<'EOF'
Resolves #YYYY ([FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX))

## Summary
- [bullet points of changes]

## Test plan
- [ ] [testing steps]
EOF
)"
```

### Step 8: Update Jira Issue

```bash
bash scripts/jira.sh update FR-XXXX --assignee me --sprint current
```

### Step 9: Display Summary

Present a clear summary:

```
✅ Submission Complete!

Jira Issue: FR-XXXX
  https://lablup.atlassian.net/browse/FR-XXXX

Pull Request: #YYYY
  https://github.com/lablup/backend.ai-webui/pull/YYYY

Branch: prefix/FR-XXXX-description

Files Changed:
  - file1.ts
  - file2.ts
```

## Jira Issue Guidelines

### Title
- Concise description of what the work accomplishes
- NO prefixes (feat, fix, etc.) - these belong in commit messages only
- Example: "Improve user CRUD E2E tests with Page Object Model"

### Description Format
```
[One-line summary]

## Why This Work is Needed

[2-3 sentences explaining the problem or need]

## Expected Outcomes

- [Key outcome 1]
- [Key outcome 2]
- [Key outcome 3]
```

### Issue Type Selection
- **Task**: Small, distinct pieces of work (default)
- **Story**: User-facing features with clear user value
- **Bug**: Fixing incorrect behavior

## Configuration Reference

Jira configuration (project key, custom fields) is hardcoded in `scripts/jira.sh`.
Auth: `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN` in env vars or `~/.config/atlassian/credentials`.

## Error Handling

### Jira Authentication Failure
If `scripts/jira.sh` fails with auth error:
1. Check `~/.config/atlassian/credentials` exists and has valid token
2. Token can be generated at https://id.atlassian.com/manage-profile/security/api-tokens
3. Exit the workflow - user must fix credentials and run the command again

### No Staged Changes
If `git diff --cached` returns empty:
```
No staged changes found. Please stage your changes first:
  git add <files>
```

### Branch Name Conflicts
If branch creation fails due to naming conflict:
1. Use `gt branch rename` to use a unique name
2. Or checkout existing branch and modify

## Important Notes

### Do's
- Use `scripts/jira.sh` for Jira operations, Graphite MCP for git operations
- Confirm with user before creating anything
- Keep Jira descriptions focused on WHY, not HOW
- Update sprint and assignee after issue creation

### Don'ts
- Never create issues or PRs without user confirmation
- Don't include implementation details in Jira descriptions
- Don't use `lj` CLI or direct `gt` commands
- Don't skip the sync step before creating branches

## Usage Examples

```bash
# Submit staged changes as a feature
/submit-staged-changes feat

# Submit staged changes as a bug fix
/submit-staged-changes fix

# Submit staged changes (prefix auto-detected)
/submit-staged-changes
```
