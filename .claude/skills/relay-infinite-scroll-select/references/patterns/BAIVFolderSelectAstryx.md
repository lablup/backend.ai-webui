# BAIVFolderSelectAstryx — id-valued variant (Class B)

Source: `packages/backend.ai-ui/src/components/fragments/BAIVFolderSelectAstryx.tsx`

Read `BAIUserSelectAstryx.md` first — this file is that recipe with an
id-shaped key. Only the differences are documented here.

## Key characteristics

- **Outer value**: plain `string | string[] | null`, where the key is the raw
  Relay **global** `id` (`valuePropName: 'id'`, the default) or the raw UUID
  (`'row_id'`)
- **Relay hooks**: `useLazyLoadQuery` + `useLazyPaginatedQuery` (offset)
- **Extra scoping**: `scope_id` (project) and a `permission` argument
- **Extra callback**: `onResolvedNamesChange` reports the resolved id→name map

## Key semantics — unchanged from the antd original

When `valuePropName` is `'id'`, the **outer** key is `node.id`, the raw global
id — *not* `toLocalId`-converted. `VFolderMountFormItem` documents that
"mount_ids stores global IDs (from BAIVFolderSelect)", and the migration did not
touch that contract.

`toLocalId` is used only for two things:

1. **display** — the secondary id text on each option row;
2. **the filter value** in the value-resolution query, because the backend
   filters on local UUIDs.

When `valuePropName` is `'row_id'` the outer key is the raw UUID and no
conversion happens at all.

```typescript
const keyOfNode = (
  node: { id: string; row_id?: string | null } | null | undefined,
): string | undefined => {
  if (!node) return undefined;
  return valuePropName === 'id' ? node.id : (node.row_id ?? undefined);
};
```

Contrast with `BAIUserSelectAstryx`, whose `keyOfNode` **does** call
`toLocalId(node.id)` in id mode. The two wrappers genuinely differ here; do not
"harmonise" them.

## Props

```typescript
export interface BAIVFolderSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIVFolderSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  currentProjectId?: string;
  filter?: string;
  valuePropName?: 'id' | 'row_id';
  excludeDeleted?: boolean;
  /**
   * Lists only the folders granting this permission to the current user.
   * Defaults to `'read_attribute'`; one value only, as the API argument is a
   * single scalar.
   */
  requiredPermission?: BAIVFolderPermission;
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
  ref?: React.Ref<BAIVFolderSelectAstryxRef>;
}
```

`onChange` here takes **one** argument. The second `option` argument exists only
on `BAIUserSelectAstryx` (P3C-1), because only `BAIGraphQLPropertyFilter` needed
it. Do not add it speculatively.

`BAIVFolderPermission` is an exported union of the permission names the
`vfolder_nodes` `permission` argument accepts (`'read_attribute'`,
`'mount_rw'`, `'delete_vfolder'`, …).

## Global-ID conversion in the value query filter

```typescript
selectedFilter: mergeFilterValues(
  [
    selectedKeys.length
      ? mergeFilterValues(
          _.map(selectedKeys, (value) => {
            // When valuePropName is 'id', the outer key is the
            // global id — convert to the local UUID the filter
            // expects. When 'row_id', use the value directly.
            const filterValue =
              valuePropName === 'id' ? toLocalId(value) : value;
            return `${valuePropName} == "${filterValue}"`;
          }),
          '|',
        )
      : null,
    mergedFilter,
  ],
  '&',
),
first: Math.max(selectedKeys.length, 1),
skipSelectedVFolder: selectedKeys.length === 0,
scopeId: currentProjectId ? `project:${currentProjectId}` : undefined,
```

The inner `mergeFilterValues(..., '|')` ORs the per-key predicates; the outer
one ANDs the result with the caller's filter. `null` entries are dropped — see
`../helpers/mergeFilterValues.md`.

## The value query stays on `read_attribute`

```graphql
vfolder_nodes(
  scope_id: $scopeId
  filter: $selectedFilter
  first: $first
  permission: "read_attribute"
) @skip(if: $skipSelectedVFolder) { ... }
```

Hardcoded, **not** `requiredPermission`. Narrowing the resolution query to a
stricter permission would leave an externally-set value showing a raw ID in the
trigger. Only the *options* query is scoped by `requiredPermission`.

## Options — the "(id)" text moved into `description`

```typescript
const options = _.compact(
  _.map(paginationData, (item) => {
    const key = keyOfNode(item);
    if (!key) return null;
    const idText = valuePropName === 'id' ? toLocalId(key) : key;
    return {
      value: key,
      label: item?.name ?? key,
      description: idText,
    };
  }),
);
```

The antd original rendered a monospace, ellipsised, secondary `(id)` fragment
inside `optionRender`/`labelRender`. `BAIComplexSelect` requires `label` to be a
plain string (P26-3), so the id moved to the option's `description` slot — a
secondary line under the label. The monospace/ellipsis treatment is gone; the
information is not.

## Dropped prop: `onClickVFolder`

antd's `onClickVFolder` turned the **trigger's** rendered label into a clickable
`BAILink` when nothing was being searched. `BAIComplexSelect`'s trigger prints
`value.label` as plain text (P26-3/P26-4), so `onClickVFolder` is **dropped
entirely from the props interface**.

If a call site needs navigation, put the link next to the select, not inside it.

## `onResolvedNamesChange`

A vfolder-specific escape hatch: once the value-resolution query lands, the
wrapper reports the id→name map so a parent can label the selection elsewhere
(a summary line, a confirmation modal) without re-querying.

```typescript
useEffect(() => {
  if (onResolvedNamesChange && selectedVFolderNodes?.edges) {
    const nameMap: Record<string, string> = {};
    selectedVFolderNodes.edges.forEach((edge) => {
      const key = keyOfNode(edge?.node);
      const name = edge?.node?.name;
      if (key && name) {
        nameMap[key] = name;
      }
    });
    onResolvedNamesChange(nameMap);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedVFolderNodes]);
```

The narrow dep list is deliberate — see `.claude/rules/use-effect-event.md`
before widening it.

## Paginated query — scoping and permission

```typescript
{ limit: 10 },
{
  filter: mergeFilterValues([
    mergedFilter,
    deferredSearchStr ? `name ilike "%${deferredSearchStr}%"` : null,
  ]),
  scopeId: currentProjectId ? `project:${currentProjectId}` : undefined,
  permission: requiredPermission,
},
{
  fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
  fetchKey: deferredFetchKey,
},
```

Note the local name is `deferredSearchStr` here (`BAIUserSelectAstryx` calls the
same thing `debouncedDeferredValue`); both are `useDebouncedDeferredValue(searchStr)`.

Search filters on `name`, not on the key — the user searches for what they see.

## Everything else is identical to the template

`useControllableValue` for value+open, the four-condition `isLoading`,
`total` + `isLoadingNext`, `endReached={loadNext}`, `searchValue`/`onSearch`,
`onOpenChange`, the `useImperativeHandle` refetch, and the `labeledValue`
builder that echoes the key as its own label when the resolution query has not
landed yet.

The empty state is the shared "No results" text (P26-7) — antd's
`notFoundContent={<Skeleton.Input/>}` placeholder is gone here too.

## Usage

```tsx
const vfolderSelectRef = useRef<BAIVFolderSelectAstryxRef>(null);

<BAIVFolderSelectAstryx
  ref={vfolderSelectRef}
  label={t('general.Folder')}
  multiple
  valuePropName="id"
  currentProjectId={projectId}
  requiredPermission="mount_rw"
  excludeDeleted
  value={selectedFolderIds}
  onChange={setSelectedFolderIds}
  onResolvedNamesChange={setFolderNames}
/>

<Button onClick={() => vfolderSelectRef.current?.refetch()}>Refresh</Button>
```

Inside a form, pass `isLabelHidden` so `BAIFormItem` owns the visible label:

```tsx
<BAIFormItem name="mount_ids" label={t('general.Folder')}>
  <BAIVFolderSelectAstryx label={t('general.Folder')} isLabelHidden multiple />
</BAIFormItem>
```

The `labelInValue` shape never reaches the form — the wrapper's outer value is
plain keys, so no `getValueProps` / `normalize` is needed.
