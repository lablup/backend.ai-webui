# Atlassian Configuration Reference

Reference document for Atlassian MCP configuration values. Use this document instead of making repeated API calls to look up field IDs and settings.

## Instance

- **Site**: `lablup.atlassian.net`
- **Cloud ID**: `a28786f5-5410-4c2d-ae2d-9833cf63eb3f`

## Project

- **Default Project Key**: `FR`
- **URL Pattern**: `https://lablup.atlassian.net/browse/FR-{issue_number}`

## Custom Fields

| Field ID | Name | Purpose | Value Format |
|----------|------|---------|--------------|
| `customfield_10020` | Sprint | Sprint assignment | Numeric ID only (e.g., `1570`) |
| `customfield_10173` | GitHub Repository | Link PR repository | `{"id":"10232"}` |

### Field Format Critical Notes

#### Sprint Field (`customfield_10020`)
- **Correct format**: Numeric ID directly - `1570`
- **Wrong format**: Array format - `[1570]` ❌ (causes Bad Request error)

#### Assignee Field
- **Correct format**: `{"accountId": "user_account_id"}`

#### GitHub Repository (`customfield_10173`)
- **Default Value**: `{"id":"10232"}` (backend.ai-webui)

## Default Values for Issue Creation

```json
{
  "project": "FR",
  "customfield_10173": {"id": "10232"}
}
```

## Common JQL Queries

| Purpose | JQL |
|---------|-----|
| Active sprint issues | `project = FR AND sprint in openSprints() ORDER BY created DESC` |
| Specific issue type | `project = FR AND issuetype = Story` |

## Atlassian MCP Tools Reference

| Tool | Purpose |
|------|---------|
| `mcp__Atlassian__createJiraIssue` | Create issue |
| `mcp__Atlassian__editJiraIssue` | Update issue |
| `mcp__Atlassian__getJiraIssue` | Get issue details |
| `mcp__Atlassian__searchJiraIssuesUsingJql` | Search issues with JQL |
| `mcp__Atlassian__atlassianUserInfo` | Get current user info |
| `mcp__Atlassian__getVisibleJiraProjects` | List accessible projects |
| `mcp__Atlassian__getJiraIssueTypeMetaWithFields` | Get issue type field metadata |

## How to Find Sprint ID

To find the active sprint ID:

1. Search for issues in active sprint:
   ```
   mcp__Atlassian__searchJiraIssuesUsingJql
   JQL: "project = FR AND sprint in openSprints() ORDER BY created DESC"
   ```

2. Get sprint field from found issue:
   ```
   mcp__Atlassian__getJiraIssue
   fields: ["customfield_10020"]
   ```

## Tool Usage Rules

**Use Atlassian MCP for ALL Jira operations:**

| Operation | MCP Tool |
|-----------|----------|
| Search/Query | `mcp__Atlassian__searchJiraIssuesUsingJql` |
| Get Details | `mcp__Atlassian__getJiraIssue` |
| Create | `mcp__Atlassian__createJiraIssue` |
| Update | `mcp__Atlassian__editJiraIssue` |
| Get User Info | `mcp__Atlassian__atlassianUserInfo` |

**Authentication**: If MCP authentication fails, re-authenticate and retry.
