import BAIButton from './BAIButton';
import BAIFlex from './BAIFlex';
import BAINotificationItem from './BAINotificationItem';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof BAINotificationItem> = {
  title: 'Components/BAINotificationItem',
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
| \`styles\` | \`BAINotificationItemStyles\` | - | Custom styles for title, description, action, and footer sections |

## BAINotificationItemStyles
\`\`\`typescript
interface BAINotificationItemStyles {
  title?: React.CSSProperties;
  description?: React.CSSProperties;
  action?: React.CSSProperties;
  footer?: React.CSSProperties;
}
\`\`\`
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
    styles: {
      control: false,
      description:
        'Custom styles for title, description, action, and footer sections',
      table: {
        type: { summary: 'BAINotificationItemStyles' },
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

// With Custom Styles: Demonstrates styles prop for customizing wrapper elements
export const WithCustomStyles: Story = {
  render: () => (
    <BAIFlex direction="column" gap="md">
      <BAINotificationItem
        title="Default styling"
        description="This notification uses default styles."
        footer="1 hour ago"
      />
      <BAINotificationItem
        title="Custom styled notification"
        description="This notification demonstrates custom styling capabilities."
        action={
          <BAIButton type="primary" size="small">
            Acknowledge
          </BAIButton>
        }
        footer="1 hour ago"
        styles={{
          title: {
            backgroundColor: '#e6f7ff',
            padding: '4px 8px',
            borderRadius: '4px',
          },
          description: {
            backgroundColor: '#f6ffed',
            padding: '8px',
            borderRadius: '4px',
          },
          footer: {
            backgroundColor: '#fff7e6',
            padding: '2px 6px',
            borderRadius: '4px',
          },
        }}
      />
    </BAIFlex>
  ),
};
