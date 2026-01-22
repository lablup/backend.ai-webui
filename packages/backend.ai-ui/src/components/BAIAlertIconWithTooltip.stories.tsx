import BAIAlertIconWithTooltip from './BAIAlertIconWithTooltip';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIAlertIconWithTooltip> = {
  title: 'Components/BAIAlertIconWithTooltip',
  component: BAIAlertIconWithTooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
**BAIAlertIconWithTooltip** extends [Ant Design Tooltip](https://ant.design/components/tooltip) with a built-in alert icon.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`iconProps\` | \`React.ComponentProps<typeof CircleAlertIcon>\` | \`undefined\` | Props for the CircleAlertIcon from lucide-react |
| \`type\` | \`'warning' | 'error'\` | \`'error'\` | Determines icon color: warning uses colorWarning token, error uses colorError token |

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
      description: 'Props for the CircleAlertIcon (lucide-react)',
      table: {
        type: { summary: 'React.ComponentProps<typeof CircleAlertIcon>' },
        defaultValue: { summary: 'undefined' },
      },
    },
    type: {
      control: { type: 'radio' },
      options: ['warning', 'error'],
      description:
        'Determines icon color: warning uses colorWarning token, error uses colorError token',
      table: {
        type: { summary: "'warning' | 'error'" },
        defaultValue: { summary: "'error'" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAlertIconWithTooltip>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    title: 'This is an error alert icon',
    type: 'error',
  },
};

// Comparison story: Demonstrate BAI-specific type prop
export const IconTypes: Story = {
  render: () => (
    <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Error (default)</div>
        <BAIAlertIconWithTooltip
          title="This is an error message"
          type="error"
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Warning</div>
        <BAIAlertIconWithTooltip
          title="This is a warning message"
          type="warning"
        />
      </div>
    </BAIFlex>
  ),
};

// Comparison story: Demonstrate BAI-specific iconProps
export const CustomIconSize: Story = {
  render: () => (
    <BAIFlex direction="row" gap="xl" align="center">
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Default size</div>
        <BAIAlertIconWithTooltip title="Default icon size" type="error" />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Small (16px)</div>
        <BAIAlertIconWithTooltip
          title="Small icon size"
          type="error"
          iconProps={{ size: 16 }}
        />
      </div>
      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>Large (32px)</div>
        <BAIAlertIconWithTooltip
          title="Large icon size"
          type="warning"
          iconProps={{ size: 32 }}
        />
      </div>
    </BAIFlex>
  ),
};
