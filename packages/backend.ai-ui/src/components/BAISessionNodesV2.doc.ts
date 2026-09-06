import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAISessionNodesV2',
  displayName: 'BAI Session Nodes V2',
  category: 'Table & List',
  keywords: [
    'session list',
    'session table',
    'sessions',
    'compute session',
    'relay fragment',
    'data grid',
  ],
  usage: {
    description:
      'The shared compute-session table, driven by a plural Relay fragment on SessionV2. It reads BAISessionNodesV2Fragment off the nodes it is handed and renders a BAITable with the standard session column set: name, session ID, status tag, AI accelerator, CPU, memory, live elapsed time, environment, resource group, session type, cluster mode, created-at, project and owner email — the less-used ones hidden by default and reachable through column settings. Occupied resources fall back from the allocated (used) entries to the requested ones, matching the v1 session list, and elapsed time ticks once a second through BAIIntervalView until the session terminates. Only name, status, createdAt, terminatedAt and id are sortable server-side, so onChangeOrder emits one of availableSessionV2SorterValues or null. Everything else — loading, order, rowSelection, pagination — passes through to BAITable, except dataSource, columns and onChangeOrder, which this component owns.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Spread BAISessionNodesV2Fragment into the query that fetches the session nodes, and hand the resulting node array straight to sessionsFrgmt.',
      },
      {
        guidance: true,
        description:
          'Add name links and row actions (terminate, restart) through customizeColumns rather than rebuilding the table, so every session surface keeps the same columns and formatting.',
      },
      {
        guidance: true,
        description:
          'Map the onChangeOrder value onto the query orderBy with convertToOrderBy and refetch — the table only reports the requested order, it does not sort locally.',
      },
      {
        guidance: false,
        description:
          'Pass dataSource or columns; they are omitted from the props type because the fragment and the generated column set are the source of truth.',
      },
      {
        guidance: false,
        description:
          'Leave sorters enabled on a surface whose query cannot reorder — set disableSorter so no column advertises sorting the backend will not honour.',
      },
    ],
  },
  props: [
    {
      name: 'sessionsFrgmt',
      type: 'BAISessionNodesV2Fragment$key',
      description:
        'The plural SessionV2 fragment reference for the rows. Null and undefined entries are filtered out before rendering.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnType<SessionV2InList>[]) => BAIColumnType<SessionV2InList>[]',
      description:
        'Last-pass hook over the generated columns. Use it to swap the plain-text name cell for a link or a BAINameActionCell, or to add app-only columns; the returned array is what the table renders.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the sorter flag from every column, for surfaces whose query has no ordering to offer.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableSessionV2SorterValues)[number] | null) => void',
      description:
        'Fired when the user changes sorting, with a value from availableSessionV2SorterValues (a leading "-" meaning descending) or null when sorting is cleared.',
    },
  ],
  examples: [
    {
      label: 'Project session list with row actions',
      code: `<BAISessionNodesV2
  sessionsFrgmt={sessionNodes}
  loading={isLoading}
  order={queryParams.order}
  onChangeOrder={(order) => setQueryParams({ order })}
  customizeColumns={(columns) =>
    columns.map((column) =>
      column.key === 'name'
        ? { ...column, render: (__, session) => <SessionNameCell session={session} /> }
        : column,
    )
  }
/>`,
    },
    {
      label: 'Read-only session list without sorting',
      code: `<BAISessionNodesV2 sessionsFrgmt={sessionNodes} disableSorter />`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
