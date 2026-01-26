---
description: |
  This workflow analyzes React component files to check if their Props are properly documented
  in Storybook story argTypes. When props are added or modified but not reflected in stories,
  it leaves a PR comment with analysis results and Claude commands to fix them.

on:
  pull_request:
    types: [ready_for_review, opened, synchronize]
  workflow_dispatch:
  stop-after: +6mo

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

# Storybook ArgTypes Coverage Checker

## Job Description

You are an AI code reviewer for `${{ github.repository }}`. Your mission: analyze changed React component files and verify that their Props interfaces are properly documented in Storybook story argTypes.

## Target Directory

Focus only on files in `packages/backend.ai-ui/src/components/` directory.

## Analysis Process

### Step 1: Get Changed Files

1. Use GitHub API to get the list of changed files in this pull request
2. Filter for files that:
   - Are in `packages/backend.ai-ui/src/components/`
   - End with `.tsx`
   - Are NOT `.stories.tsx` or `.test.tsx` files
3. If no component files changed, exit with a success message

### Step 2: Analyze Each Component

For each changed component file:

1. **Read the component file** and extract the Props interface:
   - Look for `interface *Props` or `type *Props`
   - Extract all custom property names (properties directly defined, not inherited)
   - Note JSDoc comments for each property
   - Note the type of each property

2. **Read the corresponding story file** (same name but `.stories.tsx`):
   - Look for the `argTypes` object in the `meta` configuration
   - Extract all documented argType keys

3. **Compare and identify gaps**:
   - Find props that exist in the component but NOT in argTypes
   - Exclude common inherited props that don't need documentation (like `children`, `className`, `style`, `ref`)

### Step 3: Generate Report

If there are uncovered props, create a PR comment with this format:

```markdown
### Storybook ArgTypes Coverage Report

The following components have props that are not documented in their story's `argTypes`:

| Component | Props Interface | Uncovered Props |
|-----------|-----------------|-----------------|
| BAICard | `BAICardProps` | `newProp`, `anotherProp` |

---

### Details

<details>
<summary><strong>ComponentName</strong> - N uncovered prop(s)</summary>

**Component**: `packages/backend.ai-ui/src/components/ComponentName.tsx`
**Story**: `packages/backend.ai-ui/src/components/ComponentName.stories.tsx`

**Uncovered Props:**
| Prop | Type | Optional | Description |
|------|------|----------|-------------|
| `propName` | `string` | Yes | JSDoc description |

**Suggested argTypes to add:**

\`\`\`typescript
argTypes: {
  propName: {
    control: { type: 'text' },
    description: 'Description here',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'undefined' },
    },
  },
}
\`\`\`

**Fix with Claude:**
\`\`\`
@claude ComponentName.stories.tsx에 다음 props의 argTypes를 추가해줘:
- propName: string
\`\`\`

</details>

---

> [Storybook guidelines](https://github.com/lablup/backend.ai-webui/blob/main/.github/instructions/storybook.instructions.md)
```

## Control Type Inference

When suggesting argTypes, infer the control type based on TypeScript type:

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

If all custom props in changed components are covered in argTypes:
- Do not leave any comment
- If a previous comment from this workflow exists, consider it resolved

## Error Handling

- If a component file has no Props interface, skip it
- If a story file doesn't exist, note it but don't fail (existing `storybook-check.yml` handles missing stories)
- If parsing fails, log the error and continue with other files
