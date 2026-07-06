import BAIPropertyFilter from './BAIPropertyFilter';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from 'antd';

// import { action } from '@storybook/addon-actions';

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
- **Custom input via \`renderInput\`**: Replace the default AutoComplete input with any controlled control (e.g., a user or storage-host picker). The control commits a condition via \`onAddCondition(value, label?)\` as soon as a value is selected; pass a human-readable \`label\` when the committed value is opaque (e.g. a UUID) so the condition tag shows the label instead. Give the control \`value={null}\` so it stays controlled and clears after each commit. Same contract as the one \`BAIGraphQLPropertyFilter\` adopts in FR-3011 (#8082), so controls become interchangeable once both land.

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
    onChange: () => console.log('Filter changed'),
    value: 'name ilike %test% & active == true',
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
    onChange: () => console.log('Filter changed'),
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
    onChange: () => console.log('Filter changed'),
    value: 'department ilike %engineering%',
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
    onChange: () => console.log('Filter changed'),
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
    onChange: () => console.log('Filter changed'),
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
          'When `renderInput` is provided, the default AutoComplete is replaced with a custom control. The control commits a condition via `onAddCondition(value, label?)` as soon as it emits a non-empty value; keep it controlled with `value={null}` so it clears after each commit. Pass the option label as the second argument so the condition tag shows a human-readable label (e.g. an email) instead of the opaque committed value (e.g. a UUID). Same contract as the one `BAIGraphQLPropertyFilter` adopts in FR-3011 (#8082), so controls become interchangeable once both land.',
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
          <Select
            showSearch
            placeholder="Select owner"
            style={{ minWidth: 220 }}
            value={null}
            optionFilterProp="label"
            options={sampleOwnerOptions}
            onChange={(next) =>
              onAddCondition(
                next ?? undefined,
                sampleOwnerOptions.find((o) => o.value === next)?.label,
              )
            }
          />
        ),
      },
    ],
    onChange: () => console.log('Filter changed'),
  },
};
