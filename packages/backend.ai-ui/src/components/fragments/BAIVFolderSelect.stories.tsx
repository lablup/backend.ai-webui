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

// V2 VFolder mock shape: `id`, `status`, `metadata { name }`. The component
// derives local UUIDs (used for `valuePropName='row_id'`) via `toLocalId(id)`
// at render time, so stories no longer need to provide a separate `row_id`.
const sampleVFolders = [
  {
    node: {
      id: 'VkZvbGRlcjphYmNkMTIzNC01Njc4LTkwZWYtZ2hpai1rbG1ub3BxcnN0dXY=',
      status: 'READY',
      metadata: {
        name: 'my-project-data',
      },
    },
  },
  {
    node: {
      id: 'VkZvbGRlcjp3eHl6OTg3Ni01NDMyLTEwYWItY2RlZi1naGlqa2xtbm9wcXI=',
      status: 'READY',
      metadata: {
        name: 'shared-datasets',
      },
    },
  },
  {
    node: {
      id: 'VkZvbGRlcjphYWFhMTExMS0yMjIyLTMzMzMtNDQ0NC01NTU1NjY2Njc3Nzc=',
      status: 'READY',
      metadata: {
        name: 'model-checkpoints',
      },
    },
  },
  {
    node: {
      id: 'VkZvbGRlcjpiYmJiMjIyMi0zMzMzLTQ0NDQtNTU1NS02NjY2Nzc3Nzg4ODg=',
      status: 'READY',
      metadata: {
        name: 'training-logs',
      },
    },
  },
  {
    node: {
      id: 'VkZvbGRlcjpjY2NjMzMzMy00NDQ0LTU1NTUtNjY2Ni03Nzc3ODg4ODk5OTk=',
      status: 'READY',
      metadata: {
        name: 'test-results',
      },
    },
  },
];

const sampleManyVFolders = Array.from({ length: 15 }, (_, i) => ({
  node: {
    id: btoa(`VFolder:00000000-aaaa-bbbb-cccc-${String(i).padStart(12, '0')}`),
    status: 'READY',
    metadata: {
      name: `vfolder-${i + 1}`,
    },
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
| \`currentProjectId\` | \`string\` | - | Project ID to scope vfolder selection. When set, the paginated query uses \`projectVfolders\`; otherwise \`myVfolders\`. |
| \`onClickVFolder\` | \`(value: string) => void\` | - | Callback when vfolder name is clicked |
| \`filter\` | \`VFolderFilter \\| null\` | - | Additional structured filter merged into the paginated query (AND-combined with internal filters) |
| \`valuePropName\` | \`'id' \\| 'row_id'\` | \`'id'\` | Which field to use as option value |
| \`excludeDeleted\` | \`boolean\` | \`false\` | Exclude deleted or deleting vfolders |
| \`ref\` | \`React.Ref<BAIVFolderSelectRef>\` | - | Ref exposing \`refetch()\` method |

## Features
- Strawberry V2 GraphQL queries:
  - \`BAIVFolderSelectValueQuery\`: Resolves preselected vfolders by id via aliased \`vfolderV2(vfolderId:)\` lookups (up to 10 slots)
  - \`BAIVFolderSelectPaginatedQuery\`: Paginated \`myVfolders\` / \`projectVfolders\` depending on \`currentProjectId\`
- Pagination support with \`useLazyPaginatedQuery\` hook
- Search functionality with debounced loading state, using \`VFolderFilter.name.iContains\`
- Infinite scroll via \`endReached\` callback
- Total count footer with loading indicator
- Custom label/option rendering with ID display (truncated)
- Clickable vfolder names when \`onClickVFolder\` is provided
- Automatic filtering of deleted vfolders via \`VFolderOperationStatusFilter\` when \`excludeDeleted\` is true
- Project scoping through \`currentProjectId\` prop
- Optimistic UI updates for smooth user experience
- Exposed \`refetch()\` method via ref

## GraphQL Queries

### Value Query (for selected items)
\`\`\`graphql
query BAIVFolderSelectValueQuery(
  $id0: UUID!
  $include0: Boolean!
  # ... up to $id9 / $include9
) {
  v0: vfolderV2(vfolderId: $id0) @include(if: $include0) {
    id
    metadata { name }
  }
  # ... v1..v9
}
\`\`\`

### Paginated Query (for available options)
\`\`\`graphql
query BAIVFolderSelectPaginatedQuery(
  $offset: Int!
  $limit: Int!
  $projectId: UUID!
  $filter: VFolderFilter
  $orderBy: [VFolderOrderBy!]
  $useProject: Boolean!
) {
  myVfolders(offset: $offset, limit: $limit, filter: $filter, orderBy: $orderBy)
    @skip(if: $useProject) {
    count
    edges { node { id metadata { name } } }
  }
  projectVfolders(
    projectId: $projectId
    offset: $offset
    limit: $limit
    filter: $filter
    orderBy: $orderBy
  ) @include(if: $useProject) {
    count
    edges { node { id metadata { name } } }
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

// With project scoping (uses projectVfolders)
<BAIVFolderSelect
  currentProjectId="project-123"
  excludeDeleted
  onChange={(value) => console.log(value)}
/>

// With structured filter
<BAIVFolderSelect
  filter={{ name: { iContains: 'test' } }}
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
      control: false,
      description:
        'Additional VFolderFilter merged into the paginated query (e.g., `{ name: { iContains: "test" } }`)',
      table: {
        type: { summary: 'VFolderFilter | null' },
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
          myVfolders: {
            count: 5,
            edges: sampleVFolders,
          },
          projectVfolders: {
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
          myVfolders: {
            count: 0,
            edges: [],
          },
          projectVfolders: {
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
          myVfolders: {
            count: 15,
            edges: sampleManyVFolders,
          },
          projectVfolders: {
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
          myVfolders: {
            count: 5,
            edges: sampleVFolders,
          },
          projectVfolders: {
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
          myVfolders: {
            count: 5,
            edges: sampleVFolders,
          },
          projectVfolders: {
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
