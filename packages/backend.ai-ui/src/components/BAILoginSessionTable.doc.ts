import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAILoginSessionTable',
  displayName: 'BAI Login Session Table',
  category: 'Table & List',
  keywords: [
    'login session',
    'session',
    'active sessions',
    'access key',
    'table',
    'data table',
    'security',
  ],
  usage: {
    description:
      'The presentational table over a plural `LoginSessionV2` Relay fragment, listing the sign-in sessions currently on record. It renders three columns — the session owner (the user email, falling back to a dash), the access key as monospace copyable text, and the creation time formatted as `ll LTS` — and only the created-at column is server-sortable. Session status and the invalidated-at time are deliberately not selected, because the backend does not write them yet. Filtering, pagination, query orchestration and the revoke action belong to the consuming surface: it renders BAITable, and every remaining BAITableProps prop passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Add the revoke action by overriding the `user` column in `customizeColumns` with a BAINameActionCell whose action carries a `popConfirm` — revoking a session is recoverable by signing in again, so the anchored confirm is the right tier.',
      },
      {
        guidance: true,
        description:
          'Show the access key in the revoke confirmation description, so the admin can tell two sessions of the same user apart before confirming.',
      },
      {
        guidance: true,
        description:
          'Translate `onChangeOrder` into the query `orderBy` and reset the offset to 0, so a re-sort starts from the first page.',
      },
      {
        guidance: false,
        description:
          'Expect a status or invalidated-at column — the fragment does not select those fields, so they cannot be rendered or filtered here.',
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
      name: 'loginSessionsFrgmt',
      type: 'BAILoginSessionTableFragment$key',
      description:
        'Plural fragment reference for the `LoginSessionV2` rows to render. Null and undefined entries are dropped before the table sees them.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<LoginSessionNodeInList>) => BAIColumnsType<LoginSessionNodeInList>',
      description:
        'Transforms the built-in column list before render — the hook for adding the revoke action, removing columns, or setting widths. Receives the columns in display order and must return the full list.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every column, turning the table into a fixed-order view. Use it where the surrounding query cannot re-order.',
    },
    {
      name: 'onChangeOrder',
      type: "(order: 'createdAt' | '-createdAt' | null) => void",
      description:
        'Fired when the user sorts by creation time, with a "-" prefix for descending, or null when sorting is cleared. Convert it to the query `orderBy`; the table does not sort its own rows.',
    },
  ],
  examples: [
    {
      label: 'Session list with a revoke row action',
      code: `<BAILoginSessionTable
  loginSessionsFrgmt={filterOutNullAndUndefined(
    _.map(data.myLoginSessionsV2?.edges, 'node'),
  )}
  resizable
  loading={isRefetching}
  order={order}
  onChangeOrder={(nextOrder) =>
    onReload({
      ...queryRef.variables,
      orderBy: convertToOrderBy<LoginSessionOrderBy>(nextOrder),
      offset: 0,
    })
  }
  customizeColumns={(baseColumns) =>
    _.map(baseColumns, (column) =>
      column.key === 'user'
        ? {
            ...column,
            render: (__: unknown, record: LoginSessionNodeInList) => (
              <BAINameActionCell
                title={record.user?.basicInfo.email || '-'}
                showActions="always"
                actions={[
                  {
                    key: 'revoke',
                    title: t('loginSession.RevokeSession'),
                    icon: <LogOut size="1em" />,
                    type: 'danger' as const,
                    popConfirm: {
                      title: t('loginSession.RevokeSessionConfirm'),
                      description: record.accessKey,
                      okText: t('button.Revoke'),
                      okButtonProps: { danger: true },
                      cancelText: t('button.Cancel'),
                      onConfirm: () => revokeSession(record),
                    },
                  },
                ]}
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
