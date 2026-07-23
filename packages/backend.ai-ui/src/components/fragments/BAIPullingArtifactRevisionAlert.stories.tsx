import { BAIPullingArtifactRevisionAlertStoriesQuery } from '../../__generated__/BAIPullingArtifactRevisionAlertStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIPullingArtifactRevisionAlert from './BAIPullingArtifactRevisionAlert';
import { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIPullingArtifactRevisionAlert displays an informational alert for artifact revisions currently being pulled.
 *
 * Key features:
 * - Shows version being pulled with status information
 * - Cancel button with confirmation modal
 * - GraphQL mutation to cancel pulling
 * - Success/error message handling
 *
 * @see BAIPullingArtifactRevisionAlert.tsx for implementation details
 */
const meta: Meta<typeof BAIPullingArtifactRevisionAlert> = {
  title: 'Fragments/BAIPullingArtifactRevisionAlert',
  component: BAIPullingArtifactRevisionAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIPullingArtifactRevisionAlert** displays an alert for artifact revisions being pulled.

## Features
- Info alert showing version being pulled
- Cancel button to stop pulling process
- Confirmation modal with warning message
- GraphQL mutation to cancel import
- Success/error message notifications
- Optional callback after successful cancellation

## Usage
\`\`\`tsx
<BAIPullingArtifactRevisionAlert
  pullingArtifactRevisionFrgmt={artifactRevision}
  onOk={() => console.log('Cancelled')}
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`pullingArtifactRevisionFrgmt\` | \`BAIPullingArtifactRevisionAlertFragment$key\` | - | Relay fragment reference for artifact revision |
| \`onOk\` | \`() => void\` | - | Optional callback after successful cancellation |
        `,
      },
    },
  },
  argTypes: {
    pullingArtifactRevisionFrgmt: {
      control: false,
      description: 'Relay fragment reference for artifact revision',
    },
    onOk: {
      action: 'onOk',
      description: 'Optional callback after successful cancellation',
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
type Story = StoryObj<typeof BAIPullingArtifactRevisionAlert>;

const QueryResolver = (props?: { onOk?: () => void }) => {
  const { artifactRevision } =
    useLazyLoadQuery<BAIPullingArtifactRevisionAlertStoriesQuery>(
      graphql`
        query BAIPullingArtifactRevisionAlertStoriesQuery {
          artifactRevision(id: "test-id") {
            ...BAIPullingArtifactRevisionAlertFragment
          }
        }
      `,
      {},
    );
  return (
    artifactRevision && (
      <BAIPullingArtifactRevisionAlert
        pullingArtifactRevisionFrgmt={artifactRevision}
        {...props}
      />
    )
  );
};

/**
 * Default story showing a pulling artifact revision alert.
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Displays an alert for an artifact revision being pulled. Click the Cancel button to see the confirmation modal.',
      },
    },
  },
  render: () => (
    <RelayResolver
      mockResolvers={{
        ArtifactRevision: () => ({
          id: 'QXJ0aWZhY3RSZXZpc2lvbjox',
          status: 'PULLING',
          version: 'v1.2.3',
        }),
      }}
    >
      <QueryResolver />
    </RelayResolver>
  ),
};

/**
 * Story showing alert with onOk callback.
 */
export const WithCallback: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the onOk callback being triggered after successful cancellation. Check the Actions panel.',
      },
    },
  },
  render: (args) => (
    <RelayResolver
      mockResolvers={{
        ArtifactRevision: () => ({
          id: 'QXJ0aWZhY3RSZXZpc2lvbjoy',
          status: 'PULLING',
          version: 'v2.0.0-beta.1',
        }),
      }}
    >
      <QueryResolver onOk={args.onOk} />
    </RelayResolver>
  ),
};
