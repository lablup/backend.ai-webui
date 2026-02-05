import BAIFlex from './BAIFlex';
import BAIRowWrapWithDividers from './BAIRowWrapWithDividers';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card, Tag, Button, Typography } from 'antd';

/**
 * BAIRowWrapWithDividers creates a flexible wrapping layout with automatic vertical dividers.
 *
 * Key features:
 * - Wraps items like flexbox with intelligent divider placement
 * - Vertical dividers only between items on the same row
 * - Responsive to screen size changes
 * - Customizable gaps and divider styling
 *
 * @see BAIRowWrapWithDividers.tsx for implementation details
 */
const meta: Meta<typeof BAIRowWrapWithDividers> = {
  title: 'Row/BAIRowWrapWithDividers',
  component: BAIRowWrapWithDividers,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIRowWrapWithDividers** is a custom layout component that creates a flexible row with automatic vertical dividers.

## Features
- Wraps items like flexbox while maintaining vertical dividers only between items on the same row
- Automatically recalculates divider positions on resize and layout changes
- Customizable gaps between rows and columns
- Customizable divider styling (width, color, inset)
- No layout impact from dividers (overlay positioning)

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`ReactNode\` | - | Items to display with dividers |
| \`wrap\` | \`boolean\` | \`true\` | Whether to wrap items to new rows |
| \`rowGap\` | \`number \\| string\` | \`token.marginXL\` | Gap between rows |
| \`columnGap\` | \`number \\| string\` | \`token.marginXXL\` | Gap between columns |
| \`dividerWidth\` | \`number\` | \`1\` | Width of vertical dividers in pixels |
| \`dividerColor\` | \`string\` | \`token.colorBorderSecondary\` | Color of vertical dividers |
| \`dividerInset\` | \`number\` | \`0\` | Top/bottom inset of vertical dividers (shortens divider line) |
| \`itemStyle\` | \`CSSProperties\` | - | CSS styles applied to each item wrapper |
| \`style\` | \`CSSProperties\` | - | CSS styles applied to the container |
| \`className\` | \`string\` | - | CSS class name for the container |
        `,
      },
    },
  },
  argTypes: {
    children: {
      control: false,
      description: 'Items to display with dividers between them',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    wrap: {
      control: { type: 'boolean' },
      description: 'Whether to wrap items to new rows',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    rowGap: {
      control: { type: 'number' },
      description: 'Gap between rows (uses token.marginXL by default)',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: 'token.marginXL' },
      },
    },
    columnGap: {
      control: { type: 'number' },
      description: 'Gap between columns (uses token.marginXXL by default)',
      table: {
        type: { summary: 'number | string' },
        defaultValue: { summary: 'token.marginXXL' },
      },
    },
    dividerWidth: {
      control: { type: 'number' },
      description: 'Width of the vertical dividers in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1' },
      },
    },
    dividerColor: {
      control: { type: 'color' },
      description: 'Color of the vertical dividers',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'token.colorBorderSecondary' },
      },
    },
    dividerInset: {
      control: { type: 'number' },
      description:
        'Top/bottom inset of vertical dividers in pixels (shortens the divider line without affecting container padding)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '0' },
      },
    },
    itemStyle: {
      control: false,
      description: 'CSS styles applied to each item wrapper',
      table: {
        type: { summary: 'CSSProperties' },
      },
    },
    style: {
      control: false,
      description: 'CSS styles applied to the container',
      table: {
        type: { summary: 'CSSProperties' },
      },
    },
    className: {
      control: { type: 'text' },
      description: 'CSS class name for the container',
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIRowWrapWithDividers>;

const SampleItem = ({
  children,
  color = '#f0f0f0',
}: {
  children: React.ReactNode;
  color?: string;
}) => (
  <div
    style={{
      padding: '12px 16px',
      backgroundColor: color,
      borderRadius: 4,
      minWidth: '120px',
      textAlign: 'center',
    }}
  >
    {children}
  </div>
);

export const Default: Story = {
  name: 'Basic',
  args: {
    children: [
      <SampleItem key="1">Item 1</SampleItem>,
      <SampleItem key="2">Item 2</SampleItem>,
      <SampleItem key="3">Item 3</SampleItem>,
      <SampleItem key="4">Item 4</SampleItem>,
    ],
    columnGap: 16,
    rowGap: 12,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with default dividers between items on the same row.',
      },
    },
  },
};

export const ManyItems: Story = {
  name: 'ManyItems',
  render: () => (
    <BAIRowWrapWithDividers columnGap={20} rowGap={16}>
      {Array.from({ length: 12 }, (_, i) => (
        <SampleItem key={i} color={`hsl(${i * 30}, 70%, 90%)`}>
          Item {i + 1}
        </SampleItem>
      ))}
    </BAIRowWrapWithDividers>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Multiple items that wrap to different rows with automatic divider placement.',
      },
    },
  },
};

export const WithTags: Story = {
  name: 'TagsLayout',
  render: () => (
    <BAIRowWrapWithDividers columnGap={16} rowGap={8}>
      <Tag color="blue">React</Tag>
      <Tag color="green">TypeScript</Tag>
      <Tag color="orange">Storybook</Tag>
      <Tag color="red">Ant Design</Tag>
      <Tag color="purple">Frontend</Tag>
      <Tag color="cyan">UI Components</Tag>
      <Tag color="geekblue">Responsive</Tag>
      <Tag color="magenta">Layout</Tag>
    </BAIRowWrapWithDividers>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using with Ant Design tags for a clean separated layout.',
      },
    },
  },
};

export const CustomDivider: Story = {
  name: 'CustomDivider',
  args: {
    children: [
      <SampleItem key="1" color="#e6f7ff">
        Alpha
      </SampleItem>,
      <SampleItem key="2" color="#f6ffed">
        Beta
      </SampleItem>,
      <SampleItem key="3" color="#fff2e8">
        Gamma
      </SampleItem>,
      <SampleItem key="4" color="#fef0f0">
        Delta
      </SampleItem>,
    ],
    columnGap: 24,
    rowGap: 16,
    dividerWidth: 2,
    dividerColor: '#1890ff',
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom divider styling with increased width and blue color.',
      },
    },
  },
};

export const WithInset: Story = {
  name: 'DividerInset',
  args: {
    children: [
      <Card key="1" size="small" style={{ width: 150 }}>
        <Typography.Text strong>Card 1</Typography.Text>
        <br />
        <Typography.Text type="secondary">Content here</Typography.Text>
      </Card>,
      <Card key="2" size="small" style={{ width: 150 }}>
        <Typography.Text strong>Card 2</Typography.Text>
        <br />
        <Typography.Text type="secondary">More content</Typography.Text>
      </Card>,
      <Card key="3" size="small" style={{ width: 150 }}>
        <Typography.Text strong>Card 3</Typography.Text>
        <br />
        <Typography.Text type="secondary">Even more</Typography.Text>
      </Card>,
    ],
    columnGap: 16,
    rowGap: 12,
    dividerInset: 8,
    dividerWidth: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Dividers with inset (shorter height) to avoid touching the top and bottom edges.',
      },
    },
  },
};

export const ButtonGroup: Story = {
  name: 'ButtonGroup',
  render: () => (
    <BAIRowWrapWithDividers columnGap={12} rowGap={8}>
      <Button>Save</Button>
      <Button>Cancel</Button>
      <Button type="primary">Submit</Button>
      <Button danger>Delete</Button>
      <Button type="dashed">Draft</Button>
      <Button type="link">View Details</Button>
    </BAIRowWrapWithDividers>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Button group with automatic dividers between buttons on the same row.',
      },
    },
  },
};

export const NoWrap: Story = {
  name: 'NoWrap',
  args: {
    children: [
      <SampleItem key="1">Fixed</SampleItem>,
      <SampleItem key="2">Single</SampleItem>,
      <SampleItem key="3">Row</SampleItem>,
      <SampleItem key="4">Layout</SampleItem>,
    ],
    columnGap: 16,
    wrap: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Disabled wrapping keeps all items on a single row with dividers between all items.',
      },
    },
  },
};

export const LargeGaps: Story = {
  name: 'LargeGaps',
  args: {
    children: [
      <SampleItem key="1" color="#fff1f0">
        Spaced
      </SampleItem>,
      <SampleItem key="2" color="#f0f9ff">
        Out
      </SampleItem>,
      <SampleItem key="3" color="#f0fff0">
        Items
      </SampleItem>,
      <SampleItem key="4" color="#fffbf0">
        Here
      </SampleItem>,
    ],
    columnGap: 40,
    rowGap: 24,
    dividerWidth: 1,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Large gaps between items with proportionally positioned dividers.',
      },
    },
  },
};

export const MixedContent: Story = {
  name: 'MixedContent',
  render: () => (
    <BAIRowWrapWithDividers columnGap={20} rowGap={16}>
      <Tag color="processing">Status: Active</Tag>
      <Button size="small" type="primary">
        Edit
      </Button>
      <BAIFlex gap="xs">
        <Typography.Text strong>Score:</Typography.Text>
        <Typography.Text>95/100</Typography.Text>
      </BAIFlex>
      <Button size="small">View Details</Button>
      <Tag color="success">Verified</Tag>
      <Typography.Text type="secondary">
        Last updated: 2 hours ago
      </Typography.Text>
    </BAIRowWrapWithDividers>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Mixed content types with different sizes, demonstrating flexible layout capabilities.',
      },
    },
  },
};
