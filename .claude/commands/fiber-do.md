---
description: Implement a single Jira issue in an isolated worktree. Produces a verified branch ready for review.
argument-hint: FR-XXXX
model: opus
---

# Implement Single Issue

Implement Jira issue `$ARGUMENTS` in an isolated worktree. Verify with `scripts/verify.sh`. Report results — do NOT create PR or merge.

## Process

### 1. Load Issue

```bash
bash scripts/jira.sh get $ARGUMENTS
```

If jira.sh fails, ask the user to paste the issue details.

### 2. Execute in Worktree

Launch a single Task agent with worktree isolation:

```
Task({
  subagent_type: "general-purpose",
  isolation: "worktree",
  mode: "bypassPermissions",
  prompt: [issue details + implementation instructions below]
})
```

**Worker instructions:**

1. Read and understand ALL affected files before changing anything
2. Implement the changes described in the issue
3. Follow project conventions (CLAUDE.md): `'use memo'`, BAI components, Relay fragment architecture, useBAILogger
4. For `needs-backend` / `api-partial`: build full UI + hooks with stubs marked `// TODO(needs-backend): FR-XXXX - [description]`
5. Run `bash scripts/verify.sh` and fix any failures
6. Stage all changes with `git add`
7. Report: files changed, verify.sh output, any concerns

### 3. Review Results

After the worker finishes, present a summary:

```
## FR-XXXX: [Title]

### Changed Files
- react/src/components/Foo.tsx (+25/-10)
- react/src/hooks/useFoo.ts (+15/-0)

### Verification Results
- Relay: PASS
- Lint: PASS
- Format: PASS
- TypeScript: PASS

### Key Changes
- [bullet points of what changed and why]

### Worktree
Branch: [branch-name]
Path: [worktree-path]

Review the branch and let me know if you'd like to create a PR.
```

### 4. PR Creation (only if user requests)

If the user requests PR creation:

```bash
# From worktree directory
git add -A
```

```
mcp__graphite__run_gt_cmd: ["create", "--all", "--message", "prefix(FR-XXXX): description"]
mcp__graphite__run_gt_cmd: ["submit"]
```

Then update PR body and add labels:
```bash
gh pr edit [PR_NUMBER] --body "$(cat <<'EOF'
Resolves #YYYY (FR-XXXX)

## Summary
- [changes]

## Verification
scripts/verify.sh: ALL PASS

## Test plan
- [ ] [manual test steps if needed]

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --repo lablup/backend.ai-webui

gh pr edit [PR_NUMBER] --add-label "claude-batch" --repo lablup/backend.ai-webui
```

Add comment to Jira issue:
```bash
bash scripts/jira.sh comment FR-XXXX "PR created: [PR URL]"
```

## Error Handling

- **verify.sh fails**: Show the failure output. Ask user whether to fix or stop.
- **jira.sh fails**: Proceed without Jira. Note the issue key for manual update later.
- **Worker fails**: Show error details. Do NOT retry automatically.
