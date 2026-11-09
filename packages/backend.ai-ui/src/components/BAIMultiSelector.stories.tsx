import BAIMultiSelector from './BAIMultiSelector';
import { formControlStories } from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const sampleOptions = [
  { value: 'interactive', label: 'Interactive' },
  { value: 'batch', label: 'Batch' },
  { value: 'inference', label: 'Inference' },
];

/**
 * BAIMultiSelector wraps ui-common's `MultiSelector` with a tooltip that names
 * every selection when the closed trigger cannot.
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
**BAIMultiSelector** is ui-common's \`MultiSelector\` promoted to a BUI component (ADR 0014): the same props, plus a tooltip that lists every selected option when the closed trigger shows "+N", "N selected" or cuts the text off. None while disabled or open, or when \`renderTrigger\` (or \`formatValue\` on a \`labels\` trigger) draws the text.

## Usage
\`\`\`tsx
<Form.Item name="sessionTypes" label="Allowed session types">
  <BAIMultiSelector options={sessionTypeOptions} />
</Form.Item>
\`\`\`
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
