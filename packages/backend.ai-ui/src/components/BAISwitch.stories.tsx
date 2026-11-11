import BAISwitch from './BAISwitch';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAISwitch is ui-common's `Switch` under its BAI name. Visible text goes in
 * `children`; inside a `Form.Item` use `valuePropName="checked"`.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAISwitch> = {
  title: 'Input/BAISwitch',
  component: BAISwitch,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAISwitch',
          'Switch',
          `<Form.Item name="schedulable" label="Schedulable" valuePropName="checked">
  <BAISwitch />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISwitch>;

const stories = formControlStories(
  { label: 'Schedulable', initialValue: true, valuePropName: 'checked' },
  () => <BAISwitch />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
