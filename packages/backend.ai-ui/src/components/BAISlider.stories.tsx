import BAISlider from './BAISlider';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAISlider is ui-common's `Slider` under its BAI name: a value or a range on
 * a track.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAISlider> = {
  title: 'Input/BAISlider',
  component: BAISlider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAISlider',
          'Slider',
          `<Form.Item name="temperature" label="Temperature">
  <BAISlider min={0} max={2} step={0.1} />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISlider>;

const stories = formControlStories(
  { label: 'Temperature', initialValue: 0.7 },
  () => <BAISlider min={0} max={2} step={0.1} />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
