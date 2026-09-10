import RelayResolver from '../../tests/RelayResolver';
import BAIResourceGroupSelect from './BAIResourceGroupSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';

// =============================================================================
// Mock Data
// =============================================================================

const sampleResourceGroups = [
  { name: 'default' },
  { name: 'gpu-cluster' },
  { name: 'cpu-only' },
  { name: 'high-memory' },
  { name: 'storage-optimized' },
];

const sampleManyResourceGroups = Array.from({ length: 15 }, (_, i) => ({
  name: `resource-group-${i + 1}`,
}));

const asConnection = (groups: Array<{ name: string }>) => ({
  edges: groups.map((group) => ({ node: { id: group.name, ...group } })),
});

/**
 * BAIResourceGroupSelect is a specialized Select component that fetches and displays
 * resource groups at admin scope through the `adminResourceGroups` query.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query (manager 26.2.0+, admin only)
 * - Optional server-side `filter` (`isActive`, `isPublic`)
 * - Built-in search functionality
 * - Internationalized placeholder text
 *
 * @see BAIResourceGroupSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIResourceGroupSelect> = {
  title: 'Fragments/BAIResourceGroupSelect',
  component: BAIResourceGroupSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups at admin scope.

## Features
- Fetches resource groups from GraphQL query \`BAIResourceGroupSelectQuery\` (\`adminResourceGroups\`, manager 26.2.0+)
- Optional \`filter\` prop narrows the list server-side (\`isActive\`, \`isPublic\`)
- Ordered by name, capped at 100 groups
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIResourceGroupSelect.SelectResourceGroup\`
- Uses resource group \`name\` as both label and value
- \`useResourceGroupNames(filter)\` exposes the same list to a parent that needs it during render

## GraphQL Query
\`\`\`graphql
query BAIResourceGroupSelectQuery($filter: ResourceGroupFilter) {
  adminResourceGroups(
    filter: $filter
    orderBy: [{ field: NAME, direction: ASC }]
    limit: 100
  ) {
    edges {
      node {
        name
      }
    }
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIResourceGroupSelect
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
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
        defaultValue: {
          summary: 'i18n: comp:BAIResourceGroupSelect.SelectResourceGroup',
        },
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
    allowClear: {
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
type Story = StoryObj<typeof BAIResourceGroupSelect>;

/**
 * Basic usage with 5 sample resource groups.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 5 resource groups. Search functionality is enabled by default, and placeholder is internationalized.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          adminResourceGroups: asConnection(sampleResourceGroups),
        }),
      }}
    >
      <BAIResourceGroupSelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Empty state when no resource groups are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the component when no resource groups are configured.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          adminResourceGroups: asConnection([]),
        }),
      }}
    >
      <BAIResourceGroupSelect {...args} style={{ width: '300px' }} />
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
          adminResourceGroups: asConnection(sampleResourceGroups),
        }),
      }}
    >
      <BAIResourceGroupSelect {...args} style={{ width: '300px' }} />
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
          'Select with allowClear enabled, allowing users to clear their selection.',
      },
    },
  },
  args: {
    allowClear: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          adminResourceGroups: asConnection(sampleResourceGroups),
        }),
      }}
    >
      <BAIResourceGroupSelect {...args} style={{ width: '300px' }} />
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
        story:
          'Demonstrates overriding the default internationalized placeholder.',
      },
    },
  },
  args: {
    placeholder: 'Choose a resource group...',
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          adminResourceGroups: asConnection(sampleResourceGroups),
        }),
      }}
    >
      <BAIResourceGroupSelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Select with many resource group options.
 */
export const ManyResourceGroups: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 15 resource groups, showing scrollable dropdown with search functionality.',
      },
    },
  },
  args: {
    allowClear: true,
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          adminResourceGroups: asConnection(sampleManyResourceGroups),
        }),
      }}
    >
      <BAIResourceGroupSelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};
