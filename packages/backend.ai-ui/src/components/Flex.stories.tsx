import Flex, { FlexProps } from './Flex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Flex> = {
  title: 'Layout/Flex',
  component: Flex,
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof Flex>;

const renderWithItems = ({ ...props }: FlexProps) => (
  <Flex {...props}>
    <button type="button">button1</button>
    <button type="button">button2</button>
    <button type="button">button3</button>
    <button type="button">button4</button>
  </Flex>
);

export const Default: Story = {
  name: 'Default',
  render: renderWithItems,
};

export const WithBorder: Story = {
  name: 'With Border',
  render: renderWithItems,
  args: {
    style: {
      border: '1px solid #000',
      width: 300,
      height: 100,
    },
  },
};
