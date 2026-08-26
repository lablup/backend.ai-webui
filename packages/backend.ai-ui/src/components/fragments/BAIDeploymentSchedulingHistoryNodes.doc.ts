import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentSchedulingHistoryNodes',
  displayName: 'BAI Deployment Scheduling History Nodes',
  category: 'Table & List',
  keywords: [
    'deployment',
    'scheduling',
    'history',
    'table',
    'phase',
    'error code',
    'transition',
  ],
  usage: {
    description:
      'The presentational scheduling-history table for a model deployment — the `DeploymentHistory` counterpart of BAISchedulingHistoryNodes. It reads the plural Relay fragment `BAIDeploymentSchedulingHistoryNodesFragment` on `DeploymentHistory`, so the caller spreads that fragment on each history node in its own query and passes the array as `schedulingHistoryFrgmt`; null and undefined entries are dropped and rows are keyed by `id`. Ten columns are built internally — updated, created, phase, result (a BAISchedulingResultBadge), category, from-status, to-status, attempts, error code (monospace) and message (line breaks preserved, cell capped at 500px) — with `category` and `errorCode` being what this table adds over the session variant. Query orchestration, filtering and pagination stay with the caller; it renders BAITable, so every BAITable prop except `dataSource`, `columns` and `onChangeOrder` passes through, `expandable` included.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use BAIDeploymentSchedulingHistoryTable instead when rows should expand into their sub-steps — it wraps this component and owns the `expandable` wiring.',
      },
      {
        guidance: true,
        description:
          'Feed `loading` and `pagination` from the deployment-history query that produced the nodes, since this component stores neither.',
      },
      {
        guidance: true,
        description:
          'Hide or reorder the deployment-specific columns through `customizeColumns` when the surface is narrow, returning a new array built from the base one.',
      },
      {
        guidance: false,
        description:
          'Expect `onChangeOrder` to fire out of the box — the sortable-key list is currently empty, so no base column carries a sorter and the callback only becomes reachable once `customizeColumns` adds a sortable column.',
      },
      {
        guidance: false,
        description:
          'Reuse it for session scheduling history — the fragment is typed on `DeploymentHistory`, so a `SessionSchedulingHistory` node will not type-check.',
      },
    ],
  },
  props: [
    {
      name: 'schedulingHistoryFrgmt',
      type: 'BAIDeploymentSchedulingHistoryNodesFragment$key',
      description:
        'Plural fragment reference on `DeploymentHistory` — the rows, in the order given. Null and undefined entries are filtered out before rendering.',
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
      type: '(baseColumns: BAIColumnsType<DeploymentSchedulingHistoryNodeInList>) => BAIColumnsType<DeploymentSchedulingHistoryNodeInList>',
      description:
        'Transforms the base columns into the final column set — reorder, drop, or splice in a column. Left unset, the base columns are used as-is.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableDeploymentHistorySorterValues)[number] | null) => void',
      description:
        'Called with the active sort key, or null when sorting is cleared. Overrides the BAITable prop of the same name to narrow the value to this table’s sorter vocabulary.',
    },
  ],
  examples: [
    {
      label: 'Deployment history rows from a query',
      code: `<BAIDeploymentSchedulingHistoryNodes
  resizable
  loading={isPendingRefetch}
  schedulingHistoryFrgmt={filterOutNullAndUndefined(
    _.map(data.deploymentHistories?.edges, 'node'),
  )}
  pagination={{
    current: tablePaginationOption.current,
    pageSize: tablePaginationOption.pageSize,
    total: data.deploymentHistories?.count ?? 0,
    onChange: (current, pageSize) =>
      setTablePaginationOption({ current, pageSize }),
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
