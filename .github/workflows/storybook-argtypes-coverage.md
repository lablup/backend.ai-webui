---
description: |
  This workflow analyzes React component files to check:
  1. If Storybook story files exist for changed components
  2. If Props are properly documented in story argTypes
  When issues are found, it leaves a PR comment with unified `/bui-story` command suggestions.
  The `/bui-story` command auto-detects whether to create or update story files.

on:
  workflow_dispatch:
  stop-after: +6mo

# NOTE: This workflow is triggered by GitHub Actions (storybook-check.yml)
# when component files are changed in a PR. Do not add pull_request trigger here.

timeout-minutes: 10

permissions:
  contents: read
  pull-requests: read

network: defaults

safe-outputs:
  add-comment:
    target: "*"

tools:
  bash:
  github:
    toolsets: [repos, pull_requests]
---

# Storybook Coverage Checker

## Job Description

You are an AI code reviewer for `${{ github.repository }}`. Your mission: analyze changed React component files and verify:
1. Story files exist for each component
2. Props interfaces are properly documented in Storybook story argTypes

## Target Directory

Focus only on files in `packages/backend.ai-ui/src/components/` directory.

## Analysis Process

### Step 1: Get Changed Files

1. Use GitHub API to get the list of changed files in this pull request
2. Filter for files that:
   - Are in `packages/backend.ai-ui/src/components/`
   - End with `.tsx`
   - Are NOT `.stories.tsx` or `.test.tsx` files
3. If no component files changed, exit with a success message using the `noop` tool

### Step 2: Analyze Each Component

For each changed component file:

1. **Check if story file exists** (same name but `.stories.tsx`):
   - If story file does NOT exist, mark as "missing story"
   - If story file exists, continue to step 2

2. **Read the component file** and extract the Props interface:
   - Look for `interface *Props` or `type *Props`
   - Extract all custom property names (properties directly defined, not inherited)
   - Note JSDoc comments for each property
   - Note the type of each property

3. **Read the story file** and extract argTypes:
   - Look for the `argTypes` object in the `meta` configuration
   - Extract all documented argType keys

4. **Compare and identify gaps**:
   - Find props that exist in the component but NOT in argTypes
   - Exclude common inherited props (like `children`, `className`, `style`, `ref`)

### Step 3: Generate Report

If there are any issues (missing stories OR uncovered props), use the `add_comment` tool to create a PR comment.

**IMPORTANT**: When calling `add_comment`, you MUST specify the `item_number` parameter with the PR number from the github context (available as `pull-request-number` in the system prompt). For example, if the context shows `pull-request-number: #5128`, pass `item_number: 5128`.

Use this format for the comment body:

```markdown
## 📖 Storybook Update Suggestion

### Analysis Results

| Component | Changes | Action |
|-----------|---------|--------|
| `BAICard` | Added `loading` prop | 🔄 Update |
| `BAIModal` | New component | ✨ Create |
| `BAIFlex` | Changed `gap` type | 🔄 Update |

### Commands

**Batch execution:**
\`\`\`
@claude /bui-story BAICard BAIModal BAIFlex
\`\`\`

**Individual execution:**
- \`@claude /bui-story BAICard\`
- \`@claude /bui-story BAIModal\`
- \`@claude /bui-story BAIFlex\`

<details>
<summary><strong>Detailed Changes</strong></summary>

#### BAICard (🔄 Update)
**Component**: `packages/backend.ai-ui/src/components/BAICard.tsx`
**Story**: `packages/backend.ai-ui/src/components/BAICard.stories.tsx`

**Uncovered Props:**
| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `loading` | `boolean` | Yes | Shows loading skeleton |

---

#### BAIModal (✨ Create)
**Component**: `packages/backend.ai-ui/src/components/BAIModal.tsx`
**Story**: Not found - needs creation

**Props to document:**
| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `centered` | `boolean` | Yes | Center modal vertically |
| `destroyOnClose` | `boolean` | Yes | Destroy content on close |

</details>

---

> 📚 [Storybook guidelines](https://github.com/lablup/backend.ai-webui/blob/main/.github/instructions/storybook.instructions.md)
```

## Report Structure

The report uses a unified format with:

1. **Analysis Results** - Table showing all components with their changes and required action
   - ✨ Create: Story file does not exist
   - 🔄 Update: Story exists but props changed
   - ✅ Skip: Story is up to date (do not include in report)

2. **Commands** - Using the unified `/bui-story` command
   - **Batch execution**: `@claude /bui-story Component1 Component2 Component3`
   - **Individual execution**: List each component separately

3. **Detailed Changes** - Collapsible section with detailed prop information

Only include components that need action (Create or Update). Skip components that are already up to date.

## Control Type Inference

When suggesting argTypes in the details, infer the control type based on TypeScript type:

| TypeScript Type | Storybook Control |
|-----------------|-------------------|
| `boolean` | `{ type: 'boolean' }` |
| `string` | `{ type: 'text' }` |
| `number` | `{ type: 'number' }` |
| Union of string literals (e.g., `'a' \| 'b'`) | `{ type: 'select' }, options: ['a', 'b']` |
| `ReactNode`, function types, `Ref` | `false` (no control) |

## Props to Skip

Do not report these common inherited props as missing:
- `children`
- `className`
- `style`
- `ref`
- `key`
- `id`
- `data-*` attributes

## Success Case

If all components have story files AND all custom props are covered in argTypes:
- Use the `noop` tool with a success message
- Do not leave any PR comment

## Error Handling

- If a component file has no Props interface, only check for missing story file
- If parsing fails, log the error and continue with other files
