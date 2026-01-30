import BAIFlex from './BAIFlex';
import BAIUnmountAfterClose from './BAIUnmountAfterClose';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Drawer, Form, Input, Modal } from 'antd';
import { useState } from 'react';

/**
 * BAIUnmountAfterClose unmounts Modal/Drawer children after close animation completes.
 *
 * Key features:
 * - Preserves exit animations before unmounting
 * - Works with both Modal and Drawer components
 * - Prevents stale form state in modals
 * - Automatically intercepts afterClose and afterOpenChange callbacks
 *
 * @see BAIUnmountAfterClose.tsx for implementation details
 */
const meta: Meta<typeof BAIUnmountAfterClose> = {
  title: 'Utility/BAIUnmountAfterClose',
  component: BAIUnmountAfterClose,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIUnmountAfterClose** is a utility component that unmounts Modal/Drawer children after their close animations complete.

## Problem it Solves
When you close and reopen a Modal/Drawer with forms, the previous form state persists because React doesn't unmount the component. This wrapper ensures the child is fully unmounted after closing, preventing stale state issues.

## Features
- **Preserves animations**: Waits for close animation to complete before unmounting
- **Modal/Drawer support**: Works with both Ant Design Modal and Drawer
- **Callback preservation**: Maintains original \`afterClose\` and \`afterOpenChange\` callbacks
- **Automatic cleanup**: Unmounts child after animation, preventing memory leaks

## Usage
\`\`\`tsx
// Wrap Modal with form to prevent stale state
<BAIUnmountAfterClose>
  <Modal open={open} onCancel={() => setOpen(false)}>
    <Form>
      <Form.Item name="email">
        <Input />
      </Form.Item>
    </Form>
  </Modal>
</BAIUnmountAfterClose>

// Works with Drawer too
<BAIUnmountAfterClose>
  <Drawer open={open} onClose={() => setOpen(false)}>
    <Form>{/* form fields */}</Form>
  </Drawer>
</BAIUnmountAfterClose>
\`\`\`

## When to Use
- Modals/Drawers with forms that should reset on close
- Components with expensive initialization that should be cleaned up
- Any scenario where you need fresh component state on each open

## Props
This component accepts a single child element (Modal or Drawer) and automatically manages its lifecycle.

| Prop | Type | Description |
|------|------|-------------|
| \`children\` | \`React.ReactElement<ModalProps \\| DrawerProps>\` | Single Modal or Drawer component |
        `,
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: 'Single Modal or Drawer component to wrap',
      table: {
        type: { summary: 'React.ReactElement<ModalProps | DrawerProps>' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIUnmountAfterClose>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with a Modal. The modal content unmounts after the close animation completes.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <BAIUnmountAfterClose>
          <Modal
            title="Basic Modal"
            open={open}
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          >
            <p>This content will unmount after the modal closes.</p>
            <p>Mounted at: {new Date().toLocaleTimeString()}</p>
          </Modal>
        </BAIUnmountAfterClose>
      </div>
    );
  },
};

export const FormStateReset: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates form state reset. Without BAIUnmountAfterClose, form values would persist when reopening. With it, the form is fresh on each open.',
      },
    },
  },
  render: () => {
    const [withUnmount, setWithUnmount] = useState(false);
    const [withoutUnmount, setWithoutUnmount] = useState(false);

    return (
      <BAIFlex direction="column" gap="md">
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            ✅ With BAIUnmountAfterClose (form resets on close):
          </div>
          <Button onClick={() => setWithUnmount(true)}>
            Open Modal with Unmount
          </Button>
          <BAIUnmountAfterClose>
            <Modal
              title="Form with Unmount"
              open={withUnmount}
              onOk={() => setWithUnmount(false)}
              onCancel={() => setWithUnmount(false)}
            >
              <Form>
                <Form.Item label="Name" name="name">
                  <Input placeholder="Type something and close" />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input placeholder="Type something and close" />
                </Form.Item>
              </Form>
              <p style={{ fontSize: 12, color: '#666' }}>
                💡 Close and reopen - form will be reset!
              </p>
            </Modal>
          </BAIUnmountAfterClose>
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            ❌ Without BAIUnmountAfterClose (form state persists):
          </div>
          <Button onClick={() => setWithoutUnmount(true)}>
            Open Modal without Unmount
          </Button>
          <Modal
            title="Form without Unmount"
            open={withoutUnmount}
            onOk={() => setWithoutUnmount(false)}
            onCancel={() => setWithoutUnmount(false)}
          >
            <Form>
              <Form.Item label="Name" name="name">
                <Input placeholder="Type something and close" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input placeholder="Type something and close" />
              </Form.Item>
            </Form>
            <p style={{ fontSize: 12, color: '#666' }}>
              ⚠️ Close and reopen - form values persist!
            </p>
          </Modal>
        </div>
      </BAIFlex>
    );
  },
};

export const WithDrawer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Works with Drawer component as well. The drawer content unmounts after the close animation.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open Drawer</Button>
        <BAIUnmountAfterClose>
          <Drawer
            title="Drawer with Unmount"
            open={open}
            onClose={() => setOpen(false)}
          >
            <Form>
              <Form.Item label="Username" name="username">
                <Input placeholder="Type and close to see reset" />
              </Form.Item>
              <Form.Item label="Password" name="password">
                <Input.Password placeholder="Type and close to see reset" />
              </Form.Item>
            </Form>
            <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
              Mounted at: {new Date().toLocaleTimeString()}
            </p>
          </Drawer>
        </BAIUnmountAfterClose>
      </div>
    );
  },
};

export const CallbackPreservation: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BAIUnmountAfterClose preserves original afterClose and afterOpenChange callbacks.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (message: string) => {
      setLog((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ${message}`,
      ]);
    };

    return (
      <BAIFlex direction="column" gap="md">
        <Button onClick={() => setOpen(true)}>Open Modal</Button>

        <BAIUnmountAfterClose>
          <Modal
            title="Callback Test"
            open={open}
            onCancel={() => {
              addLog('onCancel called');
              setOpen(false);
            }}
            afterClose={() => {
              addLog('afterClose called (after animation)');
            }}
          >
            <p>Close this modal to see callback execution order.</p>
          </Modal>
        </BAIUnmountAfterClose>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Callback Log:</div>
          <div
            style={{
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 11,
              maxHeight: 150,
              overflow: 'auto',
            }}
          >
            {log.length === 0 ? (
              <div style={{ color: '#999' }}>(no callbacks yet)</div>
            ) : (
              log.map((entry, i) => <div key={i}>{entry}</div>)
            )}
          </div>
        </div>
      </BAIFlex>
    );
  },
};

export const RealWorldExample: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Realistic example: Session creation modal that should reset on each open.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [createdSessions, setCreatedSessions] = useState<string[]>([]);

    const handleCreate = (values: { sessionName: string; image: string }) => {
      setCreatedSessions((prev) => [
        ...prev,
        `${values.sessionName} (${values.image})`,
      ]);
      setOpen(false);
    };

    return (
      <BAIFlex direction="column" gap="md">
        <Button type="primary" onClick={() => setOpen(true)}>
          Create New Session
        </Button>

        <BAIUnmountAfterClose>
          <Modal
            title="Create Compute Session"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
          >
            <Form
              layout="vertical"
              onFinish={handleCreate}
              initialValues={{
                sessionName: `session-${Date.now()}`,
                image: 'python:3.11',
              }}
            >
              <Form.Item
                label="Session Name"
                name="sessionName"
                rules={[
                  { required: true, message: 'Please enter session name' },
                ]}
              >
                <Input placeholder="my-jupyter-session" />
              </Form.Item>

              <Form.Item
                label="Container Image"
                name="image"
                rules={[{ required: true, message: 'Please select image' }]}
              >
                <Input placeholder="python:3.11" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block>
                  Create Session
                </Button>
              </Form.Item>
            </Form>
            <p style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
              💡 Form resets with default values each time you open the modal
            </p>
          </Modal>
        </BAIUnmountAfterClose>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Created Sessions:
          </div>
          <div
            style={{
              padding: 12,
              background: '#f5f5f5',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            {createdSessions.length === 0 ? (
              <div style={{ color: '#999' }}>(no sessions yet)</div>
            ) : (
              createdSessions.map((session, i) => (
                <div key={i}>
                  {i + 1}. {session}
                </div>
              ))
            )}
          </div>
        </div>
      </BAIFlex>
    );
  },
};
