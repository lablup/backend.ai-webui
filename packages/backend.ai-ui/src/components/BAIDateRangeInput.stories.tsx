import BAIDateRangeInput from './BAIDateRangeInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIDateRangeInput is ui-common's `DateRangeInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIDateRangeInput> = {
  title: 'Input/BAIDateRangeInput',
  component: BAIDateRangeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIDateRangeInput',
          'DateRangeInput',
          `<Form.Item name="period" label="Period">
  <BAIDateRangeInput />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDateRangeInput>;

const stories = formControlStories({ label: 'Period' }, () => (
  <BAIDateRangeInput />
));

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
