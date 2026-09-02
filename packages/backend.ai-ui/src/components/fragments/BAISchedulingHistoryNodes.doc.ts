import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISchedulingHistoryNodes',
  displayName: 'BAI Scheduling History Nodes',
  category: 'Table & List',
  keywords: [
    'scheduling',
    'history',
    'session',
    'table',
    'timeline',
    'phase',
    'transition',
  ],
  usage: {
    description:
      'The presentational table of a session scheduling history. It reads the plural Relay fragment `BAISchedulingHistoryNodesFragment` on `SessionSchedulingHistory`, so the caller spreads that fragment on each history node in its own query and passes the resulting array as `schedulingHistoryFrgmt`; null and undefined entries are dropped and rows are keyed by `id`. Eight columns are built internally — updated, created, phase, result (a BAISchedulingResultBadge), from-status, to-status, attempts and message (line breaks preserved, cell capped at 500px) — and the component holds no filter, pagination or sort state of its own. It renders BAITable, so every BAITable prop except `dataSource`, `columns` and `onChangeOrder` passes straight through, including `expandable`, which is how BAISchedulingHistoryTable adds the sub-step timeline.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Reach for BAISchedulingHistoryTable instead when the rows should expand into their sub-steps — it owns a superset fragment and wires `expandable` for you.',
      },
      {
        guidance: true,
        description:
          'Drive `loading`, `pagination` and `tableSettings` from the query orchestrator that fetched the histories, since this component keeps none of that state.',
      },
      {
        guidance: true,
        description:
          'Add or reorder a column through `customizeColumns`, building a new array from the base columns the callback receives.',
      },
      {
        guidance: false,
        description:
          'Expect `onChangeOrder` to fire out of the box — the sortable-key list is currently empty, so no base column carries a sorter and the callback only becomes reachable once `customizeColumns` adds a sortable column.',
      },
      {
        guidance: false,
        description:
          'Mutate the array handed to `customizeColumns`; return a newly built array instead.',
      },
    ],
  },
  props: [
    {
      name: 'schedulingHistoryFrgmt',
      type: 'BAISchedulingHistoryNodesFragment$key',
      description:
        'Plural fragment reference on `SessionSchedulingHistory` — the rows, in the order given. Null and undefined entries are filtered out before rendering.',
      required: true,
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every base column, making the headers non-sortable. Only observable once a column actually carries a sorter.',
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<SchedulingHistoryNodeInList>) => BAIColumnsType<SchedulingHistoryNodeInList>',
      description:
        'Transforms the eight base columns into the final column set — reorder, drop, or splice in a column. Left unset, the base columns are used as-is.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableHistorySorterValues)[number] | null) => void',
      description:
        'Called with the active sort key, or null when sorting is cleared. Overrides the BAITable prop of the same name to narrow the value to this table’s sorter vocabulary.',
    },
  ],
  examples: [
    {
      label: 'Rows from a scheduling-history query',
      code: `<BAISchedulingHistoryNodes
  resizable
  loading={deferredFetchKey !== fetchKey}
  schedulingHistoryFrgmt={filterOutNullAndUndefined(
    _.map(data.sessionScopedSchedulingHistories?.edges, 'node'),
  )}
  pagination={{
    current: tablePaginationOption.current,
    pageSize: tablePaginationOption.pageSize,
    total: data.sessionScopedSchedulingHistories?.count ?? 0,
    onChange: (current, pageSize) =>
      setTablePaginationOption({ current, pageSize }),
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
