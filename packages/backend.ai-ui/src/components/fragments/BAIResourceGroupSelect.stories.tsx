import RelayResolver from '../../tests/RelayResolver';
import BAIResourceGroupSelect from './BAIResourceGroupSelect';
import { Meta, StoryObj } from '@storybook/react-vite';

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

const sampleWithDuplicates = [
  { name: 'default' },
  { name: 'gpu-cluster' },
  { name: 'default' }, // duplicate
  { name: 'cpu-only' },
  { name: 'gpu-cluster' }, // duplicate
];

/**
 * BAIResourceGroupSelect is a specialized Select component that fetches and displays
 * resource groups (scaling groups) using GraphQL.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query
 * - Duplicate resource group names are automatically filtered
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
**BAIResourceGroupSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display resource groups (scaling groups).

## Features
- Fetches scaling groups from GraphQL query \`BAIResourceGroupSelectQuery\`
- Automatically removes duplicate resource group names using \`_.uniqBy\`
- Built-in search functionality enabled by default
- Internationalized placeholder using \`comp:BAIResourceGroupSelect.SelectResourceGroup\`
- Uses resource group \`name\` as both label and value

## GraphQL Query
\`\`\`graphql
query BAIResourceGroupSelectQuery {
  scaling_groups {
    name
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: sampleResourceGroups,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: [],
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect />
      </div>
    </RelayResolver>
  ),
};

/**
 * Automatic deduplication of resource groups by name.
 */
export const WithDuplicates: Story = {
  name: 'AutomaticDeduplication',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates automatic deduplication when the API returns duplicate resource group names. Only unique names are shown (3 unique groups from 5 total).',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: sampleWithDuplicates,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: sampleResourceGroups,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect disabled />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: sampleResourceGroups,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect allowClear />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: sampleResourceGroups,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect placeholder="Choose a resource group..." />
      </div>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          scaling_groups: sampleManyResourceGroups,
        }),
      }}
    >
      <div style={{ width: '300px' }}>
        <BAIResourceGroupSelect allowClear />
      </div>
    </RelayResolver>
  ),
};
