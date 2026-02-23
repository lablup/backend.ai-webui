import { BAISessionClusterModeStoriesQuery } from '../../__generated__/BAISessionClusterModeStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAISessionClusterMode, {
  BAISessionClusterModeProps,
} from './BAISessionClusterMode';
import { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAISessionClusterMode displays the cluster mode and size of a compute session.
 *
 * Key features:
 * - Displays single-node or multi-node cluster mode
 * - Shows cluster size with optional visibility control
 * - Two display modes: text or tag
 * - Internationalized labels
 *
 * @see BAISessionClusterMode.tsx for implementation details
 */
const meta: Meta<typeof BAISessionClusterMode> = {
  title: 'Fragments/BAISessionClusterMode',
  component: BAISessionClusterMode,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISessionClusterMode** displays cluster mode information for compute sessions.

## Features
- Displays cluster mode (Single-node or Multi-node)
- Shows cluster size (number of nodes)
- Two display modes: text (default) or tag
- Optional cluster size visibility control
- Internationalized labels

## Usage
\`\`\`tsx
// Text mode (default)
<BAISessionClusterMode sessionFrgmt={session} />

// Tag mode
<BAISessionClusterMode sessionFrgmt={session} mode="tag" />

// Hide cluster size
<BAISessionClusterMode sessionFrgmt={session} showSize={false} />
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`sessionFrgmt\` | \`BAISessionClusterModeFragment$key\` | - | Relay fragment reference for session |
| \`showSize\` | \`boolean\` | \`true\` | Whether to show cluster size |
| \`mode\` | \`'text' \\| 'tag'\` | \`'text'\` | Display mode |
        `,
      },
    },
  },
  argTypes: {
    showSize: {
      control: { type: 'boolean' },
      description: 'Whether to show cluster size',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    mode: {
      control: { type: 'radio' },
      options: ['text', 'tag'],
      description: 'Display mode',
      table: {
        type: { summary: 'text | tag' },
        defaultValue: { summary: 'tag' },
      },
    },
    sessionFrgmt: {
      control: false,
      description: 'Relay fragment reference for session',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISessionClusterMode>;

const QueryResolver = (
  props?: Omit<BAISessionClusterModeProps, 'sessionFrgmt'>,
) => {
  const { compute_session_node } =
    useLazyLoadQuery<BAISessionClusterModeStoriesQuery>(
      graphql`
        query BAISessionClusterModeStoriesQuery {
          compute_session_node(id: "test-id") {
            ...BAISessionClusterModeFragment
          }
        }
      `,
      {},
    );
  return (
    compute_session_node && (
      <BAISessionClusterMode sessionFrgmt={compute_session_node} {...props} />
    )
  );
};

/**
 * Default story showing single-node cluster in text mode.
 */
export const Default: Story = {
  name: 'Basic',
  args: {
    showSize: true,
    mode: 'text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a single-node cluster session in text mode.',
      },
    },
  },
  render: ({ showSize, mode }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          cluster_mode: 'SINGLE',
          cluster_size: 1,
        }),
      }}
    >
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
  ),
};

/**
 * Story showing multi-node cluster.
 */
export const MultiNode: Story = {
  args: {
    showSize: true,
    mode: 'text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a multi-node cluster session with 4 nodes.',
      },
    },
  },
  render: ({ showSize, mode }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          cluster_mode: 'MULTI',
          cluster_size: 4,
        }),
      }}
    >
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
  ),
};

/**
 * Story showing tag mode display.
 */
export const TagMode: Story = {
  args: {
    showSize: true,
    mode: 'tag',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays cluster mode as a tag instead of plain text.',
      },
    },
  },
  render: ({ showSize, mode }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          cluster_mode: 'MULTI',
          cluster_size: 8,
        }),
      }}
    >
      <QueryResolver showSize={showSize} mode={mode} />
    </RelayResolver>
  ),
};

/**
 * Story showing cluster mode without size.
 */
export const WithoutSize: Story = {
  args: {
    showSize: false,
    mode: 'text',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays cluster mode without showing the cluster size.',
      },
    },
  },
  render: ({ showSize, mode }) => (
    <RelayResolver
      mockResolvers={{
        ComputeSessionNode: () => ({
          cluster_mode: 'MULTI',
          cluster_size: 4,
        }),
      }}
    >
      <QueryResolver showSize={showSize} mode={mode} />
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
        story:
          'Displays all combinations of cluster modes and display options.',
      },
    },
  },
  render: () => {
    const variants = [
      {
        label: 'Single-node (text)',
        cluster_mode: 'SINGLE',
        cluster_size: 1,
        mode: 'text' as const,
        showSize: true,
      },
      {
        label: 'Multi-node (text)',
        cluster_mode: 'MULTI',
        cluster_size: 4,
        mode: 'text' as const,
        showSize: true,
      },
      {
        label: 'Single-node (tag)',
        cluster_mode: 'SINGLE',
        cluster_size: 1,
        mode: 'tag' as const,
        showSize: true,
      },
      {
        label: 'Multi-node (tag)',
        cluster_mode: 'MULTI',
        cluster_size: 8,
        mode: 'tag' as const,
        showSize: true,
      },
      {
        label: 'Multi-node (no size)',
        cluster_mode: 'MULTI',
        cluster_size: 4,
        mode: 'text' as const,
        showSize: false,
      },
    ];

    return (
      <BAIFlex direction="column" gap="md" align="start">
        {variants.map((variant, index) => (
          <RelayResolver
            key={index}
            mockResolvers={{
              ComputeSessionNode: () => ({
                cluster_mode: variant.cluster_mode,
                cluster_size: variant.cluster_size,
              }),
            }}
          >
            <BAIFlex direction="row" gap="md" align="center">
              <div style={{ width: 180 }}>
                <strong>{variant.label}:</strong>
              </div>
              <QueryResolver mode={variant.mode} showSize={variant.showSize} />
            </BAIFlex>
          </RelayResolver>
        ))}
      </BAIFlex>
    );
  },
};
