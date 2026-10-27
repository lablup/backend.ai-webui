import BAICheckboxInput from './BAICheckboxInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAICheckboxInput is ui-common's `CheckboxInput` under its BAI name. Visible
 * text goes in `children`; inside a `Form.Item` use `valuePropName="checked"`.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAICheckboxInput> = {
  title: 'Input/BAICheckboxInput',
  component: BAICheckboxInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAICheckboxInput',
          'CheckboxInput',
          `<Form.Item name="isActive" label="Status" valuePropName="checked">
  <BAICheckboxInput>Active</BAICheckboxInput>
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAICheckboxInput>;

const stories = formControlStories(
  { label: 'Status', initialValue: true, valuePropName: 'checked' },
  () => <BAICheckboxInput>Active</BAICheckboxInput>,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
