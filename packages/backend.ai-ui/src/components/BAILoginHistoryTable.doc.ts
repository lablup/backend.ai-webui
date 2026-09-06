import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAILoginHistoryTable',
  displayName: 'BAI Login History Table',
  category: 'Table & List',
  keywords: [
    'login history',
    'audit log',
    'sign in',
    'attempt',
    'table',
    'data table',
    'security',
  ],
  usage: {
    description:
      'The presentational table over a plural `LoginHistoryV2` Relay fragment, listing sign-in attempts and the session lifecycle events that follow them. It renders four columns — the attempt result as a BAITag, the domain, the login time formatted as `ll LTS`, and the failure reason — and result, domain and login time are server-sortable. The result is shown as the raw server enum (`FAILED_INVALID_CREDENTIALS`, `REVOKED_BY_ADMIN`, …) because those values are not translated; only the tag colour is mapped, so a success reads green, every failure red, an admin revoke or eviction amber, and the ordinary logout or expiry neutral. Login history is read-only, so unlike BAILoginSessionTable it carries no row actions. Filtering, pagination and query orchestration belong to the consuming surface: it renders BAITable, and every remaining BAITableProps prop passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Build the result filter from the exported `loginResultFilterOptions`, so the select offers exactly the enum members the colour map covers and stays in step when the backend adds one.',
      },
      {
        guidance: true,
        description:
          'Translate `onChangeOrder` into the query `orderBy` and reset the offset to 0, so a re-sort starts from the first page.',
      },
      {
        guidance: true,
        description:
          'Keep the raw enum spelling if you re-render the result column — the colour is what carries the meaning at a glance, and a translated label would break the match with the filter options.',
      },
      {
        guidance: false,
        description:
          'Add row actions through `customizeColumns` — the surface is a read-only record, and the acting-on-a-session case belongs to BAILoginSessionTable.',
      },
      {
        guidance: false,
        description:
          'Run pagination or filtering inside this component; pass `pagination`, `loading` and the filtered fragment references down from the page that owns the query.',
      },
    ],
  },
  props: [
    {
      name: 'loginHistoryFrgmt',
      type: 'BAILoginHistoryTableFragment$key',
      description:
        'Plural fragment reference for the `LoginHistoryV2` rows to render. Null and undefined entries are dropped before the table sees them.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<LoginHistoryNodeInList>) => BAIColumnsType<LoginHistoryNodeInList>',
      description:
        'Transforms the built-in column list before render — the hook for removing columns, setting widths, or reformatting a cell. Receives the columns in display order and must return the full list.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every column, turning the table into a fixed-order view. Use it where the surrounding query cannot re-order.',
    },
    {
      name: 'onChangeOrder',
      type: "(order: 'createdAt' | '-createdAt' | 'result' | 'domainName' | … | null) => void",
      description:
        'Fired when the user sorts, with a key optionally prefixed by "-" for descending, or null when sorting is cleared. Convert it to the query `orderBy`; the table does not sort its own rows.',
    },
  ],
  examples: [
    {
      label: 'Paginated login history',
      code: `<BAILoginHistoryTable
  loginHistoryFrgmt={filterOutNullAndUndefined(
    _.map(data.myLoginHistoryV2?.edges, 'node'),
  )}
  resizable
  loading={isRefetching}
  order={order}
  onChangeOrder={(nextOrder) =>
    onReload({
      ...queryRef.variables,
      orderBy: convertToOrderBy<LoginHistoryOrderBy>(nextOrder),
      offset: 0,
    })
  }
  pagination={{
    pageSize,
    current,
    total: data.myLoginHistoryV2?.count ?? 0,
    onChange: (nextCurrent, nextPageSize) =>
      onReload({
        ...queryRef.variables,
        limit: nextPageSize,
        offset: nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
      }),
  }}
/>`,
    },
    {
      label: 'Result filter options',
      code: `<BAISelect
  allowClear
  placeholder={t('loginHistory.Result')}
  options={loginResultFilterOptions}
  onChange={(value) => setResultFilter(value)}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
