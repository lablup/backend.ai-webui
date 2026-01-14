import BAIFlex from './BAIFlex';
import BAISelect from './BAISelect';
import BAIText from './BAIText';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta<typeof BAISelect> = {
  title: 'Components/BAISelect',
  component: BAISelect,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAISelect** extends [Ant Design Select](https://ant.design/components/select).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghost\` | \`boolean\` | \`false\` | Transparent background style |
| \`autoSelectOption\` | \`boolean \\| (options) => value\` | - | Auto-select first option when empty |
| \`tooltip\` | \`string\` | \`''\` | Tooltip text for the select |
| \`footer\` | \`ReactNode \\| string\` | - | Custom footer in dropdown |
| \`endReached\` | \`() => void\` | - | Callback when scroll reaches end |
| \`searchAction\` | \`(value: string) => Promise<void>\` | - | Async search with transition |
| \`atBottomThreshold\` | \`number\` | \`30\` | Threshold for bottom detection (px) |
| \`atBottomStateChange\` | \`(atBottom: boolean) => void\` | - | Callback for bottom state changes |

For all other props, refer to [Ant Design Select](https://ant.design/components/select).
        `,
      },
    },
  },
  argTypes: {
    // BAI-specific props - document fully
    ghost: {
      control: { type: 'boolean' },
      description: 'Transparent background style',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    autoSelectOption: {
      control: { type: 'boolean' },
      description: 'Auto-select first option when value is empty',
      table: {
        type: { summary: 'boolean | (options) => value' },
        defaultValue: { summary: '-' },
      },
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Tooltip text displayed on hover',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "''" },
      },
    },
    footer: {
      control: false,
      description: 'Custom footer content in dropdown',
      table: {
        type: { summary: 'ReactNode | string' },
        defaultValue: { summary: '-' },
      },
    },
    endReached: {
      control: false,
      description: 'Callback when scroll reaches end (for infinite scroll)',
      table: {
        type: { summary: '() => void' },
        defaultValue: { summary: '-' },
      },
    },
    searchAction: {
      control: false,
      description: 'Async search action with React transition',
      table: {
        type: { summary: '(value: string) => Promise<void>' },
        defaultValue: { summary: '-' },
      },
    },
    atBottomThreshold: {
      control: { type: 'number' },
      description: 'Threshold for bottom detection in pixels',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '30' },
      },
    },
    atBottomStateChange: {
      control: false,
      description: 'Callback for bottom state changes',
      table: {
        type: { summary: '(atBottom: boolean) => void' },
        defaultValue: { summary: '-' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAISelect>;

const sampleOptions = [
  { label: 'Option 1', value: 'option1' },
  { label: 'Option 2', value: 'option2' },
  { label: 'Option 3', value: 'option3' },
  { label: 'Option 4', value: 'option4' },
];

// Default story with interactive controls
export const Default: Story = {
  name: 'Basic',
  args: {
    options: sampleOptions,
    placeholder: 'Select an option',
    style: { width: 200 },
    ghost: false,
    autoSelectOption: false,
  },
};

// Ghost style comparison
export const GhostStyle: Story = {
  render: () => (
    <BAIFlex
      direction="column"
      gap="md"
      style={{ padding: 24, background: '#1890ff' }}
    >
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{ color: 'white' }}>Ghost Style (Transparent)</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Select option"
          ghost={true}
          style={{ width: 200 }}
        />
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <BAIText style={{ color: 'white' }}>Normal Style</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Select option"
          ghost={false}
          style={{ width: 200 }}
        />
      </BAIFlex>
    </BAIFlex>
  ),
};

// Auto-select option
export const AutoSelectOption: Story = {
  render: () => {
    const [value1, setValue1] = useState<string>();
    const [value2, setValue2] = useState<string>();

    return (
      <BAIFlex direction="column" gap="md">
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select enabled (first option selected)</BAIText>
          <BAISelect
            options={sampleOptions}
            placeholder="Auto-selects first option"
            autoSelectOption={true}
            value={value1}
            onChange={setValue1}
            style={{ width: 250 }}
          />
          <BAIText type="secondary">Selected: {value1 || 'None'}</BAIText>
        </BAIFlex>
        <BAIFlex direction="column" gap="xs">
          <BAIText>Auto-select disabled</BAIText>
          <BAISelect
            options={sampleOptions}
            placeholder="Select manually"
            autoSelectOption={false}
            value={value2}
            onChange={setValue2}
            style={{ width: 250 }}
          />
          <BAIText type="secondary">Selected: {value2 || 'None'}</BAIText>
        </BAIFlex>
      </BAIFlex>
    );
  },
};

// Tooltip feature
export const WithTooltip: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Hover over the select to see tooltip</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Select an option"
          tooltip="This is a helpful tooltip message"
          style={{ width: 250 }}
        />
      </BAIFlex>
    </BAIFlex>
  ),
};

// Footer in dropdown
export const WithFooter: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIFlex direction="column" gap="xs">
        <BAIText>Select with custom footer (string)</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Open dropdown to see footer"
          footer="Total: 4 options"
          style={{ width: 250 }}
        />
      </BAIFlex>
      <BAIFlex direction="column" gap="xs">
        <BAIText>Select with custom footer (ReactNode)</BAIText>
        <BAISelect
          options={sampleOptions}
          placeholder="Open dropdown"
          footer={
            <BAIText type="secondary" style={{ fontSize: '12px' }}>
              Custom footer content
            </BAIText>
          }
          style={{ width: 250 }}
        />
      </BAIFlex>
    </BAIFlex>
  ),
};

// Infinite scroll with endReached
export const InfiniteScroll: Story = {
  render: () => {
    const [options, setOptions] = useState(
      Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: `option${i + 1}`,
      })),
    );
    const [loading, setLoading] = useState(false);

    const handleEndReached = () => {
      if (loading) return;

      setLoading(true);
      // Simulate loading more options
      setTimeout(() => {
        const currentLength = options.length;
        const newOptions = Array.from({ length: 10 }, (_, i) => ({
          label: `Option ${currentLength + i + 1}`,
          value: `option${currentLength + i + 1}`,
        }));
        setOptions([...options, ...newOptions]);
        setLoading(false);
      }, 1000);
    };

    return (
      <BAIFlex direction="column" gap="xs">
        <BAIText>Scroll to bottom to load more options</BAIText>
        <BAISelect
          options={options}
          placeholder="Scroll down to load more"
          endReached={handleEndReached}
          loading={loading}
          footer={
            loading ? 'Loading more...' : `${options.length} options loaded`
          }
          style={{ width: 250 }}
        />
      </BAIFlex>
    );
  },
};

// Async search with searchAction
export const AsyncSearch: Story = {
  render: () => {
    const [options, setOptions] = useState(sampleOptions);

    const handleSearch = async (value: string) => {
      // Simulate async search
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!value) {
        setOptions(sampleOptions);
      } else {
        const filtered = sampleOptions.filter((opt) =>
          opt.label.toLowerCase().includes(value.toLowerCase()),
        );
        setOptions(filtered);
      }
    };

    return (
      <BAIFlex direction="column" gap="xs">
        <BAIText>Type to search with async action</BAIText>
        <BAISelect
          options={options}
          placeholder="Type to search..."
          searchAction={handleSearch}
          showSearch
          filterOption={false}
          style={{ width: 250 }}
        />
      </BAIFlex>
    );
  },
};
