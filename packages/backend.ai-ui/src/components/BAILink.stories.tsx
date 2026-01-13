import BAIFlex from './BAIFlex';
import BAILink from './BAILink';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const meta: Meta<typeof BAILink> = {
  title: 'Components/BAILink',
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
- Ellipsis with tooltip support

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
      description: 'Enable text ellipsis with optional tooltip',
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
        story:
          'Long text can be truncated with ellipsis. Add `tooltip` property to show full text on hover.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs" style={{ width: '200px' }}>
        <strong>Ellipsis without tooltip</strong>
        <BAILink ellipsis>
          This is a very long link text that will be truncated with ellipsis
        </BAILink>
      </BAIFlex>
      <BAIFlex direction="column" gap="xs" style={{ width: '200px' }}>
        <strong>Ellipsis with tooltip</strong>
        <BAILink
          ellipsis={{
            tooltip:
              'This is a very long link text that will be truncated with ellipsis',
          }}
        >
          This is a very long link text that will be truncated with ellipsis
        </BAILink>
      </BAIFlex>
    </BAIFlex>
  ),
};
