import type { ComponentDoc } from '@astryxdesign/cli/authoring';

export const docs = {
  type: 'component',
  name: 'BAIProjectTable',
  displayName: 'BAI Project Table',
  category: 'Table & List',
  keywords: [
    'project',
    'group',
    'table',
    'list',
    'admin',
    'resource policy',
    'domain',
  ],
  usage: {
    description:
      "The project list on the admin Projects page. It reads the plural `BAIProjectTableFragment` on `GroupNode`, so the caller spreads that fragment on every group node in its own query and passes the array as `projectFragment`. Thirteen columns are built internally — name, domain, description, created at, type badge, total resource slots rendered as resource chips, resource policy, storage nodes (through the allowed-vfolder-hosts fragment the row already carries), scaling groups, container registry and registry project, copyable project ID, and integration ID. Sorting is enabled only on name, domain, created at, resource policy and ID. The component holds no row actions of its own: the page composes edit / deactivate / activate / purge by overriding the `name` column's `render` through `customizeColumns`. Rows are keyed by node `id`, and everything except `dataSource`, `columns`, `rowKey` and `onChangeOrder` passes through to BAITable.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Add per-row actions by overriding the `name` column inside `customizeColumns`, keeping the mutation logic in the app layer.',
      },
      {
        guidance: true,
        description:
          "Send the value from `onChangeOrder` straight to the server query and mirror it back through BAITable's `order`, since the table keeps no sort state of its own.",
      },
      {
        guidance: true,
        description:
          'Own pagination and row selection in the parent — the component renders whatever array it is given and resets nothing when the page changes.',
      },
      {
        guidance: false,
        description:
          'Expect a sort handle on every column; only name, domain, created at, resource policy and ID declare one, even though `is_active` is a valid server order key.',
      },
      {
        guidance: false,
        description:
          'Pass raw edges — unwrap and drop the empty entries first, because a null row would break the JSON-parsing cells.',
      },
    ],
  },
  props: [
    {
      name: 'projectFragment',
      type: 'BAIProjectTableFragment$key',
      description:
        'Plural fragment reference for the rows. Spread `BAIProjectTableFragment` on each `GroupNode` and pass the array.',
      required: true,
    },
    {
      name: 'customizeColumns',
      type: '(baseColumns: BAIColumnsType<ProjectInList>) => BAIColumnsType<ProjectInList>',
      description:
        'Insert, filter, reorder or re-render the base columns. Its return value replaces the base array entirely; unset means the base columns are used.',
    },
    {
      name: 'onChangeOrder',
      type: "(order: 'name' | 'id' | 'domain_name' | 'created_at' | 'is_active' | 'resource_policy' | '-name' | '-id' | '-domain_name' | '-created_at' | '-is_active' | '-resource_policy' | null) => void",
      description:
        'Called with the new order string when the user sorts, or `null` when the sort is cleared. Only the columns that declare a sorter can produce a value.',
    },
  ],
  examples: [
    {
      label: 'Project list with row actions on the name column',
      code: `<BAIProjectTable
  projectFragment={filterOutEmpty(group_nodes?.edges.map((e) => e?.node) ?? [])}
  loading={isPendingRefetch}
  order={queryParams.order}
  onChangeOrder={(order) => setQueryParams({ order })}
  customizeColumns={(columns) =>
    columns.map((col) =>
      col.key === 'name'
        ? {
            ...col,
            render: (_name: string, record: ProjectInList) => (
              <BAINameActionCell
                title={record.name}
                showActions="always"
                actions={buildProjectActions(record)}
              />
            ),
          }
        : col,
    )
  }
/>`,
    },
  ],
} satisfies ComponentDoc;

export default docs;
