import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIKeypairResourcePolicyV2Table',
  displayName: 'BAI Keypair Resource Policy V2 Table',
  category: 'Table & List',
  keywords: [
    'resource policy',
    'keypair',
    'quota',
    'limit',
    'table',
    'grid',
    'data table',
    'policy',
  ],
  usage: {
    description:
      'The presentational table over a plural `KeypairResourcePolicyV2` Relay fragment, used by the keypair resource policy admin page. It renders the policy name, the default-for-unspecified mode (with the tooltip explaining LIMITED vs UNLIMITED), the total resource slots as resource chips, concurrent sessions, cluster size, idle timeout, max session lifetime, the allowed storage hosts with their permission summary, max pending session count, max concurrent SFTP sessions, the pending-session resource slots, and the creation time. Unlimited values are shown as an infinity sign — a zero or null count, and a cluster size equal to the signed 32-bit ceiling, all mean "no limit". The columns the V2 order-by enum covers are server-sortable and the choice is emitted as an order string rather than sorted locally. Filtering, pagination, query orchestration and row actions belong to the consuming surface: it renders BAITable, and every remaining BAITableProps prop passes straight through.',
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
          'Keep a Suspense boundary above the table — the storage-host column fetches the vfolder host permission catalog to colour each host.',
      },
      {
        guidance: false,
        description:
          'Render an unlimited value in a custom column renderer — the built-in columns already normalize each field\'s own sentinel (0 for the non-null Int! fields, null for maxPendingSessionCount, which allows 0 as a real value) to the infinity sign, and a second spelling of "unlimited" reads as a different setting.',
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
      name: 'keypairResourcePoliciesFrgmt',
      type: 'BAIKeypairResourcePolicyV2TableFragment$key',
      description:
        'Plural fragment reference for the `KeypairResourcePolicyV2` rows to render. Null and undefined entries are dropped before the table sees them.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<KeypairResourcePolicyV2InList>) => BAIColumnsType<KeypairResourcePolicyV2InList>',
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
      code: `<BAIKeypairResourcePolicyV2Table
  keypairResourcePoliciesFrgmt={filterOutNullAndUndefined(
    _.map(data.adminKeypairResourcePoliciesV2?.edges, 'node'),
  )}
  loading={isRefetching}
  order={order}
  onChangeOrder={(nextOrder) =>
    onReload({
      ...queryRef.variables,
      orderBy: convertToOrderBy<KeypairResourcePolicyV2OrderBy>(nextOrder),
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
