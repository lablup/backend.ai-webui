---
description: Create BUI Component Story (project)
model: claude-sonnet-4-5
---

# Create BUI Component Story

Generate a Storybook story file for a Backend.AI UI (BUI) component.

## Usage

```
/create-bui-component-story <component-path>
```

## Arguments

- `component-path`: Path to the component file (e.g., `packages/backend.ai-ui/src/components/BAIButton.tsx`)

## What this command does

1. **Analyze Component**: Read the component file and extract props, types, and functionality
2. **Identify BAI-Specific Props**: Distinguish BAI-added/modified props from inherited Ant Design props
3. **Generate Story File**: Create a `.stories.tsx` file following CSF 3 format
4. **Create Stories**: Generate Default story with `args` and comparison stories with `render`

**IMPORTANT:** Stories should ONLY demonstrate BAI-specific features, NOT Ant Design's original functionality.

---

## Step 1: Identify BAI-Specific Props

```typescript
// Example: BAIAlert.tsx
export interface BAIAlertProps extends AlertProps {
  ghostInfoBg?: boolean;  // ✅ BAI-specific: NOT in AlertProps
}
// AlertProps (message, type, closable, showIcon, etc.) are NOT BAI-specific
```

**Decision criteria:**
1. Is this prop defined in the BAI component's own interface (not inherited)? → BAI-specific
2. Does this prop have modified behavior compared to Ant Design? → BAI-specific
3. Is this prop just passed through to Ant Design unchanged? → NOT BAI-specific

## Step 2: Determine Story Category

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

## Step 3: Generate Story File

Create the story file at the same location as the component: `BAIButton.tsx` → `BAIButton.stories.tsx`

### Example: BAIAlert Story

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
    // Ant Design props used in Default args are shown (not hidden)
    // Only hide props if there's a specific reason to do so
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
3. **ArgTypes**: Document BAI-specific props fully. Ant Design props used in Default `args` should remain visible (not hidden). Only hide props if there's a specific reason to do so.
4. **No redundant `name`**: Only use when different from export name (e.g., `Default` → `name: 'Basic'`)
5. **Use BAIFlex**: Not Ant Design's `Space` component

---

## Common Mistake: Creating Stories for Ant Design Props

```typescript
// ❌ BAD: Stories for Ant Design features
export const AllTypes: Story = { ... };  // 'type' is Ant Design prop
export const Closable: Story = { ... };  // 'closable' is Ant Design prop
export const Banner: Story = { ... };    // 'banner' is Ant Design prop

// ✅ GOOD: Only stories for BAI-specific props
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

## Notes

- Run Storybook to verify: `cd packages/backend.ai-ui && pnpm run storybook`
- Always include `tags: ['autodocs']` for auto-documentation
