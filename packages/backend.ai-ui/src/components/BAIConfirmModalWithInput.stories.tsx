'use memo';

import BAIButton from './BAIButton';
import BAIConfirmModalWithInput from './BAIConfirmModalWithInput';
import BAIText from './BAIText';
import { DeleteOutlined } from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { theme } from 'antd';
import { useState } from 'react';

const meta: Meta<typeof BAIConfirmModalWithInput> = {
  title: 'Components/BAIConfirmModalWithInput',
  component: BAIConfirmModalWithInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIConfirmModalWithInput** is a specialized modal component for dangerous actions that require explicit user confirmation. It extends [BAIModal](/?path=/docs/components-baimodal--docs) and enforces users to type a confirmation text before allowing the action.

## Key Features
- **Type-to-Confirm**: OK button is disabled until user types the exact confirmation text
- **Danger Mode**: OK button is styled as danger (red) by default
- **Form Validation**: Built-in form validation with error messages
- **Auto-Reset**: Form resets on modal close/cancel

## BAI-Specific Props
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| \`confirmText\` | \`string\` | Yes | The exact text user must type to enable confirmation |
| \`content\` | \`ReactNode\` | Yes | Content displayed above the input field |
| \`title\` | \`ReactNode\` | Yes | Modal title |
| \`icon\` | \`ReactNode\` | No | Custom icon (defaults to warning icon) |
| \`inputLabel\` | \`ReactNode\` | No | Label displayed above the input field |
| \`inputProps\` | \`InputProps\` | No | Additional props for the input field |
| \`okButtonProps\` | \`Omit<BAIModalProps['okButtonProps'], 'disabled' \\| 'danger'>\` | No | OK button props (disabled/danger are controlled internally) |

For inherited props, refer to [BAIModal](/?path=/docs/components-baimodal--docs).
        `,
      },
    },
  },
  argTypes: {
    confirmText: {
      control: { type: 'text' },
      description: 'The exact text user must type to enable confirmation',
    },
    title: {
      control: { type: 'text' },
      description: 'Modal title',
    },
    inputLabel: {
      control: { type: 'text' },
      description: 'Label displayed above the input field',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIConfirmModalWithInput>;

export const Default: Story = {
  name: 'Basic',
  args: {
    confirmText: 'DELETE',
    title: 'Delete Project',
    inputLabel: (
      <>
        Please type <strong>DELETE</strong> to confirm.
      </>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Open Modal
        </BAIButton>
        <BAIConfirmModalWithInput
          {...args}
          open={open}
          content={
            <BAIText>
              This action <strong>cannot be undone</strong>. This will
              permanently delete the project and all its associated data.
            </BAIText>
          }
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const CustomIcon: Story = {
  args: {
    confirmText: 'DELETE',
    title: 'Delete Files',
    inputLabel: (
      <>
        Type <strong>DELETE</strong> to confirm.
      </>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const { token } = theme.useToken();
    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Open Modal
        </BAIButton>
        <BAIConfirmModalWithInput
          {...args}
          open={open}
          icon={
            <DeleteOutlined
              style={{ color: token.colorError, marginRight: 5 }}
            />
          }
          content={
            <BAIText>
              You are about to delete 15 files. This action cannot be undone.
            </BAIText>
          }
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};

export const WithInputProps: Story = {
  args: {
    confirmText: 'CONFIRM',
    title: 'Dangerous Action',
    inputLabel: (
      <>
        Type <strong>CONFIRM</strong> to proceed.
      </>
    ),
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Open Modal
        </BAIButton>
        <BAIConfirmModalWithInput
          {...args}
          open={open}
          content={
            <BAIText>
              This is a high-risk operation that will affect multiple resources.
            </BAIText>
          }
          inputProps={{
            placeholder: `Type ${args.confirmText} here...`,
          }}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </>
    );
  },
};
