import { BAIArtifactRevisionTableStoriesQuery } from '../../__generated__/BAIArtifactRevisionTableStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import {
  locales,
  mockAnonymousClientFactory,
  mockClientPromise,
} from '../../tests/storybook-mock-utils';
import { BAIConfigProvider } from '../provider/BAIConfigProvider';
import BAIArtifactRevisionTable from './BAIArtifactRevisionTable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

// =============================================================================
// Meta Configuration
// =============================================================================

/**
 * BAIArtifactRevisionTable is a specialized table component for displaying artifact revision history.
 *
 * Key features:
 * - GraphQL/Relay integration for artifact revision data
 * - Pre-configured columns for revision details (version, status, size, updated)
 * - Latest revision indicator
 * - Custom column customization via `customizeColumns` pattern
 * - Status tags for revision states
 *
 * @see BAIArtifactRevisionTable.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactRevisionTable> = {
  title: 'Fragments/BAIArtifactRevisionTable',
  component: BAIArtifactRevisionTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIArtifactRevisionTable** is a specialized table component for displaying artifact revision history with Relay GraphQL integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`artifactRevisionFrgmt\` | \`BAIArtifactRevisionTableArtifactRevisionFragment$key\` | - | GraphQL fragment reference for revisions (required) |
| \`latestRevisionFrgmt\` | \`BAIArtifactRevisionTableLatestRevisionFragment$key \\| null\` | - | Fragment reference for latest revision indicator |
| \`customizeColumns\` | \`(baseColumns) => BAIColumnType[]\` | - | Function to customize table columns |

## Pre-configured Columns
- **Version**: Revision version with "Latest" badge and PULLED status tag
- **Status**: Revision status (SCANNED, PULLING, VERIFYING, FAILED) with tag
- **Size**: Revision size in human-readable format
- **Updated**: Time since last update (relative time)

For other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).
        `,
      },
    },
  },
  argTypes: {
    artifactRevisionFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for artifact revisions',
      table: {
        type: {
          summary: 'BAIArtifactRevisionTableArtifactRevisionFragment$key',
        },
      },
    },
    latestRevisionFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for latest revision indicator',
      table: {
        type: {
          summary:
            'BAIArtifactRevisionTableLatestRevisionFragment$key | null | undefined',
        },
      },
    },
    customizeColumns: {
      control: false,
      description:
        'Function to customize table columns. Receives base columns and returns customized columns.',
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
      const baiLocale = locales[locale] || locales.en;

      return (
        <BAIConfigProvider
          locale={baiLocale}
          clientPromise={mockClientPromise}
          anonymousClientFactory={mockAnonymousClientFactory}
        >
          <Story />
        </BAIConfigProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BAIArtifactRevisionTable>;

// =============================================================================
// Query Resolver Component
// =============================================================================

interface QueryResolverProps extends Pick<
  React.ComponentProps<typeof BAIArtifactRevisionTable>,
  'customizeColumns' | 'loading'
> {}

const QueryResolver: React.FC<QueryResolverProps> = ({
  customizeColumns,
  loading,
}) => {
  const { artifact } = useLazyLoadQuery<BAIArtifactRevisionTableStoriesQuery>(
    graphql`
      query BAIArtifactRevisionTableStoriesQuery {
        artifact(id: "artifact-1") {
          revisions(limit: 100, offset: 0) {
            edges {
              node {
                ...BAIArtifactRevisionTableArtifactRevisionFragment
              }
            }
          }
          latestVersion: revisions(
            limit: 1
            orderBy: [
              { field: VERSION, direction: DESC }
              { field: UPDATED_AT, direction: DESC }
            ]
          ) {
            edges {
              node {
                ...BAIArtifactRevisionTableLatestRevisionFragment
              }
            }
          }
        }
      }
    `,
    {},
  );

  const revisionNodes =
    artifact?.revisions?.edges
      .map((e) => e?.node)
      .filter((node): node is NonNullable<typeof node> => !!node) ?? [];

  const latestRevisionNode = artifact?.latestVersion?.edges?.[0]?.node ?? null;

  return (
    <BAIArtifactRevisionTable
      artifactRevisionFrgmt={revisionNodes}
      latestRevisionFrgmt={latestRevisionNode}
      customizeColumns={customizeColumns}
      loading={loading}
      pagination={{
        total: revisionNodes.length,
        pageSize: 10,
      }}
    />
  );
};

// =============================================================================
// Mock Data Generators
// =============================================================================

const generateMockRevision = (id: number, overrides = {}) => ({
  id: btoa(`ArtifactRevisionNode:revision-${id}`),
  version: `v1.${id}.0`,
  size: `${(id + 1) * 1024 * 1024 * 100}`,
  status: 'SCANNED',
  updatedAt: new Date(Date.now() - id * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides,
});

// =============================================================================
// Stories
// =============================================================================

/**
 * Basic revision table with multiple revisions showing version history.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic artifact revision table displaying multiple revisions with their statuses and metadata.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifact: {
            revisions: {
              edges: [
                { node: generateMockRevision(1) },
                { node: generateMockRevision(2, { status: 'PULLING' }) },
                { node: generateMockRevision(3) },
                { node: generateMockRevision(4, { status: 'VERIFYING' }) },
                { node: generateMockRevision(5) },
              ],
            },
            latestVersion: {
              edges: [
                { node: { id: btoa('ArtifactRevisionNode:revision-1') } },
              ],
            },
          },
        }),
      }}
    >
      <QueryResolver {...args} />
    </RelayResolver>
  ),
};

/**
 * Revision table showing different revision statuses.
 */
export const DifferentStatuses: Story = {
  name: 'DifferentStatuses',
  parameters: {
    docs: {
      description: {
        story:
          'Displays artifact revisions with different statuses (SCANNED, PULLING, VERIFYING, FAILED, PULLED).',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifact: {
            revisions: {
              edges: [
                {
                  node: generateMockRevision(1, {
                    status: 'SCANNED',
                    version: 'v2.0.0',
                  }),
                },
                {
                  node: generateMockRevision(2, {
                    status: 'PULLING',
                    version: 'v1.9.0',
                  }),
                },
                {
                  node: generateMockRevision(3, {
                    status: 'VERIFYING',
                    version: 'v1.8.0',
                  }),
                },
                {
                  node: generateMockRevision(4, {
                    status: 'FAILED',
                    version: 'v1.7.0',
                  }),
                },
                {
                  node: generateMockRevision(5, {
                    status: 'PULLED',
                    version: 'v1.6.0',
                  }),
                },
              ],
            },
            latestVersion: {
              edges: [
                { node: { id: btoa('ArtifactRevisionNode:revision-1') } },
              ],
            },
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Revision table with custom columns including action buttons.
 */
export const WithCustomColumns: Story = {
  name: 'CustomColumns',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates column customization by adding an actions column to the table.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifact: {
            revisions: {
              edges: [
                { node: generateMockRevision(1) },
                { node: generateMockRevision(2) },
                { node: generateMockRevision(3) },
              ],
            },
            latestVersion: {
              edges: [
                { node: { id: btoa('ArtifactRevisionNode:revision-1') } },
              ],
            },
          },
        }),
      }}
    >
      <QueryResolver
        customizeColumns={(baseColumns) => [
          ...baseColumns,
          {
            key: 'actions',
            title: 'Actions',
            width: 150,
            render: () => (
              <Button type="primary" size="small">
                Download
              </Button>
            ),
          },
        ]}
      />
    </RelayResolver>
  ),
};

/**
 * Revision table in loading state.
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the artifact revision table in a loading state with reduced opacity.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifact: {
            revisions: {
              edges: [
                { node: generateMockRevision(1) },
                { node: generateMockRevision(2) },
              ],
            },
            latestVersion: {
              edges: [
                { node: { id: btoa('ArtifactRevisionNode:revision-1') } },
              ],
            },
          },
        }),
      }}
    >
      <QueryResolver loading={true} />
    </RelayResolver>
  ),
};

/**
 * Revision table with no revisions (empty state).
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the artifact revision table when no revisions are available.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifact: {
            revisions: {
              edges: [],
            },
            latestVersion: {
              edges: [],
            },
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Real-world example with version history and latest revision indicator.
 */
export const RealWorldExample: Story = {
  name: 'RealWorldUsage',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a realistic use case showing version history with latest revision indicator.',
      },
    },
  },
  render: () => {
    const [selectedRevision, setSelectedRevision] = useState<string | null>(
      null,
    );

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
          <strong>Selected Revision:</strong>{' '}
          {selectedRevision || 'None selected'}
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              artifact: {
                revisions: {
                  edges: [
                    {
                      node: generateMockRevision(1, {
                        version: 'v2.1.0',
                        status: 'SCANNED',
                        size: '524288000',
                      }),
                    },
                    {
                      node: generateMockRevision(2, {
                        version: 'v2.0.1',
                        status: 'PULLED',
                        size: '520093696',
                      }),
                    },
                    {
                      node: generateMockRevision(3, {
                        version: 'v2.0.0',
                        status: 'SCANNED',
                        size: '515899392',
                      }),
                    },
                    {
                      node: generateMockRevision(4, {
                        version: 'v1.9.5',
                        status: 'PULLING',
                        size: '511705088',
                      }),
                    },
                    {
                      node: generateMockRevision(5, {
                        version: 'v1.9.0',
                        status: 'SCANNED',
                        size: '507510784',
                      }),
                    },
                  ],
                },
                latestVersion: {
                  edges: [
                    { node: { id: btoa('ArtifactRevisionNode:revision-1') } },
                  ],
                },
              },
            }),
          }}
        >
          <QueryResolver
            customizeColumns={(baseColumns) => [
              ...baseColumns,
              {
                key: 'actions',
                title: 'Actions',
                width: 120,
                render: (_text, record) => (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => setSelectedRevision(record.version)}
                  >
                    Select
                  </Button>
                ),
              },
            ]}
          />
        </RelayResolver>
      </div>
    );
  },
};
