import { BAIProjectBulkEditModalStoriesQuery } from '../../__generated__/BAIProjectBulkEditModalStoriesQuery.graphql';
import RelayResolver from '../../tests/RelayResolver';
import BAIButton from '../BAIButton';
import BAIFlex from '../BAIFlex';
import BAIProjectBulkEditModal from './BAIProjectBulkEditModal';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * BAIProjectBulkEditModal is a modal for bulk editing multiple project settings.
 *
 * Key features:
 * - GraphQL fragment-based project data
 * - Relay mutation for updating project resource policies
 * - Shows list of selected projects
 * - Form with resource policy selection
 * - Parallel mutation execution with Promise.all
 * - Suspense boundary for loading state
 *
 * @see BAIProjectBulkEditModal.tsx for implementation details
 */
const meta: Meta<typeof BAIProjectBulkEditModal> = {
  title: 'Fragments/BAIProjectBulkEditModal',
  component: BAIProjectBulkEditModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIProjectBulkEditModal** is a modal for bulk editing multiple project settings with GraphQL mutation integration.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`selectedProjectFragments\` | \`BAIProjectBulkEditModalFragment$key\` | - | GraphQL fragment reference for selected projects (required) |
| \`onOk\` | \`(e: React.MouseEvent) => void\` | - | Called after all mutations complete successfully |
| \`onCancel\` | \`(e: React.MouseEvent) => void\` | - | Called when modal is cancelled |

## Features
- **Project List**: Shows all selected projects in an info alert
- **Resource Policy Selection**: Form field for changing project resource policy
- **Parallel Mutations**: Executes mutations for all projects simultaneously using Promise.all
- **Loading State**: Shows loading spinner in select field while data loads (Suspense)
- **Confirm Loading**: Save button shows loading state during mutation execution
- **Auto Cleanup**: Uses \`destroyOnHidden\` to unmount component when closed

For other props, refer to [BAIModal](/?path=/docs/modal-baimodal--docs).

## Note
In Storybook, the mutation will not execute. Click "Cancel" to close the modal.
        `,
      },
    },
  },
  argTypes: {
    selectedProjectFragments: {
      control: false,
      description: 'GraphQL fragment reference for selected projects',
      table: {
        type: { summary: 'BAIProjectBulkEditModalFragment$key' },
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
      description: 'Called after all mutations complete successfully',
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
type Story = StoryObj<typeof BAIProjectBulkEditModal>;

const QueryResolver = () => {
  const [open, setOpen] = useState(false);

  const { group_nodes } = useLazyLoadQuery<BAIProjectBulkEditModalStoriesQuery>(
    graphql`
      query BAIProjectBulkEditModalStoriesQuery {
        group_nodes(offset: 0, first: 3) {
          edges {
            node {
              ...BAIProjectBulkEditModalFragment
            }
          }
        }
      }
    `,
    {},
  );

  const projectNodes = group_nodes?.edges?.map((edge: any) => edge.node);

  return (
    projectNodes &&
    projectNodes.length > 0 && (
      <BAIFlex direction="column" gap="md">
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>
        <BAIProjectBulkEditModal
          selectedProjectFragments={projectNodes}
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </BAIFlex>
    )
  );
};

/**
 * Bulk edit multiple projects
 */
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Edit multiple projects at once.',
      },
    },
  },
  render: () => (
    <RelayResolver>
      <QueryResolver />
    </RelayResolver>
  ),
};
