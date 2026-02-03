import { BAIArtifactRevisionDownloadButtonStoriesQuery } from '../../__generated__/BAIArtifactRevisionDownloadButtonStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIFlex from '../BAIFlex';
import BAIArtifactRevisionDownloadButton from './BAIArtifactRevisionDownloadButton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIArtifactRevisionDownloadButton is a specialized download button for artifact revisions.
 *
 * Key features:
 * - Automatic downloadability check based on revision status
 * - Enabled only when at least one revision has SCANNED status
 * - Info-styled appearance when enabled
 * - Disabled appearance when not downloadable
 *
 * @see BAIArtifactRevisionDownloadButton.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactRevisionDownloadButton> = {
  title: 'Fragments/BAIArtifactRevisionDownloadButton',
  component: BAIArtifactRevisionDownloadButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIArtifactRevisionDownloadButton** is a specialized download button for artifact revisions with automatic downloadability checks based on GraphQL fragment data.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`revisionsFrgmt\` | \`BAIArtifactRevisionDownloadButtonFragment$key\` | - | GraphQL fragment reference for revision data (required) |
| \`loading\` | \`boolean\` | \`false\` | Loading state (inherited from BAIButtonProps) |

## Downloadability Logic
The button automatically determines if revisions are downloadable:
- **Downloadable**: At least one revision with status === 'SCANNED'
- **Not Downloadable**: No revisions have status 'SCANNED'

## Visual States
- **Enabled**: Info colors (blue icon and background)
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
        type: { summary: 'BAIArtifactRevisionDownloadButtonFragment$key' },
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
  },
};

export default meta;
type Story = StoryObj<typeof BAIArtifactRevisionDownloadButton>;

// =============================================================================
// Query Resolver Component
// =============================================================================

interface QueryResolverProps {
  loading?: boolean;
}

const QueryResolver = ({ loading = false }: QueryResolverProps) => {
  const { artifactRevisions } =
    useLazyLoadQuery<BAIArtifactRevisionDownloadButtonStoriesQuery>(
      graphql`
        query BAIArtifactRevisionDownloadButtonStoriesQuery {
          artifactRevisions(offset: 0, first: 10) {
            edges {
              node {
                ...BAIArtifactRevisionDownloadButtonFragment
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
      <BAIArtifactRevisionDownloadButton
        revisionsFrgmt={revisions}
        loading={loading}
      />
    )
  );
};

// =============================================================================
// Stories
// =============================================================================

/**
 * Downloadable revisions - button is enabled with info styling
 */
export const Default: Story = {
  name: 'Downloadable',
  parameters: {
    docs: {
      description: {
        story:
          'Revisions with SCANNED status are downloadable. The button appears in info colors (blue).',
      },
    },
  },
  render: () => (
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
          ],
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * No SCANNED revisions - button is disabled
 */
export const NotDownloadable: Story = {
  name: 'NotDownloadable',
  parameters: {
    docs: {
      description: {
        story:
          'No revisions have SCANNED status, making them non-downloadable. The button is automatically disabled with gray styling.',
      },
    },
  },
  render: () => (
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
                status: 'PULLING',
              },
            },
          ],
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Mixed status revisions - button is enabled if at least one is SCANNED
 */
export const MixedStatus: Story = {
  name: 'MixedStatus',
  parameters: {
    docs: {
      description: {
        story:
          'Mix of SCANNED and non-SCANNED revisions. The button is enabled because at least one revision is downloadable.',
      },
    },
  },
  render: () => (
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
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Loading state
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story: 'Button in loading state during download operation.',
      },
    },
  },
  render: () => (
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
      <QueryResolver loading />
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
          'Comparison of all button states: downloadable, not downloadable, and loading.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex align="center" gap="sm">
        <span style={{ width: 140 }}>Downloadable:</span>
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
        <span style={{ width: 140 }}>Not Downloadable:</span>
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
        <span style={{ width: 140 }}>Loading:</span>
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
          <QueryResolver loading />
        </RelayResolver>
      </BAIFlex>
    </BAIFlex>
  ),
};
