import RelayResolver from '../../tests/RelayResolver';
import BAIVFolderSelect from './BAIVFolderSelect';
import { Meta, StoryObj } from '@storybook/react-vite';

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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect />
      </div>
    </RelayResolver>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 0,
            edges: [],
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect />
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
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect disabled />
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
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect allowClear />
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
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect placeholder="Choose a virtual folder..." />
      </div>
    </RelayResolver>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 15,
            edges: sampleManyVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect allowClear />
      </div>
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
          'Shows built-in search functionality. Type to filter vfolders by name. Search includes debounced loading state.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect placeholder="Search folders..." allowClear />
      </div>
    </RelayResolver>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect
          onClickVFolder={(id: string) => alert(`Clicked vfolder: ${id}`)}
          allowClear
        />
      </div>
    </RelayResolver>
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
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect valuePropName="row_id" allowClear />
      </div>
    </RelayResolver>
  ),
};

/**
 * Select with project scoping enabled.
 */
export const WithProjectScoping: Story = {
  name: 'ProjectScoped',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates vfolder selection scoped to a specific project. Only vfolders belonging to the specified project are shown.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 3,
            edges: sampleVFolders.slice(0, 3),
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect
          currentProjectId="project-abc123"
          placeholder="Select folder in project..."
          allowClear
        />
      </div>
    </RelayResolver>
  ),
};

/**
 * Select with deleted vfolders excluded.
 */
export const ExcludeDeleted: Story = {
  name: 'ExcludeDeletedVFolders',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates automatic filtering of deleted or deleting vfolders using the excludeDeleted prop. Only active vfolders are shown.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_nodes: {
            count: 5,
            edges: sampleVFolders,
          },
        }),
      }}
    >
      <div style={{ width: '400px' }}>
        <BAIVFolderSelect excludeDeleted allowClear />
      </div>
    </RelayResolver>
  ),
};
