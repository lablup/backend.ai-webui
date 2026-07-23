'use memo';

import BAIButton from './BAIButton';
import BAIDeleteConfirmModal from './BAIDeleteConfirmModal';
import BAIFlex from './BAIFlex';
import { DeleteFilled, FolderOutlined } from '@ant-design/icons';
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
- **\`reversible\`**: Keeps the exact same modal chrome but never renders the typed-confirmation input (even for multiple items or with \`requireConfirmInput\`) and omits the "This action cannot be undone." warning. Use for actions the user can recover from in <30s without support (e.g. revoke a role assignment, remove a permission from a role).

## Key Features
- Accepts \`React.ReactNode\` for item labels (icons, tags, custom rendering)
- Scrollable item list for multi-item selections
- \`target\` prop produces a resource-type-aware default description ("Are you sure you want to permanently delete {target}?")
- \`reversible\` prop downgrades the modal for reversible actions while keeping a consistent design
- Long, unbreakable titles (e.g. full image references) wrap inside the header instead of overflowing
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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

export const WithTarget: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Resource-typed deletion using the `target` prop. The default description becomes "Are you sure you want to permanently delete {target}?", surfacing the resource type (e.g. "Resource Preset", "Resource Policy") in the dialog copy. Typically paired with `requireConfirmInput` for irreversible deletes.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const itemName = 'gpu-large-preset';
    return (
      <>
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
          Delete Resource Preset
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          title="Delete Resource Preset"
          target="Resource Preset"
          items={[{ key: itemName, label: itemName }]}
          confirmText={itemName}
          requireConfirmInput
          inputProps={{ placeholder: itemName }}
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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

export const Reversible: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Reversible action (e.g. revoke a role assignment, remove a permission from a role). `reversible` keeps the exact same modal chrome as the irreversible-delete modal but never renders the typed-confirmation input and omits the "This action cannot be undone." warning.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
          Revoke User
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          reversible
          title="Revoke User"
          description="Revoke the following user(s) from this role?"
          okText="Revoke User"
          items={[{ key: '1', label: 'user-john@example.com' }]}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const ReversibleMultipleItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Reversible variant with multiple items. Normally 2+ items force the typed-confirmation input; with `reversible` the item list is still shown but no input is required and the "cannot be undone" warning is omitted.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const items = [
      { key: '1', label: 'user-john@example.com' },
      { key: '2', label: 'user-jane@example.com' },
      { key: '3', label: 'user-bob@example.com' },
    ];
    return (
      <>
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
          Revoke 3 Users
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          reversible
          title="Revoke User"
          description="Revoke the following user(s) from this role?"
          okText="Revoke User"
          items={items}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const LongTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Long, unbreakable titles (e.g. a full container image reference) wrap inside the modal header instead of overflowing past the modal border.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const imageRef =
      'cr.backend.ai/testing/aimet:1.22.2-tf24-py38-cuda11.1-customized_274887c86af24173aa004423019dfcc5@x86_64';
    return (
      <>
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
          Delete Image
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          title={`Delete "${imageRef}"`}
          items={[{ key: imageRef, label: imageRef }]}
          requireConfirmInput
          confirmText={imageRef}
          inputProps={{ placeholder: imageRef }}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const PlainItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`plainItems` drops the default surface (background / border / padding / scroll) around the item list. Use when an item `label` is already a self-contained block (e.g. a table or card) so the default box does not produce a redundant double border.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
          Remove Permission
        </BAIButton>
        <BAIDeleteConfirmModal
          open={open}
          reversible
          plainItems
          title="Remove Permission"
          description="Remove the following permission from this role?"
          okText="Remove Permission"
          items={[
            {
              key: '1',
              label: (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    border: '1px solid #d9d9d9',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        Scope
                      </th>
                      <th style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        Target
                      </th>
                      <th style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        Entity
                      </th>
                      <th style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        Operation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        User
                      </td>
                      <td style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        test@lablup.com
                      </td>
                      <td style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        Notification Channel
                      </td>
                      <td style={{ border: '1px solid #d9d9d9', padding: 8 }}>
                        Create
                      </td>
                    </tr>
                  </tbody>
                </table>
              ),
            },
          ]}
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
        <BAIButton danger icon={<DeleteFilled />} onClick={() => setOpen(true)}>
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
