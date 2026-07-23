---
applyTo: "packages/backend.ai-ui/**/*.stories.tsx,packages/backend.ai-ui/**/*.stories.ts"
---

# Storybook Story Guidelines for Backend.AI UI

These instructions ensure consistent, high-quality Storybook stories in the Backend.AI UI component library.

## Overview

Stories are **colocated with components** in the same directory:
```
packages/backend.ai-ui/src/components/
├── BAICard.tsx
├── BAICard.stories.tsx
├── BAIFlex.tsx
└── BAIFlex.stories.tsx
```

**Storybook Configuration:**
- Location: `/packages/backend.ai-ui/.storybook`
- Framework: `@storybook/react-vite`
- Purpose: Shared UI component library documentation

## Story Format: CSF 3 with TypeScript

All stories must use **Component Story Format (CSF) 3** with TypeScript:

```typescript
import Component from './Component';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  tags: ['autodocs'],
  parameters: { /* ... */ },
  argTypes: { /* ... */ },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  name: 'Basic',
  args: { /* ... */ },
};
```

---

## Meta Configuration

### Required Properties

Every story file must include these meta properties:

```typescript
const meta: Meta<typeof BAICard> = {
  title: 'Components/BAICard',           // Hierarchical path (required)
  component: BAICard,                     // Component reference (required)
  tags: ['autodocs'],                     // Required for auto-documentation
  parameters: {
    layout: 'padded',                     // 'padded' | 'centered' | 'fullscreen'
    docs: {
      description: {
        component: `
**BAICard** is an enhanced Card component with status indicators.

## Features
- Status-based border colors (success, warning, error)
- Extra action buttons
- Loading state support

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | \`'default' \\| 'success' \\| 'warning' \\| 'error'\` | \`'default'\` | Visual status affecting border color |
| loading | \`boolean\` | \`false\` | Shows loading skeleton |
| extra | \`ReactNode\` | - | Extra content in card header |
        `,
      },
    },
  },
  argTypes: {
    status: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'error'],
      description: 'Visual status affecting border color and extra button icons',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading skeleton when true',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    children: {
      control: false,  // Hide control for complex types
      description: 'Card content',
    },
  },
};
```

### Title Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| General Component | `Components/[Name]` | `Components/BAICard` |
| Subcategory | `Components/[Category]/[Name]` | `Components/Input/DynamicUnitInputNumber` |
| Sub-component | `Components/[Parent]/[Name]` | `Components/BAITable/BAITableSettingModal` |
| Layout | `Layout/[Name]` | `Layout/BAIFlex` |
| Relay Fragment | `Fragments/[Name]` | `Fragments/BAISessionTypeTag` |

### Layout Options

| Layout | Use Case |
|--------|----------|
| `'padded'` | Default for most components |
| `'centered'` | Small, isolated components (buttons, badges) |
| `'fullscreen'` | Full-page layouts, tables |

---

## ArgTypes Configuration

### Control Types

| Control Type | Use Case | Example |
|--------------|----------|---------|
| `'text'` | String inputs | `title`, `placeholder` |
| `'number'` | Numeric values | `count`, `size` |
| `'boolean'` | Toggle flags | `loading`, `disabled` |
| `'select'` | Enum values | `status`, `variant` |
| `'radio'` | Few options | `size: 'sm' \| 'md' \| 'lg'` |
| `'color'` | Color values | `backgroundColor` |
| `false` | Hide control | `children`, `ref`, complex objects |

### ArgTypes Template

```typescript
argTypes: {
  // Select control for enum props
  status: {
    control: { type: 'select' },
    options: ['default', 'success', 'warning', 'error'],
    description: 'Visual status affecting border color',
    table: {
      type: { summary: "'default' | 'success' | 'warning' | 'error'" },
      defaultValue: { summary: 'default' },
    },
  },

  // Boolean control
  loading: {
    control: { type: 'boolean' },
    description: 'Shows loading state',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'false' },
    },
  },

  // Number control
  maxLength: {
    control: { type: 'number' },
    description: 'Maximum character length',
    table: {
      type: { summary: 'number' },
      defaultValue: { summary: '100' },
    },
  },

  // Hidden control for complex types
  children: {
    control: false,
    description: 'Content to render inside the component',
  },

  // Action callback
  onChange: {
    action: 'changed',
    description: 'Callback when value changes',
  },
},
```

---

## Story Definition Patterns

### Pattern A: Args-Based (Simple Props)

Use for components with straightforward props:

```typescript
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage of the component with default props.',
      },
    },
  },
  args: {
    title: 'Card Title',
    children: <div>Card content goes here</div>,
  },
};
```

### Pattern B: Render Function (Stateful)

Use when the story needs internal state:

```typescript
export const WithState: Story = {
  name: 'StatefulExample',
  parameters: {
    docs: {
      description: {
        story: 'Example showing stateful interaction with the component.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState('');

    return (
      <Component
        value={value}
        onChange={(newValue) => setValue(newValue)}
      />
    );
  },
};
```

### Pattern C: Helper Render Function (Reusable)

Use when multiple stories share similar rendering logic:

```typescript
// Define reusable render helper
const renderWithItems = (props: BAIFlexProps) => (
  <BAIFlex {...props}>
    <div style={{ padding: 8, background: '#f0f0f0' }}>Item 1</div>
    <div style={{ padding: 8, background: '#e0e0e0' }}>Item 2</div>
    <div style={{ padding: 8, background: '#d0d0d0' }}>Item 3</div>
  </BAIFlex>
);

export const Row: Story = {
  name: 'RowDirection',
  render: renderWithItems,
  args: {
    direction: 'row',
    gap: 'md',
  },
};

export const Column: Story = {
  name: 'ColumnDirection',
  render: renderWithItems,
  args: {
    direction: 'column',
    gap: 'md',
  },
};
```

### Pattern D: Relay Fragment Components

Use for components that consume GraphQL fragments:

```typescript
import { graphql, useLazyLoadQuery } from 'react-relay';
import RelayResolver from '../../tests/RelayResolver';
import type { BAISessionTypeTagStoriesQuery } from './__generated__/BAISessionTypeTagStoriesQuery.graphql';

// Query resolver component
const QueryResolver = () => {
  const { compute_session_node } = useLazyLoadQuery<BAISessionTypeTagStoriesQuery>(
    graphql`
      query BAISessionTypeTagStoriesQuery {
        compute_session_node(id: "test-id") {
          ...BAISessionTypeTagFragment
        }
      }
    `,
    {},
  );

  return (
    compute_session_node && (
      <BAISessionTypeTag sessionFrgmt={compute_session_node} />
    )
  );
};

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic session type tag showing interactive session.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          type: 'INTERACTIVE',
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

export const BatchType: Story = {
  name: 'BatchSession',
  render: () => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          type: 'BATCH',
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};
```

### Pattern E: Form Integration

Use for components that work with Ant Design Form:

```typescript
import { Form } from 'antd';

const renderWithFormItem = ({ value, ...args }: ComponentProps) => {
  return (
    <Form initialValues={{ fieldName: value }}>
      <Form.Item name="fieldName" label="Field Label">
        <Component {...args} />
      </Form.Item>
    </Form>
  );
};

export const WithFormItem: Story = {
  name: 'FormIntegration',
  render: renderWithFormItem,
  args: {
    value: 'initial value',
  },
};
```

### Pattern F: Multiple Variants Display

Use to show all variants in a single story:

```typescript
export const StatusVariants: Story = {
  name: 'AllStatuses',
  parameters: {
    docs: {
      description: {
        story: 'Displays all available status variants.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAICard title="Default Status" status="default">
        Default content
      </BAICard>
      <BAICard title="Success Status" status="success">
        Success content
      </BAICard>
      <BAICard title="Warning Status" status="warning">
        Warning content
      </BAICard>
      <BAICard title="Error Status" status="error">
        Error content
      </BAICard>
    </BAIFlex>
  ),
};
```

---

## Story Organization

### Required Stories Order

1. **Default** (`name: 'Basic'`) - Basic usage with minimal props
2. **Variant Stories** - Different prop combinations
3. **State Stories** - Loading, Empty, Error states
4. **Real-World Stories** - Production-like examples

### Story Naming Conventions

| Export Name | `name` Value | Purpose |
|-------------|--------------|---------|
| `Default` | `'Basic'` | Basic usage |
| `WithExtra` | `'ExtraContent'` | Additional features |
| `Loading` | `'LoadingState'` | Loading state |
| `Empty` | `'EmptyState'` | Empty/no data state |
| `Error` | `'ErrorState'` | Error state |
| `StatusVariants` | `'AllStatuses'` | Multiple variants |
| `RealWorldExamples` | `'RealWorldUsage'` | Realistic examples |
| `WithCustomValidation` | `'CustomValidation'` | Specific feature demo |

### Export Naming Rules

- Use **PascalCase** for exports: `export const WithCustomStyling: Story`
- Use descriptive, feature-focused names
- Avoid typos (e.g., ~~`AllowOlnyMiBandGiB`~~ → `AllowOnlyMiBandGiB`)

---

## Sample Data

### Define Reusable Sample Data

Always define sample data at the top of the file:

```typescript
// Sample data for stories
const sampleContent = (
  <div style={{ padding: 16 }}>
    <p>This is sample content for the card.</p>
    <p>It demonstrates typical usage patterns.</p>
  </div>
);

const sampleColumns: BAIColumnType<DataType>[] = [
  {
    key: 'name',
    title: 'Name',
    dataIndex: 'name',
    sorter: true,
  },
  {
    key: 'status',
    title: 'Status',
    dataIndex: 'status',
    filters: [
      { text: 'Active', value: 'active' },
      { text: 'Inactive', value: 'inactive' },
    ],
  },
];

const sampleData: DataType[] = [
  { id: '1', name: 'Item 1', status: 'active' },
  { id: '2', name: 'Item 2', status: 'inactive' },
  { id: '3', name: 'Item 3', status: 'active' },
];
```

### Sample Data Naming

| Type | Naming Pattern | Example |
|------|----------------|---------|
| Content | `sampleContent` | JSX content |
| Columns | `sampleColumns` | Table columns |
| Data Array | `sampleData` | Data records |
| Options | `sampleOptions` | Select options |
| Form Values | `sampleFormValues` | Initial form values |

---

## Decorators

### Global Decorators (in preview.tsx)

```typescript
// packages/backend.ai-ui/.storybook/preview.tsx
decorators: [
  (Story) => (
    <ConfigProvider>
      <div style={{ padding: '16px' }}>
        <Story />
      </div>
    </ConfigProvider>
  ),
],
```

### Story-Level Decorators

```typescript
const meta: Meta<typeof BAITable> = {
  // ...
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const baiLocale = locales[locale];

      return (
        <BAIConfigProvider
          locale={baiLocale}
          clientPromise={mockClientPromise}
        >
          <Story />
        </BAIConfigProvider>
      );
    },
  ],
};
```

---

## JSDoc Comments for Meta

Add a JSDoc comment above the meta configuration to provide a quick component overview. This appears in IDE tooltips and helps developers understand the component at a glance.

### Pattern

```typescript
import Component from './Component';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Component provides [brief description of what it does].
 *
 * Key features:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 *
 * @see [Related documentation or component link if applicable]
 */
const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  tags: ['autodocs'],
  // ...
};
```

### Real-World Example

From `BAIText.stories.tsx`:

```typescript
/**
 * BAIText extends Ant Design's Typography.Text with additional features
 * for better text handling and customization.
 *
 * Key features:
 * - Monospace font support via `monospace` prop
 * - CSS-based ellipsis implementation with Safari compatibility
 * - Proper tooltip integration when text is truncated
 * - Copy functionality with customizable content
 *
 * @see BAIText.tsx for implementation details
 */
const meta: Meta<typeof BAIText> = {
  title: 'Components/BAIText',
  component: BAIText,
  tags: ['autodocs'],
  // ...
};
```

### Best Practices

- Keep the description concise (1-2 sentences)
- List 3-5 key features as bullet points
- Include `@see` tag for related components or documentation
- Avoid duplicating the full documentation from `parameters.docs.description.component`

---

## Documentation Best Practices

### Component Description Format

Use markdown with clear sections:

```typescript
parameters: {
  docs: {
    description: {
      component: `
**BAIText** is an enhanced text component with advanced text handling.

## Features
- Monospace font support
- CSS-based ellipsis with Safari compatibility
- Copy-to-clipboard functionality
- Multi-line truncation

## Usage
\`\`\`tsx
<BAIText ellipsis copyable>
  Long text content here...
</BAIText>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| ellipsis | \`boolean \\| EllipsisConfig\` | \`false\` | Enable text truncation |
| copyable | \`boolean\` | \`false\` | Show copy button |
| monospace | \`boolean\` | \`false\` | Use monospace font |
      `,
    },
  },
},
```

### Story Description

Every story should have a description:

```typescript
export const EllipsisWithTooltip: Story = {
  name: 'EllipsisWithTooltip',
  parameters: {
    docs: {
      description: {
        story:
          'Text with ellipsis that shows full content in a tooltip on hover. ' +
          'Useful for displaying truncated content in tables or cards.',
      },
    },
  },
  args: {
    ellipsis: { tooltip: true },
    children: 'This is a very long text that will be truncated...',
  },
};
```

---

## Anti-Patterns to Avoid

### ❌ Missing Required Properties

```typescript
// Bad: Missing tags, description, argTypes
const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
};
```

### ❌ Empty or Minimal Stories

```typescript
// Bad: No description, no context
export const Default: Story = {
  args: { title: 'Title' },
};
```

### ❌ Hardcoded Values Without Explanation

```typescript
// Bad: Magic values without context
export const WithMagicNumber: Story = {
  args: {
    value: 42,
    threshold: 0.7,
  },
};
```

### ❌ Inconsistent Naming

```typescript
// Bad: Inconsistent casing and typos
export const defaultStory: Story = { ... };      // Should be PascalCase
export const AllowOlnyMiBandGiB: Story = { ... }; // Typo
```

### ❌ Missing State Stories

```typescript
// Bad: Only happy path, no loading/error states
export const Default: Story = { ... };
export const WithData: Story = { ... };
// Missing: Loading, Empty, Error
```

---

## Complete Template

```typescript
import { useState } from 'react';
import Component from './Component';
import type { Meta, StoryObj } from '@storybook/react-vite';

// =============================================================================
// Sample Data
// =============================================================================

const sampleContent = (
  <div style={{ padding: 16 }}>
    <p>Sample content for demonstration.</p>
  </div>
);

const sampleOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
];

// =============================================================================
// Meta Configuration
// =============================================================================

const meta: Meta<typeof Component> = {
  title: 'Components/Component',
  component: Component,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Component** is a reusable UI component for [purpose].

## Features
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Usage
\`\`\`tsx
<Component
  prop1="value"
  prop2={true}
  onChange={(value) => console.log(value)}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| prop1 | \`string\` | \`'default'\` | Description of prop1 |
| prop2 | \`boolean\` | \`false\` | Description of prop2 |
| onChange | \`(value: string) => void\` | - | Callback when value changes |
        `,
      },
    },
  },
  argTypes: {
    prop1: {
      control: { type: 'text' },
      description: 'Description of prop1',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    prop2: {
      control: { type: 'boolean' },
      description: 'Description of prop2',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when value changes',
    },
    children: {
      control: false,
      description: 'Content to render inside the component',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

// =============================================================================
// Stories
// =============================================================================

/**
 * Basic usage of the component with default props.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic usage demonstrating the component with minimal configuration.',
      },
    },
  },
  args: {
    prop1: 'Hello World',
    children: sampleContent,
  },
};

/**
 * Component with additional features enabled.
 */
export const WithFeatures: Story = {
  name: 'WithFeatures',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the component with additional features enabled.',
      },
    },
  },
  args: {
    prop1: 'With Features',
    prop2: true,
    children: sampleContent,
  },
};

/**
 * Loading state of the component.
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in a loading state.',
      },
    },
  },
  args: {
    prop1: 'Loading',
    loading: true,
  },
};

/**
 * Empty state when no data is available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no data is available.',
      },
    },
  },
  args: {
    prop1: 'Empty',
    children: null,
  },
};

/**
 * Error state of the component.
 */
export const Error: Story = {
  name: 'ErrorState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component in an error state.',
      },
    },
  },
  args: {
    prop1: 'Error',
    status: 'error',
    children: sampleContent,
  },
};

/**
 * Interactive example with state management.
 */
export const Interactive: Story = {
  name: 'InteractiveExample',
  parameters: {
    docs: {
      description: {
        story: 'Interactive example demonstrating state management and user interaction.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState('Initial value');

    return (
      <Component
        prop1={value}
        onChange={(newValue) => setValue(newValue)}
      >
        <p>Current value: {value}</p>
      </Component>
    );
  },
};

/**
 * Real-world usage example.
 */
export const RealWorldExample: Story = {
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates a realistic use case combining multiple features.',
      },
    },
  },
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Component
          prop1="Select an option"
          prop2={true}
          onChange={(value) => setSelected(value)}
        >
          {sampleOptions.map((option) => (
            <div key={option.value}>{option.label}</div>
          ))}
        </Component>
        {selected && <p>Selected: {selected}</p>}
      </div>
    );
  },
};
```

---

## Story Writing Checklist

Before submitting a story file, verify:

### Meta Configuration
- [ ] `title` follows naming conventions (`Components/[Name]`)
- [ ] `component` references the correct component
- [ ] `tags: ['autodocs']` is included
- [ ] `parameters.layout` is set appropriately
- [ ] `parameters.docs.description.component` has markdown documentation

### Component Documentation
- [ ] Features section lists key capabilities
- [ ] Props table documents all major props
- [ ] Usage example shows basic implementation

### ArgTypes
- [ ] All major props have `argTypes` defined
- [ ] Each `argType` has `control`, `description`, and `table`
- [ ] Complex types (ReactNode, functions) have `control: false`
- [ ] Callback props use `action` for logging

### Stories
- [ ] `Default` story with `name: 'Basic'` exists
- [ ] Each story has `parameters.docs.description.story`
- [ ] State stories exist (Loading, Empty, Error)
- [ ] Real-world usage example is included
- [ ] Export names use PascalCase
- [ ] No typos in story names

### Sample Data
- [ ] Reusable sample data defined at top of file
- [ ] Sample data uses consistent naming (`sample*`)
- [ ] Data is realistic and representative

### Code Quality
- [ ] No `console.log` statements (use Storybook actions)
- [ ] TypeScript types are correct
- [ ] No hardcoded magic values without explanation
- [ ] Follows React/TypeScript best practices from other guidelines

---

## Running Storybook

```bash
# Development
cd packages/backend.ai-ui && pnpm run storybook

# Build
cd packages/backend.ai-ui && pnpm run build-storybook
```

Storybook runs on port **6006** by default.
