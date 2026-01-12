import BAIAlert from './BAIAlert';
import BAIFlex from './BAIFlex';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAIAlert> = {
  title: 'Components/BAIAlert',
  component: BAIAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAIAlert** extends [Ant Design Alert](https://ant.design/components/alert).

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`ghostInfoBg\` | \`boolean\` | \`true\` | Info alerts use container background instead of default info background |

For all other props, refer to [Ant Design Alert](https://ant.design/components/alert).
        `,
      },
    },
  },
  argTypes: {
    // BAI-specific props - document fully
    ghostInfoBg: {
      control: { type: 'boolean' },
      description:
        'When true, info alerts use container background instead of default info background',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    // Hide Ant Design props used in args
    type: { table: { disable: true } },
    message: { table: { disable: true } },
    showIcon: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof BAIAlert>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    type: 'info',
    message: 'Informational alert with ghost background',
    showIcon: true,
    ghostInfoBg: true,
  },
};

// Comparison story: Demonstrate BAI-specific ghostInfoBg prop
export const GhostInfoBackground: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAIAlert
        type="info"
        message="Ghost enabled (default) - uses container background"
        ghostInfoBg={true}
        showIcon
      />
      <BAIAlert
        type="info"
        message="Ghost disabled - uses default info background"
        ghostInfoBg={false}
        showIcon
      />
    </BAIFlex>
  ),
};
