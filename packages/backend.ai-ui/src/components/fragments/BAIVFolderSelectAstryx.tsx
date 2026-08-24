/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIVFolderSelectAstryx — ticket-27 Astryx sibling of `BAIVFolderSelect`,
 built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIVFolderSelect` is NOT touched. It keeps serving every unmigrated call
 site until this wrapper's last consumer is converted. This file's OUTER
 value contract is deliberately the same plain key(s) (`string | string[] |
 undefined`) the antd wrapper exposes today — `labelInValue` lives strictly
 between this wrapper and `BAIComplexSelect`.

 KEY SEMANTICS ARE UNCHANGED from the antd original: when `valuePropName`
 is `'id'` the outer key is the raw Relay **global** id (`node.id`, NOT
 `toLocalId`-converted) — `VFolderMountFormItem` documents that "mount_ids
 stores global IDs (from BAIVFolderSelect)". `toLocalId` is used only for
 display (the secondary id text) and to build the local-UUID filter value for
 the value-resolution query, exactly as the antd `labelRender`/`optionRender`
 did. When `valuePropName` is `'row_id'` the outer key is the raw UUID
 (`node.row_id`), also unchanged.

 `mode="multiple"` support is kept: the antd original's `onChange` already
 branches on `selectProps.mode === 'multiple' || 'tags'` and its value prop is
 typed `string | string[] | undefined`, so `multiple` is passed straight
 through to `BAIComplexSelect` (inherited, not `Omit`-ed, from
 `BAIComplexSelectProps`).

 PILOT-DECISIONs:
  - antd `onClickVFolder` made the TRIGGER's rendered label a clickable
    `BAILink` when nothing was being searched. `BAIComplexSelect`'s trigger
    only prints `value.label` as plain text (P26-3/P26-4), so
    `onClickVFolder` is dropped entirely from the props interface.
  - The secondary monospace "(id)" text that every option row showed via
    `optionRender` moves into each option's `description` slot.
  - antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder is
    dropped (P26-7); the empty state is the shared "No results" text.
*/
import { BAIVFolderSelectAstryxPaginatedQuery } from '../../__generated__/BAIVFolderSelectAstryxPaginatedQuery.graphql';
import { BAIVFolderSelectAstryxValueQuery } from '../../__generated__/BAIVFolderSelectAstryxValueQuery.graphql';
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
    BAIVFolderSelectAstryxPaginatedQuery['response']['vfolder_nodes']
  >['edges'][number]
>['node'];

export interface BAIVFolderSelectAstryxRef {
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
  /**
   * Caller-known labels (keyed by the outer value) for values this select's
   * own value query cannot resolve — e.g. a prefilled folder outside the
   * current scope/filter. Used only when resolution misses; a resolved name
   * always wins.
   */
  fallbackLabels?: Record<string, string>;
  ref?: React.Ref<BAIVFolderSelectAstryxRef>;
}

// Exclude deleted or deleting vfolders
const excludeDeletedStatusFilter =
  'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"';

const BAIVFolderSelectAstryx: React.FC<BAIVFolderSelectAstryxProps> = ({
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
    useLazyLoadQuery<BAIVFolderSelectAstryxValueQuery>(
      graphql`
        query BAIVFolderSelectAstryxValueQuery(
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
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIVFolderSelectAstryxPaginatedQuery, VFolderNode>(
      graphql`
        query BAIVFolderSelectAstryxPaginatedQuery(
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
        controllableValue !== deferredControllableValue ||
        searchStr !== deferredSearchStr ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.vfolder_nodes?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const keys = _.map(_.compact(_.castArray(next ?? [])), (v) => v.value);
        setControllableValue(multiple ? keys : keys[0], undefined);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIVFolderSelectAstryx;
