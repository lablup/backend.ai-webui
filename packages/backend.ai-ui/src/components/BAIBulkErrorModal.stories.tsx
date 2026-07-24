'use memo';

import BAIBulkErrorModal from './BAIBulkErrorModal';
import BAIButton from './BAIButton';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

interface FailedRequestExample {
  key: string;
  target: string;
  action: string;
  message: string;
}

const failedRequests: FailedRequestExample[] = [
  {
    key: '1',
    target: 'project-alpha',
    action: 'Grant',
    message: 'Permission denied',
  },
  {
    key: '2',
    target: 'project-beta',
    action: 'Revoke',
    message: 'Permission not found',
  },
  {
    key: '3',
    target: 'project-gamma',
    action: 'Grant',
    message: 'Duplicate permission entry',
  },
];

const exampleColumns = [
  { key: 'target', title: 'Target', dataIndex: 'target' },
  { key: 'action', title: 'Action', dataIndex: 'action' },
  { key: 'message', title: 'Error Message', dataIndex: 'message' },
];

const meta: Meta<typeof BAIBulkErrorModal> = {
  title: 'Modal/BAIBulkErrorModal',
  component: BAIBulkErrorModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIBulkErrorModal** surfaces the per-request errors of a bulk operation in a table — one row per failed request.

## Behavior
- Every bulk operation has its own response shape, so the caller provides the table \`columns\`; nothing is hardcoded.
- The title defaults to a localized "Action execution failed" with an error icon; pass \`title\` for operation-specific copy.
- Purely informational: there is no footer — dismissal happens through the header X (or mask / Esc) and is reported through \`onRequestClose\` so the caller decides what happens next (typically keeping its own form open for a retry).
- Client-side pagination shows at most 10 rows per page; the pager is hidden while the failures fit on a single page.
- Built on \`BAIModal\` and \`BAITable\`.
        `,
      },
    },
  },
  argTypes: {
    columns: {
      control: false,
      description: 'Caller-defined column definitions for the failure table',
    },
    dataSource: {
      control: false,
      description: 'One record per failed request',
    },
    alertDescription: {
      control: 'text',
      description:
        'Optional guidance (string) rendered as the body of an error alert above the table',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIBulkErrorModal>;

export const Basic: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Default state: localized "Action execution failed" title with error icon and caller-provided columns.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Show bulk errors
        </BAIButton>
        <BAIBulkErrorModal<FailedRequestExample>
          open={open}
          columns={exampleColumns}
          dataSource={failedRequests}
          onRequestClose={() => setOpen(false)}
        />
      </>
    );
  },
};

export const ManyFailures: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'More than 10 failed requests: the table paginates client-side at 10 rows per page.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const manyFailures: FailedRequestExample[] = Array.from(
      { length: 23 },
      (_ignored, index) => ({
        key: `${index + 1}`,
        target: `project-${index + 1}`,
        action: index % 2 === 0 ? 'Grant' : 'Revoke',
        message: 'Permission denied',
      }),
    );
    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Show bulk errors
        </BAIButton>
        <BAIBulkErrorModal<FailedRequestExample>
          open={open}
          columns={exampleColumns}
          dataSource={manyFailures}
          onRequestClose={() => setOpen(false)}
        />
      </>
    );
  },
};

export const WithCustomTitleAndDescription: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Operation-specific title plus a description explaining how to retry the failed items.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Show bulk errors
        </BAIButton>
        <BAIBulkErrorModal<FailedRequestExample>
          open={open}
          title="3 permission change(s) failed"
          alertDescription="The failed changes are kept in the form. Fix them and save again — changes that were already applied will not be re-submitted."
          columns={exampleColumns}
          dataSource={failedRequests}
          onRequestClose={() => setOpen(false)}
        />
      </>
    );
  },
};
