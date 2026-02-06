import { BAIUserNodesStoriesQuery } from '../__generated__/BAIUserNodesStoriesQuery.graphql';
import RelayResolver from '../tests/RelayResolver';
import BAIUserNodes from './BAIUserNodes';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIUserNodes displays a table of Backend.AI user nodes with GraphQL fragment integration.
 *
 * Key features:
 * - Relay fragment-based data fetching
 * - Customizable columns via `customizeColumns` function
 * - Optional sorting control with `disableSorter`
 * - i18n support for all column headers
 *
 * @see BAIUserNodes.tsx for implementation details
 */
const meta: Meta<typeof BAIUserNodes> = {
  title: 'Fragments/BAIUserNodes',
  component: BAIUserNodes,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIUserNodes** is a Relay fragment component that displays Backend.AI user data in a table format.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`usersFrgmt\` | \`BAIUserNodesFragment$key\` | required | Relay fragment reference for user data |
| \`customizeColumns\` | \`(columns) => columns\` | - | Function to customize base columns (insert, filter, reorder) |
| \`disableSorter\` | \`boolean\` | \`false\` | Disable sorting functionality for all columns |
| \`onChangeOrder\` | \`(order) => void\` | - | Callback when sort order changes (receives sorter key or null) |

## Available Sorter Keys
\`\`\`typescript
'email', 'username', 'full_name', 'role', 'resource_policy',
'domain_name', 'sudo_session_enabled', 'need_password_change',
'totp_activated', 'created_at', 'modified_at', 'status'
\`\`\`

For inherited BAITable props, refer to [BAITable component](?path=/docs/table-baitable--docs).

## Usage with Relay Query

\`\`\`tsx
const { users } = useLazyLoadQuery(
  graphql\`
    query MyQuery {
      users {
        ...BAIUserNodesFragment
      }
    }
  \`,
  {},
);

<BAIUserNodes usersFrgmt={users} />
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    usersFrgmt: {
      control: false,
      description: 'Relay fragment reference for user data',
    },
    customizeColumns: {
      control: false,
      description:
        'Function to customize columns (insert, filter, reorder). Receives base columns array and returns modified array.',
    },
    disableSorter: {
      control: { type: 'boolean' },
      description: 'When true, removes sorting capability from all columns',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChangeOrder: {
      action: 'orderChanged',
      description:
        'Callback when sort order changes. Receives sorter key (e.g., "email", "-email") or null.',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Shows loading skeleton (inherited from BAITable)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIUserNodes>;

// =============================================================================
// Sample Data
// =============================================================================

const mockUsers = [
  {
    id: 'VXNlck5vZGU6MQ==',
    email: 'admin@example.com',
    username: 'admin',
    full_name: 'System Administrator',
    role: 'superadmin',
    description: 'System administrator account',
    created_at: '2024-01-15T09:00:00Z',
    modified_at: '2024-12-01T15:30:00Z',
    status: 'active',
    domain_name: 'default',
    resource_policy: 'default',
    allowed_client_ip: null,
    container_gids: [],
    container_main_gid: null,
    container_uid: null,
    status_info: null,
    sudo_session_enabled: true,
    need_password_change: false,
    totp_activated: true,
    project_nodes: {
      count: 2,
      edges: [
        { node: { id: 'proj1', name: 'ml-training' } },
        { node: { id: 'proj2', name: 'data-analysis' } },
      ],
    },
  },
  {
    id: 'VXNlck5vZGU6Mg==',
    email: 'user@example.com',
    username: 'user1',
    full_name: 'John Doe',
    role: 'user',
    description: 'Regular user account',
    created_at: '2024-03-20T10:15:00Z',
    modified_at: '2024-11-28T08:45:00Z',
    status: 'active',
    domain_name: 'default',
    resource_policy: 'user-policy',
    allowed_client_ip: '192.168.1.0/24',
    container_gids: [1000, 1001],
    container_main_gid: 1000,
    container_uid: 5000,
    status_info: null,
    sudo_session_enabled: false,
    need_password_change: false,
    totp_activated: false,
    project_nodes: {
      count: 1,
      edges: [{ node: { id: 'proj3', name: 'dev-project' } }],
    },
  },
  {
    id: 'VXNlck5vZGU6Mw==',
    email: 'guest@example.com',
    username: 'guest',
    full_name: 'Guest User',
    role: 'user',
    description: null,
    created_at: '2024-06-10T14:20:00Z',
    modified_at: '2024-06-10T14:20:00Z',
    status: 'inactive',
    domain_name: 'guest-domain',
    resource_policy: 'limited',
    allowed_client_ip: null,
    container_gids: null,
    container_main_gid: null,
    container_uid: null,
    status_info: 'Account pending activation',
    sudo_session_enabled: false,
    need_password_change: true,
    totp_activated: false,
    project_nodes: {
      count: 0,
      edges: [],
    },
  },
];

const mockEdges = mockUsers.map((user) => ({ node: user }));

// =============================================================================
// Query Resolver
// =============================================================================

const QueryResolver: React.FC<
  Omit<ComponentProps<typeof BAIUserNodes>, 'usersFrgmt'>
> = (props) => {
  const { user_nodes } = useLazyLoadQuery<BAIUserNodesStoriesQuery>(
    graphql`
      query BAIUserNodesStoriesQuery {
        user_nodes {
          edges {
            node {
              ...BAIUserNodesFragment
            }
          }
        }
      }
    `,
    {},
  );

  const users = user_nodes?.edges
    ?.map((edge: any) => edge?.node)
    .filter(Boolean);
  return users && <BAIUserNodes usersFrgmt={users} {...props} />;
};

// =============================================================================
// Stories
// =============================================================================

/**
 * Basic usage showing a table of user nodes with default columns.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic table displaying user nodes with all default columns and sorting enabled.',
      },
    },
  },
  args: {
    disableSorter: false,
    loading: false,
  },
  render: ({ usersFrgmt: _usersFrgmt, ...args }) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          user_nodes: { edges: mockEdges },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Table with sorting disabled for all columns.
 */
export const DisabledSorter: Story = {
  name: 'WithoutSorting',
  parameters: {
    docs: {
      description: {
        story:
          'Table with `disableSorter={true}`, removing sort capability from all columns.',
      },
    },
  },
  args: {
    disableSorter: true,
    loading: false,
  },
  render: ({ usersFrgmt: _usersFrgmt, ...args }) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          user_nodes: { edges: mockEdges },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Table with loading state enabled.
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Shows loading skeleton while data is being fetched.',
      },
    },
  },
  args: {
    disableSorter: false,
    loading: true,
  },
  render: ({ usersFrgmt: _usersFrgmt, ...args }) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          user_nodes: { edges: mockEdges },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Table with empty data showing placeholder message.
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows empty state when no user data is available.',
      },
    },
  },
  args: {
    disableSorter: false,
    loading: false,
  },
  render: ({ usersFrgmt: _usersFrgmt, ...args }) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          user_nodes: { edges: [] },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Demonstrates customizeColumns functionality to reorder and filter columns.
 */
export const CustomizedColumns: Story = {
  name: 'CustomColumns',
  parameters: {
    docs: {
      description: {
        story:
          'Uses `customizeColumns` to show only email, username, role, and status columns in custom order.',
      },
    },
  },
  args: {
    disableSorter: false,
    loading: false,
    customizeColumns: (baseColumns) => {
      const selectedKeys = ['email', 'username', 'role', 'status'];
      return baseColumns.filter((col) =>
        selectedKeys.includes(col.key as string),
      );
    },
  },
  render: ({ usersFrgmt: _usersFrgmt, ...args }) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          user_nodes: { edges: mockEdges },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Demonstrates onChangeOrder callback for handling sort events.
 */
export const WithSortCallback: Story = {
  name: 'SortCallback',
  parameters: {
    docs: {
      description: {
        story:
          'Uses `onChangeOrder` to log sort events. Click column headers to see sort order changes in Actions panel.',
      },
    },
  },
  args: {
    disableSorter: false,
    loading: false,
  },
  render: ({ usersFrgmt: _usersFrgmt, ...args }) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          user_nodes: { edges: mockEdges },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};
