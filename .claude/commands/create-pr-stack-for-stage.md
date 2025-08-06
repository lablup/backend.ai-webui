# Create a PR Stack for Staged Changes

Create a new graphite stack branch for currently staged changes, following the project's commit message patterns and workflow.

The associated Jira issue is specified by `$ARGUMENTS`.

- The input can be a Jira issue key, such as `FR-1234`.
- If only a number is provided, it is assumed to be from the `FR` project.
- If a link is provided, the issue key will be extracted from the link.

## Process

1. **Analyze current staged changes**
   - Check `git status` to see staged files
   - Review `git diff --cached` to understand changes
   - Determine appropriate commit message based on changes

2. **Create new stack branch**
   - Use `gt branch create <branch-name>` following naming convention
   - Branch names: `feat/FR-XXXX-description` or `fix/FR-XXXX-description`

3. **Commit with proper message format**
   - Follow pattern: `prefix(FR-XXXX): description (#PR-number)`
   - Prefixes based on change type:
     - `feat`: New features or improvements
     - `fix`: Bug fixes  
     - `refactor`: Code refactoring
     - `style`: Design/UI changes
     - `chore`: Other maintenance tasks

4. **Submit for review**
   - **IMPORTANT**: Always ask for user confirmation before running `gt stack submit`
   - Review commit message and changes with user first
   - Use `gt stack submit` to create PR only after confirmation

5. **After submit**
- Please update PR description based on jira issue and changes of PR
- Ensure PR description includes `Resolves #YYYY ([FR-XXXX](https://lablup.atlassian.net/browse/FR-XXXX))` on top. (YYYY is a number of "GitHub Issue URL" custom filed in related Jira item)

6. **Update Jira issue after PR creation**
   - If Sprint is empty, find and assign it to the currently active (open) sprint in the FR project
   - If Assignee is empty, assign it to the current Jira MCP connected account
   - Use Atlassian MCP commands to update the issue:
     ```
     # First, get current user info for assignee
     mcp__Atlassian__atlassianUserInfo
     
     # Search for issues in active sprint to find the sprint ID
     mcp__Atlassian__searchJiraIssuesUsingJql with JQL:
     "project = FR AND sprint in openSprints() ORDER BY created DESC"
     
     # Get sprint ID from existing issue in active sprint
     mcp__Atlassian__getJiraIssue with fields: ["customfield_10020"]
     
     # Update both assignee and sprint in single call (CORRECT FORMAT)
     mcp__Atlassian__editJiraIssue with fields:
     {
       "assignee": {"accountId": "user_account_id"},
       "customfield_10020": sprint_id
     }
     ```

   **CRITICAL Field Format Notes**:
   - Sprint field (`customfield_10020`): Use **numeric ID directly** (e.g., `1570`)
   - **NEVER use array format** `[1570]` - this causes Bad Request error
   - Assignee field: Use object format `{"accountId": "account_id"}`
   - Both fields can be updated in a single API call with correct formats

## Example Workflow
```bash
# Check staged changes
git status
git diff --cached

# Create new branch for staged changes
gt create feat/FR-1234-implement-feature  -m "feat(FR-1234): implement new feature functionality"

# IMPORTANT: Ask user for confirmation before submitting
# Review changes and commit message with user first
# Then submit stack for review
gt stack submit
```

## Commit Message Examples
Based on recent patterns:
- `feat(FR-1277): synchronize service launcher form with url params`
- `fix(FR-1282): modify service name rule validation logic`
- `refactor(FR-1232): Dashboard suspense handling`
- `style(FR-1257): fix broken UI of create session panel`
- `chore(FR-1153): replace CPU and MEM icons in React`

## Notes
- Always check that staged changes are logically related
- Use descriptive commit messages explaining the purpose
- Follow graphite stacked PR strategy for related changes
- Link to Jira issue when available
- **NEVER run `gt submit` or `gt stack submit` without user confirmation**
- Always present the planned commit message and changes for review first
- Do not include "Claude Code sign"