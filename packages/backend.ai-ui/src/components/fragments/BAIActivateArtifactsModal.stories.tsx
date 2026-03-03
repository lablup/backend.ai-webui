import { BAIActivateArtifactsModalStoriesQuery } from '../../__generated__/BAIActivateArtifactsModalStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIActivateArtifactsModal from './BAIActivateArtifactsModal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIActivateArtifactsModal is a confirmation modal for activating (restoring) artifacts.
 *
 * Key features:
 * - GraphQL fragment-based artifact data
 * - Relay mutation for activating artifacts
 * - Different messages for single vs multiple artifacts
 * - Success/error message handling
 * - Loading state during activation
 *
 * @see BAIActivateArtifactsModal.tsx for implementation details
 */
const meta: Meta<typeof BAIActivateArtifactsModal> = {
  title: 'Fragments/BAIActivateArtifactsModal',
  component: BAIActivateArtifactsModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIActivateArtifactsModal** is a confirmation modal for activating (restoring) archived artifacts with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedArtifactsFragment\` | \`BAIActivateArtifactsModalArtifactsFragment$key\` | - | GraphQL fragment reference for selected artifacts (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after successful mutation completion (not on button click) |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Confirmation Message**: Shows different messages for single artifact ("artifact name") vs multiple artifacts ("N artifacts")
- **Mutation Integration**: Uses \`restoreArtifacts\` mutation to activate selected artifacts
- **Success/Error Handling**: Displays success/error messages via Ant Design message component
- **Loading State**: OK button shows loading state during mutation execution

## Usage Pattern
The modal is typically used with a table selection:
1. User selects one or more archived artifacts
2. Clicks "Activate" button
3. Modal shows confirmation with artifact names/count
4. On OK, mutation executes and modal closes on success

For other props, refer to [Ant Design Modal](https://ant.design/components/modal).

## Storybook
Mutation is mocked and will execute successfully, closing the modal on completion.
        `,
      },
    },
  },
  argTypes: {
    selectedArtifactsFragment: {
      control: false,
      description: 'GraphQL fragment reference for selected artifacts',
      table: {
        type: { summary: 'BAIActivateArtifactsModalArtifactsFragment$key' },
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
type Story = StoryObj<typeof BAIActivateArtifactsModal>;

interface QueryResolverProps {
  defaultOpen?: boolean;
}

const QueryResolver = ({ defaultOpen = false }: QueryResolverProps) => {
  const [open, setOpen] = useState(defaultOpen);

  const { artifacts } = useLazyLoadQuery<BAIActivateArtifactsModalStoriesQuery>(
    graphql`
      query BAIActivateArtifactsModalStoriesQuery {
        artifacts(offset: 0, first: 10) {
          edges {
            node {
              ...BAIActivateArtifactsModalArtifactsFragment
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
        <BAIActivateArtifactsModal
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
 * Single artifact activation
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Activate a single artifact. The modal displays the artifact name in the confirmation message.',
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
        RestoreArtifactsPayload: () => ({
          artifacts: [
            {
              id: 'QXJ0aWZhY3Q6YXJ0aWZhY3QtMQ==',
              availability: 'AVAILABLE',
            },
          ],
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};
