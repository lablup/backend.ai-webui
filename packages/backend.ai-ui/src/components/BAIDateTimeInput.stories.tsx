import BAIDateTimeInput from './BAIDateTimeInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIDateTimeInput is ui-common's `DateTimeInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIDateTimeInput> = {
  title: 'Input/BAIDateTimeInput',
  component: BAIDateTimeInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIDateTimeInput',
          'DateTimeInput',
          `<Form.Item name="startAt" label="Start at">
  <BAIDateTimeInput />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDateTimeInput>;

const stories = formControlStories(
  { label: 'Start at', initialValue: '2026-12-31T09:00' },
  () => <BAIDateTimeInput />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
