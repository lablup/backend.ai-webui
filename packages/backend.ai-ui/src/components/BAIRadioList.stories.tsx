import BAIRadioList, { BAIRadioListItem } from './BAIRadioList';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIRadioList is ui-common's `RadioList` under its BAI name; its options are
 * `BAIRadioListItem`, which can carry a `description` under the label.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAIRadioList> = {
  title: 'Input/BAIRadioList',
  component: BAIRadioList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAIRadioList',
          'RadioList',
          `<Form.Item name="permission" label="Permission">
  <BAIRadioList orientation="horizontal">
    <BAIRadioListItem value="rw" label="Read & Write" />
    <BAIRadioListItem value="ro" label="Read only" />
  </BAIRadioList>
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIRadioList>;

const stories = formControlStories(
  { label: 'Permission', initialValue: 'rw' },
  () => (
    <BAIRadioList orientation="horizontal">
      <BAIRadioListItem value="rw" label="Read & Write" />
      <BAIRadioListItem value="ro" label="Read only" />
    </BAIRadioList>
  ),
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
