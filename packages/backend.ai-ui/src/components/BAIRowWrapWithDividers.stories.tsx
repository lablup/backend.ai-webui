import BAIButton from './BAIButton';
import BAICard from './BAICard';
import BAIFlex from './BAIFlex';
import BAIRowWrapWithDividers from './BAIRowWrapWithDividers';
import BAITag from './BAITag';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';

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
      <BAITag color="blue">React</BAITag>
      <BAITag color="green">TypeScript</BAITag>
      <BAITag color="orange">Storybook</BAITag>
      {/* This entry predates the astryx migration and named the library the
          tag itself is demonstrating a rename target of; keep the tag but
          drop the now-inapplicable "Ant Design" label. */}
      <BAITag color="red">UI Library</BAITag>
      <BAITag color="purple">Frontend</BAITag>
      <BAITag color="cyan">UI Components</BAITag>
      {/* geekblue/magenta have no direct Astryx Badge hue; BAITag's shared
          astryxTagVariant lookup already folds them into blue/pink. */}
      <BAITag color="geekblue">Responsive</BAITag>
      <BAITag color="magenta">Layout</BAITag>
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
      <BAICard
        key="1"
        size="small"
        style={{ width: 150 }}
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIText strong>Card 1</BAIText>
        <br />
        <BAIText type="secondary">Content here</BAIText>
      </BAICard>,
      <BAICard
        key="2"
        size="small"
        style={{ width: 150 }}
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIText strong>Card 2</BAIText>
        <br />
        <BAIText type="secondary">More content</BAIText>
      </BAICard>,
      <BAICard
        key="3"
        size="small"
        style={{ width: 150 }}
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIText strong>Card 3</BAIText>
        <br />
        <BAIText type="secondary">Even more</BAIText>
      </BAICard>,
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
      <BAIButton>Save</BAIButton>
      <BAIButton>Cancel</BAIButton>
      <BAIButton type="primary">Submit</BAIButton>
      <BAIButton danger>Delete</BAIButton>
      <BAIButton type="dashed">Draft</BAIButton>
      <BAIButton type="link">View Details</BAIButton>
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
      <BAITag color="processing">Status: Active</BAITag>
      <BAIButton size="small" type="primary">
        Edit
      </BAIButton>
      <BAIFlex gap="xs">
        <BAIText strong>Score:</BAIText>
        <BAIText>95/100</BAIText>
      </BAIFlex>
      <BAIButton size="small">View Details</BAIButton>
      <BAITag color="success">Verified</BAITag>
      <BAIText type="secondary">Last updated: 2 hours ago</BAIText>
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
