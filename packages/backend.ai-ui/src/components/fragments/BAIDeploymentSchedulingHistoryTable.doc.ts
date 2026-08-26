import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIDeploymentSchedulingHistoryTable',
  displayName: 'BAI Deployment Scheduling History Table',
  category: 'Table & List',
  keywords: [
    'deployment',
    'scheduling',
    'history',
    'timeline',
    'table',
    'expandable',
    'sub-step',
  ],
  usage: {
    description:
      'The deployment scheduling history shown in the deployment history modal. It reads the plural `BAIDeploymentSchedulingHistoryTableFragment` on `DeploymentHistory`, so the caller spreads that fragment on each history node and passes the array as `schedulingHistoryFrgmt`. The component is a thin wrapper over `BAIDeploymentSchedulingHistoryNodes`, which renders the actual columns (updated at, created at, phase, result badge, category, from / to status, attempts, error code, message); this wrapper adds the expandable sub-step layer, feeding each expanded row into `BAISubStepNodes`. A row is expandable only when it has at least one executed sub-step for its phase, so rows carrying nothing but the trailing lifecycle marker stay flat, and the expand-column header shows a mode menu only while some row in the current data set is expandable. `expandable` is owned by this component and cannot be passed in; every other prop — `disableSorter`, `customizeColumns`, `onChangeOrder` and the BAITable surface — passes through to the nodes table.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Persist the value from `onExpandModeChange` (per-user settings or a query param) and feed it back through `expandMode`, so a reload returns to the view the user chose.',
      },
      {
        guidance: true,
        description:
          'Leave `expandMode` unset to get the default "expand errors only" behaviour, which opens every non-success row that has detail.',
      },
      {
        guidance: true,
        description:
          'Order server-side through `onChangeOrder`, since the wrapper adds no sorting of its own and the underlying columns declare no sorter.',
      },
      {
        guidance: false,
        description:
          'Reach for `BAIDeploymentSchedulingHistoryNodes` directly when sub-steps matter — that component renders the rows without any expand affordance.',
      },
      {
        guidance: false,
        description:
          'Expect a manual row toggle to survive a refetch: when the data signature or the mode changes, the master mode is re-applied and per-row toggles are discarded.',
      },
    ],
  },
  props: [
    {
      name: 'schedulingHistoryFrgmt',
      type: 'BAIDeploymentSchedulingHistoryTableFragment$key',
      description:
        'Plural fragment reference for the rows. It selects the sub-step data the expand layer needs and spreads the nodes fragment, so the same array feeds both halves; rows are keyed by `id`.',
      required: true,
    },
    {
      name: 'expandMode',
      type: "'expand-all' | 'collapse-all' | 'errors-only'",
      description:
        'Controlled master mode for which rows start expanded. Unset, it behaves as "errors-only".',
      default: "'errors-only'",
    },
    {
      name: 'onExpandModeChange',
      type: '(mode: SchedulingHistoryExpandMode) => void',
      description:
        'Called when the user picks a mode from the expand-column header menu. The rows re-expand immediately either way; provide this only to own and persist the mode.',
    },
  ],
  examples: [
    {
      label: 'Inside the deployment history modal',
      code: `<BAIDeploymentSchedulingHistoryTable
  resizable
  schedulingHistoryFrgmt={filterOutEmpty(histories ?? [])}
  loading={isRefetchingInTransition}
  expandMode={expandMode ?? undefined}
  onExpandModeChange={setExpandMode}
  tableSettings={{ columnOverrides, onColumnOverridesChange: setColumnOverrides }}
  order={order}
  onChangeOrder={(nextOrder) => setOrder(nextOrder)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
