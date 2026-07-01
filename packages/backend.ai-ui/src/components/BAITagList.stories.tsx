import BAITagList from './BAITagList';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITagList renders a list of values, showing the first `maxInline` items
 * inline and collapsing the rest into a `+N` overflow indicator.
 *
 * Two variants:
 * - `chip` (default): inline antd `Tag` chips; the `+N` opens a click
 *   `Popover` listing the remaining items with a copy-all action. Suited for
 *   interactive contexts such as modals.
 * - `text`: inline plain (nowrap) text; the `+N` is a compact `Tag` whose
 *   hover tooltip lists all items. Suited for dense table cells (mirrors antd
 *   Select `maxTagCount` overflow).
 *
 * @see BAITagList.tsx for implementation details
 */
const meta: Meta<typeof BAITagList> = {
  title: 'Tag/BAITagList',
  component: BAITagList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Shows up to `maxInline` items inline and collapses the rest into a `+N` overflow indicator. Use `variant="chip"` (default) for an interactive copy-all popover, or `variant="text"` for a lightweight hover-tooltip overflow in table cells.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'radio' },
      options: ['chip', 'text'],
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

type Story = StoryObj<typeof BAITagList>;

export const Default: Story = {
  args: {
    items: ['alpha', 'beta', 'gamma', 'delta', 'epsilon'],
    popoverTitle: 'Items',
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
    popoverTitle: 'Allowed IPs',
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
