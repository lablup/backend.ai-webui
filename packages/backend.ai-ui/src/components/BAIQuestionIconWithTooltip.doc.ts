import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIQuestionIconWithTooltip',
  displayName: 'BAI Question Icon With Tooltip',
  category: 'Overlay',
  keywords: [
    'tooltip',
    'help',
    'hint',
    'question mark',
    'info icon',
    'popover',
    'infotip',
  ],
  usage: {
    description:
      'A lucide `CircleHelp` glyph that reveals explanatory text on hover or focus. It renders BAIIconWithTooltip, which supplies the focusable trigger, so the hint is reachable by keyboard and not only by pointer; the glyph inherits the theme placeholder text colour rather than a resolved hex. The prop surface is the antd Tooltip vocabulary the call sites were written against (`title`, `placement`, `open`, `mouseEnterDelay`) and is translated to Astryx placement/alignment and milliseconds at the boundary. Use it next to a form label, a card title, or a table column header when the explanation is too long to sit inline.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep `title` to one or two sentences the user can act on; anything longer belongs in the page body or the manual.',
      },
      {
        guidance: true,
        description:
          'Pass `focusable={false}` when the icon sits inside another interactive element, so the trigger does not create a nested control.',
      },
      {
        guidance: true,
        description:
          'Translate the `title` through the caller’s i18n hook — the component renders whatever node it is given and adds no copy of its own.',
      },
      {
        guidance: false,
        description:
          'Put information the user must read into the tooltip; it is hidden until hover or focus and never appears in print or search.',
      },
      {
        guidance: false,
        description:
          'Reach for it as a general-purpose tooltip — it always renders the question glyph. Wrap the element in Astryx Tooltip when the trigger is something else.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description: 'Tooltip body. Nothing is shown on hover when it is empty.',
    },
    {
      name: 'placement',
      type: "AntdPlacement ('top' | 'bottom' | 'topLeft' | 'bottomRight' | …)",
      description:
        'antd-shaped placement, split into Astryx `placement` + `alignment` before it reaches the tooltip.',
    },
    {
      name: 'open',
      type: 'boolean',
      description:
        'Controls visibility instead of letting hover and focus drive it.',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      description:
        'Fires when the tooltip wants to open or close; pair it with `open` for a controlled tooltip.',
    },
    {
      name: 'mouseEnterDelay',
      type: 'number',
      description:
        'Delay before the tooltip appears, in seconds (antd unit). Converted to milliseconds internally.',
    },
    {
      name: 'iconProps',
      type: 'React.ComponentProps<typeof CircleHelp>',
      description:
        'Props forwarded to the lucide `CircleHelp` glyph, such as `strokeWidth` or `color`. `size` is fixed to `1em` so the icon tracks the surrounding text.',
    },
    {
      name: 'focusable',
      type: 'boolean',
      description:
        'Whether the trigger takes keyboard focus. Set it to `false` for an icon nested inside another interactive element.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description: 'Inline style applied to the trigger element.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class names applied to the trigger element.',
    },
  ],
  examples: [
    {
      label: 'Hint next to a label',
      code: `<BAIFlex gap="xxs" align="center">
  {t('storageProxy.SFTPStorageProxies')}
  <BAIQuestionIconWithTooltip
    title={t('storageProxy.SFTPStorageProxiesDescription')}
  />
</BAIFlex>`,
    },
    {
      label: 'Placement override',
      code: `<BAIQuestionIconWithTooltip
  title={t('data.HostDetails')}
  placement="bottomLeft"
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
