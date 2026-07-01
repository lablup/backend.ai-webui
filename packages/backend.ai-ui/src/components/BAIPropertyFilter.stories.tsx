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
