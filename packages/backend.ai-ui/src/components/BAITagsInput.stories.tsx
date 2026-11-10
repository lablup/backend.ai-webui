import BAITagsInput from './BAITagsInput';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAITagsInput is ui-common's `TagsInput` under its BAI name: free-form tags
 * as a string array, split on `tokenSeparators` as typed or pasted.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAITagsInput> = {
  title: 'Input/BAITagsInput',
  component: BAITagsInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAITagsInput',
          'TagsInput',
          `<Form.Item name="ports" label="Ports">
  <BAITagsInput tokenSeparators={[',', ' ']} />
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAITagsInput>;

const stories = formControlStories(
  { label: 'Ports', initialValue: ['8080', '8888'] },
  () => <BAITagsInput tokenSeparators={[',', ' ']} hasClear placeholder="" />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
