import BAIQuestionIconWithTooltip from './BAIQuestionIconWithTooltip';
import BAISegmentedControl from './BAISegmentedControl';
import BAISegmentedControlItem from './BAISegmentedControlItem';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LayoutGridIcon, ListIcon } from 'lucide-react';
import { useState } from 'react';

/**
 * BAISegmentedControlItem is the option of `BAISegmentedControl`. It widens
 * `label` to a ReactNode and allows `isLabelHidden` only with a string label.
 *
 * Key features:
 * - Plain text, or a node label such as text plus a help tooltip
 * - Icon-only segments that keep a string accessible name
 * - Every other prop passes through to ui-common's `SegmentedControlItem`
 *
 * @see BAISegmentedControlItem.tsx
 */
const meta: Meta<typeof BAISegmentedControlItem> = {
  title: 'Input/BAISegmentedControlItem',
  component: BAISegmentedControlItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAISegmentedControlItem** is one segment of \`BAISegmentedControl\`.

## Features
- \`label\` accepts a ReactNode, rendered as the segment's content
- \`isLabelHidden\` hides a **string** label visually and keeps it as the accessible name (icon-only segments)
- Other props (\`value\`, \`icon\`, \`isDisabled\`, …) pass through unchanged

## Usage
\`\`\`tsx
<BAISegmentedControl aria-label="View" value={view} onChange={setView}>
  <BAISegmentedControlItem value="list" label="List" isLabelHidden icon={<ListIcon />} />
  <BAISegmentedControlItem value="grid" label="Grid" isLabelHidden icon={<LayoutGridIcon />} />
</BAISegmentedControl>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| label | \`ReactNode\` (\`string\` with \`isLabelHidden\`) | - | Segment content, or its accessible name when hidden |
| isLabelHidden | \`boolean\` | \`false\` | Hide a string label visually |
| value | \`string\` | - | The value the segment selects |
        `,
      },
    },
  },
  argTypes: {
    label: { control: false, description: 'Segment content.' },
    isLabelHidden: {
      control: false,
      description: 'Hides a string label visually.',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: { value: 'list', label: 'List' },
};

export default meta;
type Story = StoryObj<typeof BAISegmentedControlItem>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: { description: { story: 'Text segments.' } },
  },
  render: () => {
    const [value, setValue] = useState('single-node');
    return (
      <BAISegmentedControl
        aria-label="Cluster mode"
        value={value}
        onChange={setValue}
      >
        <BAISegmentedControlItem value="single-node" label="Single node" />
        <BAISegmentedControlItem value="multi-node" label="Multi node" />
      </BAISegmentedControl>
    );
  },
};

export const WithTooltipLabel: Story = {
  name: 'NodeLabel',
  parameters: {
    docs: {
      description: {
        story: 'A node label: text with a non-focusable help tooltip.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState('single-node');
    return (
      <BAISegmentedControl
        aria-label="Cluster mode"
        value={value}
        onChange={setValue}
      >
        <BAISegmentedControlItem
          value="single-node"
          label={
            <span>
              Single node{' '}
              <BAIQuestionIconWithTooltip
                title="All containers on one agent."
                focusable={false}
              />
            </span>
          }
        />
        <BAISegmentedControlItem value="multi-node" label="Multi node" />
      </BAISegmentedControl>
    );
  },
};

export const IconOnly: Story = {
  name: 'IconOnly',
  parameters: {
    docs: {
      description: {
        story:
          'Icon-only segments: `isLabelHidden` with a string label keeps the accessible name.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState('list');
    return (
      <BAISegmentedControl aria-label="View" value={value} onChange={setValue}>
        <BAISegmentedControlItem
          value="list"
          label="List"
          isLabelHidden
          icon={<ListIcon />}
        />
        <BAISegmentedControlItem
          value="grid"
          label="Grid"
          isLabelHidden
          icon={<LayoutGridIcon />}
        />
      </BAISegmentedControl>
    );
  },
};
