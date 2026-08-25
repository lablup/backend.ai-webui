import BAIComplexSelect, {
  BAIComplexSelectOption,
  BAIComplexSelectValue,
} from './BAIComplexSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAIComplexSelect is the Astryx-based select foundation (to-astryx ticket
 * 26) built on Astryx's `ComplexSelector`. It is the popup-body layer the
 * ~18 Relay-backed `*Select` wrappers (`BAIUserSelect`,
 * `BAIAdminProjectSelect`, …) share — see `BAIUserSelect.stories.tsx`
 * for a Relay-connected example with infinite scroll.
 *
 * Value contract is deliberately identical to antd `labelInValue`:
 * `{ label: string; value: string }` (or an array in `multiple` mode), so
 * `Form.Item`/`BAIFormItem` keep working without `getValueProps`/`normalize`.
 */
const meta: Meta<typeof BAIComplexSelect> = {
  title: 'Select/BAIComplexSelect',
  component: BAIComplexSelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIComplexSelect** re-implements the popup body of Astryx's \`ComplexSelector\` (search input, listbox, keyboard/ARIA, scroll container, footer) so infinite-scroll/server-search selects can be built on it.

## Dropped vs antd \`Select\` (ticket 26 PILOT-DECISIONs — simplicity policy)
- **Virtualization is deferred.** One DOM row per loaded option; bounded by the pagination window (10–20 rows).
- **\`label\` is a plain string**, not a ReactNode. Rich per-row content goes in \`description\`/\`extra\`.
- **Trigger chips (multiple mode) are display-only** — no per-chip remove button (\`ComplexSelector\` renders the trigger label inside its own \`<button>\`, so a removable chip would nest a button in a button). Deselect by clicking the option row again.
- No \`allowClear\`, controlled \`open\`, or imperative \`ref.focus()\`.

## Relay wiring
Server-paginated consumers pass \`endReached\` (-> Relay \`loadNext\`), \`isLoadingNext\`, \`total\`, and toggle \`onOpenChange\` to flip \`fetchPolicy\` between \`network-only\`/\`store-only\`. See \`BAIUserSelect\` for the full pattern.
        `,
      },
    },
  },
  argTypes: {
    value: { control: false },
    onChange: { control: false, action: 'changed' },
    options: { control: false },
    multiple: {
      control: { type: 'boolean' },
      description: 'Array-valued (labelInValue[]) selection',
    },
    hasSearch: {
      control: { type: 'boolean' },
      description: 'Show the search TextInput above the listbox',
    },
    isLoading: { control: { type: 'boolean' } },
    isDisabled: { control: { type: 'boolean' } },
    isRequired: { control: { type: 'boolean' } },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof BAIComplexSelect>;

const sampleOptions: Array<BAIComplexSelectOption> = [
  { value: 'alice', label: 'alice@example.com', description: 'Alice Kim' },
  { value: 'bob', label: 'bob@example.com', description: 'Bob Lee' },
  { value: 'carol', label: 'carol@example.com', description: 'Carol Park' },
  { value: 'dave', label: 'dave@example.com', description: 'Dave Choi' },
  { value: 'eve', label: 'eve@example.com', description: 'Eve Jung' },
  { value: 'frank', label: 'frank@example.com', description: 'Frank Han' },
];

export const Default: Story = {
  name: 'Single Select',
  parameters: {
    docs: {
      description: {
        story: 'Single-selection, labelInValue-shaped value.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState<BAIComplexSelectValue>(null);
    return (
      <BAIComplexSelect
        {...args}
        options={sampleOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: 'Owner',
    placeholder: 'Select an owner',
  },
};

export const Multiple: Story = {
  name: 'Multiple Select',
  parameters: {
    docs: {
      description: {
        story:
          'Array-valued selection. Trigger chips are display-only (P26-4) — deselect by clicking the option row again, not by an "x" on the chip.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState<BAIComplexSelectValue>([
      sampleOptions[0],
      sampleOptions[2],
    ]);
    return (
      <BAIComplexSelect
        {...args}
        options={sampleOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: 'Reviewers',
    multiple: true,
    placeholder: 'Select reviewers',
  },
};

export const WithPreselectedValue: Story = {
  name: 'Preselected Value',
  parameters: {
    docs: {
      description: {
        story: 'Renders with an initial single-selection value.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState<BAIComplexSelectValue>(sampleOptions[1]);
    return (
      <BAIComplexSelect
        {...args}
        options={sampleOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: 'Owner',
  },
};

export const Loading: Story = {
  name: 'Loading State',
  parameters: {
    docs: {
      description: {
        story: '`isLoading` shows a spinner on the trigger.',
      },
    },
  },
  args: {
    label: 'Owner',
    options: sampleOptions,
    isLoading: true,
  },
};

export const Empty: Story = {
  name: 'Empty Options',
  parameters: {
    docs: {
      description: {
        story: 'No options loaded — shows the shared "No results" text.',
      },
    },
  },
  args: {
    label: 'Owner',
    options: [],
  },
};

export const Disabled: Story = {
  args: {
    label: 'Owner',
    options: sampleOptions,
    value: sampleOptions[0],
    isDisabled: true,
  },
};
