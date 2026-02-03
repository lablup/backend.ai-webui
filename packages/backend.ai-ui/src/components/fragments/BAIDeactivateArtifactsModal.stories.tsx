import { BAIDeactivateArtifactsModalStoriesQuery } from '../../__generated__/BAIDeactivateArtifactsModalStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIDeactivateArtifactsModal from './BAIDeactivateArtifactsModal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIDeactivateArtifactsModal is a confirmation modal for deactivating (deleting) artifacts.
 *
 * Key features:
 * - GraphQL fragment-based artifact data
 * - Relay mutation for deactivating artifacts
 * - Different messages for single vs multiple artifacts
 * - Success/error message handling
 * - Loading state during deactivation
 * - Danger-styled OK button
 *
 * @see BAIDeactivateArtifactsModal.tsx for implementation details
 */
const meta: Meta<typeof BAIDeactivateArtifactsModal> = {
  title: 'Fragments/BAIDeactivateArtifactsModal',
  component: BAIDeactivateArtifactsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIDeactivateArtifactsModal** is a confirmation modal for deactivating (deleting) artifacts with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactsFragment\` | \`BAIDeactivateArtifactsModalArtifactsFragment$key\` | - | GraphQL fragment reference for selected artifacts (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Confirmation Message**: Shows different messages for single artifact ("artifact name") vs multiple artifacts ("N artifacts")
- **Mutation Integration**: Uses \`deleteArtifacts\` mutation to deactivate selected artifacts
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: OK button shows loading state during mutation execution
- **Danger Button**: OK button is styled as danger (red) to indicate destructive action

## Usage Pattern
The modal is typically used with a table selection:
1. User selects one or more artifacts
2. Clicks "Deactivate" button
3. Modal shows confirmation with artifact names/count
4. On OK, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Note
In Storybook, the mutation will not execute. Click "Cancel" to close the modal.
        `,
      },
    },
  },
  argTypes: {
    selectedArtifactsFragment: {
      control: false,
      description: 'GraphQL fragment reference for selected artifacts',
      table: {
        type: { summary: 'BAIDeactivateArtifactsModalArtifactsFragment$key' },
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
      <App>
        <Story />
      </App>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BAIDeactivateArtifactsModal>;

const QueryResolver = () => {
  const [open, setOpen] = useState(false);

  const { artifacts } =
    useLazyLoadQuery<BAIDeactivateArtifactsModalStoriesQuery>(
      graphql`
        query BAIDeactivateArtifactsModalStoriesQuery {
          artifacts(offset: 0, first: 10) {
            edges {
              node {
                ...BAIDeactivateArtifactsModalArtifactsFragment
              }
            }
          }
        }
      `,
      {},
    );

  const artifactNodes = artifacts?.edges?.map((edge: any) => edge.node);

  return (
    artifactNodes &&
    artifactNodes.length > 0 && (
      <BAIFlex direction="column" gap="md">
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>
        <BAIDeactivateArtifactsModal
          selectedArtifactsFragment={artifactNodes}
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </BAIFlex>
    )
  );
};

/**
 * Single artifact deactivation
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Deactivate a single artifact. The modal displays the artifact name in the confirmation message with a danger-styled button.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ArtifactConnection: () => ({
          edges: [
            {
              node: {
                id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
                name: 'my-model-v1.0',
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
