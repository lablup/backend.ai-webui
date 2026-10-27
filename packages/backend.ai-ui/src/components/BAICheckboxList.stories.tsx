import BAICheckboxList, { BAICheckboxListItem } from './BAICheckboxList';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAICheckboxList is ui-common's `CheckboxList` under its BAI name; its
 * options are `BAICheckboxListItem`. The value is an array of option values.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAICheckboxList> = {
  title: 'Input/BAICheckboxList',
  component: BAICheckboxList,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAICheckboxList',
          'CheckboxList',
          `<Form.Item name="permissions" label="Permissions">
  <BAICheckboxList>
    <BAICheckboxListItem value="read" label="Read" />
    <BAICheckboxListItem value="write" label="Write" />
  </BAICheckboxList>
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAICheckboxList>;

const stories = formControlStories(
  { label: 'Permissions', initialValue: ['read'] },
  () => (
    <BAICheckboxList>
      <BAICheckboxListItem value="read" label="Read" />
      <BAICheckboxListItem value="write" label="Write" />
      <BAICheckboxListItem value="delete" label="Delete" />
    </BAICheckboxList>
  ),
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
