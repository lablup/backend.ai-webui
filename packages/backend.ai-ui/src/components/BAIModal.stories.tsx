import BAIButton from './BAIButton';
import BAIFlex from './BAIFlex';
import BAIModal from './BAIModal';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
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
