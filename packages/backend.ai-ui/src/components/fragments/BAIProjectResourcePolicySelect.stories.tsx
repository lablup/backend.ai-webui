import RelayResolver from '../../tests/RelayResolver';
import BAIProjectResourcePolicySelect from './BAIProjectResourcePolicySelect';
import type { Meta, StoryObj } from '@storybook/react-vite';

const samplePolicies = [
  { id: 'policy-1', name: 'default' },
  { id: 'policy-2', name: 'gpu-limited' },
  { id: 'policy-3', name: 'cpu-only' },
  { id: 'policy-4', name: 'high-memory' },
  { id: 'policy-5', name: 'storage-optimized' },
];

const sampleManyPolicies = Array.from({ length: 15 }, (_, i) => ({
  id: `policy-${i + 1}`,
  name: `resource-policy-${i + 1}`,
}));

/**
 * BAIProjectResourcePolicySelect is a specialized Select component that fetches and displays
 * project resource policies using GraphQL.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query
 * - Alphabetically sorted by policy name
 * - Built-in search functionality
 *
 * @see BAIProjectResourcePolicySelect.tsx for implementation details
 */
const meta: Meta<typeof BAIProjectResourcePolicySelect> = {
  title: 'Fragments/BAIProjectResourcePolicySelect',
  component: BAIProjectResourcePolicySelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIProjectResourcePolicySelect** extends [BAISelect](/?path=/docs/select-baiselect--docs) to fetch and display project resource policies.

## Features
- Fetches project resource policies from GraphQL query \`BAIProjectResourcePolicySelectQuery\`
- Policies are automatically sorted alphabetically by name
- Built-in search functionality enabled by default
- Uses policy \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIProjectResourcePolicySelectQuery {
  project_resource_policies {
    id
    name
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIProjectResourcePolicySelect
  placeholder="Select a resource policy"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/select-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text when no value is selected',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    hasClear: {
      control: { type: 'boolean' },
      description: 'Show clear button',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback when selection changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIProjectResourcePolicySelect>;

/**
 * Basic usage with 5 sample resource policies.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 5 project resource policies, automatically sorted alphabetically. Search functionality is enabled by default.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          project_resource_policies: samplePolicies,
        }),
      }}
    >
      <BAIProjectResourcePolicySelect {...args} width={300} />
    </RelayResolver>
  ),
};

/**
 * Empty state when no resource policies are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when no project resource policies are configured.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          project_resource_policies: [],
        }),
      }}
    >
      <BAIProjectResourcePolicySelect {...args} width={300} />
    </RelayResolver>
  ),
};

/**
 * Disabled state of the select.
 */
export const Disabled: Story = {
  name: 'DisabledState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component in a disabled state where users cannot interact with it.',
      },
    },
  },
  args: {
    disabled: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          project_resource_policies: samplePolicies,
        }),
      }}
    >
      <BAIProjectResourcePolicySelect {...args} width={300} />
    </RelayResolver>
  ),
};

/**
 * Select with clear button enabled.
 */
export const WithClearButton: Story = {
  name: 'ClearButton',
  parameters: {
    docs: {
      description: {
        story:
          'Select with hasClear enabled, allowing users to clear their selection.',
      },
    },
  },
  args: {
    hasClear: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          project_resource_policies: samplePolicies,
        }),
      }}
    >
      <BAIProjectResourcePolicySelect {...args} width={300} />
    </RelayResolver>
  ),
};

/**
 * Select with custom placeholder text.
 */
export const WithCustomPlaceholder: Story = {
  name: 'CustomPlaceholder',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a custom placeholder text.',
      },
    },
  },
  args: {
    placeholder: 'Choose a resource policy...',
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          project_resource_policies: samplePolicies,
        }),
      }}
    >
      <BAIProjectResourcePolicySelect {...args} width={300} />
    </RelayResolver>
  ),
};

/**
 * Select with many policy options.
 */
export const ManyPolicies: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 15 resource policies, showing scrollable dropdown with search functionality.',
      },
    },
  },
  args: {
    hasClear: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          project_resource_policies: sampleManyPolicies,
        }),
      }}
    >
      <BAIProjectResourcePolicySelect {...args} width={300} />
    </RelayResolver>
  ),
};
