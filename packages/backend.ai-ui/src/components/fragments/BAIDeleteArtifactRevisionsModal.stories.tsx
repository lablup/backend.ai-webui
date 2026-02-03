import { BAIDeleteArtifactRevisionsModalStoriesQuery } from '../../__generated__/BAIDeleteArtifactRevisionsModalStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIDeleteArtifactRevisionsModal from './BAIDeleteArtifactRevisionsModal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';

/**
 * BAIDeleteArtifactRevisionsModal is a modal for deleting artifact revisions with a table view.
 *
 * Key features:
 * - GraphQL fragment-based artifact and revision data
 * - Relay mutation for deleting revisions
 * - Table showing selected revisions (version, size)
 * - Filters out PULLING and SCANNED status revisions
 * - Alert when some revisions are excluded
 * - Artifact description display
 * - Success/error message handling
 * - Danger-styled Remove button
 *
 * @see BAIDeleteArtifactRevisionsModal.tsx for implementation details
 */
const meta: Meta<typeof BAIDeleteArtifactRevisionsModal> = {
  title: 'Fragments/BAIDeleteArtifactRevisionsModal',
  component: BAIDeleteArtifactRevisionsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIDeleteArtifactRevisionsModal** is a modal for deleting artifact revisions with table view and filtering.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactFrgmt\` | \`BAIDeleteArtifactRevisionsModalArtifactFragment$key \\| null\` | - | GraphQL fragment reference for artifact data |
| \`selectedArtifactRevisionFrgmt\` | \`BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key\` | - | GraphQL fragment reference for artifact revisions (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Revision Table**: Shows version and size columns for selected revisions
- **Status Filtering**: Automatically filters out PULLING and SCANNED status revisions
- **Exclusion Alert**: Displays alert when some revisions are excluded from deletion
- **Artifact Info**: Shows artifact description (name, type, architecture)
- **Mutation Integration**: Uses \`cleanupArtifactRevisions\` mutation
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: Remove button shows loading state during mutation execution
- **Danger Button**: Remove button is styled as danger (red) to indicate destructive action
- **Smart Disabling**: Button disabled when no deletable revisions or during execution

## Usage Pattern
The modal is typically used with artifact revision selection:
1. User selects one or more artifact revisions
2. Clicks "Remove" button
3. Modal shows table of selected revisions with artifact info
4. Revisions with PULLING or SCANNED status are filtered out with alert
5. On Remove, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `,
      },
    },
  },
  argTypes: {
    selectedArtifactFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for artifact data (can be null)',
      table: {
        type: {
          summary: 'BAIDeleteArtifactRevisionsModalArtifactFragment$key | null',
        },
      },
    },
    selectedArtifactRevisionFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for artifact revisions',
      table: {
        type: {
          summary:
            'BAIDeleteArtifactRevisionsModalArtifactRevisionFragment$key',
        },
      },
    },
    open: {
      control: false,
      description: 'Whether the modal is visible (managed by parent component)',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onOk: {
      control: false,
      description: 'Called after successful mutation completion',
      table: {
        type: { summary: '(e: React.MouseEvent) => void' },
      },
    },
    onCancel: {
      control: false,
      description: 'Called when modal is cancelled',
      table: {
        type: { summary: '(e: React.MouseEvent) => void' },
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <App>
          <Story />
        </App>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BAIDeleteArtifactRevisionsModal>;

// =============================================================================
// Query Resolver Component
// =============================================================================

const QueryResolver = () => {
  const [open, setOpen] = useState(false);

  const { artifacts, artifactRevisions } =
    useLazyLoadQuery<BAIDeleteArtifactRevisionsModalStoriesQuery>(
      graphql`
        query BAIDeleteArtifactRevisionsModalStoriesQuery {
          artifacts(offset: 0, first: 1) {
            edges {
              node {
                ...BAIDeleteArtifactRevisionsModalArtifactFragment
              }
            }
          }
          artifactRevisions(offset: 0, first: 10) {
            edges {
              node {
                ...BAIDeleteArtifactRevisionsModalArtifactRevisionFragment
              }
            }
          }
        }
      `,
      {},
    );

  const artifactNode = artifacts?.edges?.[0]?.node;
  const revisionNodes = artifactRevisions?.edges?.map((edge: any) => edge.node);

  return (
    revisionNodes &&
    revisionNodes.length > 0 && (
      <BAIFlex direction="column" gap="md">
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>
        <BAIDeleteArtifactRevisionsModal
          selectedArtifactFrgmt={artifactNode ?? null}
          selectedArtifactRevisionFrgmt={revisionNodes}
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </BAIFlex>
    )
  );
};

// =============================================================================
// Stories
// =============================================================================

/**
 * Multiple revisions deletion
 */
export const Default: Story = {
  name: 'MultipleRevisions',
  parameters: {
    docs: {
      description: {
        story:
          'Delete multiple artifact revisions. The modal displays a table with version and size columns.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'my-model',
          type: 'model',
          architecture: 'x86_64',
          description: 'A trained machine learning model',
          source: {
            name: 'HuggingFace',
            url: 'https://huggingface.co/my-model',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'v1.0.0',
                size: '1073741824', // 1GB
                status: 'READY',
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
                version: 'v1.1.0',
                size: '2147483648', // 2GB
                status: 'READY',
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
                version: 'v2.0.0',
                size: '3221225472', // 3GB
                status: 'READY',
              },
            },
          ],
        }),
        CleanupArtifactRevisionsPayload: () => ({
          artifactRevisions: {
            edges: [],
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * With excluded revisions (PULLING/SCANNED status)
 */
export const WithExcludedRevisions: Story = {
  name: 'WithExcludedRevisions',
  parameters: {
    docs: {
      description: {
        story:
          'Some revisions are excluded from deletion due to PULLING or SCANNED status. An alert shows how many are excluded.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'dataset-train',
          type: 'dataset',
          architecture: 'aarch64',
          description: 'Training dataset for ML model',
          source: {
            name: 'S3 Bucket',
            url: 'https://s3.amazonaws.com/datasets/train',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'v1.0.0',
                size: '1073741824',
                status: 'READY',
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
                version: 'v1.1.0',
                size: '2147483648',
                status: 'PULLING', // Will be excluded
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
                version: 'v2.0.0',
                size: '3221225472',
                status: 'SCANNED', // Will be excluded
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==',
                version: 'v2.1.0',
                size: '4294967296',
                status: 'READY',
              },
            },
          ],
        }),
        CleanupArtifactRevisionsPayload: () => ({
          artifactRevisions: {
            edges: [],
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Single revision deletion
 */
export const SingleRevision: Story = {
  name: 'SingleRevision',
  parameters: {
    docs: {
      description: {
        story: 'Delete a single artifact revision.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'config-file',
          type: 'other',
          architecture: 'noarch',
          description: 'Configuration file',
          source: {
            name: 'Local',
            url: '',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'latest',
                size: '1024', // 1KB
                status: 'READY',
              },
            },
          ],
        }),
        CleanupArtifactRevisionsPayload: () => ({
          artifactRevisions: {
            edges: [],
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * All revisions excluded (no deletable revisions)
 */
export const AllExcluded: Story = {
  name: 'AllExcluded',
  parameters: {
    docs: {
      description: {
        story:
          'All revisions are in PULLING or SCANNED status, so the Remove button is disabled.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'in-progress-model',
          type: 'model',
          architecture: 'x86_64',
          description: 'Model currently being processed',
          source: {
            name: 'GitHub',
            url: 'https://github.com/org/model',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'v1.0.0',
                size: '1073741824',
                status: 'PULLING',
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
                version: 'v2.0.0',
                size: '2147483648',
                status: 'SCANNED',
              },
            },
          ],
        }),
        CleanupArtifactRevisionsPayload: () => ({
          artifactRevisions: {
            edges: [],
          },
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};
