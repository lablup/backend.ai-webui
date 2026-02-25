---
description: Create a PR Stack and link to Jira issue.
argument-hint: [FR-1234, https://lablup.atlassian.net/browse/FR-1234]
model: sonnet
---

# Create a PR Stack for Staged Changes

Create a new graphite stack branch for currently staged changes, following the project's commit message patterns and Graphite best practices.

The associated Jira issue is specified by `$ARGUMENTS`.

- The input can be a Jira issue key, such as `FR-1234`.
- If only a number is provided, it is assumed to be from the `FR` project.
- If a link is provided, the issue key will be extracted from the link.

## Graphite Best Practices

### Why Stacked PRs?
- **Smaller, focused PRs**: Each PR should address a distinct part of the feature (tens or hundreds of lines, not thousands)
- **Parallel development**: Continue working while previous PRs are in review
- **Faster reviews**: Reviewers can give feedback one piece at a time
- **Clear history**: Each PR has a clear purpose, making reverts and debugging easier

### Key Principles
- Break large changes into **logical, reviewable chunks**
- Each PR in the stack should be **independently understandable**
- Stack PRs when changes are **dependent**; create separate stacks for **independent** changes
- Keep trunk (`main`) up-to-date with regular `gt sync`

## Process

### 1. Pre-flight Checks
Before creating a new stack branch:
```
# Check current stack state
mcp__graphite__run_gt_cmd with args: ["log", "short"]

# Sync with trunk to avoid conflicts later
mcp__graphite__run_gt_cmd with args: ["sync"]
```

### 2. Analyze Current Staged Changes
- Check `git status` to see staged files
- Review `git diff --cached` to understand changes
- **Evaluate if changes should be split** into multiple PRs for better reviewability
- Determine appropriate commit message based on changes

### 3. Create New Stack Branch
Use Graphite MCP to create a branch stacked on the current branch:
```
mcp__graphite__run_gt_cmd with args: ["create", "--all", "--message", "commit message"]
```

**Branch Naming** (auto-generated from commit message):
- Pattern: `username/prefix-jira-description`
- Examples: `user/feat-fr-1234-add-user-api`, `user/fix-fr-1234-null-check`

### 4. Commit Message Format
Follow conventional commit format with Jira issue reference:
```
prefix(FR-XXXX): description
```

**Prefixes:**
- `feat`: New features or improvements
- `fix`: Bug fixes
- `refactor`: Code refactoring
- `style`: Design/UI changes
- `chore`: Other maintenance tasks
- `e2e`: Add E2E test cases

### 5. Submit for Review (REQUIRES USER CONFIRMATION)

**IMPORTANT**: Use `AskUserQuestion` tool to get user confirmation before submitting.

Present the following information for review:
- Branch name and commit message
- Files changed
- Current stack structure

Example confirmation format:
```
AskUserQuestion({
  questions: [{
    question: "Ready to submit this PR stack?",
    header: "Confirm Submit",
    multiSelect: false,
    options: [
      {
        label: "Submit Current Branch Only (Recommended)",
        description: "Branch: feat/FR-1234-description\nCommit: feat(FR-1234): description\n\nVia MCP: gt submit"
      },
      {
        label: "Submit Entire Stack",
        description: "Submit all branches in the current stack\nVia MCP: gt submit --stack"
      },
      {
        label: "Edit Commit Message",
        description: "Modify the commit message before submitting"
      },
      {
        label: "Cancel",
        description: "Don't submit yet"
      }
    ]
  }]
})
```

**Submit Commands:**
- Single branch: `mcp__graphite__run_gt_cmd with args: ["submit"]`
- Entire stack: `mcp__graphite__run_gt_cmd with args: ["submit", "--stack"]`

### 6. After Submit
- Update PR description based on Jira issue and changes
- Ensure PR description includes: `Resolves #YYYY ([FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX))`
  - YYYY is the GitHub Issue number from Jira's "GitHub Issue URL" custom field

### 7. Update Jira Issue
Use `scripts/jira.sh` for Jira updates:
```bash
# Assign to current user and active sprint
bash scripts/jira.sh update FR-XXXX --assignee me --sprint current
```

## Stack Management Commands

### Viewing Stack Structure
```
# View current stack as a tree
mcp__graphite__run_gt_cmd with args: ["log"]

# Concise list view
mcp__graphite__run_gt_cmd with args: ["log", "short"]
# or
mcp__graphite__run_gt_cmd with args: ["ls"]
```

### Navigating the Stack
```
# Interactive branch picker
mcp__graphite__run_gt_cmd with args: ["checkout"]

# Go to stack top (tip-most branch)
mcp__graphite__run_gt_cmd with args: ["top"]

# Go to stack bottom (closest to trunk)
mcp__graphite__run_gt_cmd with args: ["bottom"]

# Move up/down one level
mcp__graphite__run_gt_cmd with args: ["up"]
mcp__graphite__run_gt_cmd with args: ["down"]
```

### Updating a PR (Mid-Stack Changes)
When you need to update a PR that has children stacked on it:
```
# Checkout the branch to modify
mcp__graphite__run_gt_cmd with args: ["checkout", "branch-name"]

# Make your changes, then amend (auto-restacks children)
mcp__graphite__run_gt_cmd with args: ["modify", "--all"]

# Or add a new commit instead of amending
mcp__graphite__run_gt_cmd with args: ["modify", "--commit", "--all", "--message", "fix: address review feedback"]

# Push updates
mcp__graphite__run_gt_cmd with args: ["submit", "--stack"]
```

### Syncing with Trunk
Run regularly to stay up-to-date and avoid conflicts:
```
mcp__graphite__run_gt_cmd with args: ["sync"]
```

This command:
- Fetches and updates local `main` from remote
- Rebases all open PR branches onto new `main`
- Offers to delete merged/closed branches

### Handling Conflicts
If `gt sync` or `gt restack` encounters conflicts:
```
# 1. Resolve conflicts in your editor
# 2. Stage the fixes
git add <resolved-files>

# 3. Continue the operation
mcp__graphite__run_gt_cmd with args: ["continue"]

# Or abort if needed
mcp__graphite__run_gt_cmd with args: ["abort"]
```

### Reordering PRs in a Stack
```
# Opens editor to reorder branches
mcp__graphite__run_gt_cmd with args: ["reorder"]
```

### Inserting a PR Mid-Stack
```
# Create a new branch between current and its child
mcp__graphite__run_gt_cmd with args: ["create", "--insert", "--all", "--message", "commit message"]
```

### Moving a Branch to Different Parent
```
mcp__graphite__run_gt_cmd with args: ["move", "--onto", "target-branch"]
```

## Commit Message Examples
Based on recent patterns:
- `feat(FR-1277): synchronize service launcher form with url params`
- `fix(FR-1282): modify service name rule validation logic`
- `refactor(FR-1232): Dashboard suspense handling`
- `style(FR-1257): fix broken UI of create session panel`
- `chore(FR-1153): replace CPU and MEM icons in React`

## Important Notes

### Do's
- Break large features into multiple small, focused PRs
- Run Graphite sync regularly via `mcp__graphite__run_gt_cmd` to stay current with trunk
- Use the Graphite modify command via `mcp__graphite__run_gt_cmd` to update commits (auto-restacks children)
- Use the Graphite log command via `mcp__graphite__run_gt_cmd` to visualize your stack structure
- Consider reviewability when deciding PR boundaries

### Don'ts
- **NEVER** run submit commands without user confirmation
- Don't create mega-PRs with thousands of lines
- Don't let stacks get too deep (3-5 PRs is usually manageable)
- Don't include "Claude Code sign" in commits
- Don't use direct `gt` CLI commands; use `mcp__graphite__run_gt_cmd` MCP tool

### Authentication & Tools
- Use `mcp__graphite__run_gt_cmd` for all Graphite operations
- Use `scripts/jira.sh` for all Jira operations
- Auth: `~/.config/atlassian/credentials` or `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN` env vars