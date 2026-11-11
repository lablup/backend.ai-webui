import BAIDateInput from './BAIDateInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIDateInput is ui-common's `DateInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIDateInput> = {
  title: 'Input/BAIDateInput',
  component: BAIDateInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIDateInput',
          'DateInput',
          `<Form.Item name="expiresOn" label="Expires on">
  <BAIDateInput />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDateInput>;

const stories = formControlStories(
  { label: 'Expires on', initialValue: '2026-12-31' },
  () => <BAIDateInput />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
