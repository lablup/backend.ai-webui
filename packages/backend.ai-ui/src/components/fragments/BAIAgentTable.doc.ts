import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAgentTable',
  displayName: 'BAI Agent Table',
  category: 'Table & List',
  keywords: [
    'agent',
    'node',
    'table',
    'resource',
    'utilization',
    'allocation',
    'cluster',
  ],
  usage: {
    description:
      'The agent list on the admin Agents page. It reads the plural `BAIAgentTableFragment` on `AgentNode`, so the caller spreads that fragment on every agent node in its own query and passes the resulting array as `agentsFragment`. Twelve columns are built internally — ID / endpoint, region, architecture, version, start time with a live "running for" tag, lost time, per-slot allocation bars, live utilization, disk percentage, resource group, status tags and schedulable — and every cell that parses a JSON field (`occupied_slots`, `available_slots`, `live_stat`, `compute_plugins`) sits behind an error boundary that degrades to a single warning icon instead of failing the page. Version and lost time are `defaultHidden`: they exist so the server-side `version` and `lost_at` orderings are reachable, and the user opts into them through the table column settings. Eight columns carry a sorter — ID (ordered by `id`), region, version, start time, lost time, resource group, status and schedulable; architecture, allocation, utilization and disk percentage render but cannot be sorted, because the server has no order key for them. It needs a connected BAI client and the resource-slot metadata provider above it, since unit labels and elapsed time come from there. Everything except `dataSource`, `columns` and `onChangeOrder` passes through to BAITable.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Drive the query order from `onChangeOrder`, which hands back one of the eight sortable keys optionally prefixed with `-`, and feed the current value back through BAITable's `order` prop.",
      },
      {
        guidance: true,
        description:
          'Use `customizeColumns` to reorder, drop or re-render columns — it receives the base array and its return value is used verbatim.',
      },
      {
        guidance: true,
        description:
          'Render the table inside the resource-slot and client providers, because the allocation and utilization cells read display units, human-readable slot names and elapsed time from them.',
      },
      {
        guidance: false,
        description:
          'Rely on the utilization column when an agent is not `ALIVE` — for every other status it renders a "no live stat" message instead of gauges.',
      },
      {
        guidance: false,
        description:
          'Mutate the array handed to `customizeColumns`; build and return a new array from its entries.',
      },
      {
        guidance: false,
        description:
          'Pick columns out of `customizeColumns` by position (`baseColumns[0]`, `baseColumns.slice(3)`) — match on `column.key` instead. The base list grows, so an index slice silently drops whichever column moved into the gap.',
      },
    ],
  },
  props: [
    {
      name: 'agentsFragment',
      type: 'BAIAgentTableFragment$key',
      description:
        'Plural fragment reference for the rows. Spread `BAIAgentTableFragment` on each `AgentNode` and pass the array; rows are keyed by the node `id`.',
      required: true,
    },
    {
      name: 'onClickAgentName',
      type: '(agent: AgentNodeInList) => void',
      description:
        'Called with the clicked row when set. Providing it is what turns the agent ID cell into a link — without it the ID renders as plain text and nothing is clickable.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableAgentSorterValues)[number] | undefined) => void',
      description:
        'Called when the user changes sorting, with the order string to send to the server; clearing the sort passes a null-ish value. The value is one of `availableAgentSorterKeys` (`id`, `first_contact`, `scaling_group`, `status`, `schedulable`, `region`, `version`, `lost_at`), optionally prefixed with `-` for descending. Only the eight sortable columns can trigger it.',
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnType<AgentNodeInList>[]) => BAIColumnType<AgentNodeInList>[]',
      description:
        'Transforms the built-in column list before it reaches the table. Left unset, the base columns are used as-is.',
    },
  ],
  examples: [
    {
      label:
        'Agent list with a replaced region column (match by key, never by index)',
      code: `<BAIAgentTable
  resizable
  agentsFragment={filterOutEmpty(agent_nodes?.edges.map((e) => e?.node) ?? [])}
  onClickAgentName={(agent) => setCurrentAgentInfo(agent)}
  customizeColumns={(baseColumns) =>
    _.map(baseColumns, (column) =>
      column.key === 'region' ? regionColumn : column,
    )
  }
  order={queryParams.order}
  onChangeOrder={(order) => setQueryParams({ order })}
  loading={isPendingRefetch}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
