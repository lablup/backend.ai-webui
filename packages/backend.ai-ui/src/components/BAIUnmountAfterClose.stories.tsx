import { Form } from '../form-engine';
import BAIButton from './BAIButton';
import BAIFlex from './BAIFlex';
import BAIModal from './BAIModal';
import BAIUnmountAfterClose from './BAIUnmountAfterClose';
import { AstryxFormTextInput } from './astryxFormControls';
import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useEffect, useState } from 'react';

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
- **Modal/Drawer support**: Works with \`BAIModal\` (Astryx-backed) and any Drawer-shaped component exposing \`open\`/\`afterOpenChange\`
- **Callback preservation**: Maintains original \`afterClose\` and \`afterOpenChange\` callbacks
- **Automatic cleanup**: Unmounts child after animation, preventing memory leaks

## Usage
\`\`\`tsx
// Wrap BAIModal with a form to prevent stale state
<BAIUnmountAfterClose>
  <BAIModal open={open} onCancel={() => setOpen(false)}>
    <Form>
      <Form.Item name="email">
        <AstryxFormTextInput label="Email" />
      </Form.Item>
    </Form>
  </BAIModal>
</BAIUnmountAfterClose>

// Any Drawer-shaped component works too, as long as it forwards
// \`open\` and calls \`afterOpenChange\` on its close transition — Astryx
// core has no Drawer primitive, so this repo has no shared one either.
<BAIUnmountAfterClose>
  <SomeDrawer open={open} onClose={() => setOpen(false)}>
    <Form>{/* form fields */}</Form>
  </SomeDrawer>
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
| \`children\` | \`React.ReactElement<BAIUnmountAfterCloseChildProps>\` | Single Modal or Drawer component exposing \`open\`/\`afterClose\`/\`afterOpenChange\` |
        `,
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: 'Single Modal or Drawer component to wrap',
      table: {
        type: {
          summary: 'React.ReactElement<BAIUnmountAfterCloseChildProps>',
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIUnmountAfterClose>;

/**
 * Astryx core has no Drawer component — MAPPING has no destination for
 * antd's side-panel primitive, and this repo does not carry a shared
 * replacement. The `WithDrawer` story below still needs to exercise
 * BAIUnmountAfterClose's OTHER branch though: it intercepts `afterOpenChange`
 * for Drawer-shaped children, a different callback shape than `BAIModal`'s
 * `afterClose`. This minimal local stand-in exists ONLY to keep that
 * coverage — it is deliberately not promoted to a shared component, since
 * there is no real Astryx destination to build it on top of.
 */
const DemoDrawer: React.FC<{
  open?: boolean;
  title?: React.ReactNode;
  onClose?: () => void;
  afterOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}> = ({ open, title, onClose, afterOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      afterOpenChange?.(true);
      return;
    }
    // Simulate a brief close transition before reporting closed, the same
    // shape BAIUnmountAfterClose expects from a real Drawer's exit
    // animation — it unmounts the subtree right after this fires.
    const timeout = setTimeout(() => afterOpenChange?.(false), 200);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 360,
        background: 'var(--color-background-surface)',
        borderLeft: '1px solid var(--color-border)',
        boxShadow: '-4px 0 12px rgba(0,0,0,0.08)',
        padding: 16,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 200ms ease',
        zIndex: 1000,
      }}
    >
      <BAIFlex justify="between" align="center" style={{ marginBottom: 12 }}>
        <strong>{title}</strong>
        <BAIButton size="small" onClick={onClose}>
          Close
        </BAIButton>
      </BAIFlex>
      {children}
    </div>
  );
};

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
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>
        <BAIUnmountAfterClose>
          <BAIModal
            title="Basic Modal"
            open={open}
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
          >
            <p>This content will unmount after the modal closes.</p>
            <p>Mounted at: {new Date().toLocaleTimeString()}</p>
          </BAIModal>
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
          <BAIButton onClick={() => setWithUnmount(true)}>
            Open Modal with Unmount
          </BAIButton>
          <BAIUnmountAfterClose>
            <BAIModal
              title="Form with Unmount"
              open={withUnmount}
              onOk={() => setWithUnmount(false)}
              onCancel={() => setWithUnmount(false)}
            >
              <Form>
                <Form.Item label="Name" name="name">
                  <AstryxFormTextInput
                    label="Name"
                    placeholder="Type something and close"
                  />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <AstryxFormTextInput
                    label="Email"
                    placeholder="Type something and close"
                  />
                </Form.Item>
              </Form>
              <p style={{ fontSize: 12, color: '#666' }}>
                💡 Close and reopen - form will be reset!
              </p>
            </BAIModal>
          </BAIUnmountAfterClose>
        </div>

        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            ❌ Without BAIUnmountAfterClose (form state persists):
          </div>
          <BAIButton onClick={() => setWithoutUnmount(true)}>
            Open Modal without Unmount
          </BAIButton>
          <BAIModal
            title="Form without Unmount"
            open={withoutUnmount}
            onOk={() => setWithoutUnmount(false)}
            onCancel={() => setWithoutUnmount(false)}
          >
            <Form>
              <Form.Item label="Name" name="name">
                <AstryxFormTextInput
                  label="Name"
                  placeholder="Type something and close"
                />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <AstryxFormTextInput
                  label="Email"
                  placeholder="Type something and close"
                />
              </Form.Item>
            </Form>
            <p style={{ fontSize: 12, color: '#666' }}>
              ⚠️ Close and reopen - form values persist!
            </p>
          </BAIModal>
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
        <BAIButton onClick={() => setOpen(true)}>Open Drawer</BAIButton>
        <BAIUnmountAfterClose>
          <DemoDrawer
            title="Drawer with Unmount"
            open={open}
            onClose={() => setOpen(false)}
          >
            <Form>
              <Form.Item label="Username" name="username">
                <AstryxFormTextInput
                  label="Username"
                  placeholder="Type and close to see reset"
                />
              </Form.Item>
              <Form.Item label="Password" name="password">
                <AstryxFormTextInput
                  type="password"
                  label="Password"
                  placeholder="Type and close to see reset"
                />
              </Form.Item>
            </Form>
            <p style={{ fontSize: 12, color: '#666', marginTop: 16 }}>
              Mounted at: {new Date().toLocaleTimeString()}
            </p>
          </DemoDrawer>
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
        <BAIButton onClick={() => setOpen(true)}>Open Modal</BAIButton>

        <BAIUnmountAfterClose>
          <BAIModal
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
          </BAIModal>
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
    const [form] = Form.useForm();

    const handleCreate = (values: { sessionName: string; image: string }) => {
      setCreatedSessions((prev) => [
        ...prev,
        `${values.sessionName} (${values.image})`,
      ]);
      setOpen(false);
    };

    return (
      <BAIFlex direction="column" gap="md">
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Create New Session
        </BAIButton>

        <BAIUnmountAfterClose>
          <BAIModal
            title="Create Compute Session"
            open={open}
            onCancel={() => setOpen(false)}
            footer={null}
          >
            <Form
              form={form}
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
                <AstryxFormTextInput
                  label="Session Name"
                  placeholder="my-jupyter-session"
                />
              </Form.Item>

              <Form.Item
                label="Container Image"
                name="image"
                rules={[{ required: true, message: 'Please select image' }]}
              >
                <AstryxFormTextInput
                  label="Container Image"
                  placeholder="python:3.11"
                />
              </Form.Item>

              <Form.Item>
                {/* `BAIButton` deliberately does not expose antd's `htmlType`
                    (PILOT-DECISION in `BAIButton.tsx`), and Astryx `Button`
                    defaults its native `type` to `'button'` — so a bare click
                    would never submit. Driving the form instance directly is
                    the engine-native equivalent and keeps validation in the
                    loop. */}
                <BAIButton type="primary" block onClick={() => form.submit()}>
                  Create Session
                </BAIButton>
              </Form.Item>
            </Form>
            <p style={{ fontSize: 11, color: '#666', marginTop: 8 }}>
              💡 Form resets with default values each time you open the modal
            </p>
          </BAIModal>
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
