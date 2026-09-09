import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIFlex',
  displayName: 'BAI Flex',
  category: 'Layout',
  keywords: [
    'flex',
    'flexbox',
    'stack',
    'hstack',
    'vstack',
    'row',
    'column',
    'space',
  ],
  usage: {
    description:
      'The layout primitive of the Backend.AI UI: a flex container that renders one element with a normalized reset (zero margin and padding, min-width and min-height 0, border-box sizing) and resolves named gap rungs against the theme size tokens. It carries the layout vocabulary of this repository — rows, columns, alignment and spacing are expressed through BAIFlex rather than through raw layout elements with hand-written flex CSS. Remaining props pass through to the underlying element (it accepts React.HTMLAttributes<HTMLDivElement> except dir), and the ref is forwarded there.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the named gap rungs (xxs through xxl) so spacing resolves against the theme size tokens instead of a hardcoded pixel value.',
      },
      {
        guidance: true,
        description:
          'Pass a two-element gap tuple when row and column spacing differ on a wrapping container, for example gap={[16, "xs"]}.',
      },
      {
        guidance: true,
        description:
          'Set align="stretch" on a vertical stack whose children should fill the width; the default is center, which shrink-wraps them.',
      },
      {
        guidance: false,
        description:
          'Reach for a raw layout element with hand-written display flex when a BAIFlex expresses the same thing.',
      },
      {
        guidance: false,
        description:
          'Put margins on children to separate them; set gap on the container so the spacing stays consistent when children are added or removed.',
      },
    ],
  },
  props: [
    {
      name: 'direction',
      type: "'row' | 'row-reverse' | 'column' | 'column-reverse'",
      description: 'Main axis of the container, applied as flex-direction.',
      default: "'row'",
    },
    {
      name: 'wrap',
      type: "'nowrap' | 'wrap' | 'wrap-reverse'",
      description:
        'Whether children may flow onto additional lines, applied as flex-wrap.',
      default: "'nowrap'",
    },
    {
      name: 'justify',
      type: "'start' | 'end' | 'center' | 'between' | 'around'",
      description:
        'Distribution along the main axis. The short names expand to their CSS values, so between becomes space-between and around becomes space-around.',
      default: "'start'",
    },
    {
      name: 'align',
      type: "'start' | 'end' | 'center' | 'baseline' | 'stretch'",
      description:
        'Alignment along the cross axis, applied as align-items. The default centers children, so a column of full-width children needs stretch.',
      default: "'center'",
    },
    {
      name: 'gap',
      type: "number | 'xxs' | 'xs' | 'sm' | 'ms' | 'md' | 'lg' | 'xl' | 'xxl' | [GapSize, GapSize]",
      description:
        'Spacing between children. A named rung resolves to the matching theme size token, a number is used as pixels, and a two-element tuple sets row gap and column gap separately.',
      default: '0',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Merged over the computed flex styles, so it can override display, flex-direction, alignment or sizing for a one-off case.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The flex items.',
    },
  ],
  examples: [
    {
      label: 'Vertical stack with token spacing',
      code: `<BAIFlex direction="column" align="stretch" gap="sm">
  <BAIGraphQLPropertyFilter {...filterProps} />
  <BAITable {...tableProps} />
</BAIFlex>`,
    },
    {
      label: 'Inline icon and label row',
      code: `<BAIFlex gap="xs">
  <BAIJupyterIcon />
  {t('import.ImportNotebook')}
</BAIFlex>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
