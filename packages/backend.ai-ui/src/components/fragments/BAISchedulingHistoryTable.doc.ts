import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISchedulingHistoryTable',
  displayName: 'BAI Scheduling History Table',
  category: 'Table & List',
  keywords: [
    'scheduling',
    'history',
    'session',
    'table',
    'expandable',
    'sub-step',
    'timeline',
  ],
  usage: {
    description:
      'The expandable session scheduling-history table — BAISchedulingHistoryNodes plus the sub-step drill-down. It reads its own plural fragment `BAISchedulingHistoryTableFragment` on `SessionSchedulingHistory`, which selects `phase`, `result` and `subSteps` and spreads both `BAISchedulingHistoryNodesFragment` and `BAISubStepNodesFragment`, so the caller spreads only `BAISchedulingHistoryTableFragment` on each history node and passes the array as `schedulingHistoryFrgmt`. A row is expandable only when it has at least one executed sub-step for its phase, and expanding it renders a BAISubStepNodes timeline. The expand-icon column header carries a master-mode menu (expand all / collapse all / errors only, the default) that can be lifted into caller state with `expandMode` and `onExpandModeChange`. Everything else — the columns, `loading`, `pagination`, `tableSettings` — is forwarded to BAISchedulingHistoryNodes and on to BAITable, except `schedulingHistoryFrgmt` and `expandable`, which this component owns.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Persist the master mode by pairing `expandMode` with `onExpandModeChange`, so the choice survives a refetch or a modal reopen.',
      },
      {
        guidance: true,
        description:
          'Spread `BAISchedulingHistoryTableFragment` rather than the nodes fragment, since the nodes fragment alone carries no `subSteps` and every row would then be non-expandable.',
      },
      {
        guidance: true,
        description:
          'Use plain BAISchedulingHistoryNodes when the surface has no room for a drill-down and the sub-step detail is not wanted.',
      },
      {
        guidance: false,
        description:
          'Pass `expandable` yourself — this component builds it and the prop is omitted from its props type.',
      },
      {
        guidance: false,
        description:
          'Assume every row can be opened; rows whose executed sub-step count for their phase is zero stay collapsed in all three modes.',
      },
    ],
  },
  props: [
    {
      name: 'schedulingHistoryFrgmt',
      type: 'BAISchedulingHistoryTableFragment$key',
      description:
        'Plural fragment reference on `SessionSchedulingHistory`, carrying the sub-step data as well as the nodes-table spread. Overrides the same-named prop of BAISchedulingHistoryNodes, which takes the narrower nodes fragment.',
      required: true,
    },
    {
      name: 'expandMode',
      type: "'expand-all' | 'collapse-all' | 'errors-only'",
      description:
        'Controlled master mode for which rows start expanded. Left unset, the hook defaults to "errors-only", which opens every expandable row whose result is not SUCCESS.',
    },
    {
      name: 'onExpandModeChange',
      type: '(mode: SchedulingHistoryExpandMode) => void',
      description:
        'Called when the user picks a mode from the expand-column header menu. Pair it with `expandMode` to own and persist the value.',
    },
  ],
  examples: [
    {
      label: 'Inside a scheduling-history modal',
      code: `<BAISchedulingHistoryTable
  resizable
  schedulingHistoryFrgmt={filterOutNullAndUndefined(
    _.map(data.sessionScopedSchedulingHistories?.edges, 'node'),
  )}
  loading={deferredFetchKey !== fetchKey}
  order={order}
  onChangeOrder={(nextOrder) => {
    setOrder(nextOrder);
    setTablePaginationOption({ current: 1 });
  }}
  expandMode={expandMode ?? undefined}
  onExpandModeChange={setExpandMode}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
