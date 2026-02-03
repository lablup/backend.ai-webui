import { BAIImportArtifactModalStoriesQuery } from '../../__generated__/BAIImportArtifactModalStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIImportArtifactModal from './BAIImportArtifactModal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';

/**
 * BAIImportArtifactModal is a modal for importing (pulling) artifact revisions with a table view.
 *
 * Key features:
 * - GraphQL fragment-based artifact and revision data
 * - Relay mutation for importing revisions
 * - Table showing selected revisions (version, size)
 * - Only SCANNED status revisions can be imported
 * - Alert when some revisions are excluded
 * - Artifact description display
 * - Success/error message handling
 * - Pull button with loading state
 *
 * @see BAIImportArtifactModal.tsx for implementation details
 */
const meta: Meta<typeof BAIImportArtifactModal> = {
  title: 'Fragments/BAIImportArtifactModal',
  component: BAIImportArtifactModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIImportArtifactModal** is a modal for importing (pulling) artifact revisions with table view and filtering.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactFrgmt\` | \`BAIImportArtifactModalArtifactFragment$key \\| null\` | - | GraphQL fragment reference for artifact data |
| \`selectedArtifactRevisionFrgmt\` | \`BAIImportArtifactModalArtifactRevisionFragment$key\` | - | GraphQL fragment reference for artifact revisions (required) |
| \`onOk\` | \`(e: React.MouseEvent, tasks: Array) => void\` | - | Called after successful mutation with task information |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |
| \`connectionIds\` | \`string[]\` | - | Optional Relay connection IDs for cache updates |

## Features
- **Revision Table**: Shows version and size columns for selected revisions
- **Status Filtering**: Only SCANNED status revisions can be imported
- **Exclusion Alert**: Displays alert when some revisions are excluded from import
- **Artifact Info**: Shows artifact description (name, type, architecture)
- **Mutation Integration**: Uses \`importArtifacts\` mutation
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: Pull button shows loading state during mutation execution
- **Smart Disabling**: Button disabled when no importable revisions or during execution
- **Task Tracking**: Returns task information in onOk callback for progress tracking

## Usage Pattern
The modal is typically used with artifact revision selection:
1. User selects one or more artifact revisions
2. Clicks "Pull" button
3. Modal shows table of selected revisions with artifact info
4. Revisions without SCANNED status are filtered out with alert
5. On Pull, mutation executes and modal closes on success with task info

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Note
In Storybook, the mutation will not execute. Click "Cancel" to close the modal.
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
          summary: 'BAIImportArtifactModalArtifactFragment$key | null',
        },
      },
    },
    selectedArtifactRevisionFrgmt: {
      control: false,
      description: 'GraphQL fragment reference for artifact revisions',
      table: {
        type: {
          summary: 'BAIImportArtifactModalArtifactRevisionFragment$key',
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
      description:
        'Called after successful mutation completion with task information',
      table: {
        type: {
          summary:
            '(e: React.MouseEvent, tasks: { taskId: string; version: string; artifact: { id: string; name: string } }[]) => void',
        },
      },
    },
    onCancel: {
      control: false,
      description: 'Called when modal is cancelled',
      table: {
        type: { summary: '(e: React.MouseEvent) => void' },
      },
    },
    connectionIds: {
      control: false,
      description: 'Optional Relay connection IDs for cache updates',
      table: {
        type: { summary: 'string[]' },
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
type Story = StoryObj<typeof BAIImportArtifactModal>;

const QueryResolver = () => {
  const [open, setOpen] = useState(false);

  const { artifacts, artifactRevisions } =
    useLazyLoadQuery<BAIImportArtifactModalStoriesQuery>(
      graphql`
        query BAIImportArtifactModalStoriesQuery {
          artifacts(offset: 0, first: 1) {
            edges {
              node {
                ...BAIImportArtifactModalArtifactFragment
              }
            }
          }
          artifactRevisions(offset: 0, first: 10) {
            edges {
              node {
                ...BAIImportArtifactModalArtifactRevisionFragment
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
        <BAIImportArtifactModal
          selectedArtifactFrgmt={artifactNode ?? null}
          selectedArtifactRevisionFrgmt={revisionNodes}
          open={open}
          onOk={() => {
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      </BAIFlex>
    )
  );
};

/**
 * Multiple SCANNED revisions ready to be pulled
 */
export const Default: Story = {
  name: 'PullableRevisions',
  parameters: {
    docs: {
      description: {
        story:
          'Import multiple artifact revisions with SCANNED status. The modal displays a table with version and size columns.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'pytorch-model',
          type: 'model',
          architecture: 'x86_64',
          description: 'PyTorch deep learning model',
          source: {
            name: 'HuggingFace Hub',
            url: 'https://huggingface.co/pytorch/model',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'v1.0.0',
                size: '2147483648', // 2GB
                status: 'SCANNED',
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMg==',
                version: 'v1.1.0',
                size: '3221225472', // 3GB
                status: 'SCANNED',
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMw==',
                version: 'v2.0.0',
                size: '4294967296', // 4GB
                status: 'SCANNED',
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
 * With excluded revisions (non-SCANNED status)
 */
export const WithExcludedRevisions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Some revisions are excluded from import because they are not in SCANNED status. An alert shows how many are excluded.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'tensorflow-dataset',
          type: 'dataset',
          architecture: 'noarch',
          description: 'TensorFlow training dataset',
          source: {
            name: 'Google Cloud Storage',
            url: 'https://storage.googleapis.com/datasets/tf',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'v1.0.0',
                size: '1073741824',
                status: 'SCANNED',
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
                status: 'READY', // Will be excluded
              },
            },
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtNA==',
                version: 'v2.1.0',
                size: '4294967296',
                status: 'SCANNED',
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
 * Single revision import
 */
export const SingleRevision: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Import a single artifact revision.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'llm-weights',
          type: 'model',
          architecture: 'x86_64',
          description: 'Large language model weights',
          source: {
            name: 'HuggingFace',
            url: 'https://huggingface.co/llm/weights',
          },
        }),
        ArtifactRevisionConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3RSZXZpc2lvbjpyZXYtMQ==',
                version: 'latest',
                size: '10737418240', // 10GB
                status: 'SCANNED',
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
 * All revisions excluded (no pullable revisions)
 */
export const AllExcluded: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'All revisions are not in SCANNED status, so the Pull button is disabled.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        Artifact: () => ({
          id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
          name: 'processing-artifact',
          type: 'model',
          architecture: 'aarch64',
          description: 'Artifact currently being processed',
          source: {
            name: 'Internal Registry',
            url: 'https://registry.internal/artifacts',
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
