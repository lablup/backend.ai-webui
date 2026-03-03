---
description: Create a Jira issue for Git changes
argument-hint: [stage, pr, branch, commit]
model: sonnet
---

# Create a Jira issue for Git Changes

Create a Jira issue based on **Git changes** by following these instructions:

## Arguments
This command accept $ARGUMENTS to specify the type of changes to analyze:
- `stage` - Analyze staged changes
- `pr` - Analyze changes in current graphite stack up to current branch
- `branch` - Analyze all changes in current branch
- `commit` - Analyze changes in the latest commit

## Instructions

### Change Detection
Based on the argument provided:
- **stage**: Use `git diff --cached` to get staged changes
- **pr**: Use Graphite MCP tool `mcp__graphite__run_gt_cmd` with args `["parent"]` to find the parent branch of current branch, then use `git diff <parent-branch>...HEAD` to get changes in current branch only
- **branch**: Use `git diff main...HEAD` to get all branch changes
- **commit**: Use `git diff HEAD~1..HEAD` to get latest commit changes

### Jira Issue Creation
- **IMPORTANT**: The issue description should explain **WHY** this work is needed (background, purpose, motivation), **NOT HOW** to do it (implementation details, step-by-step instructions).
- **Keep descriptions CONCISE**: Aim for 3-5 sentences per section, focusing only on essential information
- Focus on:
  - The problem or need that triggered this work
  - Expected outcomes or goals
- Do **NOT** include:
  - Implementation steps or "how to do it" instructions
  - Detailed lists of file changes or code modifications
  - Technical execution details (these belong in the PR description)
  - Repetitive or redundant information
- Whenever possible, follow the recommended Jira title and description format for Story, Task, or Bug issues.
- Please determine the appropriate Jira issue type (Story, Task, or Bug) based on the content.

### Description Format (Recommended)
Use this concise format:
```
[One-line summary of what this task does and why it matters]

## Why This Work is Needed

[2-3 sentences explaining the problem or need]

## Expected Outcomes

- [Key outcome 1]
- [Key outcome 2]
- [Key outcome 3]
```

**Example of Good (Concise) Description:**
```
Standardize Claude Code CLI user interaction patterns and enhance React development guidelines for improved developer experience and code quality.

## Why This Work is Needed

Current Claude Code commands use inconsistent text-based prompts ("Proceed? [y/n]") instead of modern structured UI components. React guidelines also need updates for current best practices.

## Expected Outcomes

- Consistent button-based user confirmation across all Claude Code commands
- Updated React development guidelines with modern patterns
- Improved developer productivity and reduced errors
```

### User Confirmation (REQUIRED)
- **Before creating the Jira issue, you MUST use the `AskUserQuestion` tool to get user confirmation**
- Display the issue content in a readable format within the question options
- Provide structured options for the user to:
  1. Confirm and create the issue (recommended option)
  2. Edit the title or description
  3. Cancel the operation
- Example format:
  ```
  AskUserQuestion({
    questions: [{
      question: "Ready to create this Jira issue?",
      header: "Confirm Issue",
      multiSelect: false,
      options: [
        {
          label: "Yes, Create Issue (Recommended)",
          description: "Type: Task\nTitle: Your title here\nDescription: Your description here..."
        },
        {
          label: "Edit Details",
          description: "Modify the issue details before creating"
        },
        {
          label: "Cancel",
          description: "Don't create the issue"
        }
      ]
    }]
  })
  ```
- **IMPORTANT**: Jira issue titles should only contain the actual description without prefixes like `feat`, `fix`, or `(FR-XXXX)`. These prefixes belong in PR titles, not Jira issue titles.
- **Do NOT create the issue without user confirmation through AskUserQuestion**
- Only proceed with creation after user selects the confirmation option

### Issue Creation
- Use `scripts/jira.sh` for all Jira operations:
  ```bash
  # Create issue
  bash scripts/jira.sh create --type "Task" --title "[title]" --desc "[description]"

  # Update issue (assignee, sprint)
  bash scripts/jira.sh update FR-XXXX --assignee me --sprint current
  ```
- Project key (FR), GitHub repo field, and other required fields are handled internally by the script.
- After creating the issue, open it in your browser to review using `open` cli command.

## Usage Examples
- `/create-jira-issue-for-stage` - Create issue based on recent chat.
- `/create-jira-issue-for-stage stage` - Create issue for staged changes
- `/create-jira-issue-for-stage pr` - Create issue for current graphite stack changes
- `/create-jira-issue-for-stage branch` - Create issue for all branch changes
- `/create-jira-issue-for-stage commit` - Create issue for latest commit changes