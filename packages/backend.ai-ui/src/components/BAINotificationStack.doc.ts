import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAINotificationStack',
  displayName: 'BAI Notification Stack',
  category: 'Feedback & Status',
  keywords: [
    'notification',
    'toast',
    'snackbar',
    'alert stack',
    'background task',
    'progress',
    'banner',
  ],
  usage: {
    description:
      "The floating notice stack anchored to the bottom-right corner — the component that replaced antd's imperative `notification` API, which Astryx has no counterpart for. Each entry renders an Astryx `Banner` at high elevation with a status icon, an optional background-task progress bar (determinate or indeterminate), action, retry and cancel buttons in the banner's end slot, and a collapsible disclosure for `children`. A per-notice `duration` closes it automatically, and that countdown banks its remaining budget while the notice is hovered or holds focus so a notice never closes out from under the reader. Newest renders nearest the corner, removals play an exit transition that respects `prefers-reduced-motion`, and the whole component is presentational: no routing, no i18n, no Relay, no jotai. Application code raises notices through `useBAINotification`, not by rendering this directly.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Mount exactly one stack per app, through the host that owns the notification state, and let every notice reach it through that state.',
      },
      {
        guidance: true,
        description:
          'Order `notifications` oldest first — the last entry is the one drawn nearest the corner.',
      },
      {
        guidance: true,
        description:
          'Give a background-task notice both `percent` and `progressLabel` so the progress bar is announced with the name of the task it tracks.',
      },
      {
        guidance: true,
        description:
          'Pass `content` when a notice draws its own complete body; it replaces title, description and progress rather than stacking above them.',
      },
      {
        guidance: false,
        description:
          'Translate inside it — every string, including the retry and cancel labels, arrives already translated from the host.',
      },
      {
        guidance: false,
        description:
          'Send `duration: 0` expecting an immediate close; zero and `null` both mean the notice stays until dismissed.',
      },
    ],
  },
  props: [
    {
      name: 'notifications',
      type: 'Array<BAINotificationStackItem>',
      description:
        'The notices to show, oldest first. Each carries `key`, `title`, and the optional `description`, `status`, `percent`, `isProgressIndeterminate`, `progressLabel`, action / retry / cancel pairs, `duration`, `isClosable`, `icon`, `content` and `children`.',
      required: true,
    },
    {
      name: 'onClose',
      type: '(key: React.Key) => void',
      description:
        "Fired with the notice's key by the close button and by the auto-close timer. Remove the entry from `notifications` here; the exit animation plays for 200ms afterwards.",
    },
    {
      name: 'maxVisible',
      type: 'number',
      description:
        'Cap on simultaneously visible notices, keeping the newest. Unlimited when unset.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description:
        'Test id on the stack container. Defaults to `bai-notification-stack`; individual notices always carry `data-notification-key`, `data-status` and `data-paused`.',
    },
  ],
  examples: [
    {
      label: 'The single host mount',
      code: `<BAINotificationStack
  // newest last = newest nearest the corner; copy before reversing
  notifications={[...items].reverse()}
  onClose={closeNotification}
/>`,
    },
    {
      label: 'A background-task notice',
      code: `<BAINotificationStack
  notifications={[
    {
      key: 'import-image',
      title: t('notification.ImportingImage'),
      description: t('notification.ThisMayTakeAWhile'),
      status: 'info',
      percent: 42,
      progressLabel: t('notification.ImportingImage'),
      cancelText: t('button.Cancel'),
      onCancel: cancelImport,
      duration: null,
    },
  ]}
  onClose={closeNotification}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
