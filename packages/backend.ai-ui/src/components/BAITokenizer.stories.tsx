import BAITokenizer from './BAITokenizer';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { SearchSource, SearchableItem } from '@lablup/ui-common/Typeahead';
import type { Meta, StoryObj } from '@storybook/react-vite';

const sampleItems: SearchableItem[] = [
  { id: 'cuda', label: 'cuda' },
  { id: 'rocm', label: 'rocm' },
  { id: 'cpu', label: 'cpu' },
];

const sampleSearchSource: SearchSource<SearchableItem> = {
  search: (query) =>
    sampleItems.filter((item) => item.label.includes(query.toLowerCase())),
  bootstrap: () => sampleItems,
};

/**
 * BAITokenizer is ui-common's `Tokenizer` under its BAI name: tokens chosen
 * from a search source. Free-form string tags use `BAITagsInput` instead.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAITokenizer> = {
  title: 'Input/BAITokenizer',
  component: BAITokenizer,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAITokenizer',
          'Tokenizer',
          `<Form.Item name="accelerators" label="Accelerators">
  <BAITokenizer searchSource={acceleratorSource} />
</Form.Item>`,
        ),
      },
    },
  },
  args: { searchSource: sampleSearchSource },
};

export default meta;
type Story = StoryObj<typeof BAITokenizer>;

const stories = formControlStories(
  { label: 'Accelerators', initialValue: [sampleItems[0]] },
  () => <BAITokenizer searchSource={sampleSearchSource} />,
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
