import BAINumberInput from './BAINumberInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAINumberInput is ui-common's `NumberInput` under its BAI name. An emptied
 * field reports `null` while `hasClear` is true (the default).
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAINumberInput> = {
  title: 'Input/BAINumberInput',
  component: BAINumberInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAINumberInput',
          'NumberInput',
          `<Form.Item name="port" label="Port">
  <BAINumberInput min={1} max={65535} isIntegerOnly />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAINumberInput>;

const stories = formControlStories(
  { label: 'Port', initialValue: 8080 },
  () => <BAINumberInput min={1} max={65535} isIntegerOnly />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
