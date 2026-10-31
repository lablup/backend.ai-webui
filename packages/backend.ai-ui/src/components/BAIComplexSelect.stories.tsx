import BAIComplexSelect, {
  BAIComplexSelectOption,
  BAIComplexSelectValue,
} from './BAIComplexSelect';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAIComplexSelect is the BUI adapter over ui-common `PagedSelector`, shared
 * by the Relay-backed `*Select` wrappers (`BAIUserSelect`,
 * `BAIAdminProjectSelect`, …) — see `BAIUserSelect.stories.tsx` for a
 * Relay-connected example with infinite scroll.
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
**BAIComplexSelect** is the BUI adapter over ui-common's \`PagedSelector\` (search box, listbox, keyboard/ARIA, scroll container, footer). It keeps the antd-shaped props the Relay wrappers use and a \`labelInValue\` value (\`{ label, value }\`, an array in \`multiple\` mode).

- One DOM row per loaded option; the pagination window (10–20 rows) keeps that bounded.
- \`label\` is a plain string. Rich per-row content goes in \`labelContent\`/\`description\`/\`extra\`.
- Trigger chips (multiple mode, \`triggerDisplay="badges"\`) are display-only. Deselect by clicking the option row again.

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
      description: 'Show the search box above the listbox',
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

const noMount = { reason: "You don't have permission to mount this folder." };

export const DisabledOptionReason: Story = {
  name: 'Disabled Option With Reason',
  parameters: {
    docs: {
      description: {
        story:
          '`disabled: { reason }` dims the option and puts a glyph at its end whose tooltip says why; a bare `true` disables it silently.',
      },
    },
  },
  render: (args) => {
    const [value, setValue] = useState<BAIComplexSelectValue>([]);
    return (
      <BAIComplexSelect
        {...args}
        multiple
        selectionMark="checkbox"
        options={[
          {
            value: 'datasets',
            label: 'datasets',
            description: 'general · local:volume1',
          },
          {
            value: 'shared-models',
            label: 'shared-models',
            description: 'model · local:volume1',
            disabled: noMount,
          },
          {
            value: 'notebooks',
            label: 'notebooks',
            description: 'general · local:volume2',
          },
          {
            value: 'team-logs',
            label: 'team-logs',
            description: 'general · local:volume2',
            disabled: noMount,
          },
          {
            value: 'checkpoints',
            label: 'checkpoints',
            description: 'general · local:volume1',
            disabled: noMount,
          },
          {
            value: 'archive',
            label: 'archive',
            description: 'general · local:volume2',
            disabled: true,
          },
        ]}
        value={value}
        onChange={setValue}
      />
    );
  },
  args: {
    label: 'Folders',
    placeholder: 'Select Folder',
    width: 360,
  },
};
