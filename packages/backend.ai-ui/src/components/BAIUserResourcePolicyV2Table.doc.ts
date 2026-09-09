import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIUserResourcePolicyV2Table',
  displayName: 'BAI User Resource Policy V2 Table',
  category: 'Table & List',
  keywords: [
    'resource policy',
    'quota',
    'limit',
    'table',
    'grid',
    'data table',
    'policy',
  ],
  usage: {
    description:
      'The presentational table over a plural `UserResourcePolicyV2` Relay fragment, used by the user resource policy admin page. It renders the policy name, max vfolder count, max concurrent logins, max session count per model session, max quota scope size, max customized image count, and the creation time. Unlimited values are shown as an infinity sign — a zero vfolder count, a null concurrent-login limit, and a quota scope expression of "-1" all mean "no limit" — and the quota size itself is humanized through `convertToDecimalUnit`. Every column is server-sortable and the choice is emitted as an order string rather than sorted locally. Filtering, pagination, query orchestration and row actions belong to the consuming surface: it renders BAITable, and every remaining BAITableProps prop passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Add the edit and delete row actions by overriding the `name` column in `customizeColumns` with a BAINameActionCell, keeping the deletion behind BAIDeleteConfirmModal with `requireConfirmInput`.',
      },
      {
        guidance: true,
        description:
          'Translate `onChangeOrder` into the query `orderBy` and reset the offset to 0, so a re-sort starts from the first page.',
      },
      {
        guidance: true,
        description:
          'Pass `tableSettings` from persisted state when the page offers column customization, so an admin keeps their column layout between visits.',
      },
      {
        guidance: false,
        description:
          'Render an unlimited value as 0 or -1 in a custom column renderer — the built-in columns already normalize those sentinels to the infinity sign, and a second spelling of "unlimited" reads as a different setting.',
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
      name: 'userResourcePoliciesFrgmt',
      type: 'BAIUserResourcePolicyV2TableFragment$key',
      description:
        'Plural fragment reference for the `UserResourcePolicyV2` rows to render. Null and undefined entries are dropped before the table sees them.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<UserResourcePolicyV2InList>) => BAIColumnsType<UserResourcePolicyV2InList>',
      description:
        'Transforms the built-in column list before render — the hook for adding row actions, removing columns, or setting widths. Receives the columns in display order and must return the full list.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every column, turning the table into a fixed-order view. Use it where the surrounding query cannot re-order.',
    },
    {
      name: 'onChangeOrder',
      type: "(order: 'name' | '-name' | 'createdAt' | … | null) => void",
      description:
        'Fired when the user sorts, with a key optionally prefixed by "-" for descending, or null when sorting is cleared. Convert it to the query `orderBy`; the table does not sort its own rows.',
    },
  ],
  examples: [
    {
      label: 'Policy list with row actions',
      code: `<BAIUserResourcePolicyV2Table
  userResourcePoliciesFrgmt={filterOutNullAndUndefined(
    _.map(data.adminUserResourcePoliciesV2?.edges, 'node'),
  )}
  loading={isRefetching}
  order={order}
  onChangeOrder={(nextOrder) =>
    onReload({
      ...queryRef.variables,
      orderBy: convertToOrderBy<UserResourcePolicyV2OrderBy>(nextOrder),
      offset: 0,
    })
  }
  customizeColumns={(columns) =>
    _.map(columns, (column) =>
      column.key === 'name'
        ? {
            ...column,
            render: (name: string, record) => (
              <BAINameActionCell
                title={name}
                showActions="always"
                actions={rowActions(record)}
              />
            ),
          }
        : column,
    )
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
