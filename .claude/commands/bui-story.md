---
description: Create or Update BUI Component Story (auto-detect)
model: claude-sonnet-4-5
---

# BUI Story - Unified Storybook Command

Automatically create or update Storybook story files for Backend.AI UI (BUI) components.

## Usage

```bash
# Single component
/bui-story BAICard

# Multiple components (batch processing)
/bui-story BAICard BAIModal BAIFlex

# With full path
/bui-story packages/backend.ai-ui/src/components/BAICard.tsx
```

## Arguments

- `<ComponentName>` or `<component-path>`: One or more component names or paths
  - Component names: `BAICard`, `BAIModal`, `BAIFlex`
  - Full paths: `packages/backend.ai-ui/src/components/BAICard.tsx`

## What this command does

For each component:

1. **Find Component File**: Locate the component in `packages/backend.ai-ui/src/components/`
2. **Auto-Detect Action**:
   - Story file does NOT exist → **Create** new story
   - Story file exists → **Update** with missing argTypes
3. **Analyze Component**: Extract props interface and BAI-specific features
4. **Generate/Update Story**: Following CSF 3 format and project conventions
5. **Report Results**: Summary table of all processed components

---

## Implementation

### Step 1: For Each Component

```
FOR EACH component IN arguments:
  1. Find component file path
  2. Check if .stories.tsx exists
  3. IF NOT exists:
       → Run CREATE flow
     ELSE:
       → Run UPDATE flow
  4. Add to results
```

### Step 2: Find Component File

Search order:
1. `packages/backend.ai-ui/src/components/{ComponentName}.tsx`
2. `packages/backend.ai-ui/src/components/{ComponentName}/{ComponentName}.tsx`
3. `packages/backend.ai-ui/src/components/**/{ComponentName}.tsx`

If argument is a full path, use it directly.

### Step 3: CREATE Flow (Story Does Not Exist)

Follow the same logic as `/create-bui-component-story`:

1. **Analyze Component**: Read the component file and extract props, types, and functionality
2. **Identify BAI-Specific Props**: Distinguish BAI-added/modified props from inherited Ant Design props
3. **Generate Story File**: Create a `.stories.tsx` file following CSF 3 format
4. **Create Stories**: Generate Default story with `args` and comparison stories with `render`

**Example Output:**
```typescript
import BAICard from './BAICard';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAICard extends Ant Design Card with status indicators and extra features.
 */
const meta: Meta<typeof BAICard> = {
  title: 'Components/BAICard',
  component: BAICard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAICard** extends [Ant Design Card](https://ant.design/components/card).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`status\` | \`'default' \\| 'success' \\| 'warning' \\| 'error'\` | \`'default'\` | Visual status indicator |
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error'],
      description: 'Visual status affecting border color',
      table: {
        type: { summary: "'default' | 'success' | 'warning' | 'error'" },
        defaultValue: { summary: 'default' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAICard>;

export const Default: Story = {
  name: 'Basic',
  args: {
    title: 'Card Title',
    status: 'default',
    children: 'Card content',
  },
};
```

### Step 4: UPDATE Flow (Story Exists)

Follow the same logic as `/enhance-component-docs`:

1. **Read Component File**: Extract current Props interface
2. **Read Existing Story File**: Extract current argTypes
3. **Compare and Find Gaps**: Identify props not in argTypes
4. **Update argTypes**: Add missing props with proper control types
5. **Preserve Existing Content**: Do not overwrite existing stories or descriptions

**Props to Skip** (common inherited props):
- `children`, `className`, `style`, `ref`, `key`, `id`
- `data-*` attributes
- Props inherited from Ant Design that are not modified

**Control Type Inference:**

| TypeScript Type | Storybook Control |
|-----------------|-------------------|
| `boolean` | `{ type: 'boolean' }` |
| `string` | `{ type: 'text' }` |
| `number` | `{ type: 'number' }` |
| `'a' \| 'b' \| 'c'` (union literals) | `{ type: 'select' }, options: ['a', 'b', 'c']` |
| `ReactNode`, function types, `Ref` | `false` (no control) |

### Step 5: Report Results

After processing all components, display a summary:

```markdown
## 📖 BUI Story Results

| Component | Action | Path | Status |
|-----------|--------|------|--------|
| BAICard | ✨ Create | packages/backend.ai-ui/src/components/BAICard.stories.tsx | ✅ Success |
| BAIModal | 🔄 Update | packages/backend.ai-ui/src/components/BAIModal.stories.tsx | ✅ Success |
| BAIFlex | ⏭️ Skip | packages/backend.ai-ui/src/components/BAIFlex.stories.tsx | Already up to date |
| BAIUnknown | ❌ Error | - | Component not found |
```

---

## Reference Documents

- **Storybook Guidelines**: `.github/instructions/storybook.instructions.md`
- **Create Story**: `.claude/commands/create-bui-component-story.md`
- **Enhance Docs**: `.claude/commands/enhance-component-docs.md`

## Reference Stories

| Story File | Reference For |
|------------|---------------|
| `BAIFlex.stories.tsx` | Ant Design extension with BAI-specific props |
| `BAICard.stories.tsx` | Ant Design Card extension |
| `BAIPropertyFilter.stories.tsx` | Complex component with interactive stories |
| `BAIGraphQLPropertyFilter.stories.tsx` | BAI-specific component (not extending Ant Design) |

Located in `packages/backend.ai-ui/src/components/`.

---

## Key Rules

1. **Auto-Detect**: Automatically determine create vs update based on story file existence
2. **BAI-Specific Focus**: Only document BAI-added/modified props, not Ant Design originals
3. **CSF 3 Format**: Always use Component Story Format 3 with TypeScript
4. **Preserve Existing**: When updating, preserve existing stories and descriptions
5. **Batch Support**: Process multiple components in a single command
6. **Error Handling**: Continue processing other components if one fails

---

## Notes

- Run Storybook to verify: `cd packages/backend.ai-ui && pnpm run storybook`
- Always include `tags: ['autodocs']` for auto-documentation
- Use `BAIFlex` for layouts, not Ant Design's `Space` component
