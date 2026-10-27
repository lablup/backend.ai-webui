import BAITypeahead from './BAITypeahead';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { SearchSource, SearchableItem } from '@lablup/ui-common/Typeahead';
import type { Meta, StoryObj } from '@storybook/react-vite';

const sampleItems: SearchableItem[] = [
  { id: 'python', label: 'python:3.11' },
  { id: 'pytorch', label: 'pytorch:2.4' },
  { id: 'tensorflow', label: 'tensorflow:2.16' },
];

const sampleSearchSource: SearchSource<SearchableItem> = {
  search: (query) =>
    sampleItems.filter((item) => item.label.includes(query.toLowerCase())),
  bootstrap: () => sampleItems,
};

/**
 * BAITypeahead is ui-common's `Typeahead` under its BAI name: one item chosen
 * from a search source.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAITypeahead> = {
  title: 'Input/BAITypeahead',
  component: BAITypeahead,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAITypeahead',
          'Typeahead',
          `<Form.Item name="image" label="Image">
  <BAITypeahead searchSource={imageSource} />
</Form.Item>`,
        ),
      },
    },
  },
  args: { searchSource: sampleSearchSource },
};

export default meta;
type Story = StoryObj<typeof BAITypeahead>;

const stories = formControlStories(
  { label: 'Image', initialValue: sampleItems[0] },
  () => <BAITypeahead searchSource={sampleSearchSource} />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
