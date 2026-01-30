---
description: Create Jira issue and submit PR for staged changes in one workflow.
argument-hint: [feat, fix, refactor, style, chore, e2e, docs]
model: claude-sonnet-4-5
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
0. Verify MCP authentication
1. Analyze staged changes
2. Create Jira issue
3. Create branch and commit
4. Submit PR
5. Update Jira issue (sprint, assignee)
6. Display summary
```

## Detailed Process

### Step 0: Verify MCP Authentication

Verify that MCP tools are authenticated before starting the workflow.

```
# Test Atlassian MCP authentication
mcp__Atlassian__atlassianUserInfo

# Test Graphite MCP authentication
mcp__graphite__run_gt_cmd with args: ["--version"]
```

**If authentication fails:**
- Inform the user which MCP service needs re-authentication
- Provide guidance on how to re-authenticate:
  ```
  ⚠️ MCP Authentication Required

  The following MCP service(s) need re-authentication:
  - [ ] Atlassian: Re-authenticate via MCP settings
  - [ ] Graphite: Re-authenticate via MCP settings

  Please re-authenticate and run the command again.
  ```
- Exit the workflow without making any changes

**If authentication succeeds:**
- Proceed to Step 1

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

Use Atlassian MCP tools (refer to `.claude/atlassian-config.md`):

```
mcp__Atlassian__createJiraIssue with:
  - cloudId: a28786f5-5410-4c2d-ae2d-9833cf63eb3f
  - projectKey: FR
  - issueTypeName: Task (or Story/Bug based on content)
  - summary: [issue title without prefix]
  - description: [WHY this work is needed + Expected outcomes]
  - additional_fields: {"customfield_10173": {"id": "10232"}}
```

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

Get current user and active sprint, then update:

```
# Get current user
mcp__Atlassian__atlassianUserInfo

# Get active sprint
mcp__Atlassian__searchJiraIssuesUsingJql with:
  - jql: "project = FR AND sprint in openSprints() ORDER BY created DESC"
  - fields: ["customfield_10020"]

# Update issue
mcp__Atlassian__editJiraIssue with:
  - issueIdOrKey: FR-XXXX
  - fields: {
      "assignee": {"accountId": "[user_account_id]"},
      "customfield_10020": [sprint_id]
    }
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

See `.claude/atlassian-config.md` for:
- Cloud ID: `a28786f5-5410-4c2d-ae2d-9833cf63eb3f`
- Project Key: `FR`
- GitHub Repository field: `customfield_10173` with value `{"id": "10232"}`
- Sprint field: `customfield_10020` (numeric ID only, not array)

## Error Handling

### MCP Authentication Failure
If Atlassian or Graphite MCP authentication fails:
1. Inform the user about the authentication issue
2. Ask them to re-authenticate
3. Retry the failed operation

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
- Always use MCP tools for Jira and Graphite operations
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
