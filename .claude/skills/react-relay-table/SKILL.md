---
name: react-relay-table
description: >
  Use when creating a `*Nodes` component bound to a Relay fragment, wiring a
  page to one with `customizeColumns` / URL state / pagination, adding row
  selection and bulk actions, or setting up CSV export. Covers the query
  orchestrator + fragment split and `BAITable` conventions.
---

# Relay Fragment Tables

Patterns extracted from `BAIUserNodes`, `SessionNodes`, `VFolderNodes`,
`UserManagement.tsx`, and `AdminComputeSessionListPage.tsx`. Relevant PRs:
FR-319 (#2932) intro NEO list, FR-465 (#3104) NEO prop, FR-448 (#3170) tab
counts, FR-466/883 (#3586) sort cycle, FR-966 (#3627) custom pagination slot,
FR-1315 (#4063) column visibility, FR-1804 (#4863) `customizeColumns`,
FR-1788 (#4820) `BooleanTagWithFallBack`.

See the `create-relay-nodes-component` skill for a generator that creates a
fresh `*Nodes` file skeleton; this skill documents the patterns that skeleton
should conform to and how the orchestrator page binds to it.

## Activation Triggers

- Creating a new `*Nodes` component bound to a GraphQL type
- Creating or modifying a page that embeds a `*Nodes` table
- Adding/removing/reordering columns from a consumer via `customizeColumns`
- Wiring table sort / filter / pagination to URL query params
- Column visibility settings (`tableSettings.columnOverrides`)
- CSV export of table data

Also consult:
- `relay-patterns` — general fragment architecture
- `react-url-state` — the nuqs side of pagination / filter state
- `react-suspense-fetching` — fetchKey / deferred variables

## Gotchas

- **`tablePaginationOption.current` is 1-indexed, `baiPaginationOption.offset` is 0-indexed.** `useBAIPaginationOptionStateOnSearchParam` converts via `(current - 1) * pageSize` — don't swap them.
- **`@relay(plural: true)` fragment** needs an *array* of refs. Pass `edges.map((e) => e.node)` through `filterOutNullAndUndefined`, not the raw edge array.
- **`@catch(to: RESULT)` changes the return shape** to `{ ok, value } | { ok: false, ... }`. Consumers must check `.ok` before accessing `.value`.
- **`customizeColumns(base)` runs on every render.** The passed function should be stable (React Compiler handles this under `'use memo'`) — don't do heavy work inside.
- **Duplicate column `key`** silently breaks the column-visibility settings modal AND CSV export. Keys must be unique across base + customized columns.
- **`fixed: true` + `required: true` on the primary column** means users can't hide it or scroll it off-screen. Apply only to the identifying column (email / name / id).
- **`exportKey` is required when `dataIndex` doesn't match the GraphQL field name.** Without it, CSV export writes `undefined` for computed columns (e.g. `project` column exporting `project_name`).
- **`availableXxxSorterKeys` is the single source of truth.** Adding a sortable column means updating the const array AND the column's `sorter: isEnableSorter('key')`.

## 1. Two-file architecture: orchestrator vs `*Nodes`

```
Page/*Management component (orchestrator)       `*Nodes` component (fragment)
├── useLazyLoadQuery + fetchKey + useDeferred   ├── useFragment with @relay(plural: true)
├── nuqs URL state (order, filter, status)      ├── Exports `UserNodeInList` type
├── useBAIPaginationOptionStateOnSearchParam    ├── Owns `baseColumns`
├── Passes `usersFrgmt={edges.map(node)}`       ├── Applies `customizeColumns?(base)`
├── Passes `customizeColumns={…}`               ├── Renders <BAITable>
└── Passes pagination / selection props         └── Emits `onChangeOrder`
```

The `*Nodes` component is **dumb about fetching** — it does not trigger refetches,
does not own the URL state, does not know about `fetchKey`. All of that lives on
the orchestrator. This is what makes `customizeColumns` composable.

## 2. Fragment Component Skeleton

```tsx
import { BAITable, BAIColumnType, BAITableProps, filterOutNullAndUndefined }
  from '..';

export type UserNodeInList = NonNullable<BAIUserNodesFragment$data[number]>;

const availableUserSorterKeys = [
  'email', 'username', 'full_name', 'role', 'created_at',
] as const;
export const availableUserSorterValues = [
  ...availableUserSorterKeys,
  ...availableUserSorterKeys.map((k) => `-${k}` as const),
] as const;

const isEnableSorter = (key: string) =>
  _.includes(availableUserSorterKeys, key);

interface BAIUserNodesProps extends Omit<
  BAITableProps<UserNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  usersFrgmt: BAIUserNodesFragment$key;
  customizeColumns?: (base: BAIColumnType<UserNodeInList>[]) =>
    BAIColumnType<UserNodeInList>[];
  disableSorter?: boolean;
  onChangeOrder?: (order: (typeof availableUserSorterValues)[number] | null) =>
    void;
}

const BAIUserNodes: React.FC<BAIUserNodesProps> = ({
  usersFrgmt, customizeColumns, disableSorter, onChangeOrder, ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const users = useFragment(graphql`
    fragment BAIUserNodesFragment on UserNode @relay(plural: true) {
      id @required(action: NONE)
      email @required(action: NONE)
      username
      // … fields the table might ever render
    }
  `, usersFrgmt);

  const baseColumns = _.map(
    filterOutEmpty<BAIColumnType<UserNodeInList>>([
      {
        key: 'email',
        title: t('comp:UserNodes.Email'),
        sorter: isEnableSorter('email'),
        dataIndex: 'email',
        fixed: true,
        required: true,
        render: (__, record) => <BAIText copyable>{record.email}</BAIText>,
      },
      // … more columns
    ]),
    (column) => disableSorter ? _.omit(column, 'sorter') : column,
  );

  const allColumns = customizeColumns ? customizeColumns(baseColumns) : baseColumns;

  return (
    <BAITable
      resizable
      rowKey="id"
      size="small"
      dataSource={filterOutNullAndUndefined(users)}
      columns={allColumns}
      scroll={{ x: 'max-content' }}
      onChangeOrder={(order) =>
        onChangeOrder?.((order as (typeof availableUserSorterValues)[number]) || null)
      }
      {...tableProps}
    />
  );
};
export default BAIUserNodes;
```

### Key invariants

- Fragment is `@relay(plural: true)` — `usersFrgmt` is an array of refs,
  orchestrator passes `edges.map((e) => e.node)`.
- All i18n keys under the `comp:` namespace (`comp:UserNodes.Email`).
- `@required(action: NONE)` on id and the human-key field (`email`/`name`).
- `fixed: true` + `required: true` on the primary identifying column so
  column settings UI can't hide it and it doesn't scroll horizontally.
- Sorter keys live in a `const as const` array once, reused for prop typing.
- Order descending by default on `created_at` if present: `defaultSortOrder: 'descend'`.

## 3. `customizeColumns` composition

Consumers override, not append. Array-based `extraColumns` is the old pattern
and should be migrated.

```tsx
// ❌ Old array-based API (can only append at the end)
<BAIUserNodes extraColumns={[actionColumn]} />

// ✅ Function-based: full control
<BAIUserNodes
  usersFrgmt={…}
  customizeColumns={(baseColumns) => [
    { ...baseColumns[0], render: renderEmailWithActions }, // wrap primary column
    ...baseColumns.slice(1),                                // keep the rest
  ]}
/>

// ✅ Filter + reorder example
customizeColumns={(base) =>
  base
    .filter((c) => c.key !== 'container_gids')
    .map((c) => c.key === 'role' ? { ...c, width: 200 } : c)
}
```

When a consumer needs to inject an action column mid-table, use
`baseColumns.slice(0, n)` + new column + `baseColumns.slice(n)`.

## 4. Orchestrator Wiring (full example)

```tsx
const UserManagement: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // URL state (see react-url-state)
  const [queryParams, setQueryParams] = useQueryStates({
    filter: parseAsString.withDefault(''),
    order: parseAsString,   // null means default; enables ascend/descend/null cycle
    status: parseAsStringLiteral(['active', 'inactive']).withDefault('active'),
  });

  const { baiPaginationOption, tablePaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    first: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    filter: mergeFilterValues([queryParams.filter, statusFilter]),
    order: queryParams.order || '-created_at',   // fall back in variables, not URL
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { user_nodes } = useLazyLoadQuery<UserManagementQuery>(
    graphql`
      query UserManagementQuery(
        $first: Int, $offset: Int, $filter: String, $order: String
      ) {
        user_nodes(first: $first, offset: $offset, filter: $filter, order: $order) {
          count
          edges {
            node {
              id @required(action: THROW)
              email @required(action: THROW)
              ...BAIUserNodesFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
    },
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.UserManagement',
  );
  const { supportedFields, exportCSV } = useCSVExport('users');

  return (
    <BAIUserNodes
      usersFrgmt={filterOutNullAndUndefined(_.map(user_nodes?.edges, 'node'))}
      customizeColumns={(base) => [
        { ...base[0], render: renderEmailWithActions },
        ...base.slice(1),
      ]}
      scroll={{ x: 'max-content' }}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        total: user_nodes?.count || 0,
        current: tablePaginationOption.current,
        onChange: (current, pageSize) => setTablePaginationOption({ current, pageSize }),
      }}
      onChangeOrder={(next) => setQueryParams({ order: next })}
      order={queryParams.order}
      loading={
        deferredQueryVariables !== queryVariables ||
        deferredFetchKey !== fetchKey
      }
      tableSettings={{
        columnOverrides,
        onColumnOverridesChange: setColumnOverrides,
      }}
      exportSettings={!_.isEmpty(supportedFields) ? {
        supportedFields,
        onExport: async (keys) => { await exportCSV(keys, { status: [queryParams.status] }); },
      } : undefined}
    />
  );
};
```

Key points:

- **`loading` derives from deferred equality**, not a manual `useState(false)`.
- **Default order lives in `queryVariables`, not URL state** — so `?order=` stays
  clean but the API still gets `-created_at`. Supports null → ascend → descend → null cycle.
- **`fetchKey` deferred separately** so hitting refresh doesn't tear state twice.
- **Column overrides persist in user settings** via
  `useBAISettingUserState('table_column_overrides.<StableKey>')`.

## 5. Selection, Bulk Actions

```tsx
const [selected, setSelected] = useState<UserNode[]>([]);

<BAIUserNodes
  usersFrgmt={…}
  rowSelection={{
    type: 'checkbox',
    selectedRowKeys: _.compact(selected.map((u) => u.node?.id)),
    onChange: (keys) => {
      const edges = _.compact(user_nodes?.edges);
      setSelected(edges.filter((e) => e.node && keys.includes(e.node.id)));
    },
  }}
/>

// visible counter + bulk action buttons
{selected.length > 0 && (
  <BAIFlex gap="xs">
    <BAISelectionLabel count={selected.length} onClearSelection={() => setSelected([])} />
    <BAIButton icon={<EditIcon />} onClick={…} />
  </BAIFlex>
)}
```

## 6. Filter UX: `BAIPropertyFilter`

Use `BAIPropertyFilter` with `filterOutEmpty` to compose feature-flagged rules:

```tsx
<BAIPropertyFilter
  filterProperties={filterOutEmpty([
    { key: 'email', propertyLabel: t('general.E-Mail'), type: 'string' },
    bailClient.supports('user-node-query-project-filter') && {
      key: 'project_name', propertyLabel: t('general.Project'), type: 'string',
    },
    { key: 'role', propertyLabel: t('credential.Role'), type: 'string',
      strictSelection: true, defaultOperator: '==',
      options: [{ label: 'superadmin', value: 'superadmin' }] },
  ])}
  value={queryParams.filter || undefined}
  onChange={(v) => setQueryParams({ filter: v || '' })}
/>
```

- Pass `undefined` (not `''`) into `value` so the filter pill doesn't render for an empty filter.
- Use `mergeFilterValues([queryParams.filter, statusFilter, typeFilter])` to
  compose URL filter with page-derived fragments (e.g. status tab).

## 7. Refresh Button

```tsx
<BAIFetchKeyButton
  loading={deferredFetchKey !== fetchKey}
  value={fetchKey}
  onChange={updateFetchKey}
/>
```

Its `loading` binds to the deferred/non-deferred comparison, so spinning state
matches the actual query.

## 8. Column Visibility / Export

`tableSettings.columnOverrides` + `exportSettings` plug into the column-settings
modal baked into `BAITable` (FR-1315, FR-1443). Persist overrides per-page
under a stable key:

```tsx
useBAISettingUserState('table_column_overrides.AdminComputeSessionListPage')
useBAISettingUserState('table_column_overrides.UserManagement')
```

For CSV, declare `exportKey` on a column when its GraphQL field name differs
from `dataIndex`:

```tsx
{ key: 'id', title: 'ID', exportKey: 'uuid', render: … }
{ key: 'project', title: t('comp:UserNodes.Project'), exportKey: 'project_name', render: … }
```

## Related Skills

- **`create-relay-nodes-component`** — generator that scaffolds a fresh `*Nodes` file
- **`relay-patterns`** — general Relay fragment architecture
- **`react-url-state`** — URL side of filter / order / pagination state
- **`react-suspense-fetching`** — `fetchKey` + `useDeferredValue` on the orchestrator
- **`react-async-actions`** — bulk-action buttons and row-level mutations
- **`relay-infinite-scroll-select`** — select-based variant (not table-based)

## 9. Verification Checklist

- [ ] `*Nodes` file does not call `useLazyLoadQuery`.
- [ ] Orchestrator page passes a plain array of nodes, not the edge array.
- [ ] `availableXxxSorterValues` is a single source of truth, reused on both sides.
- [ ] Primary column is `fixed: true` and `required: true`.
- [ ] Consumers override columns via `customizeColumns`, never by extending an `extraColumns` array.
- [ ] `loading` on the table binds to deferred-variable equality, not manual state.
- [ ] Column overrides persist with a unique page key.
- [ ] CSV `exportKey` set when differs from `dataIndex`.
- [ ] `scroll={{ x: 'max-content' }}` set on the table.
