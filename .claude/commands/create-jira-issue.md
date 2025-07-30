
# Create a Jira issue for Git Changes

Create a Jira issue based on **Git changes** by following these instructions:

## Arguments
This command accept"$ARGUMENTS" to specify the type of changes to analyze:
- `stage` - Analyze staged changes
- `pr` - Analyze changes in current graphite stack up to current branch
- `branch` - Analyze all changes in current branch
- `commit` - Analyze changes in the latest commit

## Instructions

### Change Detection
Based on the argument provided:
- **stage**: Use `git diff --cached` to get staged changes
- **pr**: Use `gt parent` to find the parent branch of current branch, then use `git diff <parent-branch>...HEAD` to get changes in current branch only
- **branch**: Use `git diff main...HEAD` to get all branch changes  
- **commit**: Use `git diff HEAD~1..HEAD` to get latest commit changes

### Jira Issue Creation
- You do **not** have to include a summary of changed files or key modifications in the issue description. Instead, focus on describing the background or purpose for which a PR is needed.
- Whenever possible, follow the recommended Jira title and description format for Story, Task, or Bug issues.
- Please determine the appropriate Jira issue type (Story, Task, or Bug) based on the content.
- **Before creating the Jira issue, display the issue content (title, description, type) in a readable format on screen for user review**
- Use the "Atlassian MCP" command to create a Jira issue of proper type.
- Default values:
  - Jira Project: **FR**
  - GitHub Repository (`customfield_10173`): The PR to resolve this issue should be created in this repository.
    - Default: `{"id":"10232"}` (backend.ai-webui)
- After creating the issue, open it in your browser to review using `open` cli command.

## Usage Examples
- `/create-jira-issue-for-stage` - Create issue based on recent chat.
- `/create-jira-issue-for-stage stage` - Create issue for staged changes
- `/create-jira-issue-for-stage pr` - Create issue for current graphite stack changes
- `/create-jira-issue-for-stage branch` - Create issue for all branch changes
- `/create-jira-issue-for-stage commit` - Create issue for latest commit changes