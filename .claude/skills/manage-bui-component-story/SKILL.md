---
name: manage-bui-component-story
description: Create or Update BUI Component Story (project)
model: sonnet
disable-model-invocation: true
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
2. **Identify BAI-Specific Props**: Distinguish them from props inherited from the base the wrapper extends
3. **Generate Story File**: Create `.stories.tsx` following CSF 3 format
4. **Create Stories**: Generate Default story with `args` and comparison stories with `render`

**IMPORTANT:** Stories should ONLY demonstrate what *this wrapper* adds — not the behavior it merely forwards to the component it wraps.

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

First find out **what the component extends**. Per
`.claude/rules/component-props-extension.md` the base is whatever the wrapper
actually renders, and it varies:

| Base | Example |
|---|---|
| An Astryx primitive's props | `BAITabListProps extends Omit<TabListProps, 'ref'>` (`@astryxdesign/core/TabList`) |
| A DOM props type | `BAICardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' \| 'color' \| 'children'>` |
| Another BUI wrapper's props | `BAIListAlertProps extends Omit<BAIAlertProps, 'description'>` |
| A third-party props type | `BAILinkProps extends Omit<LinkProps, 'to'>` (react-router-dom) |
| **Nothing — standalone** | `BAIAlertProps`, `BAIBadgeProps`, `BAIModalProps` |

That last row is common and matters here. Several wrappers restate a frozen,
antd-**shaped** prop surface inline so hundreds of call sites kept compiling
through the Astryx migration — the vocabulary outlived the library
(`.claude/rules/antd-v6-props.md`). `BAIAlertProps`, for instance, is a
standalone interface that declares `type`, `title`, `message` (documented as the
deprecated alias for `title`), `showIcon`, `closable`, `banner`, `action` and
`ghostInfoBg` itself — none of them "inherited".

**Decision criteria:**
1. Is the prop the reason this wrapper exists — a behavior, layout or default
   the base doesn't have? → **document it fully**
2. Does the wrapper change the prop's meaning versus the base (renamed,
   narrowed, re-typed)? → **document it fully**
3. Is the prop forwarded to the base unchanged? → not story-worthy
4. Is the prop accepted-and-ignored (a compatibility no-op, e.g. `BAIAlert`'s
   `ghostInfoBg` since the Astryx conversion, or `BAIModal`'s `centered` /
   `draggable`)? → **say so in one line** and do not build a story that
   pretends to demonstrate it

Read the component's file header before writing: the migration records these
decisions as `PILOT-DECISION` notes right there.

---

## Story Category

Check existing story files' `title` values to determine the correct category. Use the same category as similar components.

| Category | Components | Title Pattern |
|----------|------------|---------------|
| Alert | BAIAlert, BAIAlertIconWithTooltip, BAIListAlert | `Alert/[Name]` |
| Badge | BAIBadge, BAIAuditLogStatusTag, BAISchedulingResultBadge | `Badge/[Name]` |
| Board | BAIBoardItemTitle | `Board/[Name]` |
| Button | BAIButton, BAIBackButton, BAIFetchKeyButton | `Button/[Name]` |
| Card | BAICard | `Card/[Name]` |
| Filter | BAIPropertyFilter, BAIGraphQLPropertyFilter | `Filter/[Name]` |
| Flex | BAIFlex | `Flex/[Name]` |
| Input | BAICheckbox, BAIUncontrolledInput, BAIDynamicUnitInputNumber, BAIDynamicStepInputNumber, BAIDynamicUnitInputNumberWithSlider | `Input/[Name]` |
| Link | BAILink | `Link/[Name]` |
| Modal | BAIModal, BAIDeleteConfirmModal, BAIBulkErrorModal | `Modal/[Name]` |
| Navigation | BAITabList | `Navigation/[Name]` |
| Notification | BAINotificationItem | `Notification/[Name]` |
| Row | BAIRowWrapWithDividers | `Row/[Name]` |
| Select | BAISelect, BAIComplexSelect, BAIAllowedHostNamesSelect, BAIProjectResourceGroupSelect | `Select/[Name]` |
| Statistic | BAIStatistic, BAINumberWithUnit, BAIResourceNumberWithIcon, BAIProgressWithLabel, ResourceStatistics, TotalFooter | `Statistic/[Name]` |
| Table | BAITableAstryx, BAINameActionCell | `Table/[Name]` |
| Tag | BAITag, BAIBooleanTag, BAIDoubleTag, BAITagList | `Tag/[Name]` |
| Text | BAIId, BAIText, BAITextHighlighter | `Text/[Name]` |
| Tooltip | BAIQuestionIconWithTooltip | `Tooltip/[Name]` |
| Utility | BAIIntervalView, BAIUnmountAfterClose | `Utility/[Name]` |
| Relay Fragment | (components using GraphQL fragments) | `Fragments/[Name]` |

If no existing category fits, create a new one following the `[Category]/[Name]`
pattern. Grep the existing `title:` values first — a couple of one-off
categories (`Components/`, `Data Display/` vs `DataDisplay/`) exist by accident;
don't propagate them.

---

## Story File Template

Create the story file at the same location as the component: `BAIButton.tsx` → `BAIButton.stories.tsx`

This template mirrors the shipped `BAIListAlert.stories.tsx` — a wrapper that
specializes another BUI component (`Omit<BAIAlertProps, 'description'>`) and
adds two props of its own.

```typescript
import BAIFlex from './BAIFlex';
import BAIListAlert from './BAIListAlert';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIListAlert> = {
  title: 'Alert/BAIListAlert',
  component: BAIListAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIListAlert** extends **BAIAlert**.

It renders a standardized \`ul\` list inside the alert description — used to
summarize a list of items (e.g. selected resources) inside a modal. The list
scrolls vertically once it exceeds \`maxHeight\`, so the modal never grows
unbounded.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`Array<{ key?: React.Key; content: ReactNode }>\` | — | List entries rendered as \`li\` elements |
| \`maxHeight\` | \`CSSProperties['maxHeight']\` | \`165\` | Max height before the list scrolls |

For all other props, refer to **BAIAlert**.
        `,
      },
    },
  },
  argTypes: {
    // Props this wrapper adds - document fully
    items: {
      control: false,
      description: 'List entries rendered as li elements',
      table: {
        type: { summary: 'Array<{ key?: React.Key; content: ReactNode }>' },
      },
    },
    maxHeight: {
      control: { type: 'number' },
      description: 'Maximum height of the list before it scrolls vertically',
      table: {
        type: { summary: "CSSProperties['maxHeight']" },
        defaultValue: { summary: '165' },
      },
    },
    // Inherited props that only appear because Default uses them
    type: { table: { disable: true } },
    title: { table: { disable: true } },
    showIcon: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof BAIListAlert>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    type: 'info',
    title: 'The following projects will be updated',
    showIcon: true,
    items: [
      { key: 'a', content: 'project-alpha' },
      { key: 'b', content: 'project-beta' },
    ],
  },
};

// Comparison story: Use render for multiple components
export const ScrollThreshold: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md" align="stretch">
      <BAIListAlert type="info" title="Fits" items={shortItems} showIcon />
      <BAIListAlert type="info" title="Scrolls" items={longItems} maxHeight={80} showIcon />
    </BAIFlex>
  ),
};
```

**Note on external doc links.** Older stories in the repo still link out to
`ant.design`. Don't copy those links into new stories and drop them when you
touch an existing one — antd is not a dependency and its docs no longer
describe what the component does. Point at the BUI component it extends, or at
the Astryx component (`pnpm exec astryx component <Name>`), instead.

### For Relay Fragment Components

```typescript
import { graphql, useLazyLoadQuery } from 'react-relay';
// `packages/backend.ai-ui/src/tests/RelayResolver.tsx` — from a component in
// `src/components/` that is `'../tests/RelayResolver'`; adjust for depth.
import RelayResolver from '../tests/RelayResolver';

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
3. **ArgTypes**: Document the wrapper's own props fully. Inherited props that only appear in the table because `Default` passes them can be hidden with `table: { disable: true }` — that is what the shipped stories do
4. **No redundant `name`**: Only use when different from export name (e.g., `Default` → `name: 'Basic'`)
5. **Use `BAIFlex` for story layout** — never a raw `<div>` with inline flex, and never `<Space>` (it left with antd). For a row of buttons that reads as one control, Astryx's `ButtonGroup` is the equivalent
6. **UPDATE preserves**: When updating, preserve existing stories and descriptions

---

## Common Mistake: Creating Stories for Forwarded Props

A story earns its place by showing something the wrapper *decides*. A story
that just varies a prop the wrapper hands straight to its base is documenting
someone else's component.

```typescript
// ❌ BAD: a story per value of a forwarded prop
export const AllTypes: Story = { ... };   // BAIListAlert forwards `type` to BAIAlert
export const Closable: Story = { ... };   // ditto `closable`

// ✅ GOOD: a story for behavior this component owns
export const ScrollThreshold: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md" align="stretch">
      <BAIListAlert type="info" title="Fits" items={shortItems} />
      <BAIListAlert type="info" title="Scrolls" items={longItems} maxHeight={80} />
    </BAIFlex>
  ),
};
```

Worse still is a story for a prop that is **accepted-and-ignored**. Several
wrappers keep compatibility no-ops (`BAIAlert`'s `ghostInfoBg` since the Astryx
conversion; `BAIModal`'s `centered`, `draggable`, `zIndex`, `getContainer`, …).
A story toggling one of those renders two identical panes and reads as a bug.
Note the prop as a no-op in the description table and move on.

---

## Reference Stories

| Story File | Reference For |
|------------|---------------|
| `BAIListAlert.stories.tsx` | Wrapper specializing another BUI component (`Omit<BAIAlertProps, …>`) |
| `BAITabList.stories.tsx` | Wrapper over an Astryx primitive (`Omit<TabListProps, 'ref'>`) |
| `BAICard.stories.tsx` | Hand-restated frozen prop surface (the escape hatch in `component-props-extension.md`) |
| `BAIPropertyFilter.stories.tsx` | Complex component with interactive stories |
| `BAIGraphQLPropertyFilter.stories.tsx` | Relay-backed component (`Fragments/` category, `RelayResolver`) |

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
