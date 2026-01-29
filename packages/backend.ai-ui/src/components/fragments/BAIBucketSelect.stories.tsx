import RelayResolver from '../../tests/RelayResolver';
import BAIBucketSelect from './BAIBucketSelect';
import { Meta, StoryObj } from '@storybook/react-vite';

// =============================================================================
// Mock Data
// =============================================================================

const sampleBuckets = [
  { node: { id: 'bucket-1', namespace: 'my-bucket-1' } },
  { node: { id: 'bucket-2', namespace: 'my-bucket-2' } },
  { node: { id: 'bucket-3', namespace: 'data-storage' } },
  { node: { id: 'bucket-4', namespace: 'ml-datasets' } },
  { node: { id: 'bucket-5', namespace: 'backups' } },
];

const sampleManyBuckets = Array.from({ length: 20 }, (_, i) => ({
  node: {
    id: `bucket-${i + 1}`,
    namespace: `bucket-${i + 1}`,
  },
}));

// =============================================================================
// Query Wrapper Component
// =============================================================================

/**
 * Wrapper component that provides RelayResolver context for BAIBucketSelect.
 * BAIBucketSelect uses useLazyPaginatedQuery internally for GraphQL data fetching.
 */
const BAIBucketSelectWithQuery = (
  props: Omit<React.ComponentProps<typeof BAIBucketSelect>, never>,
) => {
  return <BAIBucketSelect {...props} />;
};

// =============================================================================
// Meta Configuration
// =============================================================================

/**
 * BAIBucketSelect is a specialized Select component that fetches and displays
 * object storage buckets (namespaces) using GraphQL with pagination support.
 *
 * Key features:
 * - Automatic data fetching via GraphQL query with pagination
 * - Search functionality with debounced loading
 * - Infinite scroll support
 * - Total count footer
 *
 * @see BAIBucketSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIBucketSelect> = {
  title: 'Fragments/BAIBucketSelect',
  component: BAIBucketSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIBucketSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display object storage buckets (namespaces).

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`objectStorageId\` | \`string\` | **required** | Object storage ID to fetch buckets from |
| \`fetchKey\` | \`string\` | - | Optional key to trigger refetch |

## Features
- Fetches buckets from GraphQL query \`BAIBucketSelectQuery\`
- Pagination support with \`useLazyPaginatedQuery\` hook
- Search functionality with debounced loading state
- Infinite scroll via \`endReached\` callback
- Total count footer with loading indicator
- Automatic option selection via \`autoSelectOption\`

## GraphQL Query
\`\`\`graphql
query BAIBucketSelectQuery(
  $offset: Int!
  $limit: Int!
  $objectStorageId: ID!
  $first: Int
  $last: Int
  $before: String
  $after: String
) {
  objectStorage(id: $objectStorageId) {
    namespaces(
      offset: $offset
      limit: $limit
      first: $first
      last: $last
      before: $before
      after: $after
    ) {
      count
      edges {
        node {
          id
          namespace
        }
      }
    }
  }
}
\`\`\`

## Usage
\`\`\`tsx
<BAIBucketSelect
  objectStorageId="storage-1"
  placeholder="Select a bucket"
  onChange={(value) => console.log(value)}
/>
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    objectStorageId: {
      control: { type: 'text' },
      description: 'Object storage ID to fetch buckets from',
      table: {
        type: { summary: 'string' },
      },
    },
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
type Story = StoryObj<typeof BAIBucketSelect>;

// =============================================================================
// Stories
// =============================================================================

/**
 * Basic usage with 5 sample buckets.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 5 buckets from an object storage. The component automatically fetches and displays available namespaces.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ObjectStorage: () => ({
          namespaces: {
            count: 5,
            edges: sampleBuckets,
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        style={{ width: '300px' }}
      />
    </RelayResolver>
  ),
};

/**
 * Empty state when no buckets are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when no buckets are available in the object storage.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ObjectStorage: () => ({
          namespaces: {
            count: 0,
            edges: [],
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        style={{ width: '300px' }}
      />
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
        ObjectStorage: () => ({
          namespaces: {
            count: 5,
            edges: sampleBuckets,
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        disabled
        style={{ width: '300px' }}
      />
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
        ObjectStorage: () => ({
          namespaces: {
            count: 5,
            edges: sampleBuckets,
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        allowClear
        style={{ width: '300px' }}
      />
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
          'Demonstrates using a custom placeholder instead of the default.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ObjectStorage: () => ({
          namespaces: {
            count: 5,
            edges: sampleBuckets,
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        placeholder="Choose a bucket..."
        style={{ width: '300px' }}
      />
    </RelayResolver>
  ),
};

/**
 * Select with many bucket options showing pagination.
 */
export const ManyBuckets: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 20 buckets, showing pagination and infinite scroll behavior with total count footer.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ObjectStorage: () => ({
          namespaces: {
            count: 20,
            edges: sampleManyBuckets,
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        allowClear
        style={{ width: '300px' }}
      />
    </RelayResolver>
  ),
};

/**
 * Select with search functionality enabled.
 */
export const WithSearch: Story = {
  name: 'SearchEnabled',
  parameters: {
    docs: {
      description: {
        story:
          'Shows built-in search functionality. Type to filter buckets by namespace name. Search includes debounced loading state.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ObjectStorage: () => ({
          namespaces: {
            count: 5,
            edges: sampleBuckets,
          },
        }),
      }}
    >
      <BAIBucketSelectWithQuery
        objectStorageId="storage-1"
        placeholder="Search buckets..."
        allowClear
        style={{ width: '300px' }}
      />
    </RelayResolver>
  ),
};
