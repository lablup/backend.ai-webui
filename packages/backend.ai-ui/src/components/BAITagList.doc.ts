import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITagList',
  displayName: 'BAI Tag List',
  category: 'Content',
  keywords: [
    'tag list',
    'chips',
    'tags',
    'badge group',
    'overflow',
    'truncate',
    'more indicator',
  ],
  usage: {
    description:
      'Renders a list of short values with a bounded footprint: the first `maxInline` entries show inline and the remainder collapse into a `+N` affordance that reveals only the overflowed values. The overflow opens on hover in both variants — it is a read-only peek, so it appears on hover and leaves with the pointer. `variant="chip"` draws the inline entries as Astryx `Badge` chips and the `+N` as a keyboard-reachable `Link`; `variant="text"` draws them as nowrap plain text and puts the `+N` in a compact `Badge`. Use the chip variant in modals and detail panels and the text variant in dense table cells. With no items it renders `emptyText` and nothing else.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pair `variant="text"` with a small `maxInline` in table cells, so a row with many values does not widen the column.',
      },
      {
        guidance: true,
        description:
          'Keep entries short — names, IP addresses, IDs. The overflow popup caps at 240px tall and scrolls beyond that.',
      },
      {
        guidance: true,
        description:
          'Pass `trigger="click"` when the overflow list must survive the pointer leaving it, for example when the values are meant to be selected and copied.',
      },
      {
        guidance: false,
        description:
          'Expect the popup to repeat the inline entries — it lists only what overflowed, since the rest is already on screen.',
      },
      {
        guidance: false,
        description:
          'Feed it rich nodes; `items` is strings and numbers only, and richer rows belong in a BAITable or a BAIMetadataList.',
      },
    ],
  },
  props: [
    {
      name: 'items',
      type: 'ReadonlyArray<string | number>',
      description:
        'The values to render, in display order. An empty array renders `emptyText`.',
      required: true,
    },
    {
      name: 'maxInline',
      type: 'number',
      description:
        'How many entries render inline before the rest collapse into `+N`.',
      default: '3',
    },
    {
      name: 'emptyText',
      type: 'ReactNode',
      description: 'What to render when `items` is empty.',
      default: "'-'",
    },
    {
      name: 'variant',
      type: "'chip' | 'text'",
      description:
        'Inline appearance: `chip` renders Badge chips for interactive contexts, `text` renders nowrap plain text for dense table cells.',
      default: "'chip'",
    },
    {
      name: 'trigger',
      type: "'click' | 'hover'",
      description:
        'How the overflow list opens. Defaults to `hover` (a HoverCard, so the list sits on a card surface) in both variants; pass `click` for a Popover that latches open.',
    },
  ],
  examples: [
    {
      label: 'Dense table cell',
      code: `<BAITagList
  variant="text"
  maxInline={1}
  items={record.security?.allowedClientIp ?? []}
/>`,
    },
    {
      label: 'Chips in a bulk-edit modal',
      code: `<BAITagList
  items={_.map(projectFairShares, (p) => p.project?.basicInfo?.name || '')}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
