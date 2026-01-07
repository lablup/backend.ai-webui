---
model: claude-sonnet-4-5
---

# Improve Release Note

Improve GitHub release notes by fetching the specified release and formatting it according to the project's preferred markdown format with proper categorization.

**Usage**: `/improve-release-note [version-tag-or-release-url]`

**Examples**:
- `/improve-release-note v25.11.0`
- `/improve-release-note https://github.com/lablup/backend.ai-webui/releases/tag/v25.11.0`

## Instructions

You are an assistant that helps improve and format GitHub release notes for the `lablup/backend.ai-webui` repository. 

### Step 1: Fetch Release Data
- If given a version tag (e.g., `v25.11.0`), fetch the release from the GitHub repository
- If given a release URL, extract the version and fetch the corresponding release
- Use the `gh` command to get release information: `gh release view [version] --repo lablup/backend.ai-webui`

### Step 2: Analyze and Group Related Changes
Before formatting, analyze the PRs to understand their purpose:
- Review PR descriptions and linked Jira issues for context
- Use `gh pr view [PR_NUMBER] --repo lablup/backend.ai-webui --json title,body,labels` to get detailed information
- Group related changes within each category based on their purpose and impact
- Check Jira issues when needed for additional context

### Step 3: Format According to Guidelines
Follow the markdown format that categorizes and groups changes:

**Categories with emojis:**
- ✨ Features (`feat`)
- 🐛 Bug Fixes (`fix`)
- 🔨 Refactoring (`refactor`)
- 🛠 Chores (`chore`)
- 🌐 i18n (`i18n`)
- 🧪 E2E Tests (`test`)
- 🎨 Style (`style`)
- 🙌 New Contributors
- 🚑 Hotfix (`hotfix`)
- 📝 Documentation (`docs`)
- ⚡ Performance (`perf`)
- 🔧 Miscellaneous (`misc`)

**Formatting requirements:**
- **Group related items** within each category (e.g., "AI & Development", "File Management")
- **Add contextual descriptions** (1-2 sentences) for each group explaining the changes and their impact
- Show the FR issue number in bold (e.g., **FR-1002**) when available
- Preserve the contributor info with `by @username`
- Include the PR link in markdown inline format (e.g., [#1234](https://...))
- Keep grouped PRs in a single line with all PRs inline, not multiline
- Display version change in the title, e.g., `# What's Changed (v25.10.1 → v25.11.0)`
- Always output in **English**
- **Avoid exaggerated claims** like "5x faster" or "60% reduction" - use factual, professional language
- Wrap the full output in triple backticks (```) for easy copy-paste

**Example format:**
```markdown
## ✨ Features

### AI & Development Experience Enhancements
Enhanced integration with Claude Code and AI development tools. Added Backend.AI platform documentation skill for Claude Code and upgraded AI SDK to v5 with improved message handling.

- **FR-1697**: add a claude skill references the backend.ai docs by @nowgnuesLee in [#4669](...)
- **FR-1463**: upgrade AI SDK to v5 by @agatha197 in [#4697](...)
```

### Step 4: User Confirmation (REQUIRED)

**IMPORTANT**: Use `AskUserQuestion` tool to get user confirmation, NOT text-based prompts.

1. Display the improved release note format
2. Use `AskUserQuestion` to present options
3. Example format:
   ```
   AskUserQuestion({
     questions: [{
       question: "Update GitHub release with this improved format?",
       header: "Confirm Update",
       multiSelect: false,
       options: [
         {
           label: "Yes, Update Release (Recommended)",
           description: "Version: v25.11.0\nChanges: Formatted and grouped by category\nRun: gh release edit"
         },
         {
           label: "Edit Content",
           description: "Make additional changes to the release notes"
         },
         {
           label: "Cancel",
           description: "Don't update the release"
         }
       ]
     }]
   })
   ```
4. Only proceed to Step 5 after user selects the first option

### Step 5: Update Release (After Confirmation)
Use the `gh` command to update the release:
```bash
gh release edit [version] --notes-file /tmp/improved-release-notes.md --repo lablup/backend.ai-webui
```

**Important**: Never update the GitHub release without explicit user confirmation through `AskUserQuestion`.