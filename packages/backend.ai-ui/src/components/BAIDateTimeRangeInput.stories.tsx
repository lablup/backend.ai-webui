import BAIDateTimeRangeInput from './BAIDateTimeRangeInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIDateTimeRangeInput is ui-common's `DateTimeRangeInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIDateTimeRangeInput> = {
  title: 'Input/BAIDateTimeRangeInput',
  component: BAIDateTimeRangeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIDateTimeRangeInput',
          'DateTimeRangeInput',
          `<Form.Item name="period" label="Period">
  <BAIDateTimeRangeInput />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDateTimeRangeInput>;

const stories = formControlStories({ label: 'Period' }, () => (
  <BAIDateTimeRangeInput />
));

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
