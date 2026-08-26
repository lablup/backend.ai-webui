import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRowWrapWithDividers',
  displayName: 'BAI Row Wrap With Dividers',
  category: 'Layout',
  keywords: [
    'divider',
    'separator',
    'row',
    'wrap',
    'flex',
    'space',
    'inline group',
  ],
  usage: {
    description:
      'A wrapping row that draws a vertical divider between neighbours, but never after the last item on a line. It lays its children out as a wrapping flex row and measures their offsets — with a ResizeObserver on the container and on each item, a MutationObserver for content changes, and a window resize listener — to decide which item ends a row and therefore hides its divider. Each divider is an absolutely positioned overlay centred in the column gap, so turning dividers on or off never changes an item’s width. It is the container the dashboard resource panels use to separate BAIStatistic tiles.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Feed the gaps and the divider colour from theme tokens (`token.marginXL`, `token.colorBorder`) rather than raw pixel values.',
      },
      {
        guidance: true,
        description:
          'Use `dividerInset` to shorten the line at top and bottom; it is inset-only and leaves the container’s height untouched.',
      },
      {
        guidance: true,
        description:
          'Give each child a stable `key`, since row-end detection is recomputed from the child array whenever its length changes.',
      },
      {
        guidance: false,
        description:
          'Reach for it as a general layout container — BAIFlex carries the layout vocabulary, and this component exists only for the between-items divider.',
      },
      {
        guidance: false,
        description:
          'Nest an item that grows or animates continuously; every observed size change re-measures the whole row.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'React.ReactNode',
      description:
        'The items laid out in the row. Each is wrapped in a positioned box that carries the divider overlay.',
      required: true,
    },
    {
      name: 'wrap',
      type: 'boolean',
      description:
        'Whether items wrap onto further rows. Set it to false to keep a single row, in which case only the last item hides its divider.',
      default: 'true',
    },
    {
      name: 'rowGap',
      type: 'number | string',
      description:
        'Vertical gap between wrapped rows. Falls back to the theme’s `marginXL`.',
      default: 'token.marginXL',
    },
    {
      name: 'columnGap',
      type: 'number | string',
      description:
        'Horizontal gap between items. The divider is centred inside this gap, so it also controls how far the line sits from either neighbour.',
      default: 'token.marginXXL',
    },
    {
      name: 'dividerWidth',
      type: 'number',
      description: 'Thickness of the divider line in pixels.',
      default: '1',
    },
    {
      name: 'dividerColor',
      type: 'string',
      description:
        'Colour of the divider line. Falls back to the theme’s secondary border colour.',
      default: 'token.colorBorderSecondary',
    },
    {
      name: 'dividerInset',
      type: 'number',
      description:
        'Top and bottom inset of the line. It shortens the divider only and does not affect the container size.',
      default: '0',
    },
    {
      name: 'itemStyle',
      type: 'React.CSSProperties',
      description:
        'Style applied to every item wrapper. Padding here shifts the content relative to the divider, which stays centred in the gap.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Style merged onto the flex container, after the display, wrap and gap declarations it sets itself.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Class applied to the flex container.',
    },
  ],
  examples: [
    {
      label: 'Dividing dashboard tiles',
      code: `<BAIRowWrapWithDividers
  rowGap={token.marginXL}
  columnGap={token.marginXL}
  dividerColor={token.colorBorder}
  dividerInset={token.marginXS}
  dividerWidth={token.lineWidth}
>
  <BAIPanelItem title={t('data.MyFolders')} value={createdCount} />
  <BAIPanelItem title={t('data.ProjectFolders')} value={projectCount} />
</BAIRowWrapWithDividers>`,
    },
    {
      label: 'Defaults around statistics',
      code: `<BAIRowWrapWithDividers>
  <BAIStatistic title="CPU" current={used.cpu} total={total.cpu} progressMode="normal" />
  <BAIStatistic title="Memory" current={used.mem} total={total.mem} unit="GiB" progressMode="normal" />
</BAIRowWrapWithDividers>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
