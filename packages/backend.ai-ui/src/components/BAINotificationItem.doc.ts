import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAINotificationItem',
  displayName: 'BAI Notification Item',
  category: 'Feedback & Status',
  keywords: [
    'notification',
    'notice body',
    'toast content',
    'list item',
    'alert item',
    'message',
  ],
  usage: {
    description:
      'The body of a single notice: a stacked title, description, trailing action row and footer, laid out with BAIFlex. It is the renderer a notification passes to BAINotificationStack as its `content` slot — the folder, session and multi-step notices are all built from it — rather than a standalone surface. Primitive `title`, `description` and `footer` values are wrapped in Astryx `Text` automatically, so a plain string needs no markup, while a node is rendered as given. `action` is right-aligned under the description and `footer` is right-aligned in secondary text, which is where the timestamp goes.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass plain strings where the copy is plain — the component wraps them in Text itself and a hand-wrapped node only adds nesting.',
      },
      {
        guidance: true,
        description:
          'Keep the resource link in `title` and the status detail in `description`, so every notice in the stack reads the same way.',
      },
      {
        guidance: true,
        description:
          'Put buttons in `action` rather than at the end of `description`; the action row already handles the right alignment and the gap.',
      },
      {
        guidance: false,
        description:
          'Render it outside a notification — the spacing and the secondary footer colour are tuned for the 384px notice column, not for page content.',
      },
      {
        guidance: false,
        description:
          'Reach for `styles` to restyle a section wholesale; it exists for per-notice nudges such as a width or a margin, and the rest belongs in the theme.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Headline of the notice, usually the resource name as a link. A primitive value is wrapped in Astryx Text; the block is medium weight with room kept at its right edge for the close button.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        'Body of the notice — status tags, progress, an error detail. A primitive value is wrapped in Astryx Text.',
    },
    {
      name: 'action',
      type: 'ReactNode',
      description:
        'Controls for the notice, rendered as a right-aligned row below the description.',
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        'Trailing line, right-aligned in secondary text colour. Typically the formatted timestamp.',
    },
    {
      name: 'styles',
      type: 'BAINotificationItemStyles',
      description:
        'Per-section inline style overrides — `title`, `description`, `action`, `footer` — merged after the component defaults.',
    },
  ],
  examples: [
    {
      label: 'Folder notice body',
      code: `<BAINotificationItem
  title={
    <BAIText ellipsis>
      {t('general.Folder')}:&nbsp;
      <BAILink onClick={() => openFolderExplorer(localId)}>
        {folderName}
      </BAILink>
    </BAIText>
  }
  description={_.truncate(notification.description, { length: 300 })}
  footer={showDate ? dayjs(notification.created).format('lll') : undefined}
/>`,
    },
    {
      label: 'With an action row',
      code: `<BAINotificationItem
  title={t('session.SessionEnded')}
  description={node.status_info}
  action={<BAIButton size="small" onClick={onRetry}>{t('button.Retry')}</BAIButton>}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
