import BAITextArea from './BAITextArea';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITextArea is ui-common's multi-line `TextArea` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAITextArea> = {
  title: 'Input/BAITextArea',
  component: BAITextArea,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAITextArea',
          'TextArea',
          `<Form.Item name="description" label="Description">
  <BAITextArea rows={3} />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAITextArea>;

const stories = formControlStories(
  { label: 'Description', initialValue: 'A shared folder for training data.' },
  () => <BAITextArea rows={3} />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
