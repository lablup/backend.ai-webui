import BAISegmentedControl from './BAISegmentedControl';
import BAISegmentedControlItem from './BAISegmentedControlItem';
import {
  formControlDocsDescription,
  formControlStories,
} from './formControlStory';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAISegmentedControl is ui-common's `SegmentedControl` under its BAI name;
 * its options are `BAISegmentedControlItem`.
 *
 * @see ADR 0014 (docs/adr/0014-bai-names-for-ui-common-form-controls.md)
 */
const meta: Meta<typeof BAISegmentedControl> = {
  title: 'Input/BAISegmentedControl',
  component: BAISegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: formControlDocsDescription(
          'BAISegmentedControl',
          'SegmentedControl',
          `<Form.Item name="clusterMode" label="Cluster mode">
  <BAISegmentedControl>
    <BAISegmentedControlItem value="single-node" label="Single node" />
    <BAISegmentedControlItem value="multi-node" label="Multi node" />
  </BAISegmentedControl>
</Form.Item>`,
        ),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISegmentedControl>;

const stories = formControlStories(
  { label: 'Cluster mode', initialValue: 'single-node' },
  () => (
    <BAISegmentedControl>
      <BAISegmentedControlItem value="single-node" label="Single node" />
      <BAISegmentedControlItem value="multi-node" label="Multi node" />
    </BAISegmentedControl>
  ),
);

export const Default: Story = stories.Default;
export const ErrorState: Story = stories.ErrorState;
export const DisabledState: Story = stories.DisabledState;
