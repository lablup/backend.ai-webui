import BAIButton from './BAIButton';
import BAINotificationItem from './BAINotificationItem';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAINotificationItem> = {
  title: 'Notification/BAINotificationItem',
  component: BAINotificationItem,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**BAINotificationItem** is a custom notification item template component for Backend.AI WebUI.

This component is designed to display structured notification content with title, description, action buttons, and footer information.

## BAI-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`title\` | \`ReactNode\` | - | Notification title (automatically wrapped in Typography.Text if primitive) |
| \`description\` | \`ReactNode\` | - | Notification description content |
| \`action\` | \`ReactNode\` | - | Action buttons or controls displayed at the bottom right |
| \`footer\` | \`ReactNode\` | - | Footer content (e.g., timestamp) displayed at the bottom right with secondary text color |

        `,
      },
    },
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description:
        'Notification title (automatically wrapped in Typography.Text if primitive)',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    description: {
      control: { type: 'text' },
      description: 'Notification description content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    action: {
      control: false,
      description: 'Action buttons or controls displayed at the bottom right',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    footer: {
      control: { type: 'text' },
      description:
        'Footer content (e.g., timestamp) displayed at the bottom right with secondary text color',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAINotificationItem>;

// Default story: Use args for interactive Controls
export const Default: Story = {
  name: 'Basic',
  args: {
    title: 'New session created',
    description: 'Your compute session has been successfully created.',
    footer: '2 minutes ago',
  },
};

// With Action Buttons: Demonstrates action prop with BAI-specific right-aligned layout
export const WithActions: Story = {
  render: () => (
    <BAINotificationItem
      title="Session compute resource insufficient"
      description="Your session requires more resources than currently available."
      action={
        <>
          <BAIButton type="link" size="small">
            Dismiss
          </BAIButton>
          <BAIButton type="primary" size="small">
            View Details
          </BAIButton>
        </>
      }
      footer="5 minutes ago"
    />
  ),
};
