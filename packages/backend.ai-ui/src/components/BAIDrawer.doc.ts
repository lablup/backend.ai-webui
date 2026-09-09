import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDrawer',
  displayName: 'BAI Drawer',
  category: 'Overlay',
  keywords: [
    'drawer',
    'panel',
    'side panel',
    'sheet',
    'sidebar',
    'detail drawer',
    'off canvas',
  ],
  usage: {
    description:
      'The project drawer shell: a lab `Drawer` panel plus the header arrangement every detail surface in the app expects — a close button, the title, an `extra` action slot, then a scrollable padded body. lab `Drawer` has no title bar of its own, only a floating close glyph that would overlap the content, so that glyph is turned off and this header owns the single close affordance. A scrimmed drawer renders through `BAIDrawerPortal`, which keeps modal focus containment without entering the browser top layer, so modals opened from inside the drawer are not inerted; a `hasScrim={false}` drawer stays on the native non-modal overlay and leaves the page behind it interactive. The props surface is closed — it declares no pass-through, so anything not listed here has no effect.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass `title` as a plain string wherever possible: it doubles as the accessible name, and a non-string title needs an explicit `label` instead.',
      },
      {
        guidance: true,
        description:
          'Put the refresh button and any drawer-scoped action in `extra`, matching how card-scoped actions live in a BAICard `extra` slot.',
      },
      {
        guidance: true,
        description:
          'Set `hasScrim={false}` for an inspector panel the user keeps open while working with the page behind it, such as the notification drawer.',
      },
      {
        guidance: false,
        description:
          'Rendering a second close button inside `children` — the header already provides one, and two close affordances read as a defect.',
      },
      {
        guidance: false,
        description:
          'Turning off `hasBodyPadding` to nudge spacing; clear it only when the content owns its own inset, and then pad inside `children`.',
      },
    ],
  },
  props: [
    {
      name: 'open',
      type: 'boolean',
      description: 'Whether the drawer panel is shown.',
      default: 'false',
    },
    {
      name: 'onClose',
      type: '() => void',
      description:
        'Close request from Escape, a scrim click, or the header close button. The drawer is fully controlled, so it stays open until `open` flips.',
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Header title, rendered as a level-5 heading when it is a string. A string title also becomes the accessible name of the panel.',
    },
    {
      name: 'extra',
      type: 'ReactNode',
      description:
        'Header actions rendered at the trailing edge of the header row, opposite the close button.',
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the panel. Needed when `title` is not a plain string, since lab `Drawer` has no heading of its own to derive a name from.',
    },
    {
      name: 'size',
      type: 'number | string',
      description:
        'Panel extent along the slide axis — width for a start/end drawer, height for top/bottom.',
      default: '400',
    },
    {
      name: 'side',
      type: "'start' | 'end' | 'top' | 'bottom'",
      description:
        'Edge the panel slides in from. Logical values, so `start`/`end` follow the writing direction.',
      default: "'end'",
    },
    {
      name: 'hasScrim',
      type: 'boolean',
      description:
        'Whether a modal scrim is painted. This is also the modality switch: `true` routes through `BAIDrawerPortal` for focus containment without the top layer, `false` keeps the native non-modal overlay and leaves the page interactive.',
      default: 'true',
    },
    {
      name: 'hasBodyPadding',
      type: 'boolean',
      description:
        'Whether the scrollable body carries the standard inset. Set it to `false` when the content pads itself.',
      default: 'true',
    },
    {
      name: 'bodyClassName',
      type: 'string',
      description:
        'Extra class on the scrollable body region, for a drawer that needs its own inset or background.',
    },
    {
      name: 'headerClassName',
      type: 'string',
      description:
        'Extra class on the header row. Used by the Electron notification drawer, which makes its header the frameless window drag handle.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Body content, rendered inside the scrollable region.',
    },
  ],
  examples: [
    {
      label: 'Detail drawer with a refresh action',
      code: `<BAIDrawer
  open={open}
  onClose={onRequestClose}
  side="end"
  size={800}
  title={t('agent.AgentInfo')}
  extra={
    <BAIFetchKeyButton
      loading={isPendingRefetch}
      value=""
      onChange={refetch}
    />
  }
>
  <AgentDetailContent agentFrgmt={agent} />
</BAIDrawer>`,
    },
    {
      label: 'Non-modal inspector panel',
      code: `<BAIDrawer
  open={open}
  onClose={onClose}
  side="end"
  size={400}
  hasScrim={false}
  hasBodyPadding={false}
  title={t('notification.Notifications')}
  bodyClassName="webui-notification-drawer-body"
>
  <NotificationList />
</BAIDrawer>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
