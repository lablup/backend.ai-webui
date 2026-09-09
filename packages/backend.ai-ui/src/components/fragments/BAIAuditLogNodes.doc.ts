import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAuditLogNodes',
  displayName: 'BAI Audit Log Nodes',
  category: 'Table & List',
  keywords: ['audit', 'log', 'history', 'activity', 'event', 'table', 'trail'],
  usage: {
    description:
      'The shared audit-log table used by the session, vfolder and model-deployment detail surfaces. It reads the plural Relay fragment `BAIAuditLogNodesFragment` on `AuditLogV2`, so the caller spreads that fragment on each audit-log node in its own query and passes the array as `auditLogFrgmt`; null and undefined entries are dropped and rows are keyed by `id`. Ten columns are built internally — time, operation, status (a BAIAuditLogStatusTag), description, duration and triggered-by are visible by default, while entity type, entity id, request id and action id ship as `defaultHidden`. Filtering, pagination and refetch stay in the consuming surface; the component renders BAITable with resizing on and size "small", and every BAITable prop except `dataSource`, `columns` and `onChangeOrder` passes through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Convert `onChangeOrder` output with the shared `convertToOrderBy` helper and reset the offset to 0, so a re-sort starts from the first page.',
      },
      {
        guidance: true,
        description:
          'Scope the query to one resource and put the property filter and refresh button above the table, since the component renders neither.',
      },
      {
        guidance: true,
        description:
          'Expose the id columns through `tableSettings` rather than `customizeColumns` when the surface only needs them occasionally — they exist already and merely start hidden.',
      },
      {
        guidance: false,
        description:
          'Expect duration, description or the id columns to sort — only time, operation and status carry a sorter.',
      },
      {
        guidance: false,
        description:
          'Assume the triggered-by cell always shows an email; it renders "email (id)" only when the user’s `basicInfo.email` is present, and the user id alone otherwise.',
      },
    ],
  },
  props: [
    {
      name: 'auditLogFrgmt',
      type: 'BAIAuditLogNodesFragment$key',
      description:
        'Plural fragment reference on `AuditLogV2` — the rows, in the order given. Null and undefined entries are filtered out before rendering.',
      required: true,
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every base column, making the time, operation and status headers non-sortable.',
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<AuditLogNodeInList>) => BAIColumnsType<AuditLogNodeInList>',
      description:
        'Transforms the ten base columns into the final column set — reorder, drop, or splice in a column. Left unset, the base columns are used as-is.',
    },
    {
      name: 'onChangeOrder',
      type: '(order: (typeof availableAuditLogSorterValues)[number] | null) => void',
      description:
        'Called with the active sort key ("createdAt", "operation", "status", or their "-" prefixed descending form), or null when sorting is cleared.',
    },
  ],
  examples: [
    {
      label: 'Scoped audit log with server-side sort and pagination',
      code: `<BAIAuditLogNodes
  resizable
  loading={isRefetching}
  order={order}
  auditLogFrgmt={filterOutNullAndUndefined(
    _.map(data.scopedAuditLogsV2?.edges, 'node'),
  )}
  onChangeOrder={(nextOrder) => {
    onReload(
      {
        ...queryRef.variables,
        orderBy: convertToOrderBy<AuditLogOrderBy>(nextOrder),
        offset: 0,
      },
      { fetchPolicy: 'network-only' },
    );
  }}
  pagination={{
    pageSize,
    current,
    total: data.scopedAuditLogsV2?.count ?? 0,
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
