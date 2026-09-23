import BAITokenList from './BAITokenList';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITokenList renders a list of values, showing the first `maxInline` items
 * inline and collapsing the rest into a `+N` overflow indicator.
 *
 * @see BAITokenList.tsx — the `variant` and `trigger` prop JSDoc documents when
 * to reach for each variant.
 */
const meta: Meta<typeof BAITokenList> = {
  title: 'Token/BAITokenList',
  component: BAITokenList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Shows up to `maxInline` items inline and collapses the rest into a `+N` overflow indicator, whose popup lists only the hidden items. The overflow opens on hover in both variants; `variant="token"` (default) shows a `+N` link for modals, `variant="text"` a compact `+N` badge for table cells. Pass `trigger="click"` for a popover that latches open.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['token', 'text'],
    },
    trigger: {
      control: { type: 'radio' },
      options: ['click', 'hover'],
    },
    maxInline: {
      control: { type: 'number', min: 0 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAITokenList>;

export const Default: Story = {
  args: {
    items: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'],
  },
};

export const TextVariant: Story = {
  name: 'Text variant (table cell)',
  args: {
    variant: 'text',
    maxInline: 1,
    items: ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.4'],
  },
};

export const TextVariantNumbers: Story = {
  name: 'Text variant (numbers)',
  args: {
    variant: 'text',
    maxInline: 1,
    items: [1000, 1001, 1002, 1003],
  },
};

export const TextVariantClickTrigger: Story = {
  name: 'Text variant (click popover)',
  args: {
    variant: 'text',
    maxInline: 1,
    trigger: 'click',
    items: ['10.0.0.1', '10.0.0.2', '10.0.0.3', '10.0.0.4'],
  },
};

export const SingleItem: Story = {
  name: 'Single item (no +N)',
  args: {
    variant: 'text',
    maxInline: 1,
    items: ['10.0.0.1'],
  },
};

export const Empty: Story = {
  name: 'Empty (placeholder)',
  args: {
    items: [],
  },
};
