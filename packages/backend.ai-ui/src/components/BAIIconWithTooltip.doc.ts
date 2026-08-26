import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIIconWithTooltip',
  displayName: 'BAI Icon With Tooltip',
  category: 'Overlay',
  keywords: [
    'tooltip',
    'hint',
    'help icon',
    'info icon',
    'popover',
    'title',
    'hover card',
  ],
  usage: {
    description:
      'Attaches an Astryx Tooltip to any glyph — a lucide icon, a status badge — and wraps that glyph in a focusable button so the hint is reachable from the keyboard, not only on hover. The tooltip content is flattened into the trigger accessible name, and the icon renders in the placeholder text color so a hint never competes with the content beside it. Where the trigger sits inside another interactive element, focusable={false} swaps the button for a span, since nesting a button is invalid. Its props extend Astryx TooltipProps (minus children and anchorRef), so content, placement and alignment pass straight through. BAIQuestionIconWithTooltip specializes it with the CircleHelp glyph.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set focusable={false} inside a link, a select option or a segmented-control label — a nested button is invalid HTML and breaks the parent control.',
      },
      {
        guidance: true,
        description:
          'Size the glyph in em (size="1em") so the hint scales with the text it annotates.',
      },
      {
        guidance: true,
        description:
          'Reach for BAIQuestionIconWithTooltip when the hint is a plain "what is this?" — it already carries the shared question glyph.',
      },
      {
        guidance: false,
        description:
          'Put an action behind it; the trigger is a hint with a help cursor, so a click that changes state has no visible affordance.',
      },
      {
        guidance: false,
        description:
          'Pass content that is only decoration — the flattened content is the accessible name, and an empty one leaves the trigger unlabelled.',
      },
    ],
  },
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'The glyph the tooltip is attached to. Rendered inside an Astryx Text in the placeholder color.',
      required: true,
    },
    {
      name: 'content',
      type: 'ReactNode',
      description:
        'Tooltip body, inherited from Astryx TooltipProps. Its flattened text also becomes the trigger accessible name.',
    },
    {
      name: 'focusable',
      type: 'boolean',
      description:
        'Whether the trigger is a real button. Set it to false inside another interactive element, which downgrades the trigger to a hover-only span.',
      default: 'true',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline style merged onto the trigger, after the inline-flex and help-cursor reset.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the trigger element.',
    },
  ],
  examples: [
    {
      label: 'Hint next to a label',
      code: `<BAIFlex gap="xs">
  {t('session.launcher.MiniumAllocation')}
  <BAIIconWithTooltip
    content={t('session.launcher.MiniumAllocationTooltip')}
    focusable={false}
    icon={<Info size="1em" />}
  />
</BAIFlex>`,
    },
    {
      label: 'Status badge as the trigger',
      code: `<BAIIconWithTooltip
  content={t('data.usage.HostStatusTooltip', { status: usageLabel })}
  icon={<StorageUsageBadge percent={usagePercent} />}
  style={{ alignItems: 'center' }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
