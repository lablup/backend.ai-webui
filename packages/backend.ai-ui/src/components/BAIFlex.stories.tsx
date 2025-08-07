import BAIFlex, { BAIFlexProps } from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIFlex> = {
  title: 'Layout/BAIFlex',
  component: BAIFlex,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
    },
    wrap: {
      control: { type: 'select' },
      options: ['nowrap', 'wrap', 'wrap-reverse'],
    },
    justify: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'between', 'around'],
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'baseline', 'stretch'],
    },
    gap: {
      control: { type: 'number' },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIFlex>;

const renderWithItems = ({ ...props }: BAIFlexProps) => (
  <BAIFlex {...props}>
    <div
      style={{
        padding: '8px',
        background: '#1890ff',
        color: 'white',
        borderRadius: '4px',
      }}
    >
      Item 1
    </div>
    <div
      style={{
        padding: '8px',
        background: '#52c41a',
        color: 'white',
        borderRadius: '4px',
      }}
    >
      Item 2
    </div>
    <div
      style={{
        padding: '8px',
        background: '#faad14',
        color: 'white',
        borderRadius: '4px',
      }}
    >
      Item 3
    </div>
    <div
      style={{
        padding: '8px',
        background: '#f5222d',
        color: 'white',
        borderRadius: '4px',
      }}
    >
      Item 4
    </div>
  </BAIFlex>
);

export const Default: Story = {
  name: 'Default Flex',
  render: renderWithItems,
  args: {
    direction: 'row',
    justify: 'start',
    align: 'center',
    gap: 0,
  },
};

export const Column: Story = {
  name: 'Column Direction',
  render: renderWithItems,
  args: {
    direction: 'column',
    gap: 8,
  },
};

export const JustifyCenter: Story = {
  render: renderWithItems,
  args: {
    justify: 'center',
    gap: 16,
    style: { width: 400, border: '1px dashed #ccc', padding: '16px' },
  },
};

export const SpaceBetween: Story = {
  render: renderWithItems,
  args: {
    justify: 'between',
    style: { width: 400, border: '1px dashed #ccc', padding: '16px' },
  },
};

export const WithWrap: Story = {
  render: ({ ...props }: BAIFlexProps) => (
    <BAIFlex {...props}>
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          style={{
            padding: '8px',
            background: '#1890ff',
            color: 'white',
            borderRadius: '4px',
            minWidth: '80px',
          }}
        >
          Item {i + 1}
        </div>
      ))}
    </BAIFlex>
  ),
  args: {
    wrap: 'wrap',
    gap: 8,
    style: { width: 300, border: '1px dashed #ccc', padding: '16px' },
  },
};

export const WithTokenGaps: Story = {
  name: 'Token-based Gaps',
  render: ({ ...props }: BAIFlexProps) => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h4>Small Gap (xs)</h4>
        <BAIFlex {...props} gap="xs">
          <div
            style={{
              padding: '8px',
              background: '#1890ff',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 1
          </div>
          <div
            style={{
              padding: '8px',
              background: '#52c41a',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 2
          </div>
          <div
            style={{
              padding: '8px',
              background: '#faad14',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 3
          </div>
        </BAIFlex>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <h4>Medium Gap (md)</h4>
        <BAIFlex {...props} gap="md">
          <div
            style={{
              padding: '8px',
              background: '#1890ff',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 1
          </div>
          <div
            style={{
              padding: '8px',
              background: '#52c41a',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 2
          </div>
          <div
            style={{
              padding: '8px',
              background: '#faad14',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 3
          </div>
        </BAIFlex>
      </div>
      <div>
        <h4>Large Gap (xl)</h4>
        <BAIFlex {...props} gap="xl">
          <div
            style={{
              padding: '8px',
              background: '#1890ff',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 1
          </div>
          <div
            style={{
              padding: '8px',
              background: '#52c41a',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 2
          </div>
          <div
            style={{
              padding: '8px',
              background: '#faad14',
              color: 'white',
              borderRadius: '4px',
            }}
          >
            Item 3
          </div>
        </BAIFlex>
      </div>
    </div>
  ),
  args: {
    direction: 'row',
  },
};

export const ArrayGap: Story = {
  name: 'Array Gap (Horizontal, Vertical)',
  render: ({ ...props }: BAIFlexProps) => (
    <BAIFlex {...props}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          style={{
            padding: '8px',
            background: '#722ed1',
            color: 'white',
            borderRadius: '4px',
            minWidth: '60px',
          }}
        >
          Item {i + 1}
        </div>
      ))}
    </BAIFlex>
  ),
  args: {
    wrap: 'wrap',
    gap: [16, 8],
    style: { width: 200, border: '1px dashed #ccc', padding: '16px' },
  },
};

export const AlignStretch: Story = {
  render: renderWithItems,
  args: {
    align: 'stretch',
    direction: 'row',
    gap: 8,
    style: { height: 120, border: '1px dashed #ccc', padding: '16px' },
  },
};
