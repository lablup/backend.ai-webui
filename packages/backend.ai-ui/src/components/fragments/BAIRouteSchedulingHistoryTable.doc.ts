import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIRouteSchedulingHistoryTable',
  displayName: 'BAI Route Scheduling History Table',
  category: 'Table & List',
  keywords: [
    'route',
    'routing',
    'scheduling',
    'history',
    'table',
    'expandable',
    'sub-step',
  ],
  usage: {
    description:
      'The route scheduling history shown in the route history modal. It reads the plural `BAIRouteSchedulingHistoryTableFragment` on `RouteHistory`, so the caller spreads that fragment on each history node and passes the array as `schedulingHistoryFrgmt`. The component wraps `BAIRouteSchedulingHistoryNodeTable`, which renders the columns (updated at, created at, phase, result badge, category, from / to status, attempts, error code, message), and adds the expandable sub-step layer that renders `BAISubStepNodes` inside an opened row. A row is expandable only when it has at least one executed sub-step for its phase, so rows holding just the trailing lifecycle marker stay flat, and the mode menu appears in the expand-column header only while at least one row in the current data set is expandable. `expandable` is owned by this component; every other prop — `disableSorter`, `customizeColumns`, `onChangeOrder` and the BAITable surface — passes through to the node table.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Persist the value from `onExpandModeChange` and feed it back through `expandMode`, so reopening the modal restores the chosen view.',
      },
      {
        guidance: true,
        description:
          'Leave `expandMode` unset to get the default "expand errors only" behaviour, which opens every non-success row that has detail.',
      },
      {
        guidance: true,
        description:
          'Order server-side through `onChangeOrder`, since neither this wrapper nor the underlying columns sort client-side.',
      },
      {
        guidance: false,
        description:
          'Use `BAIRouteSchedulingHistoryNodeTable` directly when sub-steps need to be readable — it renders rows with no expand affordance at all.',
      },
      {
        guidance: false,
        description:
          'Expect manual row toggles to survive a refetch: a changed data signature or mode re-applies the master mode and discards them.',
      },
    ],
  },
  props: [
    {
      name: 'schedulingHistoryFrgmt',
      type: 'BAIRouteSchedulingHistoryTableFragment$key',
      description:
        'Plural fragment reference for the rows. It selects the sub-step data the expand layer needs and spreads the node-table fragment, so one array feeds both halves; rows are keyed by `id`.',
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
      label: 'Inside the route history modal',
      code: `<BAIRouteSchedulingHistoryTable
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
