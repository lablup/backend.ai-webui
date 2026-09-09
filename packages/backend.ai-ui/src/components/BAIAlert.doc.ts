import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAlert',
  displayName: 'BAI Alert',
  category: 'Feedback & Status',
  keywords: [
    'alert',
    'banner',
    'callout',
    'notice',
    'message',
    'inline message',
    'warning',
  ],
  usage: {
    description:
      'The inline status message shown above a form, inside a modal or across the top of a page. It renders an Astryx Banner and keeps antd `Alert`’s prop names on the surface, mapping `type` to Banner `status`, `closable`/`onClose` to `isDismissable`/`onDismiss`, `banner` to a full-width section container and `action` to Banner trailing content. Banner always shows the status icon and always lays out title above description, so `showIcon` is inert and a description-only alert promotes its description into the title slot rather than rendering an empty header.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give a single-line alert only `description` (or only `title`) — the promotion keeps one line of copy in the header slot where it belongs.',
      },
      {
        guidance: true,
        description:
          'Use `title` rather than `message` in new code; `message` is antd’s deprecated alias and exists for the call sites that still pass it.',
      },
      {
        guidance: true,
        description:
          'Set `banner` for a page-level notice that must span the full width, and leave it off for an alert sitting inside a card or a modal body.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIListAlert when the body is a list of failures rather than one sentence.',
      },
      {
        guidance: false,
        description:
          'Rely on `showIcon` or `ghostInfoBg` — both are accepted and inert, since Banner owns its icon and its per-status colour.',
      },
      {
        guidance: false,
        description:
          'Use an alert for a transient result of a user action; that is `message` from the app-shim, not a persistent inline banner.',
      },
    ],
  },
  props: [
    {
      name: 'type',
      type: "'info' | 'warning' | 'error' | 'success'",
      description:
        'Severity. Maps to Banner `status`, which picks the colour and the icon.',
      default: "'info'",
    },
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'Headline copy. When omitted, `description` is promoted into this slot so the banner never renders an empty header.',
    },
    {
      name: 'message',
      type: 'ReactNode',
      description:
        'antd’s deprecated alias for `title`. Read only when `title` is not given.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        'Secondary copy under the title. Becomes the title itself when no title or message is supplied.',
    },
    {
      name: 'showIcon',
      type: 'boolean',
      description:
        'Accepted and inert — Banner always renders the status icon, where antd rendered it only on request.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Replaces the status icon. Banner does honour this override.',
    },
    {
      name: 'closable',
      type: 'boolean',
      description:
        'Adds the dismiss button (Banner `isDismissable`). The alert does not unmount itself — hide it from `onClose`.',
    },
    {
      name: 'onClose',
      type: '() => void',
      description: 'Called when the dismiss button is pressed.',
    },
    {
      name: 'banner',
      type: 'boolean',
      description:
        'Renders the full-width page-banner form (Banner `container="section"`) instead of the inset card form.',
    },
    {
      name: 'action',
      type: 'ReactNode',
      description:
        'Trailing controls, typically a BAIButton. Rendered in Banner’s end-content slot.',
    },
    {
      name: 'ghostInfoBg',
      type: 'boolean',
      description:
        'Accepted and inert since the Astryx conversion — Banner owns its per-status background and exposes no knob for it.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Extra body content rendered inside the banner, below the title and description.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'Class merged with the internal `bai-alert` hook, which the one project-level CSS rule targets.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline style forwarded to the Banner.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test hook forwarded to the Banner.',
    },
  ],
  examples: [
    {
      label: 'Inline notice',
      code: `<BAIAlert
  type="warning"
  description={t('projectSelect.NoAccessibleProjects')}
/>`,
    },
    {
      label: 'Page banner with title and description',
      code: `<BAIAlert
  banner
  type="warning"
  title={t('webui.menu.PleaseChangeYourPassword')}
  description={t('webui.menu.PasswordChangePlace')}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
