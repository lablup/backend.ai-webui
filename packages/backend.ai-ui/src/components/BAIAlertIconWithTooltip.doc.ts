import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAlertIconWithTooltip',
  displayName: 'BAI Alert Icon With Tooltip',
  category: 'Feedback & Status',
  keywords: [
    'alert',
    'warning',
    'error',
    'tooltip',
    'status icon',
    'infotip',
    'exclamation',
  ],
  usage: {
    description:
      'A lucide `CircleAlertIcon` that explains a warning or an error on hover or focus. It renders BAIIconWithTooltip, so the glyph sits in a focusable trigger and the hint is reachable by keyboard, and `type` paints the glyph from the `--color-warning` / `--color-error` theme tokens instead of a hardcoded hue. Use it where a full BAIAlert would be too heavy — a table cell, a column header, a card header, or an error-boundary fallback that has to stay the size of the cell it replaced.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set `type` on every instance so the glyph carries the severity in colour as well as in the tooltip text.',
      },
      {
        guidance: true,
        description:
          'Reach for it as the `fallbackRender` of a cell-level error boundary, where a full-width alert would break the table layout.',
      },
      {
        guidance: true,
        description:
          'Translate `title` at the call site — the component renders the node it is given and contributes no copy of its own.',
      },
      {
        guidance: false,
        description:
          'Put text the user must read into `title`; it stays hidden until hover or focus, so a blocking problem belongs in a BAIAlert or a modal.',
      },
      {
        guidance: false,
        description:
          'Style the severity colour through `iconProps`; an inline colour there replaces the token wiring and drifts from the theme in dark mode.',
      },
    ],
  },
  props: [
    {
      name: 'title',
      type: 'ReactNode',
      description:
        'The tooltip body, in the antd `Tooltip.title` spelling. Nothing appears on hover when it is empty.',
    },
    {
      name: 'type',
      type: "'warning' | 'error'",
      description:
        'Severity that colours the glyph from `--color-warning` or `--color-error`. Left unset, the icon inherits the surrounding text colour.',
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        'Side of the trigger the tooltip opens on, in the Astryx placement vocabulary. Passed straight through to the tooltip.',
    },
    {
      name: 'iconProps',
      type: 'React.ComponentProps<typeof CircleAlertIcon>',
      description:
        'Props forwarded to the lucide glyph, such as `size` or `strokeWidth`. They are spread after the token colour, so a `style` given here replaces it.',
    },
  ],
  examples: [
    {
      label: 'Cell-level error boundary fallback',
      code: `<ErrorBoundary
  fallbackRender={() => (
    <BAIAlertIconWithTooltip
      type="error"
      title={t('comp:AgentTable.FailedToLoadCellData')}
    />
  )}
>
  {children}
</ErrorBoundary>`,
    },
    {
      label: 'Warning beside a value',
      code: `<BAIFlex gap="xxs" align="center">
  {quotaScopeId}
  <BAIAlertIconWithTooltip
    type="warning"
    title={t('storageHost.QuotaScopeNotFound')}
  />
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
