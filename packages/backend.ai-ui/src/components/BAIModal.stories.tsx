import BAIButton from './BAIButton';
import BAIFlex from './BAIFlex';
import BAIModal from './BAIModal';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';

const meta: Meta<typeof BAIModal> = {
  title: 'Modal/BAIModal',
  component: BAIModal,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIModal** extends [Ant Design Modal](https://ant.design/components/modal).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`draggable\` | \`boolean\` | \`false\` | Enable dragging modal by header |
| \`confirmBeforeClose\` | \`boolean\` | \`false\` | When true, calls \`onConfirmClose\` before closing |
| \`onConfirmClose\` | \`() => void \\| Promise<boolean>\` | - | Callback before close; return false/reject to prevent |
| \`stickyTitle\` | \`boolean\` | \`false\` | Makes the header sticky when body content is scrolled |
| \`type\` | \`'normal' \\| 'warning' \\| 'error'\` | \`'normal'\` | Visual variant that changes the header title color |

## Additional Features
- **Fixed z-index**: Uses \`DEFAULT_BAI_MODAL_Z_INDEX = 1001\`
- **Centered by default**: \`centered\` defaults to \`true\`
- **Consistent styling**: Standard header, body, footer styles with dividers

For all other props, refer to [Ant Design Modal](https://ant.design/components/modal).
        `,
      },
    },
  },
  argTypes: {
    // BAI-specific props - document fully
    draggable: {
      control: { type: 'boolean' },
      description:
        'Enable dragging modal by header. Hover over the drag icon to activate.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    confirmBeforeClose: {
      control: { type: 'boolean' },
      description:
        'When true, calls onConfirmClose before closing. If onConfirmClose returns false or rejects, the close is prevented.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onConfirmClose: {
      control: false,
      description:
        'Callback invoked before close when confirmBeforeClose is true. Return false or reject to prevent closing.',
      table: {
        type: { summary: '() => void | Promise<boolean>' },
      },
    },
    stickyTitle: {
      control: { type: 'boolean' },
      description:
        'Makes the modal header sticky so it remains visible when body content is scrolled.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    type: {
      control: { type: 'select' },
      options: ['normal', 'warning', 'error'],
      description:
        'Visual variant that changes the header title color. Uses Ant Design theme tokens for colors.',
      table: {
        type: { summary: "'normal' | 'warning' | 'error'" },
        defaultValue: { summary: 'normal' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIModal>;

const ModalContent = () => (
  <BAIFlex direction="column" gap="md">
    <BAIText>
      This is sample content for the BAI Modal component. It demonstrates how
      content is displayed within the modal body.
    </BAIText>
    <BAIText>
      The modal provides consistent styling with proper header dividers, body
      padding, and footer layout following Backend.AI design guidelines.
    </BAIText>
  </BAIFlex>
);

const LongModalContent = () => (
  <BAIFlex direction="column" gap="md">
    {Array.from({ length: 20 }, (_, i) => (
      <BAIText key={i}>
        Paragraph {i + 1}: This is a long content section to demonstrate
        scrollable body behavior and the sticky title feature. When the body
        overflows, the header should remain fixed at the top.
      </BAIText>
    ))}
  </BAIFlex>
);

// Default story with interactive controls
export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic modal with standard props. Click the button to open the modal.',
      },
    },
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal
        </BAIButton>
        <BAIModal
          {...args}
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <ModalContent />
        </BAIModal>
      </>
    );
  },
  args: {
    title: 'Modal Title',
    draggable: false,
  },
};

// Draggable modal comparison
export const DraggableModal: Story = {
  name: 'Draggable Feature',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the draggable feature. Hover over the drag handle icon (☰) in the modal header to activate dragging. The modal can be moved around the viewport while staying within bounds.',
      },
    },
  },
  render: () => {
    const [openNormal, setOpenNormal] = useState(false);
    const [openDraggable, setOpenDraggable] = useState(false);

    return (
      <BAIFlex gap="md">
        <BAIButton type="primary" onClick={() => setOpenNormal(true)}>
          Open Normal Modal
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenDraggable(true)}>
          Open Draggable Modal
        </BAIButton>

        <BAIModal
          title="Normal Modal (Not Draggable)"
          open={openNormal}
          onOk={() => setOpenNormal(false)}
          onCancel={() => setOpenNormal(false)}
          draggable={false}
        >
          <BAIText>
            This modal cannot be dragged. It stays in the center of the
            viewport.
          </BAIText>
        </BAIModal>

        <BAIModal
          title="Draggable Modal"
          open={openDraggable}
          onOk={() => setOpenDraggable(false)}
          onCancel={() => setOpenDraggable(false)}
          draggable={true}
        >
          <BAIFlex direction="column" gap="sm">
            <BAIText>
              Hover over the drag handle icon (☰) to the left of the title,
              then drag this modal around!
            </BAIText>
            <BAIText>
              The modal will stay within the viewport bounds and cannot be
              dragged outside the visible area.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </BAIFlex>
    );
  },
};

// Confirm before close story
export const ConfirmBeforeClose: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `confirmBeforeClose` feature. When enabled, a confirmation dialog is shown before the modal closes. The close is only allowed if the user confirms.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const { modal } = App.useApp();

    return (
      <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal with Confirm
        </BAIButton>
        <BAIModal
          title="Form Modal"
          open={open}
          confirmBeforeClose
          onConfirmClose={() =>
            new Promise<boolean>((resolve) => {
              modal.confirm({
                title: 'Discard changes?',
                content:
                  'You have unsaved changes. Are you sure you want to close?',
                onOk: () => resolve(true),
                onCancel: () => resolve(false),
              });
            })
          }
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              This modal uses <strong>confirmBeforeClose</strong>. Try clicking
              the X or Cancel button — a confirmation dialog will appear before
              the modal actually closes.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>
    );
  },
};

// Sticky title story
export const StickyTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `stickyTitle` feature. The modal header stays fixed at the top as you scroll through long content in the body.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal with Sticky Title
        </BAIButton>
        <BAIModal
          title="Sticky Header Modal"
          open={open}
          stickyTitle
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          styles={{
            body: {
              maxHeight: '300px',
              overflowY: 'auto',
            },
          }}
        >
          <LongModalContent />
        </BAIModal>
      </>
    );
  },
};

// Warning type story
export const WarningType: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `type="warning"` variant. The modal title is rendered in the warning color (orange/amber) to indicate a potentially dangerous or irreversible action.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <BAIButton onClick={() => setOpen(true)}>Open Warning Modal</BAIButton>
        <BAIModal
          title="Warning: Irreversible Action"
          type="warning"
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          okText="Proceed"
          okButtonProps={{ danger: true }}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              This action cannot be undone. The <strong>warning</strong> type
              highlights the title in an amber color to draw the user&apos;s
              attention to potentially risky operations.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>
    );
  },
};

// Error type story
export const ErrorType: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `type="error"` variant. The modal title is rendered in the error color (red) to signal a destructive or critical action.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <BAIButton danger onClick={() => setOpen(true)}>
          Open Error Modal
        </BAIButton>
        <BAIModal
          title="Error: Destructive Action"
          type="error"
          open={open}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
          okText="Delete"
          okButtonProps={{ danger: true }}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              This will permanently delete the selected resource. The{' '}
              <strong>error</strong> type highlights the title in red to
              indicate a destructive operation.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>
    );
  },
};

// All type variants in one story
export const TypeVariants: Story = {
  name: 'All Type Variants',
  parameters: {
    docs: {
      description: {
        story:
          'Shows all available `type` variants side by side for comparison.',
      },
    },
  },
  render: () => {
    const [openNormal, setOpenNormal] = useState(false);
    const [openWarning, setOpenWarning] = useState(false);
    const [openError, setOpenError] = useState(false);

    return (
      <BAIFlex gap="md" wrap="wrap">
        <BAIButton type="primary" onClick={() => setOpenNormal(true)}>
          Normal
        </BAIButton>
        <BAIButton onClick={() => setOpenWarning(true)}>Warning</BAIButton>
        <BAIButton danger onClick={() => setOpenError(true)}>
          Error
        </BAIButton>

        <BAIModal
          title="Normal Modal Title"
          type="normal"
          open={openNormal}
          onOk={() => setOpenNormal(false)}
          onCancel={() => setOpenNormal(false)}
        >
          <BAIText>Normal type — default title color.</BAIText>
        </BAIModal>

        <BAIModal
          title="Warning Modal Title"
          type="warning"
          open={openWarning}
          onOk={() => setOpenWarning(false)}
          onCancel={() => setOpenWarning(false)}
        >
          <BAIText>Warning type — title in amber/orange color.</BAIText>
        </BAIModal>

        <BAIModal
          title="Error Modal Title"
          type="error"
          open={openError}
          onOk={() => setOpenError(false)}
          onCancel={() => setOpenError(false)}
        >
          <BAIText>Error type — title in red color.</BAIText>
        </BAIModal>
      </BAIFlex>
    );
  },
};
