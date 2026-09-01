import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBadgeCount',
  displayName: 'BAI Badge Count',
  category: 'Feedback & Status',
  keywords: [
    'badge',
    'count',
    'dot',
    'notification badge',
    'unread',
    'indicator',
    'overlay',
  ],
  usage: {
    description:
      'A count or dot overlaid on the corner of another element — the notification-bell badge, the "N pending invitations" pill, the warning dot on a menu icon. Astryx Badge is a standalone pill with no overlay mode and no ribbon, so this component supplies the missing anchor: it wraps its child in a positioned span and pins an Astryx Badge (or a bare dot) to its corner, with the antd overflow rule (`max`), the antd `offset` sign convention, and a `role="status"` live region so a changing count is announced. Colour is not decided for you: `variant` is a straight pass-through to Astryx Badge, and omitting it yields Astryx\'s neutral default rather than antd\'s implicit red. Props other than the ones below reach the inner Badge, and `label`/`icon` are excluded because the overlay owns them.',
    bestPractices: [
      {
        guidance: true,
        description:
          'State `variant="error"` explicitly on a badge that used to rely on antd\'s implicit red, so the semantics are visible at the call site.',
      },
      {
        guidance: true,
        description:
          'Give every overlay a `title` — a dot has no text at all and a bare number rarely says what it counts.',
      },
      {
        guidance: true,
        description:
          'Use `size="small"` in dense rows such as tab rails and table headers, where the default pill crowds its anchor.',
      },
      {
        guidance: true,
        description:
          "Nudge with `offset` when the anchor is an icon whose glyph does not fill its box, keeping antd's convention: positive x moves right, positive y moves down.",
      },
      {
        guidance: false,
        description:
          'Reach for it to render a standalone pill or a status dot with a label — those are Astryx Badge and BAIBadge, and this component is only the corner overlay.',
      },
      {
        guidance: false,
        description:
          'Pass an arbitrary colour; the palette is the closed Astryx variant union, and there is no `color`, `status` or ribbon support.',
      },
    ],
  },
  props: [
    {
      name: 'count',
      type: 'number | React.ReactNode',
      description:
        'The value shown in the overlay. A number above `max` renders as `${max}+`; a zero hides the overlay unless `showZero` is set; undefined or null hides it too.',
    },
    {
      name: 'hasDot',
      type: 'boolean',
      description:
        'Renders a bare dot instead of a number, and keeps the overlay visible regardless of `count`.',
      default: 'false',
    },
    {
      name: 'max',
      type: 'number',
      description:
        'Overflow ceiling. A numeric count larger than this is displayed as the ceiling followed by a plus sign.',
      default: '99',
    },
    {
      name: 'showZero',
      type: 'boolean',
      description: 'Keeps the overlay visible when `count` is 0.',
      default: 'false',
    },
    {
      name: 'offset',
      type: '[number, number]',
      description:
        "Pixel nudge of the overlay in antd's sign convention: positive x moves it right, positive y moves it down.",
    },
    {
      name: 'size',
      type: "'small' | 'default'",
      description:
        'Overlay scale. `small` shrinks the pill for dense rows such as tab rails and table headers.',
      default: "'default'",
    },
    {
      name: 'title',
      type: 'string',
      description:
        'Accessible name of the overlay, applied to the live region that announces count changes.',
    },
    {
      name: 'variant',
      type: "BadgeProps['variant']",
      description:
        'Colour of the pill or dot, passed straight to Astryx Badge. Left unset it falls back to the neutral default — set it where the count means a problem.',
    },
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'The element the overlay is anchored to. Rendered inside the positioned wrapper, unchanged.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Extra class on the wrapper span, appended to the internal `bai-badge-count` class.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style on the wrapper span — this is where a stacking-context fix such as `zIndex` goes when the overlay is painted over by a sticky band.',
    },
  ],
  examples: [
    {
      label: 'Dot on a header icon button',
      code: `<BAIBadgeCount
  hasDot={hasRunningBackgroundTask}
  variant="error"
  title={t('notification.Notifications')}
>
  <Bell size="1em" />
</BAIBadgeCount>`,
    },
    {
      label: 'Count overlay with an offset',
      code: `<BAIBadgeCount
  count={\`+\${invitationCount}\`}
  variant="error"
  offset={[-token.sizeXS, -token.sizeXS]}
  style={{ zIndex: 50 }}
  title={t('data.InvitedFoldersTooltip', { count: invitationCount })}
>
  <BAIBoardItemTitle title={t('data.Folders')} />
</BAIBadgeCount>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
