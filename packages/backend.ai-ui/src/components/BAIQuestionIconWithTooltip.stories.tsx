import BAIFlex from './BAIFlex';
import BAIQuestionIconWithTooltip from './BAIQuestionIconWithTooltip';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIQuestionIconWithTooltip> = {
  title: 'Tooltip/BAIQuestionIconWithTooltip',
  component: BAIQuestionIconWithTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIQuestionIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in help (question mark) icon.

It is typically placed next to a label, form field, or table column header to surface an explanatory hint on hover. The icon uses the \`colorTextTertiary\` token and a \`help\` cursor.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`iconProps\` | \`React.ComponentProps<typeof QuestionCircleOutlined>\` | \`undefined\` | Props for the QuestionCircleOutlined icon from \`@ant-design/icons\`. Size is controlled via \`style.fontSize\` (antd icons have no \`size\` prop). |

**Note:** The \`children\` prop is omitted as the component provides its own icon.

For all other props, refer to [Ant Design Tooltip](https://ant.design/components/tooltip).
        `,
      },
    },
  },
  argTypes: {
    // BAI-specific props - document fully
    iconProps: {
      control: { type: 'object' },
      description:
        'Props for the QuestionCircleOutlined icon (@ant-design/icons)',
      table: {
        type: {
          summary: 'React.ComponentProps<typeof QuestionCircleOutlined>',
        },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIQuestionIconWithTooltip>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    title: 'This field accepts a comma-separated list of IP ranges.',
  },
};

// Usage story: Demonstrate placement next to a label
export const WithLabel: Story = {
  render: () => (
    <BAIFlex gap="xxs" align="center">
      <span>Allowed Client IPs</span>
      <BAIQuestionIconWithTooltip title="Restrict access to the listed CIDR ranges. Leave empty to allow all." />
    </BAIFlex>
  ),
};

// Comparison story: Demonstrate BAI-specific iconProps (icon size via fontSize)
export const CustomIconSize: Story = {
  render: () => (
    <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Default size</div>
        <BAIQuestionIconWithTooltip title="Default icon size" />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Small (12px)</div>
        <BAIQuestionIconWithTooltip
          title="Small icon size"
          iconProps={{ style: { fontSize: 12 } }}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Large (24px)</div>
        <BAIQuestionIconWithTooltip
          title="Large icon size"
          iconProps={{ style: { fontSize: 24 } }}
        />
      </div>
    </BAIFlex>
  ),
};

// Placement story: Tooltip placement is a pass-through Ant Design Tooltip prop
export const Placement: Story = {
  render: () => (
    <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Top (default)</div>
        <BAIQuestionIconWithTooltip title="Tooltip on top" placement="top" />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Right</div>
        <BAIQuestionIconWithTooltip
          title="Tooltip on right"
          placement="right"
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Bottom</div>
        <BAIQuestionIconWithTooltip
          title="Tooltip on bottom"
          placement="bottom"
        />
      </div>
    </BAIFlex>
  ),
};
