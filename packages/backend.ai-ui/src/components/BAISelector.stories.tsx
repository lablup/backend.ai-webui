import BAISelector from './BAISelector';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const sampleOptions = [
  { value: 'fifo', label: 'FIFO' },
  { value: 'lifo', label: 'LIFO' },
  { value: 'drf', label: 'DRF' },
];

/**
 * BAISelector is ui-common's `Selector` under its BAI name: a single choice
 * from a static option list, opening below the trigger.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAISelector> = {
  title: 'Select/BAISelector',
  component: BAISelector,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAISelector',
          'Selector',
          `<Form.Item name="scheduler" label="Scheduler">
  <BAISelector options={[{ value: 'fifo', label: 'FIFO' }]} />
</Form.Item>`,
        ),
      },
    },
  },
  args: { options: sampleOptions },
};

export default meta;
type Story = StoryObj<typeof BAISelector>;

const stories = formControlStories(
  { label: 'Scheduler', initialValue: 'fifo' },
  () => <BAISelector options={sampleOptions} />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
