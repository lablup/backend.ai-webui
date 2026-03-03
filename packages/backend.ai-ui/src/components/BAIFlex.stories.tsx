import BAIFlex, { BAIFlexProps } from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIFlex is a flexible layout component for arranging items in rows or columns.
 *
 * Key features:
 * - Simplified flexbox API with intuitive prop names
 * - Token-based gap system (xxs, xs, sm, ms, md, lg, xl, xxl)
 * - Array gap support for separate horizontal/vertical spacing
 * - Forwarded ref support
 *
 * @see BAIFlex.tsx for implementation details
 */
const meta: Meta<typeof BAIFlex> = {
  title: 'Flex/BAIFlex',
  component: BAIFlex,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIFlex** is a flexible layout component that simplifies flexbox layouts with an intuitive API.

## Features
- Simplified flexbox properties with short, intuitive names
- Token-based gap system for consistent spacing
- Array gap support for separate horizontal and vertical spacing
- Full TypeScript support with proper types
- Forwarded ref for DOM access

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`direction\` | \`'row' \\| 'row-reverse' \\| 'column' \\| 'column-reverse'\` | \`'row'\` | Flex direction |
| \`wrap\` | \`'nowrap' \\| 'wrap' \\| 'wrap-reverse'\` | \`'nowrap'\` | Flex wrap behavior |
| \`justify\` | \`'start' \\| 'end' \\| 'center' \\| 'between' \\| 'around'\` | \`'start'\` | Justify content |
| \`align\` | \`'start' \\| 'end' \\| 'center' \\| 'baseline' \\| 'stretch'\` | \`'center'\` | Align items |
| \`gap\` | \`number \\| GapSize \\| [GapSize, GapSize]\` | \`0\` | Gap between items (supports tokens and arrays) |

## Gap Sizes
Token-based gap sizes map to theme tokens:
- \`'xxs'\` - Extra extra small
- \`'xs'\` - Extra small
- \`'sm'\` - Small
- \`'ms'\` - Medium small
- \`'md'\` - Medium
- \`'lg'\` - Large
- \`'xl'\` - Extra large
- \`'xxl'\` - Extra extra large

Array format: \`[horizontal, vertical]\` - e.g., \`[16, 8]\` or \`['md', 'sm']\`
        `,
      },
    },
  },
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['row', 'row-reverse', 'column', 'column-reverse'],
      description: 'Flex direction for arranging items',
      table: {
        type: {
          summary: "'row' | 'row-reverse' | 'column' | 'column-reverse'",
        },
        defaultValue: { summary: 'row' },
      },
    },
    wrap: {
      control: { type: 'select' },
      options: ['nowrap', 'wrap', 'wrap-reverse'],
      description: 'Whether items should wrap to new lines',
      table: {
        type: { summary: "'nowrap' | 'wrap' | 'wrap-reverse'" },
        defaultValue: { summary: 'nowrap' },
      },
    },
    justify: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'between', 'around'],
      description: 'How items are justified along the main axis',
      table: {
        type: { summary: "'start' | 'end' | 'center' | 'between' | 'around'" },
        defaultValue: { summary: 'start' },
      },
    },
    align: {
      control: { type: 'select' },
      options: ['start', 'end', 'center', 'baseline', 'stretch'],
      description: 'How items are aligned along the cross axis',
      table: {
        type: {
          summary: "'start' | 'end' | 'center' | 'baseline' | 'stretch'",
        },
        defaultValue: { summary: 'center' },
      },
    },
    gap: {
      control: { type: 'number' },
      description:
        'Gap between items. Supports numbers (px), token strings ("xs", "md", "lg"), or arrays for [horizontal, vertical] spacing',
      table: {
        type: {
          summary:
            "number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl' | [GapSize, GapSize]",
        },
        defaultValue: { summary: '0' },
      },
    },
    children: {
      control: false,
      description: 'The items to arrange in the flex container',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    style: {
      control: false,
      description: 'Additional CSS styles for the container',
      table: {
        type: { summary: 'CSSProperties' },
      },
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
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story: 'Basic horizontal flex layout with default settings.',
      },
    },
  },
  render: renderWithItems,
  args: {
    direction: 'row',
    justify: 'start',
    align: 'center',
    gap: 0,
  },
};

export const Column: Story = {
  name: 'ColumnDirection',
  parameters: {
    docs: {
      description: {
        story: 'Vertical flex layout with column direction and gap spacing.',
      },
    },
  },
  render: renderWithItems,
  args: {
    direction: 'column',
    gap: 8,
  },
};

export const JustifyCenter: Story = {
  name: 'CenterJustified',
  parameters: {
    docs: {
      description: {
        story: 'Items centered along the main axis with gap spacing.',
      },
    },
  },
  render: renderWithItems,
  args: {
    justify: 'center',
    gap: 16,
    style: { width: 400, border: '1px dashed #ccc', padding: '16px' },
  },
};

export const SpaceBetween: Story = {
  name: 'SpaceBetween',
  parameters: {
    docs: {
      description: {
        story: 'Items distributed with equal space between them.',
      },
    },
  },
  render: renderWithItems,
  args: {
    justify: 'between',
    style: { width: 400, border: '1px dashed #ccc', padding: '16px' },
  },
};

export const WithWrap: Story = {
  name: 'WrappingItems',
  parameters: {
    docs: {
      description: {
        story: 'Items wrap to multiple lines when container width is exceeded.',
      },
    },
  },
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
  name: 'TokenGaps',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates token-based gap sizes (xs, md, xl) for consistent spacing across the design system.',
      },
    },
  },
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
  name: 'ArrayGap',
  parameters: {
    docs: {
      description: {
        story:
          'Array gap format allows different horizontal and vertical spacing: [horizontal, vertical].',
      },
    },
  },
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
  name: 'StretchAlignment',
  parameters: {
    docs: {
      description: {
        story: 'Items stretched to fill the cross axis (container height).',
      },
    },
  },
  render: renderWithItems,
  args: {
    align: 'stretch',
    direction: 'row',
    gap: 8,
    style: { height: 120, border: '1px dashed #ccc', padding: '16px' },
  },
};
