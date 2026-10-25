import BAIFileInput from './BAIFileInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIFileInput is ui-common's `FileInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIFileInput> = {
  title: 'Input/BAIFileInput',
  component: BAIFileInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIFileInput',
          'FileInput',
          `<Form.Item name="csv" label="User list (CSV)">
  <BAIFileInput accept=".csv" />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIFileInput>;

const stories = formControlStories({ label: 'User list (CSV)' }, () => (
  <BAIFileInput accept=".csv" />
));

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
