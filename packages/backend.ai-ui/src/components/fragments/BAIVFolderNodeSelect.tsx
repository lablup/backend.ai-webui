/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
// TODO(needs-backend): #11082 V2 has no filter on the caller's mount permission (`requiredPermission`);
// the scope-less RBAC picker also stays here until an `adminVfoldersV2` select exists.
import { BAIVFolderNodeSelectPaginatedQuery } from '../../__generated__/BAIVFolderNodeSelectPaginatedQuery.graphql';
import { BAIVFolderNodeSelectValueQuery } from '../../__generated__/BAIVFolderNodeSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import { mergeFilterValues } from '../BAIPropertyFilter';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type VFolderNode = NonNullable<
  NonNullable<
    BAIVFolderNodeSelectPaginatedQuery['response']['vfolder_nodes']
  >['edges'][number]
>['node'];

export interface BAIVFolderNodeSelectRef {
  refetch: () => void;
}

/** Permission names accepted by the `permission` argument of `vfolder_nodes`. */
export type BAIVFolderPermission =
  | 'clone'
  | 'assign_permission_to_others'
  | 'read_attribute'
  | 'update_attribute'
  | 'delete_vfolder'
  | 'read_content'
  | 'write_content'
  | 'delete_content'
  | 'mount_ro'
  | 'mount_rw'
  | 'mount_wd';

export interface BAIVFolderNodeSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  value?: string | Array<string> | null;
  /** The second argument is the picked option, so a `renderInput` filter can
   * label its token with the folder name while the id serializes. */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
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
  /**
   * Caller-known labels (keyed by the outer value) for values this select's
   * own value query cannot resolve — e.g. a prefilled folder outside the
   * current scope/filter. Used only when resolution misses; a resolved name
   * always wins.
   */
  fallbackLabels?: Record<string, string>;
  ref?: React.Ref<BAIVFolderNodeSelectRef>;
}

// Exclude deleted or deleting vfolders
const excludeDeletedStatusFilter =
  'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"';

const BAIVFolderNodeSelect: React.FC<BAIVFolderNodeSelectProps> = ({
  currentProjectId,
  filter,
  excludeDeleted,
  valuePropName = 'id',
  requiredPermission = 'read_attribute',
  onResolvedNamesChange,
  fallbackLabels,
  multiple = false,
  isLoading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const [controllableValue, setControllableValue] = useControllableValue<
    string | Array<string> | null | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps as Record<string, unknown>,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>('');
  const deferredSearchStr = useDebouncedDeferredValue(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const mergedFilter = mergeFilterValues([
    excludeDeleted ? excludeDeletedStatusFilter : null,
    filter,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  const keyOfNode = (
    node: { id: string; row_id?: string | null } | null | undefined,
  ): string | undefined => {
    if (!node) return undefined;
    return valuePropName === 'id' ? node.id : (node.row_id ?? undefined);
  };

  // Labels the selected value(s). Stays on `read_attribute` — narrowing it to
  // `requiredPermission` would leave an externally-set value showing a raw ID.
  const { vfolder_nodes: selectedVFolderNodes } =
    useLazyLoadQuery<BAIVFolderNodeSelectValueQuery>(
      graphql`
        query BAIVFolderNodeSelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelectedVFolder: Boolean!
          $scopeId: ScopeField
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            filter: $selectedFilter
            first: $first
            permission: "read_attribute"
          ) @skip(if: $skipSelectedVFolder) {
            edges {
              node {
                name
                id
                row_id
              }
            }
          }
        }
      `,
      {
        selectedFilter: mergeFilterValues(
          [
            selectedKeys.length
              ? mergeFilterValues(
                  _.map(selectedKeys, (value) => {
                    // The queryfilter only knows `id` (the local UUID); a
                    // `row_id` key already is that UUID, a global id is not.
                    const filterValue =
                      valuePropName === 'id' ? toLocalId(value) : value;
                    return `id == "${filterValue}"`;
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
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIVFolderNodeSelectPaginatedQuery, VFolderNode>(
      graphql`
        query BAIVFolderNodeSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $scopeId: ScopeField
          $filter: String
          $permission: VFolderPermissionValueField
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            offset: $offset
            first: $limit
            filter: $filter
            permission: $permission
            order: "-created_at"
          ) {
            count
            edges {
              node {
                id
                name
                row_id
              }
            }
          }
        }
      `,
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
      {
        getTotal: (result) => result.vfolder_nodes?.count ?? undefined,
        getItem: (result) =>
          result.vfolder_nodes?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
      },
    );

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

  // Notify parent of resolved id→name mapping when selected nodes are loaded
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

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const edge = _.find(
        selectedVFolderNodes?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      // Unresolvable value (folder deleted, or outside this select's
      // scope/filter): prefer a caller-supplied label, then the readable
      // local UUID — never the base64 global id.
      const fallbackLabel =
        fallbackLabels?.[key] ??
        (valuePropName === 'id' ? (toLocalId(key) ?? key) : key);
      return { label: edge?.node?.name ?? fallbackLabel, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIVFolderSelect.SelectFolder')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        // The open-driven `network-only` refetch is a deferred update and
        // raises no pending flag of its own (FR-3724). Only the opening
        // half counts; closing would flash the spinner for nothing.
        (!!controllableOpen && !deferredOpen) ||
        controllableValue !== deferredControllableValue ||
        searchStr !== deferredSearchStr ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.vfolder_nodes?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
        setControllableValue(
          multiple ? keys : keys[0],
          multiple ? labeled : labeled[0],
        );
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIVFolderNodeSelect;
