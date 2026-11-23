import BAIPasswordInput from './BAIPasswordInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIPasswordInput is ui-common's `PasswordInput` (a password field with a show/hide toggle) under its BAI name.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIPasswordInput> = {
  title: 'Input/BAIPasswordInput',
  component: BAIPasswordInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIPasswordInput',
          'PasswordInput',
          `<Form.Item name="password" label="Password" rules={[{ required: true }]}>
  <BAIPasswordInput autoComplete="current-password" />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIPasswordInput>;

const stories = formControlStories(
  { label: 'Password', initialValue: 'correct-horse' },
  () => <BAIPasswordInput autoComplete="current-password" />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
