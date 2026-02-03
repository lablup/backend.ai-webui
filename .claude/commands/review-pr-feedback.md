---
description: Review PR feedback, summarize meaningful comments, apply fixes, and resolve threads.
argument-hint: [PR_NUMBER]
model: opus
---

# Review PR Feedback

Analyze PR review comments, summarize meaningful feedback, apply necessary fixes, and resolve review threads.

## Arguments

The `$ARGUMENTS` specifies the PR number to review. If not provided, uses the current branch's PR.

## Workflow Overview

```
1. Fetch PR review comments
2. Analyze and categorize feedback
3. Present summary to user
4. Apply approved fixes
5. Resolve review threads
```

## Detailed Process

### Step 1: Fetch PR Information

```bash
# Get current branch if no PR number provided
git branch --show-current

# Get PR details
gh pr view [PR_NUMBER] --json number,title,url

# Get review comments (inline comments)
gh api repos/lablup/backend.ai-webui/pulls/[PR_NUMBER]/comments --jq '.[] | {id: .id, path: .path, line: .line, body: .body, user: .user.login}'
```

### Step 2: Analyze and Categorize Feedback

Categorize each review comment into:

| Category | Description | Action |
|----------|-------------|--------|
| **Code Fix Required** | Valid issue that needs code change | Apply fix |
| **Documentation Update** | Wording or clarity improvements | Apply fix |
| **Convention Alignment** | Misalignment with project conventions | Evaluate and fix |
| **Future Work** | Valid but for future implementation | Acknowledge in reply |
| **Clarification Needed** | Comment misunderstands the intent | Explain in reply |
| **Not Applicable** | Comment doesn't apply to this context | Explain in reply |

### Step 3: Present Summary to User

Present a clear summary table:

```markdown
## PR #XXXX Review Summary

| # | File | Category | Summary | Recommendation |
|---|------|----------|---------|----------------|
| 1 | file.ts:42 | Code Fix | Description | Apply fix |
| 2 | file.ts:100 | Not Applicable | Description | Explain: [reason] |
| 3 | other.ts:20 | Future Work | Description | Acknowledge |
```

Then ask user for approval:

```
AskUserQuestion({
  questions: [{
    question: "How would you like to proceed with the review feedback?",
    header: "Review Action",
    multiSelect: false,
    options: [
      {
        label: "Apply recommended fixes & resolve all",
        description: "Apply code fixes for items marked 'Apply fix' and resolve all threads with appropriate replies"
      },
      {
        label: "Review each item individually",
        description: "Go through each comment one by one for approval"
      },
      {
        label: "Only resolve threads (no code changes)",
        description: "Add replies and resolve threads without making code changes"
      },
      {
        label: "Cancel",
        description: "Don't make any changes"
      }
    ]
  }]
})
```

### Step 4: Apply Fixes

For each approved fix:

1. Read the relevant file
2. Make the necessary edit
3. Stage the changes

```bash
git add [modified_files]
```

### Step 5: Amend and Push (if code changes made)

```
mcp__graphite__run_gt_cmd with args: ["modify", "--all"]
mcp__graphite__run_gt_cmd with args: ["submit", "--no-interactive"]
```

### Step 6: Reply to Comments

For each comment, add an appropriate reply:

```bash
# Reply to a review comment
gh api repos/lablup/backend.ai-webui/pulls/[PR_NUMBER]/comments/[COMMENT_ID]/replies -f body="[REPLY_MESSAGE]"
```

**Reply Templates by Category:**

| Category | Reply Template |
|----------|---------------|
| Code Fix Applied | "Good point. Fixed in the latest commit." |
| Documentation Updated | "Updated the wording as suggested." |
| Convention Aligned | "Updated to align with [convention_name]." |
| Future Work | "[Feature] is planned for future implementation. This change focuses on [current scope]." |
| Clarification | "[Explanation of intent/design decision]" |
| Not Applicable | "[Reason why this doesn't apply to current context]" |

### Step 7: Resolve Review Threads

Get thread IDs and resolve them:

```bash
# Get review thread IDs
gh api graphql -f query='
query {
  repository(owner: "lablup", name: "backend.ai-webui") {
    pullRequest(number: [PR_NUMBER]) {
      reviewThreads(first: 50) {
        nodes {
          id
          isResolved
        }
      }
    }
  }
}'

# Resolve threads (batch mutation)
gh api graphql -f query='
mutation {
  t1: resolveReviewThread(input: {threadId: "THREAD_ID_1"}) { thread { isResolved } }
  t2: resolveReviewThread(input: {threadId: "THREAD_ID_2"}) { thread { isResolved } }
  ...
}'
```

### Step 8: Display Summary

```
✅ Review Feedback Processed!

PR: #XXXX - [PR Title]
  https://github.com/lablup/backend.ai-webui/pull/XXXX

Actions Taken:
  - Code fixes applied: X
  - Comments replied: Y
  - Threads resolved: Z

Changes:
  - [file1.ts]: [description of fix]
  - [file2.ts]: [description of fix]
```

## Common Review Categories

### Copilot Reviews

GitHub Copilot often comments on:
- **Convention mismatches**: File extensions, directory structure
- **Absolute language**: "Never", "Always" that may be too strict
- **Example inconsistencies**: Variable names, code snippets
- **Missing context**: Comments that miss project-specific context

**Handling Copilot Reviews:**
1. Evaluate if the suggestion improves the code
2. Check if it aligns with project conventions
3. For project-specific decisions, explain the reasoning
4. Apply valid improvements, explain intentional deviations

### Human Reviews

For human reviewer comments:
1. Prioritize addressing all concerns
2. Ask for clarification if needed
3. Provide detailed explanations for design decisions
4. Be open to alternative approaches

## Error Handling

### No Reviews Found
```
ℹ️ No Review Comments

PR #XXXX has no review comments to process.
```

### API Rate Limiting
If GitHub API rate limited:
1. Wait and retry
2. Process in smaller batches

## Usage Examples

```bash
# Review current branch's PR
/review-pr-feedback

# Review specific PR
/review-pr-feedback 5229
```

## Important Notes

### Do's
- Read each comment carefully before categorizing
- Preserve original intent when making fixes
- Provide clear explanations for design decisions
- Batch resolve threads for efficiency

### Don'ts
- Don't dismiss valid feedback without explanation
- Don't make unrelated changes while fixing reviews
- Don't resolve threads without replying first
- Don't change architectural decisions without discussion
