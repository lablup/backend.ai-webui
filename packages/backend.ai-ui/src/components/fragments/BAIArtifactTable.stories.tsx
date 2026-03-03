import { BAIArtifactTableStoriesQuery } from '../../__generated__/BAIArtifactTableStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import {
  locales,
  mockAnonymousClientFactory,
  mockClientPromise,
} from '../../tests/storybook-mock-utils';
import { BAIConfigProvider } from '../provider/BAIConfigProvider';
import BAIArtifactTable from './BAIArtifactTable';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';

/**
 * BAIArtifactTable is a specialized table component for displaying Backend.AI artifact information.
 *
 * Key features:
 * - GraphQL/Relay integration for artifact data
 * - Pre-configured columns for artifact details (name, version, size, status, etc.)
 * - Activate/Deactivate controls for artifact management
 * - Pull latest version functionality
 * - Type and status tags
 *
 * @see BAIArtifactTable.tsx for implementation details
 */
const meta: Meta<typeof BAIArtifactTable> = {
  title: 'Fragments/BAIArtifactTable',
  component: BAIArtifactTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIArtifactTable** is a specialized table component for displaying Backend.AI artifact information with Relay GraphQL integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`artifactFragment\` | \`BAIArtifactTableArtifactFragment$key\` | - | GraphQL fragment reference (required) |
| \`onClickPull\` | \`(artifactId: string, revisionId: string) => void\` | - | Callback when pull button is clicked |
| \`onClickDelete\` | \`(artifactId: string) => void\` | - | Callback when deactivate button is clicked |
| \`onClickRestore\` | \`(artifactId: string) => void\` | - | Callback when activate button is clicked |

## Pre-configured Columns
- **Name**: Artifact name with type tag and description
- **Controls**: Activate/Deactivate buttons based on artifact availability
- **Latest Version**: Latest revision version with status tag and pull button
- **Size**: Latest revision size in human-readable format
- **Scanned**: Time since last scan (relative time)
- **Updated**: Time since last update (relative time)
- **Registry**: Registry name and URL (hidden by default)
- **Source**: Source repository link (hidden by default)

For other props (loading, pagination, etc.), refer to [BAITable](?path=/docs/table-baitable--docs).
        `,
      },
    },
  },
  argTypes: {
    artifactFragment: {
      control: false,
      description: 'GraphQL fragment reference for artifact data',
      table: {
        type: { summary: 'BAIArtifactTableArtifactFragment$key' },
      },
    },
    onClickPull: {
      action: 'pull-clicked',
      description: 'Callback when pull button is clicked',
      table: {
        type: {
          summary: '(artifactId: string, revisionId: string) => void',
        },
      },
    },
    onClickDelete: {
      action: 'delete-clicked',
      description: 'Callback when deactivate button is clicked',
      table: {
        type: { summary: '(artifactId: string) => void' },
      },
    },
    onClickRestore: {
      action: 'restore-clicked',
      description: 'Callback when activate button is clicked',
      table: {
        type: { summary: '(artifactId: string) => void' },
      },
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || 'en';
      const baiLocale = locales[locale] || locales.en;

      return (
        <MemoryRouter>
          <BAIConfigProvider
            locale={baiLocale}
            clientPromise={mockClientPromise}
            anonymousClientFactory={mockAnonymousClientFactory}
          >
            <Story />
          </BAIConfigProvider>
        </MemoryRouter>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof BAIArtifactTable>;

interface QueryResolverProps extends Pick<
  React.ComponentProps<typeof BAIArtifactTable>,
  'onClickPull' | 'onClickDelete' | 'onClickRestore' | 'loading'
> {}

const QueryResolver: React.FC<QueryResolverProps> = ({
  onClickPull,
  onClickDelete,
  onClickRestore,
  loading,
}) => {
  const { artifacts } = useLazyLoadQuery<BAIArtifactTableStoriesQuery>(
    graphql`
      query BAIArtifactTableStoriesQuery {
        artifacts(limit: 100, offset: 0) {
          edges {
            node {
              ...BAIArtifactTableArtifactFragment
            }
          }
          count
        }
      }
    `,
    {},
  );

  const artifactNodes =
    artifacts?.edges
      .map((e) => e?.node)
      .filter((node): node is NonNullable<typeof node> => !!node) ?? [];

  return (
    <BAIArtifactTable
      artifactFragment={artifactNodes}
      onClickPull={onClickPull}
      onClickDelete={onClickDelete}
      onClickRestore={onClickRestore}
      loading={loading}
      pagination={{
        total: artifacts?.count ?? 0,
        pageSize: 10,
      }}
    />
  );
};

const generateMockArtifact = (id: number, overrides = {}) => ({
  id: btoa(`ArtifactNode:artifact-${id}`),
  name: `artifact-${id}`,
  description: `Description for artifact ${id}`,
  updatedAt: new Date(Date.now() - id * 24 * 60 * 60 * 1000).toISOString(),
  scannedAt: new Date(Date.now() - id * 12 * 60 * 60 * 1000).toISOString(),
  availability: 'ALIVE',
  type: id % 3 === 0 ? 'MODEL' : id % 3 === 1 ? 'PACKAGE' : 'IMAGE',
  registry: {
    name: 'docker.io',
    url: 'https://hub.docker.com',
  },
  source: {
    name: `github.com/org/repo-${id}`,
    url: `https://github.com/org/repo-${id}`,
  },
  latestVersion: {
    edges: [
      {
        node: {
          id: btoa(`ArtifactRevisionNode:revision-${id}`),
          version: `v1.${id}.0`,
          size: `${(id + 1) * 1024 * 1024 * 100}`,
          status: 'SCANNED',
        },
      },
    ],
  },
  ...overrides,
});

/**
 * Basic artifact table with mock data showing various artifact types and statuses.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic artifact table displaying multiple artifacts with their latest versions and statuses.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifacts: {
            edges: [
              { node: generateMockArtifact(1, { type: 'MODEL' }) },
              { node: generateMockArtifact(2, { type: 'PACKAGE' }) },
              { node: generateMockArtifact(3, { type: 'IMAGE' }) },
              {
                node: generateMockArtifact(4, {
                  type: 'MODEL',
                  availability: 'DELETED',
                }),
              },
              {
                node: generateMockArtifact(5, {
                  type: 'PACKAGE',
                  latestVersion: {
                    edges: [
                      {
                        node: {
                          id: btoa('ArtifactRevisionNode:revision-5'),
                          version: 'v1.5.0',
                          size: '524288000',
                          status: 'PULLING',
                        },
                      },
                    ],
                  },
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
 * Artifact table with activate/deactivate functionality demonstration.
 */
export const WithControls: Story = {
  name: 'ActivateDeactivate',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates activate and deactivate controls. Click deactivate (ban icon) to mark as deleted, or activate (undo icon) to restore.',
      },
    },
  },
  render: () => {
    const [selectedAction, setSelectedAction] = useState<string | null>(null);

    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <strong>Last Action:</strong> {selectedAction || 'None'}
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              artifacts: {
                edges: [
                  {
                    node: generateMockArtifact(1, {
                      availability: 'ALIVE',
                      type: 'MODEL',
                    }),
                  },
                  {
                    node: generateMockArtifact(2, {
                      availability: 'DELETED',
                      type: 'PACKAGE',
                    }),
                  },
                  {
                    node: generateMockArtifact(3, {
                      availability: 'ALIVE',
                      type: 'IMAGE',
                    }),
                  },
                ],
                count: 3,
              },
            }),
          }}
        >
          <QueryResolver
            onClickDelete={(id) => setSelectedAction(`Deactivate ${id}`)}
            onClickRestore={(id) => setSelectedAction(`Activate ${id}`)}
            onClickPull={(artifactId, revisionId) =>
              setSelectedAction(`Pull ${artifactId}/${revisionId}`)
            }
          />
        </RelayResolver>
      </div>
    );
  },
};

/**
 * Artifact table showing different revision statuses.
 */
export const DifferentStatuses: Story = {
  name: 'DifferentStatuses',
  parameters: {
    docs: {
      description: {
        story:
          'Displays artifacts with different revision statuses (SCANNED, PULLING, VERIFYING, FAILED).',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifacts: {
            edges: [
              {
                node: generateMockArtifact(1, {
                  latestVersion: {
                    edges: [
                      {
                        node: {
                          id: btoa('ArtifactRevisionNode:revision-1'),
                          version: 'v1.1.0',
                          size: '104857600',
                          status: 'SCANNED',
                        },
                      },
                    ],
                  },
                }),
              },
              {
                node: generateMockArtifact(2, {
                  latestVersion: {
                    edges: [
                      {
                        node: {
                          id: btoa('ArtifactRevisionNode:revision-2'),
                          version: 'v1.2.0',
                          size: '209715200',
                          status: 'PULLING',
                        },
                      },
                    ],
                  },
                }),
              },
              {
                node: generateMockArtifact(3, {
                  latestVersion: {
                    edges: [
                      {
                        node: {
                          id: btoa('ArtifactRevisionNode:revision-3'),
                          version: 'v1.3.0',
                          size: '314572800',
                          status: 'VERIFYING',
                        },
                      },
                    ],
                  },
                }),
              },
              {
                node: generateMockArtifact(4, {
                  latestVersion: {
                    edges: [
                      {
                        node: {
                          id: btoa('ArtifactRevisionNode:revision-4'),
                          version: 'v1.4.0',
                          size: '419430400',
                          status: 'FAILED',
                        },
                      },
                    ],
                  },
                }),
              },
            ],
            count: 4,
          },
        }),
      }}
    >
      <QueryResolver
        onClickPull={() => {}}
        onClickDelete={() => {}}
        onClickRestore={() => {}}
      />
    </RelayResolver>
  ),
};

/**
 * Artifact table in loading state.
 */
export const Loading: Story = {
  name: 'LoadingState',
  parameters: {
    docs: {
      description: {
        story:
          'Shows the artifact table in a loading state with reduced opacity.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifacts: {
            edges: [
              { node: generateMockArtifact(1) },
              { node: generateMockArtifact(2) },
            ],
            count: 2,
          },
        }),
      }}
    >
      <QueryResolver
        loading={true}
        onClickPull={() => {}}
        onClickDelete={() => {}}
        onClickRestore={() => {}}
      />
    </RelayResolver>
  ),
};

/**
 * Artifact table with no artifacts (empty state).
 */
export const Empty: Story = {
  name: 'EmptyState',
  parameters: {
    docs: {
      description: {
        story: 'Shows the artifact table when no artifacts are available.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Query: () => ({
          artifacts: {
            edges: [],
            count: 0,
          },
        }),
      }}
    >
      <QueryResolver
        onClickPull={() => {}}
        onClickDelete={() => {}}
        onClickRestore={() => {}}
      />
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
          'Demonstrates a realistic use case combining pull, activate, and deactivate actions.',
      },
    },
  },
  render: () => {
    const [actions, setActions] = useState<string[]>([]);

    const addAction = (action: string) => {
      setActions((prev) => [action, ...prev].slice(0, 5));
    };

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
          <strong>Recent Actions:</strong>
          {actions.length > 0 ? (
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              {actions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          ) : (
            <div style={{ marginTop: 8 }}>No actions yet</div>
          )}
        </div>
        <RelayResolver
          mockResolvers={{
            Query: () => ({
              artifacts: {
                edges: [
                  {
                    node: generateMockArtifact(1, {
                      type: 'MODEL',
                      availability: 'ALIVE',
                    }),
                  },
                  {
                    node: generateMockArtifact(2, {
                      type: 'PACKAGE',
                      availability: 'DELETED',
                    }),
                  },
                  {
                    node: generateMockArtifact(3, {
                      type: 'IMAGE',
                      availability: 'ALIVE',
                      latestVersion: {
                        edges: [
                          {
                            node: {
                              id: btoa('ArtifactRevisionNode:revision-3'),
                              version: 'v2.0.1',
                              size: '314572800',
                              status: 'SCANNED',
                            },
                          },
                        ],
                      },
                    }),
                  },
                  {
                    node: generateMockArtifact(4, {
                      type: 'MODEL',
                      availability: 'ALIVE',
                      latestVersion: {
                        edges: [
                          {
                            node: {
                              id: btoa('ArtifactRevisionNode:revision-4'),
                              version: 'v3.1.0',
                              size: '524288000',
                              status: 'PULLING',
                            },
                          },
                        ],
                      },
                    }),
                  },
                ],
                count: 4,
              },
            }),
          }}
        >
          <QueryResolver
            onClickPull={(artifactId, revisionId) =>
              addAction(`Pull: ${artifactId} (revision: ${revisionId})`)
            }
            onClickDelete={(id) => addAction(`Deactivate: ${id}`)}
            onClickRestore={(id) => addAction(`Activate: ${id}`)}
          />
        </RelayResolver>
      </div>
    );
  },
};
