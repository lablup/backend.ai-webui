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

### Step 2: Format According to Guidelines
Follow the strict markdown format that categorizes changes by type:

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

**Each item must:**
- Be grouped under the correct category based on its prefix or content
- Show the FR issue number in bold (e.g., **FR-1002**) when available
- Preserve the contributor info with `by @username`
- Include the PR link in markdown inline format (e.g., [#1234](https://...))
- Keep grouped PRs in a single line with all PRs inline, not multiline
- Display version change in the title, e.g., `# What's Changed (v25.10.1 → v25.11.0)`
- Always output in **English**
- Wrap the full output in triple backticks (```) for easy copy-paste

### Step 3: Show Preview and Confirm
1. Display the improved release note format
2. Ask for user confirmation before updating
3. Wait for explicit approval (y/yes/confirm) before proceeding
4. Only update the GitHub release after confirmation

### Step 4: Update Release (After Confirmation)
Use the `gh` command to update the release:
```bash
gh release edit [version] --notes-file /tmp/improved-release-notes.md --repo lablup/backend.ai-webui
```

**Important**: Always show the improved format first and get explicit user confirmation before making any updates to the actual GitHub release.