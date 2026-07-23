import BAIDoubleTag from './BAIDoubleTag';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * BAIDoubleTag displays multiple tags side-by-side with a connected appearance.
 *
 * Key features:
 * - Accepts both string arrays and object arrays with custom colors/styles
 * - Built-in text highlighting support
 * - Automatic ellipsis with tooltip for long labels
 * - Tags are visually connected (no gaps between them)
 *
 * @see BAIDoubleTag.tsx for implementation details
 */
const meta: Meta<typeof BAIDoubleTag> = {
  title: 'Tag/BAIDoubleTag',
  component: BAIDoubleTag,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIDoubleTag** displays multiple tags in a connected layout with advanced text handling.

## Features
- **Flexible input**: Accepts string arrays or object arrays with custom properties
- **Text highlighting**: Built-in keyword highlighting with \`highlightKeyword\`
- **Ellipsis support**: Automatically truncates long labels with tooltips
- **Connected appearance**: Tags are visually connected without gaps
- **Custom styling**: Supports custom colors and styles per tag

## Usage
\`\`\`tsx
// String array
<BAIDoubleTag values={['Python', '3.11']} />

// Object array with colors
<BAIDoubleTag
  values={[
    { label: 'Python', color: 'blue' },
    { label: '3.11', color: 'green' }
  ]}
/>

// With keyword highlighting
<BAIDoubleTag
  values={['Python', '3.11']}
  highlightKeyword="py"
/>
\`\`\`

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| \`values\` | \`string[] \\| DoubleTagObjectValue[]\` | \`[]\` | Tag values as strings or objects with color/style |
| \`highlightKeyword\` | \`string\` | - | Keyword to highlight in tag labels |

### DoubleTagObjectValue
| Property | Type | Description |
|----------|------|-------------|
| \`label\` | \`string\` | Tag label text |
| \`color\` | \`string\` | Tag color (Ant Design color presets or custom) |
| \`style\` | \`React.CSSProperties\` | Custom styles for the tag |
        `,
      },
    },
  },
  argTypes: {
    values: {
      control: { type: 'object' },
      description:
        'Array of tag values (strings or objects with label, color, and style properties)',
      table: {
        type: { summary: 'string[] | DoubleTagObjectValue[]' },
        defaultValue: { summary: '[]' },
      },
    },
    highlightKeyword: {
      control: { type: 'text' },
      description: 'Keyword to highlight within tag labels',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIDoubleTag>;

export const Default: Story = {
  name: 'Basic',
  parameters: {
    docs: {
      description: {
        story:
          'Basic usage with a string array. Tags are automatically styled with blue color.',
      },
    },
  },
  args: {
    values: ['Frontend', 'Backend', 'Database'],
  },
};

export const ObjectValues: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates using object values with custom colors for each tag.',
      },
    },
  },
  args: {
    values: [
      { label: 'Python', color: 'blue' },
      { label: '3.11', color: 'green' },
    ],
  },
};

export const WithHighlight: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Highlights matching keywords within tag labels using BAITextHighlighter.',
      },
    },
  },
  args: {
    values: ['Frontend', 'Backend', 'Database'],
    highlightKeyword: 'end',
  },
};

export const CustomColors: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Showcases various Ant Design color presets available for tags.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIDoubleTag
        values={[
          { label: 'Success', color: 'success' },
          { label: 'Processing', color: 'processing' },
        ]}
      />
      <BAIDoubleTag
        values={[
          { label: 'Warning', color: 'warning' },
          { label: 'Error', color: 'error' },
        ]}
      />
      <BAIDoubleTag
        values={[
          { label: 'Magenta', color: 'magenta' },
          { label: 'Purple', color: 'purple' },
          { label: 'Cyan', color: 'cyan' },
        ]}
      />
      <BAIDoubleTag
        values={[
          { label: 'Gold', color: 'gold' },
          { label: 'Lime', color: 'lime' },
          { label: 'Volcano', color: 'volcano' },
        ]}
      />
    </BAIFlex>
  ),
};

export const LongLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Long tag labels are automatically truncated with ellipsis. Hover over the tags to see the full text in a tooltip.',
      },
    },
  },
  args: {
    values: [
      { label: 'Very Long Tag Label That Will Be Truncated', color: 'blue' },
      { label: 'Another Long Label', color: 'orange' },
    ],
  },
};

export const CustomStyles: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Each tag can have custom styles (font weight, size, style, etc.) through the style property.',
      },
    },
  },
  args: {
    values: [
      {
        label: 'Custom',
        color: 'purple',
        style: { fontWeight: 'bold', fontSize: 14 },
      },
      { label: 'Styled', color: 'cyan', style: { fontStyle: 'italic' } },
    ],
  },
};

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story: 'When values array is empty, the component renders null.',
      },
    },
  },
  args: {
    values: [],
  },
};

export const RealWorldExample: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Realistic examples showing how BAIDoubleTag is used in Backend.AI WebUI, such as displaying image names with versions, or resource allocations.',
      },
    },
  },
  render: () => (
    <BAIFlex direction="column" gap="md" style={{ alignItems: 'flex-start' }}>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Container Image:</div>
        <BAIDoubleTag
          values={[
            { label: 'lablup/python', color: 'blue' },
            { label: '3.11-ubuntu22.04', color: 'green' },
          ]}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>GPU Allocation:</div>
        <BAIDoubleTag
          values={[
            { label: 'NVIDIA', color: 'processing' },
            { label: 'A100', color: 'success' },
            { label: '2 cores', color: 'orange' },
          ]}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Session Status:</div>
        <BAIDoubleTag
          values={[
            { label: 'RUNNING', color: 'success' },
            { label: 'kernel-python', color: 'blue' },
          ]}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>
          Search Result (keyword: &quot;tensor&quot;):
        </div>
        <BAIDoubleTag
          values={[
            { label: 'tensorflow', color: 'orange' },
            { label: '2.12', color: 'cyan' },
          ]}
          highlightKeyword="tensor"
        />
      </div>
    </BAIFlex>
  ),
};
