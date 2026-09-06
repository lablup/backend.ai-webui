import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIBadge',
  displayName: 'BAI Badge',
  category: 'Feedback & Status',
  keywords: [
    'badge',
    'status',
    'status dot',
    'state',
    'indicator',
    'chip',
    'tag',
    'pill',
  ],
  usage: {
    description:
      'A coloured status dot with a label beside it — the shape antd `Badge status={…} text={…}` produced. It renders an Astryx `StatusDot` for the dot plus a sibling `Text` for the visible label, because `StatusDot` alone paints only the dot and treats its own `label` as the accessible name. The `color` prop takes a BUI `SemanticColor` (`success` / `info` / `warning` / `error` / `default`) rather than a raw hue, so every status in the app maps onto the same five-way vocabulary; omitting it renders an outline-only dot for an unknown or indeterminate state. Specialised badges such as `BAISchedulingResultBadge`, `BAIAuditLogStatusTag` and `StorageUsageBadge` are built on it by fixing `color` and `text`.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Map a domain status onto a `SemanticColor` in a small wrapper component, the way `BAISchedulingResultBadge` does, so the same state always gets the same colour across pages.',
      },
      {
        guidance: true,
        description:
          'Leave `color` unset when the status is genuinely unknown — the outline-only dot says "no data" rather than picking a colour that implies one.',
      },
      {
        guidance: true,
        description:
          'Pass a plain string to `text` where you can: it becomes the accessible name of the dot, and a non-string node falls back to the generic "status".',
      },
      {
        guidance: false,
        description:
          'Using `processing` for anything but a genuinely in-flight state — the pulse is motion, and a static status that pulses reads as activity that is not happening.',
      },
      {
        guidance: false,
        description:
          'Reaching for it to show a count; `BAIBadgeCount` is the counting badge.',
      },
    ],
  },
  props: [
    {
      name: 'color',
      type: "'success' | 'info' | 'warning' | 'error' | 'default'",
      description:
        'Semantic colour of the dot. `info` renders on the accent slot and `default` on neutral. Left undefined, the dot is transparent with a border, marking the status unknown or indeterminate.',
    },
    {
      name: 'processing',
      type: 'boolean',
      description:
        'Pulses the dot, for a state that is still resolving (scheduling, provisioning, terminating).',
    },
    {
      name: 'text',
      type: 'ReactNode',
      description:
        'Visible label rendered beside the dot. A string value also becomes the accessible name of the dot; nothing is rendered when it is omitted or null.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        "Extra class on the wrapping element, appended to the component's own `bai-badge` class.",
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline style on the wrapping element. Used by the shipped wrappers mainly to keep the label from wrapping inside a table cell.',
    },
  ],
  examples: [
    {
      label: 'Status with a label',
      code: `<BAIBadge color="success" text={t('session.Running')} />`,
    },
    {
      label: 'In-flight state, no label',
      code: `<BAIBadge color="warning" processing />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
