import BAIComplexSelect, { BAILabeledValue } from './BAIComplexSelect';
import type {
  FilterEntity,
  FilterEntitySource,
} from './BAIPowerSearchAdapters';
import BAIPropertyFilter from './BAIPropertyFilter';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAIPropertyFilter> = {
  title: 'Filter/BAIPropertyFilter',
  component: BAIPropertyFilter,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIPropertyFilter** is a sophisticated filtering component designed for Backend.AI applications. It provides a user-friendly interface for constructing complex filter queries with support for:

- **Multiple property types**: String and boolean properties with type-specific operators
- **Dynamic query building**: Visual interface for constructing filter expressions
- **Autocomplete support**: Predefined options and suggestions for property values
- **Validation rules**: Custom validation for property values
- **Query language**: Based on Backend.AI's query filter minilang specification
- **Entity values via \`entitySource\`**: Declarative picker for properties whose value is an opaque id (a user UUID chosen by email). Supply \`{ search, bootstrap?, resolve?, cancel? }\` and the editor renders an Astryx Typeahead (a Tokenizer when the operator is a list one — **arity follows the operator, not the property**). \`resolve(ids)\` turns ids restored from a saved query string back into labels. Prefer it over \`renderInput\` for id-valued properties. Same field as on \`BAIGraphQLPropertyFilter\`.
- **Custom input via \`renderInput\`**: Replace the built-in value editor with any controlled control (e.g., a user or storage-host picker). The control stages a value via \`onAddCondition(value, label?)\` and the edit popover's Apply button commits it; pass a human-readable \`label\` when the staged value is opaque (e.g. a UUID) so the token shows the label instead. The render prop receives \`{ onAddCondition, value, isDisabled }\`. Same contract as \`BAIGraphQLPropertyFilter\`, so controls are interchangeable.

> **to-astryx ticket 28** — the engine is now Astryx \`PowerSearch\`. The prop contract is unchanged, but the antd chrome it documented (property \`Select\` + \`AutoComplete\` + closable \`Tag\`s + the bespoke reset button) is replaced by PowerSearch's typeahead, tokens and built-in clear. \`rule.validate\` is advisory now: a violating token is reported through the control's error status instead of being refused. **to-astryx ticket 32** refreshed these stories: the \`renderInput\` demo below now uses \`BAIComplexSelect\` (Astryx-native) instead of antd \`Select\`, matching what a migrated call site actually renders.

The component generates filter query strings that can be used with Backend.AI's query system, enabling powerful data filtering capabilities across the platform.

**Query Syntax Examples:**
- Simple filter: \`name ilike %john%\`
- Boolean filter: \`active == true\`
- Combined filters: \`name ilike %john% & active == true\`
        `,
      },
    },
  },
  argTypes: {
    filterProperties: {
      description: 'Array of filterable properties configuration',
      control: { type: 'object' },
      table: {
        type: { summary: 'FilterProperty[]' },
      },
    },
    value: {
      control: { type: 'text' },
      description: 'Current filter query string',
      table: {
        type: { summary: 'string' },
      },
    },
    onChange: {
      action: 'filterChanged',
      description: 'Callback when filter value changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  // BAIPropertyFilter is a controlled component: it renders exactly what
  // `value` holds and reports changes through `onChange`. Storybook args are
  // static, so unless each change is written back into `value` the filter
  // looks frozen — searching can't add a tag and the close/reset buttons
  // can't remove one. We hold the value in local state per story instance so
  // every story is independently interactive. NOTE: do not use Storybook
  // `useArgs` here — in the autodocs page only the Primary story's
  // `updateArgs` is wired, so every other story would stay frozen. `useState`
  // works for every instance in both the Canvas and Docs views.
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return (
      <BAIPropertyFilter
        {...args}
        value={value}
        onChange={(next) => {
          args.onChange?.(next);
          setValue(next);
        }}
      />
    );
  },
};

export default meta;

type Story = StoryObj<typeof BAIPropertyFilter>;

export const Default: Story = {
  name: 'Basic Usage',
  parameters: {
    docs: {
      description: {
        story:
          'Basic property filter with string and boolean properties. Shows how to construct complex filter queries using the visual interface.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        defaultOperator: 'ilike',
        propertyLabel: 'Name',
        type: 'string',
      },
      {
        key: 'description',
        propertyLabel: 'Description',
        type: 'string',
      },
      {
        key: 'active',
        propertyLabel: 'Active Status',
        type: 'boolean',
      },
    ],
    value: 'name ilike "%test%" & active == true',
  },
};

export const NumberAndDatetime: Story = {
  name: 'Number and Datetime Properties',
  parameters: {
    docs: {
      description: {
        story:
          'Numeric and time properties offer comparison operators. Numbers serialize bare (`priority >= 10`); datetimes stay quoted (`created_at >= "2026-08-01"`) because the backend parses the string into a date.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
      },
      {
        key: 'priority',
        propertyLabel: 'Priority',
        type: 'number',
      },
      {
        key: 'created_at',
        propertyLabel: 'Created At',
        type: 'datetime',
      },
    ],
    value: 'priority >= 10 & created_at >= "2026-08-01"',
  },
};

export const WithCustomValidation: Story = {
  name: 'Custom Validation',
  parameters: {
    docs: {
      description: {
        story:
          'Property filter with custom validation rules for email addresses and strict selection options.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'email',
        propertyLabel: 'Email Address',
        type: 'string',
        rule: {
          message: 'Please enter a valid email address',
          validate: (value: string) => /\S+@\S+\.\S+/.test(value),
        },
      },
      {
        key: 'status',
        propertyLabel: 'Status',
        type: 'string',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
        strictSelection: true,
      },
    ],
  },
};

export const WithAutocompleteOptions: Story = {
  name: 'Autocomplete Options',
  parameters: {
    docs: {
      description: {
        story:
          'Property filter with predefined autocomplete options for easier data entry.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'department',
        propertyLabel: 'Department',
        type: 'string',
        options: [
          { label: 'Engineering', value: 'engineering' },
          { label: 'Marketing', value: 'marketing' },
          { label: 'Sales', value: 'sales' },
          { label: 'Human Resources', value: 'hr' },
        ],
      },
      {
        key: 'priority',
        propertyLabel: 'Priority Level',
        type: 'string',
        options: [
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
        ],
        strictSelection: true,
      },
    ],
    value: 'department ilike "%engineering%"',
  },
};

export const EmptyState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Property filter in its initial state with no applied filters.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
      },
      {
        key: 'enabled',
        propertyLabel: 'Enabled',
        type: 'boolean',
      },
    ],
  },
};

export const LoadingState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Property filter in loading state, typically shown while fetching filter options or processing queries.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
      },
    ],
    loading: true,
  },
};

const sampleOwnerOptions = [
  { label: 'alice@example.com', value: 'owner-uuid-0001' },
  { label: 'bob@example.com', value: 'owner-uuid-0002' },
  { label: 'carol@example.com', value: 'owner-uuid-0003' },
];

export const WithRenderInput: Story = {
  name: 'Custom Input via renderInput',
  parameters: {
    docs: {
      description: {
        story:
          "When `renderInput` is provided, the default value editor is replaced with a custom control. The control **stages** a value via `onAddCondition(value, label?)` and the edit popover's Apply button commits it — nothing lands on the filter until Apply. Pass the option label as the second argument so the token shows a human-readable label (e.g. an email) instead of the opaque staged value (e.g. a UUID). The render prop also receives `value` (what is currently staged) and `isDisabled`. Same contract as `BAIGraphQLPropertyFilter`, so controls are interchangeable; for id-valued properties prefer `entitySource`.",
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        defaultOperator: 'ilike',
      },
      {
        key: 'owner',
        propertyLabel: 'Owner',
        type: 'string',
        defaultOperator: '==',
        renderInput: ({ onAddCondition }) => (
          <BAIComplexSelect
            label="Owner"
            isLabelHidden
            placeholder="Select owner"
            width={220}
            options={sampleOwnerOptions}
            value={null}
            onChange={(next) => {
              const labeled = next as BAILabeledValue | null;
              onAddCondition(labeled?.value, labeled?.label);
            }}
          />
        ),
      },
    ],
    onChange: () => console.log('Filter changed'),
  },
};

const sampleUserEntities: Array<FilterEntity> = [
  {
    id: 'owner-uuid-0001',
    label: 'alice@example.com',
    description: 'Alice Kim',
  },
  { id: 'owner-uuid-0002', label: 'bob@example.com', description: 'Bob Lee' },
  {
    id: 'owner-uuid-0003',
    label: 'carol@example.com',
    description: 'Carol Park',
  },
  {
    id: 'owner-uuid-0004',
    label: 'dave@example.com',
    description: 'Dave Choi',
  },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Stands in for a Relay-backed source (useBAIUserEntitySource); the latency is
// what makes the id -> label swap visible in the Canvas.
const demoUserEntitySource: FilterEntitySource = {
  search: async (query) => {
    await sleep(400);
    const needle = query.trim().toLowerCase();
    return needle
      ? sampleUserEntities.filter((entity) =>
          entity.label.toLowerCase().includes(needle),
        )
      : sampleUserEntities;
  },
  bootstrap: async () => {
    await sleep(300);
    return sampleUserEntities.slice(0, 3);
  },
  resolve: async (ids) => {
    await sleep(1200);
    return sampleUserEntities.filter((entity) => ids.includes(entity.id));
  },
};

export const WithEntitySource: Story = {
  name: 'Entity picker via entitySource',
  parameters: {
    docs: {
      description: {
        story:
          '`entitySource` is the declarative way to filter on an opaque id: the user searches by email while the query string keeps the UUID (`owner == "owner-uuid-0003"` — the same bytes `renderInput` produced). Arity follows the operator, so a single-value operator like `==` gets a single-select Typeahead. The story is pre-seeded with a raw UUID and this demo source resolves it after ~1.2s, so the token starts as the UUID and swaps to the email — what happens when a saved query is reopened. Without `resolve` the token simply keeps showing the raw id.',
      },
    },
  },
  args: {
    filterProperties: [
      {
        key: 'name',
        propertyLabel: 'Name',
        type: 'string',
        defaultOperator: 'ilike',
      },
      {
        key: 'owner',
        propertyLabel: 'Owner',
        type: 'string',
        defaultOperator: '==',
        entitySource: demoUserEntitySource,
      },
    ],
    value: 'owner == "owner-uuid-0003"',
    onChange: () => console.log('Filter changed'),
  },
};
