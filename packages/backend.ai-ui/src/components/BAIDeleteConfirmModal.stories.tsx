'use memo';

import BAIButton from './BAIButton';
import BAIDeleteConfirmModal from './BAIDeleteConfirmModal';
import BAIFlex from './BAIFlex';
import { DeleteOutlined, FolderOutlined } from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, Space, Tag } from 'antd';
import { useState } from 'react';

const meta: Meta<typeof BAIDeleteConfirmModal> = {
  title: 'Modal/BAIDeleteConfirmModal',
  component: BAIDeleteConfirmModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIDeleteConfirmModal** is a unified delete confirmation modal for table row deletion.

## Behavior
- **Single item**: Simple confirm dialog. OK button is immediately enabled.
- **Single item + \`requireConfirmInput\`**: Requires typing the item name. Item list is hidden — the name already appears in the description.
- **Multiple items (2+)**: Shows scrollable item list followed by a confirmation input requiring "Delete" to be typed.

## Key Features
- Accepts \`React.ReactNode\` for item labels (icons, tags, custom rendering)
- Scrollable item list for multi-item selections
- \`extraContent\` slot for domain-specific additions (checkboxes, warnings)
- Built on \`BAIModal\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDeleteConfirmModal>;

export const SingleItem: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Single item deletion with simple confirm. No text input required.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Delete Item
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={[{ key: '1', label: 'my-important-resource' }]}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const SingleItemWithInput: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Single item with `requireConfirmInput={true}`. Item list is hidden (name already appears in description). User must type the item name into the confirmation input to enable the Delete button.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Delete (Confirm Required)
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={[{ key: '1', label: 'production-database' }]}
          requireConfirmInput
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const MultipleItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Multiple items require typing "Delete" to confirm. Shows scrollable item list above the confirmation input.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [
      { key: '1', label: 'project-alpha' },
      { key: '2', label: 'project-beta' },
      { key: '3', label: 'project-gamma' },
      { key: '4', label: 'project-delta' },
      { key: '5', label: 'project-epsilon' },
    ];
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Delete 5 Items
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={items}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const ManyItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Large selection (50 items) demonstrating scroll behavior within the item list.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = Array.from({ length: 50 }, (_, i) => ({
      key: String(i),
      label: `resource-${String(i + 1).padStart(3, '0')}`,
    }));
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Delete 50 Items
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={items}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const CustomRenderedItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Items with ReactNode labels — icons, tags, and custom components.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [
      {
        key: '1',
        label: (
          <Space>
            <FolderOutlined />
            <span>shared-dataset</span>
            <Tag color="blue">Public</Tag>
          </Space>
        ),
      },
      {
        key: '2',
        label: (
          <Space>
            <FolderOutlined />
            <span>model-weights-v2</span>
            <Tag color="red">Private</Tag>
          </Space>
        ),
      },
      {
        key: '3',
        label: (
          <Space>
            <FolderOutlined />
            <span>training-logs</span>
            <Tag color="green">Archived</Tag>
          </Space>
        ),
      },
    ];
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Delete Folders
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={items}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const WithExtraContent: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Extra content slot with checkboxes, similar to PurgeUsersModal pattern.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [
      { key: '1', label: 'user-john@example.com' },
      { key: '2', label: 'user-jane@example.com' },
    ];
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Purge Users
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={items}
          extraContent={
            <BAIFlex direction="column" align="start">
              <Checkbox>Also delete shared folders</Checkbox>
              <Checkbox>Terminate running sessions</Checkbox>
            </BAIFlex>
          }
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const EmptyItems: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Edge case: empty items array. OK button is disabled.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton
          danger
          icon={<DeleteOutlined />}
          onClick={() => setOpen(true)}
        >
          Delete (No Selection)
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          items={[]}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};
