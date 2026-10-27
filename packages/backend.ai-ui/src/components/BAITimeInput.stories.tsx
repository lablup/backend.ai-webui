import BAITimeInput from './BAITimeInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITimeInput is ui-common's `TimeInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAITimeInput> = {
  title: 'Input/BAITimeInput',
  component: BAITimeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAITimeInput',
          'TimeInput',
          `<Form.Item name="backupAt" label="Backup at">
  <BAITimeInput />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAITimeInput>;

const stories = formControlStories(
  { label: 'Backup at', initialValue: '03:00' },
  () => <BAITimeInput />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
