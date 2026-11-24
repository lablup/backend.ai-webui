import BAIMultiSelector from './BAIMultiSelector';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const sampleOptions = [
  { value: 'interactive', label: 'Interactive' },
  { value: 'batch', label: 'Batch' },
  { value: 'inference', label: 'Inference' },
];

/**
 * BAIMultiSelector is ui-common's `MultiSelector` under its BAI name: several
 * choices from a static option list, named in the trigger.
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
        component: formControlDocsDescription(
          'BAIMultiSelector',
          'MultiSelector',
          `<Form.Item name="sessionTypes" label="Allowed session types">
  <BAIMultiSelector options={sessionTypeOptions} />
</Form.Item>`,
        ),
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
