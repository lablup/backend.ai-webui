import RelayResolver from '../../tests/RelayResolver';
import BAIObjectStorageSelect from './BAIObjectStorageSelect';
import { Meta, StoryObj } from '@storybook/react-vite';

const sampleObjectStorages = [
  { node: { id: 'storage-1', name: 'S3 Main Storage' } },
  { node: { id: 'storage-2', name: 'Azure Blob Storage' } },
  { node: { id: 'storage-3', name: 'MinIO Dev Storage' } },
  { node: { id: 'storage-4', name: 'Google Cloud Storage' } },
  { node: { id: 'storage-5', name: 'Local Storage' } },
];

const sampleManyStorages = Array.from({ length: 15 }, (_, i) => ({
  node: {
    id: `storage-${i + 1}`,
    name: `Object Storage ${i + 1}`,
  },
}));

/**
 * BAIObjectStorageSelect is a specialized Select component that fetches and displays
 * object storage systems using GraphQL with pagination support.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query with pagination
 * - Search functionality with debounced loading
 * - Infinite scroll support
 * - Total count footer
 *
 * @see BAIObjectStorageSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIObjectStorageSelect> = {
  title: 'Fragments/BAIObjectStorageSelect',
  component: BAIObjectStorageSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIObjectStorageSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display object storage systems.

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`fetchKey\` | \`string\` | - | Optional key to trigger refetch |

## Features
- Fetches object storages from GraphQL query \`BAIObjectStorageSelectQuery\`
- Pagination support with \`useLazyPaginatedQuery\` hook
- Search functionality with debounced loading state
- Infinite scroll via \`endReached\` callback
- Total count footer with loading indicator
- Custom label rendering with \`BAIText\` component

## GraphQL Query
\`\`\`graphql
query BAIObjectStorageSelectQuery($offset: Int!, $limit: Int!) {
  objectStorages(offset: $offset, limit: $limit) {
    count
    edges {
      node {
        id
        name
      }
    }
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIObjectStorageSelect
  placeholder="Select storage"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    fetchKey: {
      control: { type: 'text' },
      description: 'Optional key to trigger refetch when changed',
      table: {
        type: { summary: 'string' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text when no value is selected',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '"Select Storage"' },
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
type Story = StoryObj<typeof BAIObjectStorageSelect>;

/**
 * Basic usage with 5 sample object storages.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 5 object storage systems. The component automatically fetches and displays available storages with search functionality.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          objectStorages: {
            count: 5,
            edges: sampleObjectStorages,
          },
        }),
      }}
    >
      <BAIObjectStorageSelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Empty state when no object storages are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when no object storage systems are configured.',
      },
    },
  },
  args: {},
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          objectStorages: {
            count: 0,
            edges: [],
          },
        }),
      }}
    >
      <BAIObjectStorageSelect {...args} style={{ width: '300px' }} />
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
          objectStorages: {
            count: 5,
            edges: sampleObjectStorages,
          },
        }),
      }}
    >
      <BAIObjectStorageSelect {...args} style={{ width: '300px' }} />
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
          objectStorages: {
            count: 5,
            edges: sampleObjectStorages,
          },
        }),
      }}
    >
      <BAIObjectStorageSelect {...args} style={{ width: '300px' }} />
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
          'Demonstrates using a custom placeholder instead of the default "Select Storage".',
      },
    },
  },
  args: {
    placeholder: 'Choose storage system...',
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          objectStorages: {
            count: 5,
            edges: sampleObjectStorages,
          },
        }),
      }}
    >
      <BAIObjectStorageSelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};

/**
 * Select with many storage options showing pagination.
 */
export const ManyStorages: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 15 object storages, showing pagination and infinite scroll behavior with total count footer.',
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
          objectStorages: {
            count: 15,
            edges: sampleManyStorages,
          },
        }),
      }}
    >
      <BAIObjectStorageSelect {...args} style={{ width: '300px' }} />
    </RelayResolver>
  ),
};
