import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIListAlert',
  displayName: 'BAI List Alert',
  category: 'Feedback & Status',
  keywords: [
    'alert',
    'banner',
    'callout',
    'notice',
    'list',
    'summary',
    'affected items',
  ],
  usage: {
    description:
      'The alert that summarizes which items an action is about to affect — the selected users of a bulk update, the folders a delete will skip. It renders BAIAlert and fills its description with a standardized bulleted `ul` built from `items`; the list is keyboard-focusable and scrolls vertically once it passes `maxHeight`, so a modal holding it never grows unbounded. An empty `items` array renders the alert with no description at all. Everything else — `type`, `title`, `showIcon`, `closable`, `style` — passes through to BAIAlert, except `description`, which this component owns and Omits.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Put the item count in `title` through an i18n `count` interpolation — the component renders the entries but never a count of its own.',
      },
      {
        guidance: true,
        description:
          'Give each entry a stable `key` from the record it came from, so a re-sorted or filtered list does not reuse rows by index.',
      },
      {
        guidance: true,
        description:
          'Use `type="warning"` when the listed items are about to be changed or removed, and `type="info"` when they are merely being reported.',
      },
      {
        guidance: false,
        description:
          'Raise `maxHeight` to fit a long list — the scroll cap is what keeps the containing modal a fixed size.',
      },
      {
        guidance: false,
        description:
          'Hand-roll a `ul` inside a plain BAIAlert `description`; that is the markup and scroll behaviour this component standardizes.',
      },
    ],
  },
  props: [
    {
      name: 'items',
      type: 'Array<{ key?: React.Key | null; content: ReactNode }>',
      description:
        'The list entries, rendered as `li` elements in order. `key` falls back to the array index. An empty array renders no description.',
      required: true,
    },
    {
      name: 'maxHeight',
      type: "CSSProperties['maxHeight']",
      description:
        'Height at which the list starts scrolling instead of growing. The default fits roughly seven rows.',
      default: '165',
    },
  ],
  examples: [
    {
      label: 'Items affected by a bulk update',
      code: `<BAIListAlert
  type="warning"
  showIcon
  title={t('credential.UpdateUsersWarningAlertTitle')}
  items={_.map(users, (user) => ({
    key: user.id,
    content: user.basicInfo.email,
  }))}
/>`,
    },
    {
      label: 'Reporting skipped items with a count in the title',
      code: `<BAIListAlert
  type="info"
  showIcon
  title={t('data.folders.CannotDeleteCount', { count: skipped.length })}
  maxHeight={80}
  items={_.map(skipped, (folder) => ({
    key: folder.id,
    content: folder.name,
  }))}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
