import BAINotificationStack from './BAINotificationStack';
import type { BAINotificationStackItem } from './BAINotificationStack';
import type { Meta, StoryObj } from '@storybook/react-vite';

const LONG_ERROR = `Failed to start the session: ${'the backend returned an unusually long diagnostic that used to grow the notice past the top of the viewport. '.repeat(40)}`;

const meta: Meta<typeof BAINotificationStack> = {
  title: 'Notification/BAINotificationStack',
  component: BAINotificationStack,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**BAINotificationStack** is the floating notice stack anchored to the bottom-right corner.

## Features
- Astryx \`Banner\` per notice, with status icon, background-task progress, action / retry / cancel buttons and a collapsible disclosure
- Per-notice auto-close that pauses while the notice is hovered or focused
- An oversized description or disclosure scrolls inside the notice, so the banner header and its dismiss button never leave the viewport
- The stack itself is capped below the app header, and \`maxVisible\` keeps it short

## Props
| Name | Type | Default | Description |
|------|------|---------|-------------|
| notifications | \`Array<BAINotificationStackItem>\` | - | Notices, oldest first; the last renders nearest the corner |
| onClose | \`(key: React.Key) => void\` | - | Fired by the close button and by the auto-close timer |
| maxVisible | \`number\` | - | Cap on simultaneously visible notices, keeping the newest |
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BAINotificationStack>;

export const Default: Story = {
  name: 'Basic',
  args: {
    notifications: [
      { key: 'info', title: 'Session started', description: 'session-1a2b3c' },
      {
        key: 'task',
        title: 'Importing image',
        description: 'This may take a while.',
        percent: 42,
        progressLabel: 'Importing image',
        cancelText: 'Cancel',
        onCancel: () => {},
        duration: null,
      },
    ],
  },
};

/** FR-3829 — the dismiss button stays reachable however long the error is. */
export const OversizedError: Story = {
  args: {
    notifications: [
      {
        key: 'error',
        title: 'Failed to start the app',
        description: LONG_ERROR,
        status: 'error',
        duration: null,
        children: LONG_ERROR,
      },
    ],
  },
};

/** FR-3829 — `maxVisible` keeps the stack clear of the app header. */
export const CappedStack: Story = {
  args: {
    maxVisible: 3,
    notifications: Array.from(
      { length: 10 },
      (_, i): BAINotificationStackItem => ({
        key: `n${i}`,
        title: `Notice ${i + 1}`,
        description: 'One of ten notices raised at once.',
        duration: null,
      }),
    ),
  },
};
