import { BAISessionAgentIdsStoriesQuery } from '../../__generated__/BAISessionAgentIdsStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAISessionAgentIds from './BAISessionAgentIds';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAISessionAgentIds displays agent IDs associated with a compute session.
 *
 * Key features:
 * - Displays inline agent IDs with configurable limit
 * - Shows remaining agents in a popover
 * - Copy all agent IDs functionality
 * - Customizable empty state text
 *
 * @see BAISessionAgentIds.tsx for implementation details
 */
const meta: Meta<typeof BAISessionAgentIds> = {
  title: 'Fragments/BAISessionAgentIds',
  component: BAISessionAgentIds,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISessionAgentIds** displays a list of agent IDs for compute sessions.

## Features
- Inline display of agent IDs with configurable limit
- Popover to show remaining agent IDs when exceeding limit
- Copy all agent IDs to clipboard functionality
- Removes duplicate agent IDs automatically
- Customizable empty state text

## Usage
\`\`\`tsx
// Default (shows up to 3 agent IDs inline)
<BAISessionAgentIds sessionFrgmt={session} />

// Custom inline limit
<BAISessionAgentIds sessionFrgmt={session} maxInline={5} />

// Custom empty text
<BAISessionAgentIds sessionFrgmt={session} emptyText="No agents" />
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`sessionFrgmt\` | \`BAISessionAgentIdsFragment$key\` | - | Relay fragment reference for session |
| \`maxInline\` | \`number\` | \`3\` | Maximum number of agent IDs to display inline |
| \`emptyText\` | \`string\` | \`'-'\` | Text to display when no agents exist |
        `,
      },
    },
  },
  argTypes: {
    maxInline: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Maximum number of agent IDs to display inline',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '3' },
      },
    },
    emptyText: {
      control: { type: 'text' },
      description: 'Text to display when no agents exist',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'-'" },
      },
    },
    sessionFrgmt: {
      control: false,
      description: 'Relay fragment reference for session',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISessionAgentIds>;

const QueryResolver = (props?: { maxInline?: number; emptyText?: string }) => {
  const { compute_session_node } =
    useLazyLoadQuery<BAISessionAgentIdsStoriesQuery>(
      graphql`
        query BAISessionAgentIdsStoriesQuery {
          compute_session_node(id: "test-id") {
            ...BAISessionAgentIdsFragment
          }
        }
      `,
      {},
    );
  return (
    compute_session_node && (
      <BAISessionAgentIds sessionFrgmt={compute_session_node} {...props} />
    )
  );
};

/**
 * Default story showing multiple agent IDs.
 */
export const Default: Story = {
  name: 'Basic',
  args: {
    maxInline: 3,
    emptyText: '-',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays multiple agent IDs with the default limit of 3 inline agents. Click "+2" to see the popover with remaining agents.',
      },
    },
  },
  render: ({ maxInline, emptyText }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          agent_ids: [
            'i-1234567890abcdef0',
            'i-2345678901bcdef01',
            'i-3456789012cdef012',
            'i-4567890123def0123',
            'i-567890124ef01234',
          ],
        }),
      }}
    >
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
  ),
};

/**
 * Story showing single agent ID.
 */
export const SingleAgent: Story = {
  args: {
    maxInline: 3,
    emptyText: '-',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a single agent ID without the popover.',
      },
    },
  },
  render: ({ maxInline, emptyText }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          agent_ids: ['i-1234567890abcdef0'],
        }),
      }}
    >
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
  ),
};

/**
 * Story showing empty state.
 */
export const Empty: Story = {
  args: {
    maxInline: 3,
    emptyText: '-',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays the empty state text when no agents exist.',
      },
    },
  },
  render: ({ maxInline, emptyText }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          agent_ids: [],
        }),
      }}
    >
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
  ),
};

/**
 * Story showing custom empty text.
 */
export const CustomEmptyText: Story = {
  args: {
    maxInline: 3,
    emptyText: 'No agents available',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays custom empty state text.',
      },
    },
  },
  render: ({ maxInline, emptyText }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          agent_ids: [],
        }),
      }}
    >
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
  ),
};

/**
 * Story showing many agent IDs with custom inline limit.
 */
export const ManyAgents: Story = {
  args: {
    maxInline: 5,
    emptyText: '-',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Displays many agent IDs with maxInline set to 5. Click "+5" to see the popover with 10 total agents.',
      },
    },
  },
  render: ({ maxInline, emptyText }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          agent_ids: Array.from({ length: 10 }, (_, i) => `i-agent-${i + 1}`),
        }),
      }}
    >
      <QueryResolver maxInline={maxInline} emptyText={emptyText} />
    </RelayResolver>
  ),
};

/**
 * Story showing all variants together.
 */
export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Displays all different configurations of agent ID display.',
      },
    },
  },
  render: () => {
    const variants = [
      {
        label: 'Single agent',
        agent_ids: ['i-1234567890abcdef0'],
        maxInline: 3,
      },
      {
        label: 'Multiple agents (default)',
        agent_ids: [
          'i-agent-1',
          'i-agent-2',
          'i-agent-3',
          'i-agent-4',
          'i-agent-5',
        ],
        maxInline: 3,
      },
      {
        label: 'Many agents (maxInline: 5)',
        agent_ids: Array.from({ length: 10 }, (_, i) => `i-agent-${i + 1}`),
        maxInline: 5,
      },
      { label: 'Empty state', agent_ids: [], maxInline: 3 },
    ];

    return (
      <BAIFlex direction="column" gap="md" align="start">
        {variants.map((variant, index) => (
          <RelayResolver
            key={index}
            mockResolvers={{
              ComputeSessionNode: () => ({
                agent_ids: variant.agent_ids,
              }),
            }}
          >
            <BAIFlex direction="row" gap="md" align="start">
              <div style={{ width: 240 }}>
                <strong>{variant.label}:</strong>
              </div>
              <QueryResolver maxInline={variant.maxInline} />
            </BAIFlex>
          </RelayResolver>
        ))}
      </BAIFlex>
    );
  },
};
