import BAIFlex from './BAIFlex';
import BAIMultiSelector from './BAIMultiSelector';
import { formControlStories } from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const sampleOptions = [
  { value: 'interactive', label: 'Interactive' },
  { value: 'batch', label: 'Batch' },
  { value: 'inference', label: 'Inference' },
];

/**
 * BAIMultiSelector is ui-common's `MultiSelector` under its BAI name, with
 * `showSelectedOptionsTooltip` on by default.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIMultiSelector> = {
  title: 'Select/BAIMultiSelector',
  component: BAIMultiSelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIMultiSelector** is ui-common's \`MultiSelector\` under its BAI name (ADR 0014): several choices from a static option list, named in the trigger.

## Features
- Form.Item-aware: value, onChange, disabled, validation status and the accessible name come from the item
- Fills the Form.Item row by default
- \`showSelectedOptionsTooltip\` defaults to \`true\`: the trigger names three labels, then "+N", and its tooltip lists every selected label
- Import from \`backend.ai-ui\`; ESLint blocks \`MultiSelector\` from the ui-common subpath in \`react/\`

## Usage
\`\`\`tsx
<Form.Item name="sessionTypes" label="Allowed session types">
  <BAIMultiSelector options={sessionTypeOptions} />
</Form.Item>
\`\`\`

## Props
ui-common's \`MultiSelectorProps\`, with \`showSelectedOptionsTooltip\` defaulting to \`true\`. Run \`ui-common component MultiSelector\` for the full list.
`,
      },
    },
  },
  args: { options: sampleOptions },
};

export default meta;
type Story = StoryObj<typeof BAIMultiSelector>;

const stories = formControlStories(
  { label: 'Allowed session types', initialValue: ['interactive', 'batch'] },
  () => <BAIMultiSelector options={sampleOptions} />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;

const manyOptions = [
  ...sampleOptions,
  { value: 'system', label: 'System' },
  { value: 'training', label: 'Training' },
];

export const SelectionTooltip: Story = {
  name: 'SelectionTooltip',
  parameters: {
    docs: {
      description: {
        story:
          'Hover or focus the trigger: the tooltip lists every selected label, including the ones "+N" hides. `showSelectedOptionsTooltip={false}` turns it off.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIMultiSelector
        aria-label="With tooltip"
        width={300}
        options={manyOptions}
        defaultValue={manyOptions.map((option) => option.value)}
      />
      <BAIMultiSelector
        aria-label="Without tooltip"
        width={300}
        showSelectedOptionsTooltip={false}
        options={manyOptions}
        defaultValue={manyOptions.map((option) => option.value)}
      />
    </BAIFlex>
  ),
};
