import BAIBoard, { type BAIBoardItem, type BAIBoardProps } from './BAIBoard';
import BAIBoardItemTitle from './BAIBoardItemTitle';
import BAIFlex from './BAIFlex';
import { Text } from '@lablup/ui-common/Text';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAIBoard is the dashboard grid: ui-common `Board` behind the `movable` /
 * `resizable` / `bordered` names and the `onItemsChange({ detail })` shape the
 * Backend.AI dashboards use.
 */
const meta: Meta<typeof BAIBoard> = {
  title: 'Board/BAIBoard',
  component: BAIBoard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'BAIBoard renders dashboard panels on a grid the user can rearrange. Each item draws its `data.content`; the board is controlled, so what `onItemsChange` reports is passed back as `items`.',
      },
    },
  },
  argTypes: {
    movable: {
      description: 'Renders a drag handle at the top-left of each item',
      control: { type: 'boolean' },
    },
    resizable: {
      description: 'Renders a resize handle at the bottom-right of each item',
      control: { type: 'boolean' },
    },
    bordered: {
      description: 'Draws a border on each item',
      control: { type: 'boolean' },
    },
    items: { control: false },
    onItemsChange: { control: false },
    renderItem: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof BAIBoard>;

const panel = (title: string, body: string) => (
  <BAIFlex
    direction="column"
    align="stretch"
    style={{ paddingInline: 'var(--spacing-8)', height: '100%' }}
  >
    <BAIBoardItemTitle title={title} />
    <Text>{body}</Text>
  </BAIFlex>
);

const sampleItems: Array<BAIBoardItem> = [
  {
    id: 'sessions',
    rowSpan: 2,
    columnSpan: 2,
    definition: { minRowSpan: 2, minColumnSpan: 2 },
    data: { content: panel('My Sessions', '12 running, 3 pending') },
  },
  {
    id: 'resources',
    rowSpan: 2,
    columnSpan: 2,
    definition: { minRowSpan: 2, minColumnSpan: 2 },
    data: { content: panel('My Resources', 'CPU 4 / 16, Memory 8 / 64 GiB') },
  },
  {
    id: 'recent',
    rowSpan: 3,
    columnSpan: 4,
    definition: { minRowSpan: 2, minColumnSpan: 2 },
    data: {
      content: panel('Recently Created Sessions', 'A table of sessions'),
    },
  },
];

const ControlledBoard = (args: Partial<BAIBoardProps>) => {
  const [items, setItems] = useState<Array<BAIBoardItem>>(sampleItems);
  return (
    <BAIBoard
      {...args}
      items={items}
      onItemsChange={(event) => setItems([...event.detail.items])}
    />
  );
};

export const Default: Story = {
  name: 'Basic',
  render: (args) => <ControlledBoard {...args} />,
  args: {
    movable: true,
    resizable: true,
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'A movable, resizable, bordered board, as the dashboards render it. Drag the handle at the top-left of an item, or focus it and use the arrow keys, then Enter.',
      },
    },
  },
};

export const ReadOnly: Story = {
  name: 'ReadOnly',
  render: (args) => <ControlledBoard {...args} />,
  args: {
    movable: false,
    resizable: false,
    bordered: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'No handles: the layout is fixed.',
      },
    },
  },
};

export const Plain: Story = {
  render: (args) => <ControlledBoard {...args} />,
  args: {
    movable: true,
    resizable: false,
    bordered: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Without `bordered`, items render on a surface with no border, as the start page does.',
      },
    },
  },
};
