import BAIFlex from './BAIFlex';
import BAILink from './BAILink';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const meta: Meta<typeof BAILink> = {
  title: 'Link/BAILink',
  component: BAILink,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAILink** is a hybrid link component that integrates React Router and Ant Design Typography.Link.

## Features
- Uses React Router \`Link\` when \`to\` prop is provided
- Falls back to Ant Design \`Typography.Link\` when \`to\` is not provided
- Custom hover and disabled states
- Ellipsis with tooltip support via \`BAIText\` (CSS-based, no layout-loop risk)

## Ellipsis Behavior
When \`ellipsis\` is provided, the content is wrapped by \`BAIText\` internally:
- \`ellipsis={true}\` — CSS truncation + tooltip showing full text on overflow
- \`ellipsis={{ tooltip: 'custom' }}\` — CSS truncation + custom tooltip text

This avoids antd's JS-based \`EllipsisMeasure\` component, which can cause infinite
render loops when nested inside flex containers with \`ResizeObserver\`.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`type\` | \`'hover' \\| 'disabled'\` | - | Link style variant (hover effect or disabled state) |
| \`ellipsis\` | \`boolean \\| { tooltip?: string }\` | - | Enable text ellipsis with optional tooltip |
| \`to\` | \`To\` | - | React Router path (optional, triggers Router Link mode) |

For other props, refer to [React Router Link](https://reactrouter.com/en/main/components/link) and [Ant Design Typography](https://ant.design/components/typography).
        `,
      },
    },
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: [undefined, 'hover', 'disabled'],
      description: 'Link style variant',
      table: {
        type: { summary: "'hover' | 'disabled' | undefined" },
      },
    },
    to: {
      control: { type: 'object' },
      description: 'React Router path (optional)',
      table: {
        type: { summary: 'To' },
      },
    },
    ellipsis: {
      control: false,
      description:
        'Enable text ellipsis with optional tooltip. Internally uses BAIText for CSS-based truncation.',
      table: {
        type: { summary: 'boolean | { tooltip?: string }' },
      },
    },
    children: {
      control: { type: 'text' },
      description: 'Link content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Story />} />
          <Route path="/example" element={<div>Example Page</div>} />
        </Routes>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BAILink>;

export const Default: Story = {
  args: {
    to: { pathname: '/example' },
    children: 'Navigate to Example',
  },
};

export const TypeVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'BAILink supports `hover` and `disabled` type variants for different visual states.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <strong>Default (no type)</strong>
        <BAILink to="/example">Standard link</BAILink>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <strong>Type: hover</strong>
        <BAILink to="/example" type="hover">
          Link with hover underline effect
        </BAILink>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <strong>Type: disabled</strong>
        <BAILink type="disabled">Disabled link (not clickable)</BAILink>
      </BAIFlex>
    </BAIFlex>
  ),
};

export const WithEllipsis: Story = {
  parameters: {
    docs: {
      description: {
        story: `Long text is truncated via CSS ellipsis (no layout-loop risk).
\`ellipsis={true}\` shows the full text as a tooltip on overflow.
Hover over the truncated links below to see the tooltip.`,
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <strong>ellipsis (boolean) — tooltip on overflow</strong>
        <div style={{ width: 200 }}>
          <BAILink ellipsis>
            This is a very long link text that will be truncated with ellipsis
          </BAILink>
        </div>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <strong>ellipsis with custom tooltip</strong>
        <div style={{ width: 200 }}>
          <BAILink ellipsis={{ tooltip: 'Full text shown here as tooltip' }}>
            This is a very long link text that will be truncated with ellipsis
          </BAILink>
        </div>
      </BAIFlex>
    </BAIFlex>
  ),
};

export const EllipsisInsideBAIText: Story = {
  parameters: {
    docs: {
      description: {
        story: `\`BAILink ellipsis\` nested inside \`BAIText ellipsis\` — as used in \`BAINameActionCell\`.

Both components are CSS-based and do not conflict. The outer \`BAIText\`'s overflow check
(\`scrollWidth > clientWidth\` on its span) returns false because the inner \`BAIText\`
constrains itself to \`maxWidth: 100%\` of the outer span — so the outer span sees no overflow.
Only the inner \`BAIText\`'s \`ResizeObserver\` detects overflow and shows the tooltip.

Result: a single tooltip with the plain text content (not a React element). Hover to confirm.`,
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs" style={{ width: 240 }}>
        <strong>Overflow (truncated) — single tooltip</strong>
        <BAIText ellipsis={{ tooltip: true }}>
          <BAILink type="hover" ellipsis>
            very-long-revision-name-abc123def456ghi789
          </BAILink>
        </BAIText>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" style={{ width: 240 }}>
        <strong>No overflow (short text)</strong>
        <BAIText ellipsis={{ tooltip: true }}>
          <BAILink type="hover" ellipsis>
            rev-001
          </BAILink>
        </BAIText>
      </BAIFlex>
    </BAIFlex>
  ),
};

export const EllipsisInsideBAITextTooltipDiff: Story = {
  parameters: {
    docs: {
      description: {
        story: `Tooltip content difference: \`BAILink\` with vs. without \`ellipsis\` inside \`BAIText ellipsis\`.

- **With \`ellipsis\` on \`BAILink\`**: inner \`BAIText\` handles overflow; tooltip title = plain text string (clean).
- **Without \`ellipsis\` on \`BAILink\`**: outer \`BAIText\` handles overflow; tooltip title = \`BAILink\` ReactNode (renders with link styling inside the tooltip popup).

Both show a single tooltip — the difference is only in what the tooltip renders as its title.`,
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs" style={{ width: 240 }}>
        <strong>BAILink with ellipsis — tooltip is plain text</strong>
        <BAIText ellipsis={{ tooltip: true }}>
          <BAILink type="hover" ellipsis>
            very-long-revision-name-abc123def456ghi789
          </BAILink>
        </BAIText>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" style={{ width: 240 }}>
        <strong>BAILink without ellipsis — tooltip is ReactNode (link)</strong>
        <BAIText ellipsis={{ tooltip: true }}>
          <BAILink type="hover">
            very-long-revision-name-abc123def456ghi789
          </BAILink>
        </BAIText>
      </BAIFlex>
    </BAIFlex>
  ),
};

export const EllipsisTrueBehavior: Story = {
  parameters: {
    docs: {
      description: {
        story: `\`ellipsis={true}\` now normalizes to \`{ tooltip: true }\` internally.

Previously (before this fix), \`ellipsis={true}\` delegated to antd's \`Typography.Link\`
which used JS-based \`EllipsisMeasure\` — no tooltip, and caused infinite render loops
when nested inside a \`ResizeObserver\`-powered container.

Now it uses CSS-based truncation via \`BAIText\` and shows a tooltip on overflow.
Hover over the truncated link below to confirm.`,
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="xs">
      <strong>ellipsis={'{true}'} — tooltip appears on overflow</strong>
      <div style={{ width: 240 }}>
        <BAILink ellipsis>
          This is a very long link text that will be truncated with ellipsis and
          show a tooltip
        </BAILink>
      </div>
    </BAIFlex>
  ),
};
