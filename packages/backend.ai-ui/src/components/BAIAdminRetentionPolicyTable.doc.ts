import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIAdminRetentionPolicyTable',
  displayName: 'BAI Admin Retention Policy Table',
  category: 'Table & List',
  keywords: [
    'retention',
    'retention policy',
    'data retention',
    'cleanup',
    'sweep',
    'maintenance',
    'table',
    'grid',
    'data table',
    'policy',
  ],
  usage: {
    description:
      'The presentational table over a plural `RetentionPolicy` Relay fragment, used by the Data Retention tab of the Maintenance page. It renders the localized record category, the retention period in days, whether the policy is enabled, and when it was last cleaned up ("Not run yet" when it never ran), with the creation and update times as hidden-by-default columns. Category, last cleanup and creation time are server-sortable and the choice is emitted as an order string rather than sorted locally. Pagination, query orchestration, the enable toggle and row actions belong to the consuming surface: it renders BAITable, and every remaining BAITableProps prop passes straight through.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Add the edit and delete row actions by overriding the `category` column in `customizeColumns` with a BAINameActionCell whose title is the base column render, keeping the deletion behind BAIDeleteConfirmModal with `requireConfirmInput`.',
      },
      {
        guidance: true,
        description:
          'Replace the read-only `enabled` column in `customizeColumns` with an inline Switch when the page can update the policy, keeping the mutation and its per-row pending state in the page.',
      },
      {
        guidance: true,
        description:
          'Translate `onChangeOrder` into the query `orderBy`, and drive `order` from the same variables, so the sort survives a reload.',
      },
      {
        guidance: false,
        description:
          'Run pagination or mutations inside this component; pass `pagination`, `loading` and the fragment references down from the page that owns the query.',
      },
    ],
  },
  props: [
    {
      name: 'retentionPoliciesFrgmt',
      type: 'BAIAdminRetentionPolicyTableFragment$key',
      description:
        'Plural fragment reference for the `RetentionPolicy` rows to render. Null and undefined entries are dropped before the table sees them.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<RetentionPolicyInList>) => BAIColumnsType<RetentionPolicyInList>',
      description:
        'Transforms the built-in column list before render — the hook for adding row actions, an editable enabled switch, or widths. Receives the columns in display order and must return the full list.',
    },
    {
      name: 'disableSorter',
      type: 'boolean',
      description:
        'Strips the `sorter` flag from every column, turning the table into a fixed-order view. Use it where the surrounding query cannot re-order.',
    },
    {
      name: 'onChangeOrder',
      type: "(order: 'category' | '-category' | 'createdAt' | '-createdAt' | 'lastSweptAt' | '-lastSweptAt' | null) => void",
      description:
        'Fired when the user sorts, with a key optionally prefixed by "-" for descending, or null when sorting is cleared. Convert it to the query `orderBy`; the table does not sort its own rows.',
    },
  ],
  examples: [
    {
      label: 'Policy list with row actions',
      code: `<BAIAdminRetentionPolicyTable
  retentionPoliciesFrgmt={policies}
  loading={isPending}
  order={order}
  onChangeOrder={(nextOrder) =>
    onReload({
      ...variables,
      orderBy: convertToOrderBy<RetentionPolicyOrderBy>(nextOrder),
    })
  }
  customizeColumns={(columns) =>
    _.map(columns, (column) =>
      column.key === 'category'
        ? {
            ...column,
            render: (value, row, index) => (
              <BAINameActionCell
                title={column.render?.(value, row, index)}
                showActions="always"
                actions={rowActions(row)}
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
