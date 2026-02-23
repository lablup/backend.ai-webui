import { RelayResolverProps } from '../../tests/RelayResolver';
import BAIVFolderSelect from './BAIVFolderSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Suspense } from 'react';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

/**
 * BAIVFolderSelect uses dual GraphQL queries (ValueQuery + PaginatedQuery)
 * and re-fetches on selection. The shared RelayResolver only queues 1 resolver,
 * which is insufficient. This dedicated resolver queues enough resolvers
 * to handle multiple operations.
 */
const VFolderRelayResolver = ({
  children,
  mockResolvers = {},
}: RelayResolverProps) => {
  const environment = createMockEnvironment();
  for (let i = 0; i < 20; i++) {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, mockResolvers),
    );
  }

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Suspense fallback="Loading...">{children}</Suspense>
    </RelayEnvironmentProvider>
  );
};

const sampleVFolders = [
  {
    node: {
      id: 'VkZvbGRlck5vZGU6MTIzNDU2Nzg5MA==',
      name: 'my-project-data',
      row_id: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
    },
  },
  {
    node: {
      id: 'VkZvbGRlck5vZGU6MDk4NzY1NDMyMQ==',
      name: 'shared-datasets',
      row_id: 'wxyz9876-5432-10ab-cdef-ghijklmnopqr',
    },
  },
  {
    node: {
      id: 'VkZvbGRlck5vZGU6MTExMTExMTExMQ==',
      name: 'model-checkpoints',
      row_id: 'aaaa1111-2222-3333-4444-555566667777',
    },
  },
  {
    node: {
      id: 'VkZvbGRlck5vZGU6MjIyMjIyMjIyMg==',
      name: 'training-logs',
      row_id: 'bbbb2222-3333-4444-5555-666677778888',
    },
  },
  {
    node: {
      id: 'VkZvbGRlck5vZGU6MzMzMzMzMzMzMw==',
      name: 'test-results',
      row_id: 'cccc3333-4444-5555-6666-777788889999',
    },
  },
];

const sampleManyVFolders = Array.from({ length: 15 }, (_, i) => ({
  node: {
    id: `VkZvbGRlck5vZGU6${i + 1000000000}`,
    name: `vfolder-${i + 1}`,
    row_id: `${i.toString().padStart(8, '0')}-aaaa-bbbb-cccc-ddddeeeefffff`,
  },
}));

/**
 * BAIVFolderSelect is a specialized Select component that fetches and displays
 * virtual folders (vfolders) using GraphQL with advanced features.
 *
 * Key features:
 * - Dual GraphQL queries for selected values and available options
 * - Pagination support with infinite scroll
 * - Search functionality with debouncing
 * - Project scoping via currentProjectId
 * - Exclude deleted vfolders option
 * - Custom label rendering with ID display
 * - Clickable vfolder names support
 * - Optimistic UI updates for smooth UX
 *
 * @see BAIVFolderSelect.tsx for implementation details
 */
const meta: Meta<typeof BAIVFolderSelect> = {
  title: 'Fragments/BAIVFolderSelect',
  component: BAIVFolderSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIVFolderSelect** extends [BAISelect](/?path=/docs/components-input-baiselect--docs) to fetch and display virtual folders (vfolders).

## BAI-Specific Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`currentProjectId\` | \`string\` | - | Project ID to scope vfolder selection |
| \`onClickVFolder\` | \`(value: string) => void\` | - | Callback when vfolder name is clicked |
| \`filter\` | \`string\` | - | Additional filter string for vfolder query |
| \`valuePropName\` | \`'id' \\| 'row_id'\` | \`'id'\` | Which field to use as option value |
| \`excludeDeleted\` | \`boolean\` | \`false\` | Exclude deleted or deleting vfolders |
| \`ref\` | \`React.Ref<BAIVFolderSelectRef>\` | - | Ref exposing \`refetch()\` method |

## Features
- Fetches vfolders from two GraphQL queries:
  - \`BAIVFolderSelectValueQuery\`: Fetch selected vfolder labels
  - \`BAIVFolderSelectPaginatedQuery\`: Fetch paginated available vfolders
- Pagination support with \`useLazyPaginatedQuery\` hook
- Search functionality with debounced loading state
- Infinite scroll via \`endReached\` callback
- Total count footer with loading indicator
- Custom label/option rendering with ID display (truncated)
- Clickable vfolder names when \`onClickVFolder\` is provided
- Automatic filtering of deleted vfolders when \`excludeDeleted\` is true
- Project scoping through \`currentProjectId\` prop
- Optimistic UI updates for smooth user experience
- Exposed \`refetch()\` method via ref

## GraphQL Queries

### Value Query (for selected items)
\`\`\`graphql
query BAIVFolderSelectValueQuery(
  $selectedFilter: String
  $skipSelectedVFolder: Boolean!
  $scopeId: ScopeField
) {
  vfolder_nodes(
    scope_id: $scopeId
    filter: $selectedFilter
    permission: "read_attribute"
  ) @skip(if: $skipSelectedVFolder) {
    edges {
      node {
        name
        id
        row_id
      }
    }
  }
}
\`\`\`

### Paginated Query (for available options)
\`\`\`graphql
query BAIVFolderSelectPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $scopeId: ScopeField
  $filter: String
  $permission: VFolderPermissionValueField
) {
  vfolder_nodes(
    scope_id: $scopeId
    offset: $offset
    first: $limit
    filter: $filter
    permission: $permission
    order: "-created_at"
  ) {
    count
    edges {
      node {
        id
        name
        row_id
      }
    }
  }
}
\`\`\`

## Usage
\`\`\`tsx
// Basic usage
<BAIVFolderSelect
  placeholder="Select a folder"
  onChange={(value) => console.log(value)}
/>

// With project scoping
<BAIVFolderSelect
  currentProjectId="project-123"
  excludeDeleted
  onChange={(value) => console.log(value)}
/>

// With clickable names
<BAIVFolderSelect
  onClickVFolder={(id) => window.open(\`/vfolder/\${id}\`)}
  onChange={(value) => console.log(value)}
/>

// With ref for refetching
const ref = useRef<BAIVFolderSelectRef>(null);
<BAIVFolderSelect
  ref={ref}
  onChange={(value) => console.log(value)}
/>
// Later: ref.current?.refetch()
\`\`\`

For all other props, refer to [BAISelect](/?path=/docs/components-input-baiselect--docs).
        `,
      },
    },
  },
  argTypes: {
    currentProjectId: {
      control: { type: 'text' },
      description: 'Project ID to scope vfolder selection',
      table: {
        type: { summary: 'string' },
      },
    },
    onClickVFolder: {
      action: 'vfolder-clicked',
      description: 'Callback when vfolder name is clicked',
    },
    filter: {
      control: { type: 'text' },
      description:
        'Additional filter string for vfolder query (e.g., "name ilike \'%test%\'")',
      table: {
        type: { summary: 'string' },
      },
    },
    valuePropName: {
      control: { type: 'select' },
      options: ['id', 'row_id'],
      description: 'Which field to use as option value',
      table: {
        type: { summary: "'id' | 'row_id'" },
        defaultValue: { summary: 'id' },
      },
    },
    excludeDeleted: {
      control: { type: 'boolean' },
      description: 'Exclude deleted or deleting vfolders from the list',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text when no value is selected',
      table: {
        type: { summary: 'string' },
        defaultValue: {
          summary: 'i18n: comp:BAIVFolderSelect.SelectFolder',
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
type Story = StoryObj<typeof BAIVFolderSelect>;

/**
 * Basic usage with 5 sample virtual folders.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage showing 5 virtual folders. Each option displays the folder name and a truncated ID. Search functionality is enabled by default.',
      },
    },
  },
  args: {},
  render: (args) => (
    <VFolderRelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <BAIVFolderSelect {...args} style={{ width: '400px' }} />
    </VFolderRelayResolver>
  ),
};

/**
 * Empty state when no virtual folders are available.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the component when no virtual folders are configured or accessible.',
      },
    },
  },
  args: {},
  render: (args) => (
    <VFolderRelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 0,
            edges: [],
          },
        }),
      }}
    >
      <BAIVFolderSelect {...args} style={{ width: '400px' }} />
    </VFolderRelayResolver>
  ),
};

/**
 * Select with many virtual folder options showing pagination.
 */
export const ManyVFolders: Story = {
  name: 'ManyOptions',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the component with 15 virtual folders, showing pagination and infinite scroll behavior with total count footer.',
      },
    },
  },
  args: {
    allowClear: true,
  },
  render: (args) => (
    <VFolderRelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 15,
            edges: sampleManyVFolders,
          },
        }),
      }}
    >
      <BAIVFolderSelect {...args} style={{ width: '400px' }} />
    </VFolderRelayResolver>
  ),
};

/**
 * Select with clickable vfolder names.
 */
export const WithClickableNames: Story = {
  name: 'ClickableVFolderNames',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates clickable vfolder names using the onClickVFolder prop. Clicking a vfolder name triggers the callback instead of displaying the ID.',
      },
    },
  },
  args: {
    allowClear: true,
  },
  render: (args) => (
    <VFolderRelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <BAIVFolderSelect
        {...args}
        onClickVFolder={(id: string) => alert(`Clicked vfolder: ${id}`)}
        style={{ width: '400px' }}
      />
    </VFolderRelayResolver>
  ),
};

/**
 * Select using row_id instead of global ID.
 */
export const WithRowId: Story = {
  name: 'UsingRowId',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates using row_id as the value property instead of the default global ID. Useful when working with UUID-based APIs.',
      },
    },
  },
  args: {
    valuePropName: 'row_id' as const,
    allowClear: true,
  },
  render: (args) => (
    <VFolderRelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <BAIVFolderSelect {...args} style={{ width: '400px' }} />
    </VFolderRelayResolver>
  ),
};
