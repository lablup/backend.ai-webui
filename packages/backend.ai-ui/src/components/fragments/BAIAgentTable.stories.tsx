import { BAIAgentTableStoriesQuery } from '../../__generated__/BAIAgentTableStoriesQuery.graphql';
import { BAILocale } from '../../locale';
import RelayResolver from '../../tests/RelayResolver';
import { BAIClient } from '../provider/BAIClientProvider';
import { BAIConfigProvider } from '../provider/BAIConfigProvider';
import {
  BAIMetaDataProvider,
  type DeviceMetaData,
} from '../provider/BAIMetaDataProvider';
import BAIAgentTable, { AgentNodeInList } from './BAIAgentTable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Mock BAIClient for Storybook
const mockClient = {
  utils: {
    elapsedTime: (start: string | Date, end: number) => {
      const startTime = new Date(start).getTime();
      const elapsed = end - startTime;
      const seconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d ${hours % 24}h`;
      if (hours > 0) return `${hours}h ${minutes % 60}m`;
      if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
      return `${seconds}s`;
    },
  },
} as unknown as BAIClient;

const mockClientPromise = Promise.resolve(mockClient);
const mockAnonymousClientFactory = () => mockClient;

// Simple locale setup for Storybook
const locales = {
  en: { lang: 'en', antdLocale: enUS },
  ko: { lang: 'ko', antdLocale: koKR },
} as const;

// Mock device metadata for BAIMetaDataProvider
const mockDeviceMetaData: DeviceMetaData = {
  cpu: {
    slot_name: 'cpu',
    description: 'CPU',
    human_readable_name: 'CPU',
    display_unit: 'Core',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'cpu',
  },
  mem: {
    slot_name: 'mem',
    description: 'Memory',
    human_readable_name: 'Memory',
    display_unit: 'GiB',
    number_format: { binary: true, round_length: 2 },
    display_icon: 'mem',
  },
  'cuda.device': {
    slot_name: 'cuda.device',
    description: 'NVIDIA GPU',
    human_readable_name: 'GPU',
    display_unit: 'GPU',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'nvidia',
  },
  'cuda.shares': {
    slot_name: 'cuda.shares',
    description: 'NVIDIA GPU (fractional)',
    human_readable_name: 'GPU',
    display_unit: 'FGPU',
    number_format: { binary: false, round_length: 2 },
    display_icon: 'nvidia',
  },
};

/**
 * BAIAgentTable is a specialized table component for displaying Backend.AI agent information.
 *
 * Key features:
 * - GraphQL/Relay integration for agent data
 * - Pre-configured columns for agent details (ID, region, architecture, resource allocation, etc.)
 * - Custom column customization via `customizeColumns` pattern
 * - Clickable agent names with callback support
 * - Typed sorting with available sorter keys
 *
 * @see BAIAgentTable.tsx for implementation details
 */
const meta: Meta<typeof BAIAgentTable> = {
  title: 'Fragments/BAIAgentTable',
  component: BAIAgentTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIAgentTable** is a specialized table component for displaying Backend.AI agent information with Relay GraphQL integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`agentsFragment\` | \`BAIAgentTableFragment$key\` | - | GraphQL fragment reference (required) |
| \`onClickAgentName\` | \`(agent: AgentNodeInList) => void\` | - | Callback when agent name is clicked |
| \`onChangeOrder\` | \`(order: string \\| undefined) => void\` | - | Callback for sorting with typed order values |
| \`customizeColumns\` | \`(baseColumns: BAIColumnType[]) => BAIColumnType[]\` | - | Function to customize table columns |

## Available Sorter Keys
- \`first_contact\`
- \`scaling_group\`
- \`status\`
- \`schedulable\`

Use with prefix \`-\` for descending order (e.g., \`'-first_contact'\`).

## Pre-configured Columns
- **ID / Endpoint**: Agent row ID and address
- **Region**: Agent region
- **Architecture**: CPU architecture
- **Starts**: First contact time and running duration
- **Allocation**: Resource allocation (CPU, memory, GPU, etc.) with progress bars
- **Utilization**: Live resource utilization statistics
- **Disk %**: Disk usage percentage
- **Resource Group**: Scaling group name
- **Status**: Agent status, CUDA version, plugin info
- **Schedulable**: Whether agent can schedule new sessions

For other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).
        `,
      },
    },
  },
  argTypes: {
    agentsFragment: {
      control: false,
      description: 'GraphQL fragment reference for agent data',
      table: {
        type: { summary: 'BAIAgentTableFragment$key' },
      },
    },
    onClickAgentName: {
      action: 'agent-name-clicked',
      description: 'Callback when agent name is clicked',
      table: {
        type: { summary: '(agent: AgentNodeInList) => void' },
      },
    },
    onChangeOrder: {
      action: 'order-changed',
      description: 'Callback for sorting with typed order values',
      table: {
        type: { summary: '(order: string | undefined) => void' },
      },
    },
    customizeColumns: {
      control: false,
      description: 'Function to customize table columns',
      table: {
        type: {
          summary: '(baseColumns: BAIColumnType[]) => BAIColumnType[]',
        },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const baiLocale: BAILocale =
        locales[locale as keyof typeof locales] || locales.en;

      return (
        <BAIConfigProvider
          locale={baiLocale}
          clientPromise={mockClientPromise}
          anonymousClientFactory={mockAnonymousClientFactory}
        >
          <BAIMetaDataProvider deviceMetaData={mockDeviceMetaData}>
            <Story />
          </BAIMetaDataProvider>
        </BAIConfigProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BAIAgentTable>;

interface QueryResolverProps extends Pick<
  React.ComponentProps<typeof BAIAgentTable>,
  | 'onClickAgentName'
  | 'onChangeOrder'
  | 'customizeColumns'
  | 'loading'
  | 'order'
> {}

const QueryResolver: React.FC<QueryResolverProps> = ({
  onClickAgentName,
  onChangeOrder,
  customizeColumns,
  loading,
  order,
}) => {
  const { agent_nodes } = useLazyLoadQuery<BAIAgentTableStoriesQuery>(
    graphql`
      query BAIAgentTableStoriesQuery {
        agent_nodes(offset: 0, first: 100) {
          edges {
            node {
              ...BAIAgentTableFragment
            }
          }
          count
        }
      }
    `,
    {},
  );

  const agents =
    agent_nodes?.edges
      .map((e) => e?.node)
      .filter((node): node is NonNullable<typeof node> => !!node) ?? [];

  return (
    <BAIAgentTable
      agentsFragment={agents}
      onClickAgentName={onClickAgentName}
      onChangeOrder={onChangeOrder}
      customizeColumns={customizeColumns}
      loading={loading}
      order={order}
      pagination={{
        total: agent_nodes?.count ?? 0,
        pageSize: 10,
      }}
    />
  );
};

const generateMockAgent = (id: number, overrides = {}) => ({
  id: `agent-${id}`,
  row_id: `agent-00${id}`,
  addr: `192.168.1.${100 + id}:6001`,
  region: id % 2 === 0 ? 'us-west-2' : 'us-east-1',
  architecture: 'x86_64',
  first_contact: new Date(Date.now() - id * 24 * 60 * 60 * 1000).toISOString(),
  occupied_slots: JSON.stringify({
    cpu: '4',
    mem: '8589934592',
    'cuda.device': '1',
  }),
  available_slots: JSON.stringify({
    cpu: '16',
    mem: '34359738368',
    'cuda.device': '2',
    'cuda.shares': '2.0',
  }),
  live_stat: JSON.stringify({
    node: {
      cpu_util: {
        current: 25.5 + id * 5,
        capacity: 100,
        pct: 25.5 + id * 5,
      },
      mem: {
        current: '8589934592',
        capacity: '34359738368',
        pct: '25',
      },
      disk: {
        current: '107374182400',
        capacity: '536870912000',
        pct: '20',
      },
      net_rx: {
        current: '1048576',
      },
      net_tx: {
        current: '524288',
      },
      cuda_util: {
        current: '50',
        capacity: '100',
      },
      cuda_mem: {
        current: '4294967296',
        capacity: '8589934592',
        pct: '50',
      },
    },
    devices: {
      cpu_util: {
        0: 25.5,
        1: 30.0,
        2: 20.0,
        3: 28.5,
      },
    },
  }),
  status: 'ALIVE',
  scaling_group: 'default',
  compute_plugins: JSON.stringify({
    cuda: {
      version: '12.0.1',
      cuda_version: '12.0',
    },
  }),
  version: '24.03.0',
  schedulable: true,
  ...overrides,
});

/**
 * Basic agent table with mock data showing various agent states and configurations.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic agent table displaying multiple agents with their resource allocations, utilization, and status.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          agent_nodes: {
            edges: [
              { node: generateMockAgent(1) },
              { node: generateMockAgent(2, { status: 'TERMINATED' }) },
              { node: generateMockAgent(3) },
              { node: generateMockAgent(4, { schedulable: false }) },
              { node: generateMockAgent(5) },
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
 * Agent table with clickable agent names. Click on any agent ID to see the callback in action.
 */
export const WithClickableAgentNames: Story = {
  name: 'ClickableAgentNames',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates clickable agent names. Click on any agent ID to trigger the callback.',
      },
    },
  },
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState<AgentNodeInList | null>(
      null,
    );

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <strong>Selected Agent:</strong>{' '}
          {selectedAgent ? selectedAgent.row_id : 'None'}
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              agent_nodes: {
                edges: [
                  { node: generateMockAgent(1) },
                  { node: generateMockAgent(2) },
                  { node: generateMockAgent(3) },
                ],
                count: 3,
              },
            }),
          }}
        >
          <QueryResolver
            onClickAgentName={(agent) => {
              setSelectedAgent(agent);
            }}
          />
        </RelayResolver>
      </div>
    );
  },
};

/**
 * Agent table with custom column configuration using the `customizeColumns` pattern.
 */
export const WithCustomColumns: Story = {
  name: 'CustomColumns',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates column customization by adding an actions column at the beginning of the table.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          agent_nodes: {
            edges: [
              { node: generateMockAgent(1) },
              { node: generateMockAgent(2) },
              { node: generateMockAgent(3) },
            ],
            count: 3,
          },
        }),
      }}
    >
      <QueryResolver
        customizeColumns={(baseColumns) => [
          {
            key: 'actions',
            title: 'Actions',
            fixed: 'left',
            width: 100,
            render: (_value, record) => (
              <Button
                size="small"
                onClick={() => alert(`Managing agent: ${record.row_id}`)}
              >
                Manage
              </Button>
            ),
          },
          ...baseColumns,
        ]}
      />
    </RelayResolver>
  ),
};

/**
 * Agent table in loading state.
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the agent table in a loading state with reduced opacity.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          agent_nodes: {
            edges: [
              { node: generateMockAgent(1) },
              { node: generateMockAgent(2) },
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
 * Agent table with no agents (empty state).
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the agent table when no agents are available.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          agent_nodes: {
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
 * Agent table showing different agent statuses (ALIVE, TERMINATED, etc.).
 */
export const DifferentStatuses: Story = {
  name: 'DifferentStatuses',
  parameters: {
    docs: {
      description: {
        story:
          'Displays agents with different statuses to show how the table renders each state.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          agent_nodes: {
            edges: [
              {
                node: generateMockAgent(1, {
                  status: 'ALIVE',
                  schedulable: true,
                }),
              },
              {
                node: generateMockAgent(2, {
                  status: 'TERMINATED',
                  schedulable: false,
                }),
              },
              {
                node: generateMockAgent(3, {
                  status: 'ALIVE',
                  schedulable: false,
                }),
              },
              {
                node: generateMockAgent(4, {
                  status: 'LOST',
                  schedulable: false,
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
 * Real-world example combining multiple features.
 */
export const RealWorldExample: Story = {
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a realistic use case combining clickable agent names, sorting, and custom columns.',
      },
    },
  },
  render: () => {
    const [selectedAgent, setSelectedAgent] = useState<AgentNodeInList | null>(
      null,
    );
    const [order, setOrder] = useState<string | undefined>('-first_contact');

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
          <div>
            <strong>Selected Agent:</strong>{' '}
            {selectedAgent ? selectedAgent.row_id : 'None'}
          </div>
          <div>
            <strong>Sort Order:</strong> {order || 'None'}
          </div>
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              agent_nodes: {
                edges: [
                  { node: generateMockAgent(1) },
                  { node: generateMockAgent(2, { status: 'TERMINATED' }) },
                  { node: generateMockAgent(3) },
                  { node: generateMockAgent(4, { schedulable: false }) },
                  { node: generateMockAgent(5) },
                  { node: generateMockAgent(6) },
                ],
                count: 6,
              },
            }),
          }}
        >
          <QueryResolver
            order={order}
            onClickAgentName={(agent) => setSelectedAgent(agent)}
            onChangeOrder={(newOrder) => setOrder(newOrder)}
            customizeColumns={(baseColumns) => [
              {
                key: 'actions',
                title: 'Actions',
                fixed: 'left',
                width: 100,
                render: (_value, record) => (
                  <Button
                    size="small"
                    type="link"
                    onClick={() => setSelectedAgent(record)}
                  >
                    Select
                  </Button>
                ),
              },
              ...baseColumns,
            ]}
          />
        </RelayResolver>
      </div>
    );
  },
};
