import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRouteSchedulingHistoryNodeTable',
  displayName: 'BAI Route Scheduling History Node Table',
  category: 'Table & List',
  hidden: true,
  keywords: [
    'route',
    'routing',
    'scheduling',
    'history',
    'table',
    'transition',
    'audit',
  ],
  usage: {
    description:
      'The plain row renderer behind `BAIRouteSchedulingHistoryTable`, kept separate so the expandable sub-step layer can wrap it. It reads the plural `BAIRouteSchedulingHistoryNodeTableFragment` on `RouteHistory` — the caller spreads that fragment on each history node and passes the array as `schedulingHistoryFrgmt` — and builds ten columns: updated at and created at (formatted date + time), phase, result as a `BAISchedulingResultBadge` (an unrecognized future enum value renders as no result rather than raw text), category, from and to status, attempts, monospace error code, and the message, which is width-capped and rendered with its newlines preserved. No column declares a sorter today, because the sortable-key list is empty, so `onChangeOrder` cannot fire until keys are added. Prefer `BAIRouteSchedulingHistoryTable` in application code; reach for this one only where sub-step expansion is genuinely unwanted. Everything except `dataSource`, `columns` and `onChangeOrder` passes through to BAITable.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use `BAIRouteSchedulingHistoryTable` instead whenever a row may carry sub-steps, since this table gives the user no way to open them.',
      },
      {
        guidance: true,
        description:
          'Supply `expandable` yourself if this table is used directly and rows still need detail — the prop is untouched here, unlike in the wrapper that owns it.',
      },
      {
        guidance: true,
        description:
          'Add a column through `customizeColumns` rather than a parallel table, so the resize and column-settings behaviour stays consistent.',
      },
      {
        guidance: false,
        description:
          'Wire `onChangeOrder` and expect calls: no column currently declares a sorter, so nothing triggers it.',
      },
      {
        guidance: false,
        description:
          'Pass a raw nullable array — nulls are filtered internally, but every remaining row must carry the fragment spread or its cells render empty.',
      },
    ],
  },
  props: [
    {
      name: 'schedulingHistoryFrgmt',
      type: 'BAIRouteSchedulingHistoryNodeTableFragment$key',
      description:
        'Plural fragment reference for the rows. Spread `BAIRouteSchedulingHistoryNodeTableFragment` on each `RouteHistory` node; rows are keyed by `id` and null entries are dropped.',
      required: true,
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every column. Currently a no-op in effect, since no column declares one.',
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<RouteSchedulingHistoryNodeInList>) => BAIColumnsType<RouteSchedulingHistoryNodeInList>',
      description:
        'Transforms the base column list before rendering. Its return value is used verbatim; unset means the base columns are used.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: null) => void',
      description:
        'Sort callback kept for parity with the other history tables. It stays silent while the sortable-key list is empty.',
    },
  ],
  examples: [
    {
      label: 'Flat history table, no sub-step expansion',
      code: `<BAIRouteSchedulingHistoryNodeTable
  resizable
  schedulingHistoryFrgmt={filterOutEmpty(histories ?? [])}
  loading={isRefetchingInTransition}
  pagination={false}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
