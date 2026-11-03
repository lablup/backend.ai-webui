import BAITextInput from './BAITextInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITextInput is ui-common's single-line `TextInput` under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAITextInput> = {
  title: 'Input/BAITextInput',
  component: BAITextInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAITextInput',
          'TextInput',
          `<Form.Item name="name" label="Name" rules={[{ required: true }]}>
  <BAITextInput placeholder="Enter a name" />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAITextInput>;

const stories = formControlStories(
  { label: 'Session name', initialValue: 'my-session' },
  () => <BAITextInput placeholder="Enter a name" hasClear />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
