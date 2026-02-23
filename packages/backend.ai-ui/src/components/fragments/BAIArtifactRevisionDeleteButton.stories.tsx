import { BAIArtifactRevisionDeleteButtonStoriesQuery } from '../../__generated__/BAIArtifactRevisionDeleteButtonStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAIArtifactRevisionDeleteButton from './BAIArtifactRevisionDeleteButton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIArtifactRevisionDeleteButton is a specialized delete button for artifact revisions.
 *
 * Key features:
 * - Automatic deletability check based on revision status
 * - Disabled when all revisions are SCANNED or PULLING
 * - Error-styled appearance when enabled
 * - Disabled appearance when not deletable
 *
 * @see BAIArtifactRevisionDeleteButton.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactRevisionDeleteButton> = {
  title: 'Fragments/BAIArtifactRevisionDeleteButton',
  component: BAIArtifactRevisionDeleteButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIArtifactRevisionDeleteButton** is a specialized delete button for artifact revisions with automatic deletability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`revisionsFrgmt\` | \`BAIArtifactRevisionDeleteButtonFragment$key\` | - | GraphQL fragment reference for revision data (required) |
| \`loading\` | \`boolean\` | \`false\` | Loading state (inherited from BAIButtonProps) |

## Deletability Logic
The button automatically determines if revisions are deletable:
- **Deletable**: At least one revision with status !== 'SCANNED' && status !== 'PULLING'
- **Not Deletable**: All revisions have status 'SCANNED' or 'PULLING'

## Visual States
- **Enabled**: Error colors (red icon and background)
- **Disabled**: Disabled colors (gray)

For other props, refer to [BAIButton](?path=/docs/button-baibutton--docs).
        `,
      },
    },
  },
  argTypes: {
    revisionsFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for artifact revision data',
      table: {
        type: { summary: 'BAIArtifactRevisionDeleteButtonFragment$key' },
      },
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIArtifactRevisionDeleteButton>;

// =============================================================================
// Query Resolver Component
// =============================================================================

interface QueryResolverProps {
  loading?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

const QueryResolver = ({ loading = false, onClick }: QueryResolverProps) => {
  const { artifactRevisions } =
    useLazyLoadQuery<BAIArtifactRevisionDeleteButtonStoriesQuery>(
      graphql`
        query BAIArtifactRevisionDeleteButtonStoriesQuery {
          artifactRevisions(offset: 0, first: 10) {
            edges {
              node {
                ...BAIArtifactRevisionDeleteButtonFragment
              }
            }
          }
        }
      `,
      {},
    );

  const revisions = artifactRevisions?.edges?.map((edge: any) => edge.node);

  return (
    revisions &&
    revisions.length > 0 && (
      <BAIArtifactRevisionDeleteButton
        revisionsFrgmt={revisions}
        loading={loading}
        onClick={onClick}
      />
    )
  );
};

// =============================================================================
// Stories
// =============================================================================

/**
 * Deletable revisions - button is enabled with error styling
 */
export const Default: Story = {
  name: 'Basic',
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Revisions with deletable status (not SCANNED or PULLING). The button appears in error colors (red).',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                status: 'READY',
              },
            },
            {
              node: {
                status: 'FAILED',
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * All revisions are SCANNED or PULLING - button is disabled
 */
export const NotDeletable: Story = {
  name: 'NotDeletable',
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'All revisions are SCANNED or PULLING, making them non-deletable. The button is automatically disabled with gray styling.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                status: 'SCANNED',
              },
            },
            {
              node: {
                status: 'PULLING',
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Mixed status revisions - button is enabled if at least one is deletable
 */
export const MixedStatus: Story = {
  name: 'MixedStatus',
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          'Mix of deletable and non-deletable revisions. The button is enabled because at least one revision is deletable.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                status: 'SCANNED',
              },
            },
            {
              node: {
                status: 'READY',
              },
            },
            {
              node: {
                status: 'PULLING',
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  name: 'LoadingState',
  args: {
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state during deletion operation.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                status: 'READY',
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Comparison of all states
 */
export const AllStates: Story = {
  name: 'AllStates',
  parameters: {
    docs: {
      description: {
        story:
          'Comparison of all button states: deletable, not deletable, and loading.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{ width: 120 }}>Deletable:</span>
        <RelayResolver
          mockResolvers={{
            ArtifactRevisionConnection: () => ({
              edges: [
                {
                  node: {
                    status: 'READY',
                  },
                },
              ],
            }),
          }}
        >
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{ width: 120 }}>Not Deletable:</span>
        <RelayResolver
          mockResolvers={{
            ArtifactRevisionConnection: () => ({
              edges: [
                {
                  node: {
                    status: 'SCANNED',
                  },
                },
              ],
            }),
          }}
        >
          <QueryResolver />
        </RelayResolver>
      </BAIFlex>

      <BAIFlex align="center" gap="sm">
        <span style={{ width: 120 }}>Loading:</span>
        <RelayResolver
          mockResolvers={{
            ArtifactRevisionConnection: () => ({
              edges: [
                {
                  node: {
                    status: 'READY',
                  },
                },
              ],
            }),
          }}
        >
          <QueryResolver loading />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
  ),
};
