import BAIFlex from './BAIFlex';
import BAISelect from './BAISelect';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

/**
 * BAISelect is ui-common `Selector` under the BAI name (ADR 0042): a single
 * value from a list the client already holds.
 *
 * Key features:
 * - Search on by default, with the translated search placeholder
 * - An accessible name from the placeholder when neither `aria-label` nor the
 *   enclosing Form.Item label names it
 * - `ghost` for the header's brand band, `autoSelectOption` for a first-option default
 *
 * @see BAISelect.tsx for implementation details
 */
const meta: Meta<typeof BAISelect> = {
  title: 'Select/BAISelect',
  component: BAISelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISelect** is ui-common \`Selector\` under the BAI name: its props are \`SelectorProps\` (run \`ui-common component Selector\` for the full list) plus \`ghost\` and \`autoSelectOption\`. A multi-value list uses **BAIMultiSelector**.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghost\` | \`boolean\` | \`false\` | The on-dark treatment for a select on the header's brand band |
| \`autoSelectOption\` | \`boolean\` | \`false\` | While no value is set, select the first option and report it through \`onChange\` |

## Selector props used most
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`SelectorOptionType[]\` | **required** | \`{ value, label }\` options, \`{ type: 'section', title, options }\` sections, \`{ type: 'divider' }\` |
| \`value\` / \`onChange\` | \`string \\| null\` / \`(value: string \\| null) => void\` | - | The selected option value |
| \`hasSearch\` | \`boolean\` | \`true\` | The search field in the listbox (on by default here) |
| \`hasClear\` | \`boolean\` | \`false\` | A clear button while something is selected |
| \`isLoading\` | \`boolean\` | \`false\` | The pending state of the trigger |
| \`width\` | \`number \\| string\` | - | The trigger width |
| \`showTooltipOnEllipsis\` | \`boolean\` | \`false\` | A tooltip with the full label while the trigger cuts it off |

## Usage
\`\`\`tsx
<BAISelect
  options={[{ value: 'a', label: 'Option A' }]}
  placeholder="Select an option"
  width={200}
  onChange={(value) => setValue(value)}
/>
\`\`\`
        `,
      },
    },
  },
  argTypes: {
    ghost: {
      control: { type: 'boolean' },
      description:
        "The on-dark treatment for a select on the header's brand band",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoSelectOption: {
      control: false,
      description:
        'While no value is set, select the first option and report it through onChange. Needs a controlled value, so it is shown in the AutoSelectOption story',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    options: {
      control: false,
      description: 'Options, sections and dividers of the listbox',
      table: {
        type: { summary: 'SelectorOptionType[]' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description:
        'Trigger text while nothing is selected; also the accessible name when nothing else gives one',
      table: {
        type: { summary: 'string' },
      },
    },
    hasSearch: {
      control: { type: 'boolean' },
      description: 'The search field in the listbox',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    hasClear: {
      control: { type: 'boolean' },
      description: 'A clear button while something is selected',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'The pending state of the trigger',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: { type: 'radio' },
      options: ['sm', 'md', 'lg'],
      description: 'The trigger size',
      table: {
        type: { summary: "'sm' | 'md' | 'lg'" },
        defaultValue: { summary: 'md' },
      },
    },
    status: {
      control: { type: 'select' },
      options: ['', 'error', 'warning'],
      description: 'The border state; inside a Form.Item it follows validation',
      table: {
        type: { summary: "'error' | 'warning' | ''" },
      },
    },
    width: {
      control: { type: 'number' },
      description: 'The trigger width',
      table: {
        type: { summary: 'number | string' },
      },
    },
    showTooltipOnEllipsis: {
      control: { type: 'boolean' },
      description:
        'A tooltip with the full selected label while the trigger cuts it off',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onChange: {
      action: 'changed',
      description: 'Called with the selected option value, or null on clear',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISelect>;

const sampleOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 'option4' },
];

const sampleLongLabelOptions = [
  {
    label: 'gpu-cluster-a100-80gb-high-memory-seoul',
    value: 'gpu-a100-seoul',
  },
  { label: 'cpu-only', value: 'cpu-only' },
];

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'A single select with four options. Search is on by default; use the controls to try the other props.',
      },
    },
  },
  args: {
    options: sampleOptions,
    placeholder: 'Select an option',
    width: 200,
    ghost: false,
  },
};

export const GhostStyle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`ghost` next to the default treatment on a brand-coloured band, as in the app header's project select.",
      },
    },
  },
  render: () => (
    <BAIFlex
      direction="column"
      gap="md"
      style={{ padding: 24, background: '#1890ff' }}
    >
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{ color: 'white' }}>Ghost Style (Transparent)</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Select option"
          ghost={true}
          width={200}
        />
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{ color: 'white' }}>Normal Style</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Select option"
          ghost={false}
          width={200}
        />
      </BAIFlex>
    </BAIFlex>
  ),
};

export const AutoSelectOption: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `autoSelectOption`, the first option is reported through `onChange` while no value is set; without it the select stays empty.',
      },
    },
  },
  render: () => {
    const [value1, setValue1] = useState<string | null>(null);
    const [value2, setValue2] = useState<string | null>(null);

    return (
      <BAIFlex direction="column" gap="md">
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select enabled (first option selected)</BAIText>
          <BAISelect
            options={sampleOptions}
            placeholder="Auto-selects first option"
            autoSelectOption={true}
            value={value1}
            onChange={setValue1}
            width={250}
          />
          <BAIText type="secondary">Selected: {value1 || 'None'}</BAIText>
        </BAIFlex>
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select disabled</BAIText>
          <BAISelect
            options={sampleOptions}
            placeholder="Select manually"
            autoSelectOption={false}
            value={value2}
            onChange={setValue2}
            width={250}
          />
          <BAIText type="secondary">Selected: {value2 || 'None'}</BAIText>
        </BAIFlex>
      </BAIFlex>
    );
  },
};

export const TooltipOnEllipsis: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A long selected label in a narrow trigger. With `showTooltipOnEllipsis`, hovering or focusing the trigger shows the full label; without it the label is only cut off.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAISelect
        aria-label="With tooltip"
        showTooltipOnEllipsis
        options={sampleLongLabelOptions}
        defaultValue="gpu-a100-seoul"
        width={160}
      />
      <BAISelect
        aria-label="Without tooltip"
        options={sampleLongLabelOptions}
        defaultValue="gpu-a100-seoul"
        width={160}
      />
    </BAIFlex>
  ),
};

export const DisabledOptionReason: Story = {
  name: 'Disabled Option With Reason',
  parameters: {
    docs: {
      description: {
        story:
          'An option disabled with `{ reason }` cannot be picked, and hovering its row shows why.',
      },
    },
  },
  args: {
    options: [
      { label: 'AK1A2B3C4D', value: 'ak1' },
      {
        label: 'AK9Z8Y7X6W',
        value: 'ak2',
        disabled: { reason: 'This keypair is inactive.' },
      },
      { label: 'AK5E6F7G8H', value: 'ak3' },
    ],
    placeholder: 'Select an access key',
    width: 280,
  },
};
