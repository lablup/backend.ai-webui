import BAIButton from './BAIButton';
import BAIFlex from './BAIFlex';
import BAIModal from './BAIModal';
import type { WindowState } from './BAIModal';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { App } from 'antd';
import { useState } from 'react';

/**
 * BAIModal extends Ant Design's Modal with dragging, confirm-before-close,
 * sticky headers, type variants, and window management controls.
 *
 * Key features:
 * - Draggable modal header
 * - Confirm before close with async support
 * - Sticky title for scrollable content
 * - Warning/error type variants
 * - Window controls: minimize, maximize, fullscreen
 *
 * @see BAIModal.tsx for implementation details
 */
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
| \`windowActions\` | \`Array<'minimize' \\| 'maximize' \\| 'fullscreen'>\` | - | Control which window actions are available. When provided (non-empty), window controls are rendered in the header. |
| \`onWindowStateChange\` | \`(state: WindowState) => void\` | - | Callback when modal window state changes |
| \`minimizedPlacement\` | \`'bottomRight' \\| 'bottomLeft' \\| 'topRight' \\| 'topLeft'\` | \`'bottomRight'\` | Placement of the minimized modal bar |

## Additional Features
- **Fixed z-index**: Uses \`DEFAULT_BAI_MODAL_Z_INDEX = 1001\`
- **Centered by default**: \`centered\` defaults to \`true\`
- **Consistent styling**: Standard header, body, footer styles with dividers
- **Window controls**: Minimize (compact bar), maximize (viewport with margin), fullscreen (full viewport)
- **Scroll unlock when minimized**: Page scroll lock is overridden when modal is minimized, allowing full page interaction
- **Minimized hover effect**: The header area of the minimized bar shows a background-color hover transition
- **Keyboard accessible minimized bar**: Press Enter or Space on the minimized bar to restore the modal

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
    windowActions: {
      control: false,
      description:
        'Control which window actions are available. When provided (non-empty), window controls are rendered in the header.',
      table: {
        type: {
          summary: "Array<'minimize' | 'maximize' | 'fullscreen'>",
        },
      },
    },
    onWindowStateChange: {
      action: 'windowStateChanged',
      description: 'Callback when modal window state changes.',
      table: {
        type: {
          summary:
            "(state: 'default' | 'minimized' | 'maximized' | 'fullscreen') => void",
        },
      },
    },
    minimizedPlacement: {
      control: { type: 'select' },
      options: ['bottomRight', 'bottomLeft', 'topRight', 'topLeft'],
      description:
        'Placement of the minimized modal bar. Similar to Ant Design notification placement.',
      table: {
        type: {
          summary: "'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'",
        },
        defaultValue: { summary: 'bottomRight' },
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
          'Demonstrates the draggable feature. Hover over the drag handle icon in the modal header to activate dragging. The modal can be moved around the viewport while staying within bounds.',
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
              Hover over the drag handle icon to the left of the title, then
              drag this modal around!
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
          <BAIText>Normal type -- default title color.</BAIText>
        </BAIModal>

        <BAIModal
          title="Warning Modal Title"
          type="warning"
          open={openWarning}
          onOk={() => setOpenWarning(false)}
          onCancel={() => setOpenWarning(false)}
        >
          <BAIText>Warning type -- title in amber/orange color.</BAIText>
        </BAIModal>

        <BAIModal
          title="Error Modal Title"
          type="error"
          open={openError}
          onOk={() => setOpenError(false)}
          onCancel={() => setOpenError(false)}
        >
          <BAIText>Error type -- title in red color.</BAIText>
        </BAIModal>
      </BAIFlex>
    );
  },
};

// Window controls story - all controls enabled
export const WindowControls: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `windowActions` feature with all actions enabled. The modal header shows minimize, maximize, and fullscreen buttons. Click each button to toggle the corresponding state; clicking the same button again returns to the default state.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);
    const [currentState, setCurrentState] = useState<WindowState>('default');

    return (
      <BAIFlex direction="column" gap="md" align="start">
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal with Window Controls
        </BAIButton>
        <BAIText>
          Current state: <strong>{currentState}</strong>
        </BAIText>
        <BAIModal
          title="Window Controls Modal"
          open={open}
          windowActions={['minimize', 'maximize', 'fullscreen']}
          onWindowStateChange={setCurrentState}
          onOk={() => setOpen(false)}
          onCancel={() => {
            setOpen(false);
            setCurrentState('default');
          }}
          footer={
            <BAIFlex justify="end" gap="sm">
              <BAIButton
                onClick={() => {
                  setOpen(false);
                  setCurrentState('default');
                }}
              >
                Cancel
              </BAIButton>
              <BAIButton
                type="primary"
                onClick={() => {
                  setOpen(false);
                  setCurrentState('default');
                }}
              >
                OK
              </BAIButton>
            </BAIFlex>
          }
        >
          <LongModalContent />
        </BAIModal>
      </BAIFlex>
    );
  },
};

// Minimized state story
export const MinimizedState: Story = {
  parameters: {
    docs: {
      description: {
        story: `Demonstrates the minimize/restore flow. Click the minimize button (minus icon) in the header to collapse the modal to a compact bar at the corner of the viewport.

**Behaviors when minimized:**
- The modal backdrop mask is removed so the page is visible
- Page scrolling and interactions are unlocked (scroll lock override applied)
- The minimized bar header shows a **hover effect** (background-color transition on \`.ant-modal-header\`)
- Click anywhere on the minimized bar to restore the modal
- Press **Enter** or **Space** while the bar is focused to restore via keyboard`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Minimizable Modal
        </BAIButton>
        <BAIModal
          title="Minimizable Modal"
          open={open}
          windowActions={['minimize']}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>minus icon</strong> in the modal header to
              minimize this modal. It will collapse to a compact bar showing
              only the title at the bottom of the viewport.
            </BAIText>
            <BAIText>
              Click the minus icon again on the minimized bar to restore the
              modal to its default size.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>
    );
  },
};

// Maximized state story
export const MaximizedState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the maximize/restore flow. Click the maximize button (border icon) to expand the modal to fill the viewport with a 24px margin on each side. Click the button again (now showing overlapping squares) to restore.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Maximizable Modal
        </BAIButton>
        <BAIModal
          title="Maximizable Modal"
          open={open}
          windowActions={['maximize']}
          draggable
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>border icon</strong> in the modal header to
              maximize this modal. It will expand to fill the viewport with a
              24px margin.
            </BAIText>
            <BAIText>
              Note: Dragging is automatically disabled when the modal is
              maximized and re-enabled when restored.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>
    );
  },
};

// Fullscreen state story
export const FullscreenState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the fullscreen/exit flow. Click the fullscreen button to expand the modal to fill the entire viewport with no margin and no border-radius. Click the exit fullscreen button to restore.',
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Fullscreen Modal
        </BAIButton>
        <BAIModal
          title="Fullscreen Modal"
          open={open}
          windowActions={['fullscreen']}
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>fullscreen icon</strong> in the modal header to
              expand this modal to fill the entire viewport (100vw x 100vh) with
              no margin and no border-radius.
            </BAIText>
            <BAIText>
              Click the exit fullscreen icon to restore the modal to its default
              size.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </>
    );
  },
};

// Minimized placement story
export const MinimizedPlacement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `minimizedPlacement` prop. Each modal minimizes to a different corner of the viewport. Default placement is `bottomRight`.',
      },
    },
  },
  render: () => {
    const [openBR, setOpenBR] = useState(false);
    const [openBL, setOpenBL] = useState(false);
    const [openTR, setOpenTR] = useState(false);
    const [openTL, setOpenTL] = useState(false);

    return (
      <BAIFlex gap="md" wrap="wrap">
        <BAIButton type="primary" onClick={() => setOpenBR(true)}>
          Bottom Right (default)
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenBL(true)}>
          Bottom Left
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenTR(true)}>
          Top Right
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenTL(true)}>
          Top Left
        </BAIButton>

        <BAIModal
          title="Bottom Right"
          open={openBR}
          windowActions={['minimize']}
          minimizedPlacement="bottomRight"
          onOk={() => setOpenBR(false)}
          onCancel={() => setOpenBR(false)}
        >
          <BAIText>
            Minimizes to <strong>bottom-right</strong> corner (default).
          </BAIText>
        </BAIModal>

        <BAIModal
          title="Bottom Left"
          open={openBL}
          windowActions={['minimize']}
          minimizedPlacement="bottomLeft"
          onOk={() => setOpenBL(false)}
          onCancel={() => setOpenBL(false)}
        >
          <BAIText>
            Minimizes to <strong>bottom-left</strong> corner.
          </BAIText>
        </BAIModal>

        <BAIModal
          title="Top Right"
          open={openTR}
          windowActions={['minimize']}
          minimizedPlacement="topRight"
          onOk={() => setOpenTR(false)}
          onCancel={() => setOpenTR(false)}
        >
          <BAIText>
            Minimizes to <strong>top-right</strong> corner.
          </BAIText>
        </BAIModal>

        <BAIModal
          title="Top Left"
          open={openTL}
          windowActions={['minimize']}
          minimizedPlacement="topLeft"
          onOk={() => setOpenTL(false)}
          onCancel={() => setOpenTL(false)}
        >
          <BAIText>
            Minimizes to <strong>top-left</strong> corner.
          </BAIText>
        </BAIModal>
      </BAIFlex>
    );
  },
};

// Scroll behavior when minimized story
export const ScrollBehaviorWhenMinimized: Story = {
  name: 'Scroll Unlock When Minimized',
  parameters: {
    docs: {
      description: {
        story: `Demonstrates that page scroll and interaction are fully unlocked when the modal is minimized.

When a modal is open, Ant Design / rc-component locks page scrolling (injects \`html body { overflow-y: hidden }\`).
BAIModal overrides this with a higher-specificity rule when minimized, so users can scroll the page content
behind the minimized bar without closing the modal.

Additionally:
- The minimized modal wrapper has \`pointer-events: none\`, so all clicks pass through to the page
- Only the minimized bar itself has \`pointer-events: auto\` so it remains clickable
- The minimized bar header shows a **hover effect** (background-color transition) when hovered
- Pressing **Enter** or **Space** on the minimized bar restores the modal (keyboard accessible)`,
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <BAIFlex direction="column" gap="md" style={{ position: 'relative' }}>
        <BAIButton type="primary" onClick={() => setOpen(true)}>
          Open Modal Then Minimize
        </BAIButton>
        <BAIText type="secondary">
          After minimizing the modal, you can scroll this content and interact
          with the buttons below — the page is fully unlocked.
        </BAIText>
        {Array.from({ length: 10 }, (_, i) => (
          <BAIFlex key={i} gap="sm" align="center">
            <BAIText>
              Scrollable page content row {i + 1} — interactive while modal is
              minimized
            </BAIText>
            <BAIButton size="small">Click me</BAIButton>
          </BAIFlex>
        ))}
        <BAIModal
          title="Scroll Unlock Demo"
          open={open}
          windowActions={['minimize']}
          minimizedPlacement="bottomRight"
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          <BAIFlex direction="column" gap="md">
            <BAIText>
              Click the <strong>minus icon</strong> to minimize this modal. The
              page behind will become scrollable and interactive.
            </BAIText>
            <BAIText type="secondary">
              The minimized bar shows a <strong>hover effect</strong> on the
              header area. Press <strong>Enter</strong> or{' '}
              <strong>Space</strong> on the bar to restore via keyboard.
            </BAIText>
          </BAIFlex>
        </BAIModal>
      </BAIFlex>
    );
  },
};

// Selective window actions story
export const SelectiveWindowActions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `windowActions` prop for selectively enabling specific window controls. Each modal shows a different combination of window action buttons.',
      },
    },
  },
  render: () => {
    const [openMinMax, setOpenMinMax] = useState(false);
    const [openMaxFull, setOpenMaxFull] = useState(false);
    const [openMinOnly, setOpenMinOnly] = useState(false);

    return (
      <BAIFlex gap="md" wrap="wrap">
        <BAIButton type="primary" onClick={() => setOpenMinMax(true)}>
          Minimize + Maximize
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenMaxFull(true)}>
          Maximize + Fullscreen
        </BAIButton>
        <BAIButton type="primary" onClick={() => setOpenMinOnly(true)}>
          Minimize Only
        </BAIButton>

        <BAIModal
          title="Minimize + Maximize"
          open={openMinMax}
          windowActions={['minimize', 'maximize']}
          onOk={() => setOpenMinMax(false)}
          onCancel={() => setOpenMinMax(false)}
        >
          <BAIText>
            This modal has only <strong>minimize</strong> and{' '}
            <strong>maximize</strong> buttons. No fullscreen option.
          </BAIText>
        </BAIModal>

        <BAIModal
          title="Maximize + Fullscreen"
          open={openMaxFull}
          windowActions={['maximize', 'fullscreen']}
          onOk={() => setOpenMaxFull(false)}
          onCancel={() => setOpenMaxFull(false)}
        >
          <BAIText>
            This modal has only <strong>maximize</strong> and{' '}
            <strong>fullscreen</strong> buttons. No minimize option.
          </BAIText>
        </BAIModal>

        <BAIModal
          title="Minimize Only"
          open={openMinOnly}
          windowActions={['minimize']}
          onOk={() => setOpenMinOnly(false)}
          onCancel={() => setOpenMinOnly(false)}
        >
          <BAIText>
            This modal has only the <strong>minimize</strong> button.
          </BAIText>
        </BAIModal>
      </BAIFlex>
    );
  },
};
