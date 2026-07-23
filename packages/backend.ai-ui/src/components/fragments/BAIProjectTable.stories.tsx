import { BAIProjectTableStoriesQuery } from '../../__generated__/BAIProjectTableStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import {
  locales,
  mockAnonymousClientFactory,
  mockClientPromise,
  mockDeviceMetaData,
} from '../../tests/storybook-mock-utils';
import { BAIConfigProvider } from '../provider/BAIConfigProvider';
import { BAIMetaDataProvider } from '../provider/BAIMetaDataProvider';
import BAIProjectTable, {
  availableProjectSorterValues,
} from './BAIProjectTable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIProjectTable is a specialized table component for displaying Backend.AI project (group) information.
 *
 * Key features:
 * - GraphQL/Relay integration for project data
 * - Pre-configured columns for project details (name, domain, description, resource slots, etc.)
 * - Sortable columns support
 * - Resource slots visualization
 * - Container registry information
 *
 * Per-row actions (edit / deactivate / activate / purge) are intentionally NOT
 * shown in these stories — the component itself ships only the data columns,
 * and pages compose actions via `customizeColumns` (see `ProjectPage.tsx`).
 *
 * @see BAIProjectTable.tsx for implementation details
 */
const meta: Meta<typeof BAIProjectTable> = {
  title: 'Fragments/BAIProjectTable',
  component: BAIProjectTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**BAIProjectTable** is a specialized table component for displaying Backend.AI project (group) information with Relay GraphQL integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`projectFragment\` | \`BAIProjectTableFragment$key\` | - | GraphQL fragment reference (required) |
| \`onChangeOrder\` | \`(order: ProjectSorterValue \\| null) => void\` | - | Callback when sort order changes |
| \`customizeColumns\` | \`(columns) => columns\` | - | Customize base columns (insert, filter, reorder, or override a column's \`render\`). The page composes the per-row action list (edit / deactivate / activate / purge) by overriding the \`name\` column here so action logic stays in the app layer |

## Pre-configured Columns
- **Name**: Project name (sortable) — override via \`customizeColumns\` to compose row actions
- **Domain**: Domain name (sortable)
- **Description**: Project description
- **Created At**: Creation timestamp (sortable)
- **Is Active**: Active status with tag (sortable)
- **Type**: Project type (GENERAL, MODEL_STORE)
- **Total Resource Slots**: Resource allocation display
- **Resource Policy**: Associated resource policy name (sortable)
- **Storage Nodes**: Allowed vfolder hosts with permissions
- **Scaling Groups**: Associated scaling groups
- **Container Registry**: Registry and project details
- **Project ID**: Global ID (sortable, copyable)
- **Integration ID**: External integration ID

For other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).
        `,
      },
    },
  },
  argTypes: {
    projectFragment: {
      control: false,
      description: 'GraphQL fragment reference for project data',
      table: {
        type: { summary: 'BAIProjectTableFragment$key' },
      },
    },
    onChangeOrder: {
      action: 'order-changed',
      description: 'Callback when sort order changes',
      table: {
        type: {
          summary: '(order: ProjectSorterValue | null) => void',
        },
      },
    },
    customizeColumns: {
      control: false,
      description:
        'Function to customize columns (insert, filter, reorder, or override a column render). Receives base columns array and returns modified array. The page composes the per-row action list (edit / deactivate / activate / purge) by overriding the name column here.',
      table: {
        type: {
          summary: '(columns) => columns',
        },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const baiLocale = locales[locale] || locales.en;

      return (
        <App>
          <BAIConfigProvider
            locale={baiLocale}
            clientPromise={mockClientPromise}
            anonymousClientFactory={mockAnonymousClientFactory}
          >
            <BAIMetaDataProvider deviceMetaData={mockDeviceMetaData}>
              <Story />
            </BAIMetaDataProvider>
          </BAIConfigProvider>
        </App>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BAIProjectTable>;

interface QueryResolverProps extends Pick<
  React.ComponentProps<typeof BAIProjectTable>,
  'customizeColumns' | 'onChangeOrder' | 'loading' | 'order'
> {}

const QueryResolver: React.FC<QueryResolverProps> = ({
  customizeColumns,
  onChangeOrder,
  loading,
  order,
}) => {
  const { group_nodes } = useLazyLoadQuery<BAIProjectTableStoriesQuery>(
    graphql`
      query BAIProjectTableStoriesQuery {
        group_nodes(offset: 0, first: 100) {
          edges {
            node {
              ...BAIProjectTableFragment
            }
          }
          count
        }
        vfolder_host_permissions {
          vfolder_host_permission_list
        }
      }
    `,
    {},
  );

  const projectNodes =
    group_nodes?.edges
      .map((e) => e?.node)
      .filter((node): node is NonNullable<typeof node> => !!node) ?? [];

  return (
    <BAIProjectTable
      projectFragment={projectNodes}
      customizeColumns={customizeColumns}
      onChangeOrder={onChangeOrder}
      loading={loading}
      order={order}
      pagination={{
        total: group_nodes?.count ?? 0,
        pageSize: 10,
      }}
    />
  );
};

const mockVfolderHostPermissions = {
  vfolder_host_permission_list: ['read', 'write', 'delete', 'mount_in_session'],
};

const generateMockProject = (id: number, overrides = {}) => ({
  id: btoa(`GroupNode:group-${id}`),
  row_id: `group-uuid-${id}`,
  name: `project-${id}`,
  domain_name: id % 2 === 0 ? 'domain-a' : 'domain-b',
  description: `Description for project ${id}`,
  is_active: id % 3 !== 0,
  created_at: new Date(Date.now() - id * 7 * 24 * 60 * 60 * 1000).toISOString(),
  total_resource_slots: JSON.stringify({
    cpu: `${(id + 1) * 4}`,
    mem: `${(id + 1) * 8}g`,
    'cuda.device': `${id % 3}`,
  }),
  integration_id: id % 2 === 0 ? `integration-${id}` : null,
  resource_policy: `user-policy-${id}`,
  type: id % 5 === 0 ? 'MODEL_STORE' : 'GENERAL',
  container_registry: JSON.stringify({
    registry: id % 2 === 0 ? 'cr.backend.ai' : 'docker.io',
    project: `project-${id}`,
  }),
  scaling_groups: id % 2 === 0 ? ['default', `sg-${id}`] : ['default'],
  allowed_vfolder_hosts:
    id % 2 === 0
      ? JSON.stringify({
          local: ['read', 'write', 'delete', 'mount_in_session'],
          nfs: ['read', 'write'],
        })
      : JSON.stringify({
          local: ['read', 'write'],
        }),
  ...overrides,
});

/**
 * Basic project table showing the default `active` view used in ProjectPage —
 * all rows share the same Edit + Deactivate action set. The last row is a
 * MODEL_STORE project, which keeps its buttons visible but disabled.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Default project table view as seen on the ProjectPage `Active` tab. All projects are active; the final MODEL_STORE row demonstrates the disabled action state.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_host_permissions: mockVfolderHostPermissions,
          group_nodes: {
            edges: [
              {
                node: generateMockProject(1, {
                  type: 'GENERAL',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(2, {
                  type: 'GENERAL',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(3, {
                  type: 'GENERAL',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(4, {
                  type: 'GENERAL',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(5, {
                  type: 'MODEL_STORE',
                  is_active: true,
                }),
              },
            ],
            count: 5,
          },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Project table showing different project types.
 */
export const DifferentTypes: Story = {
  name: 'DifferentTypes',
  parameters: {
    docs: {
      description: {
        story:
          'Displays projects with different types (GENERAL, MODEL_STORE). MODEL_STORE projects have restricted controls.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_host_permissions: mockVfolderHostPermissions,
          group_nodes: {
            edges: [
              {
                node: generateMockProject(1, {
                  name: 'general-project-1',
                  type: 'GENERAL',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(2, {
                  name: 'general-project-2',
                  type: 'GENERAL',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(3, {
                  name: 'model-store-project',
                  type: 'MODEL_STORE',
                  is_active: true,
                }),
              },
            ],
            count: 3,
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Project table showing active and inactive projects.
 */
export const ActiveInactiveStates: Story = {
  name: 'ActiveInactiveStates',
  parameters: {
    docs: {
      description: {
        story:
          'Displays projects with different active states. Inactive projects have disabled deactivate buttons.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_host_permissions: mockVfolderHostPermissions,
          group_nodes: {
            edges: [
              {
                node: generateMockProject(1, {
                  name: 'active-project-1',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(2, {
                  name: 'active-project-2',
                  is_active: true,
                }),
              },
              {
                node: generateMockProject(3, {
                  name: 'inactive-project-1',
                  is_active: false,
                }),
              },
              {
                node: generateMockProject(4, {
                  name: 'inactive-project-2',
                  is_active: false,
                }),
              },
            ],
            count: 4,
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Project table with sorting functionality demonstration.
 */
export const WithSorting: Story = {
  name: 'WithSorting',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates sorting functionality. Click column headers to sort by name, domain, created date, etc.',
      },
    },
  },
  render: () => {
    const [order, setOrder] = useState<
      (typeof availableProjectSorterValues)[number] | null
    >(null);

    return (
      <div>
        <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5' }}>
          <strong>Current Order:</strong> {order || 'None'}
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              vfolder_host_permissions: mockVfolderHostPermissions,
              group_nodes: {
                edges: [
                  {
                    node: generateMockProject(1, {
                      name: 'alpha-project',
                      created_at: new Date('2024-01-15').toISOString(),
                    }),
                  },
                  {
                    node: generateMockProject(2, {
                      name: 'beta-project',
                      created_at: new Date('2024-02-20').toISOString(),
                    }),
                  },
                  {
                    node: generateMockProject(3, {
                      name: 'gamma-project',
                      created_at: new Date('2024-03-10').toISOString(),
                    }),
                  },
                ],
                count: 3,
              },
            }),
          }}
        >
          <QueryResolver
            order={order}
            onChangeOrder={(newOrder) => setOrder(newOrder)}
          />
        </RelayResolver>
      </div>
    );
  },
};

/**
 * Project table in loading state.
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the project table in a loading state with reduced opacity.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_host_permissions: mockVfolderHostPermissions,
          group_nodes: {
            edges: [
              { node: generateMockProject(1) },
              { node: generateMockProject(2) },
            ],
            count: 2,
          },
        }),
      }}
    >
      <QueryResolver loading={true} />
    </RelayResolver>
  ),
};

/**
 * Project table with no projects (empty state).
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the project table when no projects are available.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_host_permissions: mockVfolderHostPermissions,
          group_nodes: {
            edges: [],
            count: 0,
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Project table showing various resource allocations.
 */
export const VariousResourceAllocations: Story = {
  name: 'VariousResourceAllocations',
  parameters: {
    docs: {
      description: {
        story:
          'Displays projects with different resource slot allocations (CPU, memory, GPU).',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          vfolder_host_permissions: mockVfolderHostPermissions,
          group_nodes: {
            edges: [
              {
                node: generateMockProject(1, {
                  name: 'high-resource-project',
                  total_resource_slots: JSON.stringify({
                    cpu: '64',
                    mem: '256g',
                    'cuda.device': '8',
                  }),
                }),
              },
              {
                node: generateMockProject(2, {
                  name: 'medium-resource-project',
                  total_resource_slots: JSON.stringify({
                    cpu: '16',
                    mem: '64g',
                    'cuda.device': '2',
                  }),
                }),
              },
              {
                node: generateMockProject(3, {
                  name: 'low-resource-project',
                  total_resource_slots: JSON.stringify({
                    cpu: '4',
                    mem: '16g',
                  }),
                }),
              },
              {
                node: generateMockProject(4, {
                  name: 'no-resource-project',
                  total_resource_slots: JSON.stringify({}),
                }),
              },
            ],
            count: 4,
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Real-world example with realistic project names, mixed types, and sort
 * tracking.
 */
export const RealWorldExample: Story = {
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a realistic use case combining mixed project types and sort interaction.',
      },
    },
  },
  render: () => {
    const [order, setOrder] = useState<
      (typeof availableProjectSorterValues)[number] | null
    >(null);

    return (
      <div>
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          <strong>Current Order:</strong> {order || 'None'}
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              vfolder_host_permissions: mockVfolderHostPermissions,
              group_nodes: {
                edges: [
                  {
                    node: generateMockProject(1, {
                      name: 'ml-research-team',
                      type: 'GENERAL',
                      is_active: true,
                      total_resource_slots: JSON.stringify({
                        cpu: '32',
                        mem: '128g',
                        'cuda.device': '4',
                      }),
                    }),
                  },
                  {
                    node: generateMockProject(2, {
                      name: 'data-analysis-team',
                      type: 'GENERAL',
                      is_active: true,
                      total_resource_slots: JSON.stringify({
                        cpu: '16',
                        mem: '64g',
                        'cuda.device': '2',
                      }),
                    }),
                  },
                  {
                    node: generateMockProject(3, {
                      name: 'legacy-project',
                      type: 'GENERAL',
                      is_active: false,
                      total_resource_slots: JSON.stringify({
                        cpu: '8',
                        mem: '32g',
                      }),
                    }),
                  },
                  {
                    node: generateMockProject(4, {
                      name: 'model-repository',
                      type: 'MODEL_STORE',
                      is_active: true,
                      total_resource_slots: JSON.stringify({}),
                    }),
                  },
                ],
                count: 4,
              },
            }),
          }}
        >
          <QueryResolver
            order={order}
            onChangeOrder={(newOrder) => setOrder(newOrder)}
          />
        </RelayResolver>
      </div>
    );
  },
};
