import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminUserV2Table',
  displayName: 'BAI Admin User V2 Table',
  category: 'Table & List',
  keywords: [
    'user',
    'admin',
    'account',
    'table',
    'grid',
    'data table',
    'user management',
  ],
  usage: {
    description:
      'The presentational table over a plural `UserV2` Relay fragment, used by the admin user-management surfaces. It reads every user field the admin views need — email, local user id, username, full name, domain, integration name, role, resource policy, main access key, sudo and TOTP flags, allowed client IPs, status and status info, password-change flag, description, container UID/GID, and the created/modified timestamps — and renders them through BAIText, BooleanTag, BAITagList and BAIQuestionIconWithTooltip. Sorting is enabled only on the columns the server can order by (email, username, status, domainName, createdAt, modifiedAt), and it emits that choice as an order string rather than sorting locally. Filtering, pagination, query orchestration and row actions belong to the consuming surface: it renders BAITable, and every remaining BAITableProps prop passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Declare an `$isNotSupportTotp` boolean variable on the query that spreads the fragment — the TOTP fields are conditional on it — and drop the two TOTP columns in `customizeColumns` when the manager has no TOTP plugin.',
      },
      {
        guidance: true,
        description:
          'Add row actions by overriding the first column in `customizeColumns` with a BAINameActionCell, and give that column a `minWidth`, since the default proportional share pins every column to its 120px floor at this column count and clips the action buttons.',
      },
      {
        guidance: true,
        description:
          'Translate `onChangeOrder` into the query `orderBy` and reset the offset to 0, so a re-sort starts from the first page.',
      },
      {
        guidance: false,
        description:
          'Sort on a column outside the six server-sortable keys — the remaining columns are deliberately non-sortable because the backend cannot order by them.',
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
      name: 'usersFrgmt',
      type: 'BAIAdminUserV2TableFragment$key',
      description:
        'Plural fragment reference for the `UserV2` rows to render. Null and undefined entries are dropped before the table sees them.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnType<UserV2InList>[]) => BAIColumnType<UserV2InList>[]',
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
      type: "(order: 'email' | '-email' | 'username' | … | null) => void",
      description:
        'Fired when the user sorts, with a key optionally prefixed by "-" for descending, or null when sorting is cleared. Convert it to the query `orderBy`; the table does not sort its own rows.',
    },
  ],
  examples: [
    {
      label: 'Admin user management, with actions in the email column',
      code: `<BAIAdminUserV2Table
  usersFrgmt={filterOutNullAndUndefined(_.map(adminUsersV2?.edges, 'node'))}
  loading={isRefetching}
  order={order}
  onChangeOrder={(nextOrder) => setOrder(nextOrder)}
  customizeColumns={(baseColumns) => {
    const columns = isTOTPSupported
      ? baseColumns
      : baseColumns.filter(
          (column) =>
            column.key !== 'totp_activated' &&
            column.key !== 'totp_activated_at',
        );
    return [
      { ...columns[0], render: renderEmailWithActions, minWidth: 320 },
      ...columns.slice(1),
    ];
  }}
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
