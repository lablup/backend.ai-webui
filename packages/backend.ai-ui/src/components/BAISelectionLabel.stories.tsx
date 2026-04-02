'use memo';

import BAISelectionLabel from './BAISelectionLabel';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

const meta: Meta<typeof BAISelectionLabel> = {
  title: 'DataDisplay/BAISelectionLabel',
  component: BAISelectionLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAISelectionLabel** displays the number of selected items with an optional clear-all button.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`count\` | \`number\` | — | Number of selected items. Renders nothing when \`count <= 0\`. |
| \`onClearSelection\` | \`() => void\` | — | Callback when the clear icon is clicked. Icon is hidden when omitted. |
        `,
      },
    },
  },
  argTypes: {
    count: {
      control: { type: 'number', min: 0, max: 100 },
      description: 'Number of selected items. Renders nothing when 0.',
      table: {
        type: { summary: 'number' },
      },
    },
    onClearSelection: {
      description:
        'Callback fired when the clear icon is clicked. Icon is hidden when omitted.',
      table: {
        type: { summary: '() => void' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISelectionLabel>;

export const Default: Story = {
  name: 'Basic',
  args: {
    count: 3,
    onClearSelection: action('onClearSelection'),
  },
};

export const WithoutClearButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `onClearSelection` is not provided, the clear icon is hidden.',
      },
    },
  },
  args: {
    count: 5,
  },
};

export const Comparison: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Side-by-side comparison: with and without the clear button, and different counts.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <BAISelectionLabel count={1} onClearSelection={action('clear-1')} />
      <BAISelectionLabel count={10} onClearSelection={action('clear-10')} />
      <BAISelectionLabel count={99} onClearSelection={action('clear-99')} />
      <BAISelectionLabel count={5} />
      <BAISelectionLabel count={0} onClearSelection={action('clear-0')} />
    </div>
  ),
};
