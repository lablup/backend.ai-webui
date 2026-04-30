import {
  BAIVFolderSelectPaginatedQuery,
  VFolderFilter,
} from '../../__generated__/BAIVFolderSelectPaginatedQuery.graphql';
import { BAIVFolderSelectValueQuery } from '../../__generated__/BAIVFolderSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAILink from '../BAILink';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, Skeleton } from 'antd';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type VFolderNode = NonNullable<
  NonNullable<
    BAIVFolderSelectPaginatedQuery['response']['myVfolders']
  >['edges'][number]
>['node'];

export interface BAIVFolderSelectRef {
  refetch: () => void;
}

export interface BAIVFolderSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  currentProjectId?: string;
  onClickVFolder?: (value: string) => void;
  /**
   * Additional structured filter (VFolderFilter) merged via AND with the
   * internal filters (status exclusion and search term). Pass `null` to clear.
   */
  filter?: VFolderFilter | null;
  valuePropName?: 'id' | 'row_id';
  excludeDeleted?: boolean;
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
  ref?: React.Ref<BAIVFolderSelectRef>;
}

// Status values excluded when `excludeDeleted` is true. Mirrors the V1
// filter-string semantics (`status != DELETE_*`) using the V2
// `VFolderOperationStatusFilter` enum shape. The cast targets the
// Relay-generated `VFolderOperationStatus` union without re-importing the
// alias (kept local to minimize coupling to the generated types).
const EXCLUDE_DELETED_STATUSES: ReadonlyArray<
  'DELETE_PENDING' | 'DELETE_ONGOING' | 'DELETE_ERROR' | 'DELETE_COMPLETE'
> = ['DELETE_PENDING', 'DELETE_ONGOING', 'DELETE_ERROR', 'DELETE_COMPLETE'];

// Keep in sync with the `$id0..$id9` / `$include0..$include9` variables in
// `BAIVFolderSelectValueQuery`. See the note inside the query for why we use
// a fixed set of aliased `vfolderV2` lookups instead of a single filter-by-id
// query (V2 `VFolderFilter` does not expose an id field, tracked under
// FR-2685 follow-ups).
const MAX_PRESELECTED_VALUE_RESOLVE = 10;

const combineVFolderFilters = (
  filters: Array<VFolderFilter | null | undefined>,
): VFolderFilter | null => {
  const cleaned = _.compact(filters);
  if (cleaned.length === 0) return null;
  if (cleaned.length === 1) return cleaned[0] as VFolderFilter;
  return { AND: cleaned } as VFolderFilter;
};

const BAIVFolderSelect: React.FC<BAIVFolderSelectProps> = ({
  loading,
  currentProjectId,
  onClickVFolder,
  filter,
  excludeDeleted,
  valuePropName = 'id',
  onResolvedNamesChange,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [controllableValue, setControllableValue] = useControllableValue<
    string | string[] | undefined
  >(selectProps);
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const deferredSearchStr = useDebouncedDeferredValue(searchStr);
  const [optimisticSearchStr, setOptimisticSearchStr] =
    useOptimistic(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const mergedFilter = combineVFolderFilters([
    excludeDeleted ? { status: { notIn: EXCLUDE_DELETED_STATUSES } } : null,
    filter ?? null,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  // Build an array of (id, include) pairs to drive the aliased
  // `vfolderV2(vfolderId:)` queries. V2 `VFolderFilter` cannot filter by id,
  // so we fetch each preselected vfolder via a dedicated aliased query up to
  // `MAX_PRESELECTED_VALUE_RESOLVE`. Extra values fall through to the
  // paginated list for name resolution.
  const selectedValueList = _.castArray(deferredControllableValue).filter(
    (v): v is string => !_.isNil(v) && v !== '',
  );
  const valueQuerySlots = _.range(MAX_PRESELECTED_VALUE_RESOLVE).map(
    (index) => {
      const value = selectedValueList[index];
      if (!value) {
        return { id: null as string | null, include: false };
      }
      const localId = valuePropName === 'id' ? toLocalId(value) : value;
      return { id: localId, include: Boolean(localId) };
    },
  );

  const { v0, v1, v2, v3, v4, v5, v6, v7, v8, v9 } =
    useLazyLoadQuery<BAIVFolderSelectValueQuery>(
      graphql`
        query BAIVFolderSelectValueQuery(
          $id0: UUID!
          $id1: UUID!
          $id2: UUID!
          $id3: UUID!
          $id4: UUID!
          $id5: UUID!
          $id6: UUID!
          $id7: UUID!
          $id8: UUID!
          $id9: UUID!
          $include0: Boolean!
          $include1: Boolean!
          $include2: Boolean!
          $include3: Boolean!
          $include4: Boolean!
          $include5: Boolean!
          $include6: Boolean!
          $include7: Boolean!
          $include8: Boolean!
          $include9: Boolean!
        ) {
          v0: vfolderV2(vfolderId: $id0) @include(if: $include0) {
            id
            metadata {
              name
            }
          }
          v1: vfolderV2(vfolderId: $id1) @include(if: $include1) {
            id
            metadata {
              name
            }
          }
          v2: vfolderV2(vfolderId: $id2) @include(if: $include2) {
            id
            metadata {
              name
            }
          }
          v3: vfolderV2(vfolderId: $id3) @include(if: $include3) {
            id
            metadata {
              name
            }
          }
          v4: vfolderV2(vfolderId: $id4) @include(if: $include4) {
            id
            metadata {
              name
            }
          }
          v5: vfolderV2(vfolderId: $id5) @include(if: $include5) {
            id
            metadata {
              name
            }
          }
          v6: vfolderV2(vfolderId: $id6) @include(if: $include6) {
            id
            metadata {
              name
            }
          }
          v7: vfolderV2(vfolderId: $id7) @include(if: $include7) {
            id
            metadata {
              name
            }
          }
          v8: vfolderV2(vfolderId: $id8) @include(if: $include8) {
            id
            metadata {
              name
            }
          }
          v9: vfolderV2(vfolderId: $id9) @include(if: $include9) {
            id
            metadata {
              name
            }
          }
        }
      `,
      {
        // Non-nullable UUID! args must always be a valid string; the
        // `@include(if:)` guard prevents the server from actually running the
        // lookup when we don't have a real id. Use a zeroed UUID as a safe
        // placeholder to avoid GraphQL validation errors.
        id0: valueQuerySlots[0]?.id ?? '00000000-0000-0000-0000-000000000000',
        id1: valueQuerySlots[1]?.id ?? '00000000-0000-0000-0000-000000000000',
        id2: valueQuerySlots[2]?.id ?? '00000000-0000-0000-0000-000000000000',
        id3: valueQuerySlots[3]?.id ?? '00000000-0000-0000-0000-000000000000',
        id4: valueQuerySlots[4]?.id ?? '00000000-0000-0000-0000-000000000000',
        id5: valueQuerySlots[5]?.id ?? '00000000-0000-0000-0000-000000000000',
        id6: valueQuerySlots[6]?.id ?? '00000000-0000-0000-0000-000000000000',
        id7: valueQuerySlots[7]?.id ?? '00000000-0000-0000-0000-000000000000',
        id8: valueQuerySlots[8]?.id ?? '00000000-0000-0000-0000-000000000000',
        id9: valueQuerySlots[9]?.id ?? '00000000-0000-0000-0000-000000000000',
        include0: valueQuerySlots[0]?.include ?? false,
        include1: valueQuerySlots[1]?.include ?? false,
        include2: valueQuerySlots[2]?.include ?? false,
        include3: valueQuerySlots[3]?.include ?? false,
        include4: valueQuerySlots[4]?.include ?? false,
        include5: valueQuerySlots[5]?.include ?? false,
        include6: valueQuerySlots[6]?.include ?? false,
        include7: valueQuerySlots[7]?.include ?? false,
        include8: valueQuerySlots[8]?.include ?? false,
        include9: valueQuerySlots[9]?.include ?? false,
      },
      {
        fetchPolicy:
          selectedValueList.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  // Aggregate aliased results into a flat list of {id, name} pairs aligned
  // with the original selection order. Slots beyond MAX_PRESELECTED_VALUE_RESOLVE
  // or entries whose id/metadata failed to resolve are skipped; the consumer
  // falls back to the paginated results or the raw id for labels.
  const resolvedSelectedList = _.compact([
    v0,
    v1,
    v2,
    v3,
    v4,
    v5,
    v6,
    v7,
    v8,
    v9,
  ]);

  const {
    paginationData,
    result: paginatedResult,
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<BAIVFolderSelectPaginatedQuery, VFolderNode>(
    // The paginated list targets `projectVfolders` when the caller scopes
    // the picker to a project, otherwise the current user's scope. Super
    // admin (`adminVfoldersV2`) surfacing is intentionally out of scope for
    // this migration.
    graphql`
      query BAIVFolderSelectPaginatedQuery(
        $offset: Int!
        $limit: Int!
        $projectId: UUID!
        $filter: VFolderFilter
        $orderBy: [VFolderOrderBy!]
        $useProject: Boolean!
      ) {
        myVfolders(
          offset: $offset
          limit: $limit
          filter: $filter
          orderBy: $orderBy
        ) @skip(if: $useProject) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
            }
          }
        }
        projectVfolders(
          projectId: $projectId
          offset: $offset
          limit: $limit
          filter: $filter
          orderBy: $orderBy
        ) @include(if: $useProject) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
            }
          }
        }
      }
    `,
    { limit: 10 },
    {
      filter: combineVFolderFilters([
        mergedFilter,
        deferredSearchStr ? { name: { iContains: deferredSearchStr } } : null,
      ]),
      orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
      // `$projectId` is typed `UUID!` because Strawberry's
      // `projectVfolders(projectId:)` is non-nullable. When `useProject` is
      // false the `@include(if:)` guard prevents the field from executing,
      // so a zeroed UUID is a safe placeholder.
      projectId: currentProjectId ?? '00000000-0000-0000-0000-000000000000',
      useProject: Boolean(currentProjectId),
    },
    {
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
      fetchKey: deferredFetchKey,
    },
    {
      getTotal: (result) =>
        (result.projectVfolders ?? result.myVfolders)?.count ?? undefined,
      getItem: (result) =>
        (result.projectVfolders ?? result.myVfolders)?.edges?.map(
          (edge) => edge?.node,
        ),
      getId: (item) => item?.id,
    },
  );

  const paginatedConnection =
    paginatedResult.projectVfolders ?? paginatedResult.myVfolders;

  // Expose refetch function through ref
  useImperativeHandle(
    ref,
    () => ({
      refetch: () => {
        startRefetchTransition(() => {
          updateFetchKey();
        });
      },
    }),
    [updateFetchKey, startRefetchTransition],
  );

  // Notify parent of resolved id→name mapping when selected nodes are loaded.
  // V2 `VFolder.id` is a global ID; we additionally map the local UUID
  // derivation so callers using `row_id` as `valuePropName` can resolve names
  // with the same key shape. Uses `useEffectEvent` so the effect only
  // re-runs when the list of resolved ids changes — not on every parent
  // render that re-creates `onResolvedNamesChange`.
  const notifyResolvedNames = useEffectEvent(() => {
    if (!onResolvedNamesChange || resolvedSelectedList.length === 0) return;
    const nameMap: Record<string, string> = {};
    resolvedSelectedList.forEach((node) => {
      if (!node?.id || !node.metadata?.name) return;
      const name = node.metadata.name;
      if (valuePropName === 'row_id') {
        nameMap[toLocalId(node.id) ?? node.id] = name;
      } else {
        nameMap[node.id] = name;
      }
    });
    if (!_.isEmpty(nameMap)) {
      onResolvedNamesChange(nameMap);
    }
  });
  const resolvedSelectedKey = resolvedSelectedList.map((n) => n?.id).join('|');
  useEffect(() => {
    notifyResolvedNames();
  }, [resolvedSelectedKey]);

  const availableOptions = _.map(_.compact(paginationData), (item) => ({
    label: item.metadata?.name,
    value:
      valuePropName === 'row_id'
        ? item.id
          ? (toLocalId(item.id) ?? undefined)
          : undefined
        : item.id,
  }));

  const controllableValueWithLabel = (() => {
    const values = _.castArray(deferredControllableValue).filter(
      (v): v is string => !_.isNil(v) && v !== '',
    );
    if (values.length === 0) return undefined;
    // Index resolved selected-node names by the outward `valuePropName` key
    // for O(1) lookup during render.
    const resolvedByKey = new Map<string, string>();
    resolvedSelectedList.forEach((node) => {
      if (!node?.id || !node.metadata?.name) return;
      if (valuePropName === 'row_id') {
        const localId = toLocalId(node.id);
        if (localId) resolvedByKey.set(localId, node.metadata.name);
      } else {
        resolvedByKey.set(node.id, node.metadata.name);
      }
    });
    return values
      .map((value) => {
        const resolvedLabel = resolvedByKey.get(value);
        if (resolvedLabel) {
          return { label: resolvedLabel, value };
        }
        const availableOption = availableOptions.find(
          (opt) => opt.value === value,
        );
        if (availableOption?.label) {
          return { label: availableOption.label, value };
        }
        // Fallback — show the raw value until the name resolves via the
        // ValueQuery or paginated list.
        return { label: value, value };
      })
      .filter(
        (item): item is { label: string; value: string } =>
          item !== null && _.isString(item.value),
      );
  })();

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIVFolderSelect.SelectFolder')}
      loading={
        loading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== deferredSearchStr ||
        isPendingRefetch
      }
      {...selectProps}
      searchAction={async (value) => {
        setOptimisticSearchStr(value);
        setSearchStr(value);
        await selectProps.searchAction?.(value);
      }}
      showSearch={
        selectProps.showSearch === false
          ? false
          : {
              searchValue: optimisticSearchStr,
              autoClearSearchValue: true,
              ...(_.isObject(selectProps.showSearch)
                ? _.omit(selectProps.showSearch, ['searchValue'])
                : {}),
              filterOption: false,
            }
      }
      labelRender={({ label, value }) => {
        return onClickVFolder ? (
          <BAILink onClick={() => onClickVFolder(_.toString(value))}>
            {label}
          </BAILink>
        ) : (
          <>
            {label}
            <BAIText type="secondary">
              &nbsp; (
              <BAIText
                ellipsis
                type="secondary"
                style={{
                  width: 80,
                }}
                monospace
              >
                {valuePropName === 'id'
                  ? toLocalId(_.toString(value))
                  : _.toString(value)}
              </BAIText>
              )
            </BAIText>
          </>
        );
      }}
      optionRender={({ label, value }) => (
        <>
          {label}
          <BAIText type="secondary">
            &nbsp; (
            <BAIText
              ellipsis
              style={{
                width: 80,
              }}
              type="secondary"
              monospace
            >
              {valuePropName === 'id'
                ? toLocalId(_.toString(value))
                : _.toString(value)}
            </BAIText>
            )
          </BAIText>
        </>
      )}
      value={
        controllableValue !== deferredControllableValue
          ? optimisticValueWithLabel
          : controllableValueWithLabel
      }
      labelInValue
      onChange={(value, option) => {
        // In multiple mode, when removing tags, value.label is a React element
        // So we need to find the original label from availableOptions
        const castedValue = _.isEmpty(value) ? [] : _.castArray(value);
        const valueWithOriginalLabel = castedValue.map((v) => {
          // If label is string, use it directly; if React element, find from options
          const label = _.isString(v.label)
            ? v.label
            : (availableOptions.find((opt) => opt.value === v.value)?.label ??
              v.value);
          return {
            label,
            value: v.value,
          };
        });
        setOptimisticValueWithLabel(valueWithOriginalLabel);
        const isMultiple =
          selectProps.mode === 'multiple' || selectProps.mode === 'tags';
        const idArray = castedValue.map((v) => _.toString(v.value));
        setControllableValue(
          isMultiple ? idArray : (idArray[0] ?? undefined),
          option,
        );
      }}
      options={availableOptions}
      endReached={() => {
        loadNext();
      }}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(paginatedConnection?.count) &&
        paginatedConnection.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={paginatedConnection.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIVFolderSelect;
