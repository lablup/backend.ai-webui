---
description: Create or Update BUI Component Story (project)
model: sonnet
---

# Create or Update BUI Component Story

Generate or update Storybook story files for Backend.AI UI (BUI) components.

## Usage

```
/manage-bui-component-story <component-names...>
```

## Arguments

- `component-names`: One or more component names (e.g., `BAIButton BAICard BAIModal`)
  - Can be component names: `BAIButton`
  - Can be full paths: `packages/backend.ai-ui/src/components/BAIButton.tsx`

## Examples

```bash
# Single component
/manage-bui-component-story BAIButton

# Multiple components (batch)
/manage-bui-component-story BAIButton BAICard BAIModal

# With full path
/manage-bui-component-story packages/backend.ai-ui/src/components/BAIButton.tsx
```

## What this command does

For each component:

1. **Locate Component**: Find the component file in `packages/backend.ai-ui/src/components/`
2. **Check Story Existence**: Determine if `.stories.tsx` file exists
3. **Analyze Component**: Read and parse the Props interface
4. **CREATE or UPDATE**:
   - **CREATE**: If no story exists, generate a new story file
   - **UPDATE**: If story exists, sync argTypes with component props

---

## CREATE Mode (No Story Exists)

When the story file doesn't exist:

1. **Analyze Component**: Extract props, types, and functionality
2. **Identify BAI-Specific Props**: Distinguish from inherited Ant Design props
3. **Generate Story File**: Create `.stories.tsx` following CSF 3 format
4. **Create Stories**: Generate Default story with `args` and comparison stories with `render`

**IMPORTANT:** Stories should ONLY demonstrate BAI-specific features, NOT Ant Design's original functionality.

---

## UPDATE Mode (Story Exists)

When the story file already exists:

1. **Parse Component Props**: Extract current props from the component interface
2. **Parse Story argTypes**: Extract current argTypes from the story meta
3. **Compare and Sync**:
   - `+ Added props`: Add new argTypes for props not in story
   - `- Removed props`: Remove argTypes for props no longer in component
   - `~ Changed props`: Update argTypes for props with type changes
4. **Preserve Existing**: Keep existing stories, descriptions, and custom configurations

### UPDATE Rules

```typescript
// Component has new prop 'loading'
// → ADD argType:
loading: {
  control: { type: 'boolean' },
  description: 'Shows loading state',
  table: {
    type: { summary: 'boolean' },
    defaultValue: { summary: 'false' },
  },
},

// Component removed prop 'oldProp'
// → REMOVE from argTypes

// Component changed prop type
// status: 'default' | 'success'  →  'default' | 'success' | 'warning'
// → UPDATE argType:
status: {
  control: { type: 'select' },
  options: ['default', 'success', 'warning'],  // Updated options
  // ...
},
```

---

## Identifying BAI-Specific Props

```typescript
// Example: BAIAlert.tsx
export interface BAIAlertProps extends AlertProps {
  ghostInfoBg?: boolean;  // BAI-specific: NOT in AlertProps
}
// AlertProps (message, type, closable, showIcon, etc.) are NOT BAI-specific
```

**Decision criteria:**
1. Is this prop defined in the BAI component's own interface (not inherited)? → BAI-specific
2. Does this prop have modified behavior compared to Ant Design? → BAI-specific
3. Is this prop just passed through to Ant Design unchanged? → NOT BAI-specific

---

## Story Category

Check existing story files' `title` values to determine the correct category. Use the same category as similar components.

| Category | Components | Title Pattern |
|----------|------------|---------------|
| Alert | BAIAlert, BAIAlertIconWithTooltip | `Alert/[Name]` |
| Board | BAIBoardItemTitle | `Board/[Name]` |
| Button | BAIButton, BAIBackButton, BAIFetchKeyButton | `Button/[Name]` |
| Card | BAICard | `Card/[Name]` |
| Filter | BAIPropertyFilter, BAIGraphQLPropertyFilter | `Filter/[Name]` |
| Flex | BAIFlex | `Flex/[Name]` |
| Input | DynamicUnitInputNumber, DynamicUnitInputNumberWithSlider | `Input/[Name]` |
| Link | BAILink | `Link/[Name]` |
| Modal | BAIModal, BAIConfirmModalWithInput | `Modal/[Name]` |
| Notification | BAINotificationItem | `Notification/[Name]` |
| Row | BAIRowWrapWithDividers | `Row/[Name]` |
| Select | BAISelect | `Select/[Name]` |
| Statistic | BAIStatistic, BAINumberWithUnit, BAIResourceNumberWithIcon, BAIProgressWithLabel | `Statistic/[Name]` |
| Tag | BAITag, BooleanTag, BAIDoubleTag | `Tag/[Name]` |
| Text | BAIText, BAITextHighlighter | `Text/[Name]` |
| Relay Fragment | (components using GraphQL fragments) | `Fragments/[Name]` |

If no existing category fits, create a new one following the `[Category]/[Name]` pattern.

---

## Story File Template

Create the story file at the same location as the component: `BAIButton.tsx` → `BAIButton.stories.tsx`

```typescript
import BAIAlert from './BAIAlert';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIAlert> = {
  title: 'Components/BAIAlert',
  component: BAIAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIAlert** extends [Ant Design Alert](https://ant.design/components/alert).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghostInfoBg\` | \`boolean\` | \`true\` | Info alerts use container background |

For all other props, refer to [Ant Design Alert](https://ant.design/components/alert).
        `,
      },
    },
  },
  argTypes: {
    // BAI-specific props - document fully
    ghostInfoBg: {
      control: { type: 'boolean' },
      description: 'When true, info alerts use container background',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAlert>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    type: 'info',
    message: 'Informational alert with ghost background',
    showIcon: true,
    ghostInfoBg: true,  // BAI-specific prop MUST be included
  },
};

// Comparison story: Use render for multiple components
export const GhostInfoBackground: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIAlert type="info" message="Ghost enabled (default)" ghostInfoBg={true} showIcon />
      <BAIAlert type="info" message="Ghost disabled" ghostInfoBg={false} showIcon />
    </BAIFlex>
  ),
};
```

### For Relay Fragment Components

```typescript
import { graphql, useLazyLoadQuery } from 'react-relay';
import RelayResolver from '../../tests/RelayResolver';

const QueryResolver = () => {
  const { data_node } = useLazyLoadQuery<ComponentStoriesQuery>(
    graphql`
      query ComponentStoriesQuery {
        data_node(id: "test-id") {
          ...ComponentFragment
        }
      }
    `,
    {},
  );
  return data_node && <ComponentName fragmentRef={data_node} />;
};

export const Default: Story = {
  name: 'Basic',
  render: () => (
    <RelayResolver mockResolvers={{ DataNode: () => ({ field: 'value' }) }}>
      <QueryResolver />
    </RelayResolver>
  ),
};
```

---

## Key Rules

1. **Default story**: Use `args` to enable interactive Controls, MUST include BAI-specific props
2. **Comparison stories**: Use `render` for layouts with multiple components
3. **ArgTypes**: Document BAI-specific props fully. Ant Design props used in Default `args` should remain visible (not hidden)
4. **No redundant `name`**: Only use when different from export name (e.g., `Default` → `name: 'Basic'`)
5. **Use BAIFlex**: Not Ant Design's `Space` component
6. **UPDATE preserves**: When updating, preserve existing stories and descriptions

---

## Common Mistake: Creating Stories for Ant Design Props

```typescript
// ❌ BAD: Stories for Ant Design features
export const AllTypes: Story = { ... };  // 'type' is Ant Design prop
export const Closable: Story = { ... };  // 'closable' is Ant Design prop

// GOOD: Only stories for BAI-specific props
export const GhostInfoBackground: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIAlert type="info" message="Ghost enabled" ghostInfoBg={true} />
      <BAIAlert type="info" message="Ghost disabled" ghostInfoBg={false} />
    </BAIFlex>
  ),
};
```

---

## Reference Stories

| Story File | Reference For |
|------------|---------------|
| `BAIFlex.stories.tsx` | Ant Design extension with BAI-specific props |
| `BAICard.stories.tsx` | Ant Design Card extension |
| `BAIPropertyFilter.stories.tsx` | Complex component with interactive stories |
| `BAIGraphQLPropertyFilter.stories.tsx` | BAI-specific component (not extending Ant Design) |

Located in `packages/backend.ai-ui/src/components/`.

---

## Output Report

After processing all components, output a summary:

```markdown
## BUI Story Results

| Component | Action | Path | Status |
|-----------|--------|------|--------|
| BAICard | Created | .../BAICard.stories.tsx | Done |
| BAIModal | Updated | .../BAIModal.stories.tsx | Done |
| BAIFlex | Skipped | .../BAIFlex.stories.tsx | Up-to-date |

### Changes Made
- **BAICard**: Created new story with 3 BAI-specific props
- **BAIModal**: Added `loading` argType, removed `oldProp` argType
```

---

## Notes

- Run Storybook to verify: `cd packages/backend.ai-ui && pnpm run storybook`
- Always include `tags: ['autodocs']` for auto-documentation
- Component base path: `packages/backend.ai-ui/src/components/`
