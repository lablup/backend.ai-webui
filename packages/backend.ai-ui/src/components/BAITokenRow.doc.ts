import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAITokenRow',
  displayName: 'BAI Token Row',
  category: 'Table & List',
  keywords: [
    'token',
    'badge list',
    'list',
    'tags',
    'overflow',
    'truncate',
    'and more',
    'table cell',
  ],
  usage: {
    description:
      'A row of read-only Astryx Tokens for a settled collection that lives inside a table cell — the projects a container registry is allowed for, an image\'s aliases, a record\'s labels. It renders the first `maxCount` items (three by default) and closes with a translated "and N more" count, so a record with a long tail cannot stretch the row or push later columns off screen. When the server returned only a page of the collection, pass `totalCount` and the indicator reports what exists rather than what was fetched. It is ui-common `TokenRow` under its BUI name; other div attributes (className, style, data-*) reach the row.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Cap the query the same way the cell is capped — select the connection with `first: 3` and its `count`, then pass `totalCount={count}`, so a row does not silently drop items the manager never sent.',
      },
      {
        guidance: true,
        description:
          'Give each item a stable `key` (the record id) when the labels can repeat; the label is only the fallback key.',
      },
      {
        guidance: true,
        description:
          'Set `emptyText` to whatever the column uses for "nothing here", so an empty collection matches its neighbours instead of rendering a bare dash by accident.',
      },
      {
        guidance: false,
        description:
          'Reach for it to show a collection the user has to act on — a removable set is Astryx `Token` with `onRemove`, and a full list belongs in a detail panel or a modal rather than a cell.',
      },
      {
        guidance: false,
        description:
          'Raise `maxCount` past a handful to "show everything"; the component exists because an uncapped cell is the failure mode.',
      },
    ],
  },
  props: [
    {
      name: 'items',
      type: 'Array<{ key?: React.Key; label: string }>',
      description:
        'The tokens to render, in display order. Only the first `maxCount` of them are drawn.',
    },
    {
      name: 'maxCount',
      type: 'number',
      description:
        'How many tokens are rendered before the overflow indicator takes over.',
      default: '3',
    },
    {
      name: 'totalCount',
      type: 'number',
      description:
        'Size of the whole collection when `items` is only a page of it, as with a connection capped by `first:`. The overflow count is measured against this. Defaults to the length of `items`.',
    },
    {
      name: 'color',
      type: 'TokenColor',
      description:
        'Colour of every token in the row, passed to Astryx Token. Left unset, the default (neutral outline) colour applies.',
    },
    {
      name: 'emptyText',
      type: 'React.ReactNode',
      description:
        'Rendered in place of the row when there is nothing to show.',
      default: "'-'",
    },
    {
      name: 'moreLabel',
      type: '(count: number) => string',
      description:
        'The count after the tokens, given how many were left out. Defaults to the translated "and N more" from ui-common\'s catalog.',
    },
  ],
  examples: [
    {
      label: 'A connection capped at three, with the true total',
      code: `<BAITokenRow
  items={_.map(groups, (group) => ({
    key: group.id,
    label: group.name ?? '',
  }))}
  totalCount={record.allowed_groups?.count ?? undefined}
/>`,
    },
    {
      label: 'A fully-loaded string list',
      code: `<BAITokenRow
  items={_.map(_.compact(row.aliases), (alias) => ({
    key: alias,
    label: alias,
  }))}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
