/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
*/
import type {
  BAIVFolderSelectPaginatedQuery,
  BAIVFolderSelectPaginatedQuery$data,
  VFolderFilter,
  VFolderScope,
} from '../../__generated__/BAIVFolderSelectPaginatedQuery.graphql';
import { BAIVFolderSelectValueQuery } from '../../__generated__/BAIVFolderSelectValueQuery.graphql';
import { toGlobalId, toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type { VFolderFilter, VFolderScope };

export type VFolderSelectNode = NonNullable<
  BAIVFolderSelectPaginatedQuery$data['scopedVFoldersV2']
>['edges'][number]['node'];

export interface BAIVFolderSelectRef {
  refetch: () => void;
}

export interface BAIVFolderSelectProps extends Omit<
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
  /** The scopes whose folders are listed, combined with OR (ADR 0012). */
  scope: VFolderScope;
  /** ANDed onto the options and onto the selected-value lookup. */
  filter?: VFolderFilter;
  /** `'id'` keys by the `VirtualFolderNode` global id the call sites store; `'entityId'` by the UUID. */
  valuePropName?: 'id' | 'entityId';
  excludeDeleted?: boolean;
  /** Labels, keyed by the outer value, for selected folders the scope and filter do not reach. */
  fallbackLabels?: Record<string, string>;
  ref?: React.Ref<BAIVFolderSelectRef>;
}

const excludeDeletedFilter: VFolderFilter = {
  status: {
    notIn: [
      'DELETE_PENDING',
      'DELETE_ONGOING',
      'DELETE_ERROR',
      'DELETE_COMPLETE',
    ],
  },
};

const BAIVFolderSelect: React.FC<BAIVFolderSelectProps> = ({
  scope,
  filter,
  excludeDeleted,
  valuePropName = 'id',
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
  const baseFilters = _.compact([
    excludeDeleted ? excludeDeletedFilter : null,
    filter,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  const keyOf = (entityId: string) =>
    valuePropName === 'id'
      ? toGlobalId('VirtualFolderNode', entityId)
      : entityId;
  const entityIdOf = (key: string) =>
    valuePropName === 'id' ? toLocalId(key) : key;

  const { scopedVFoldersV2: selectedVFolders } =
    useLazyLoadQuery<BAIVFolderSelectValueQuery>(
      graphql`
        query BAIVFolderSelectValueQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $limit: Int!
          $skip: Boolean!
        ) {
          scopedVFoldersV2(scope: $scope, filter: $filter, limit: $limit)
            @skip(if: $skip) {
            edges {
              node {
                entityId
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      {
        scope,
        filter: {
          AND: [
            ...baseFilters,
            { entityId: { in: _.map(selectedKeys, entityIdOf) } },
          ],
        },
        limit: Math.max(selectedKeys.length, 1),
        skip: selectedKeys.length === 0,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIVFolderSelectPaginatedQuery, VFolderSelectNode>(
      graphql`
        query BAIVFolderSelectPaginatedQuery(
          $scope: VFolderScope!
          $filter: VFolderFilter
          $limit: Int!
          $offset: Int!
        ) {
          scopedVFoldersV2(
            scope: $scope
            filter: $filter
            limit: $limit
            offset: $offset
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            count
            edges {
              node {
                entityId
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
        scope,
        filter: {
          AND: _.compact([
            ...baseFilters,
            deferredSearchStr
              ? { name: { iContains: deferredSearchStr } }
              : null,
          ]),
        },
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.scopedVFoldersV2?.count ?? undefined,
        getItem: (result) =>
          result.scopedVFoldersV2?.edges.map((edge) => edge.node),
        getId: (item) => item?.entityId,
      },
    );

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

  const options = _.map(paginationData, (item) => ({
    value: keyOf(item.entityId),
    label: item.metadata.name,
    description: item.entityId,
  }));

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const edge = _.find(
        selectedVFolders?.edges,
        (e) => e.node.entityId === entityIdOf(key),
      );
      // Unreachable value: a caller-supplied label, then the readable UUID.
      return {
        label:
          edge?.node.metadata.name ?? fallbackLabels?.[key] ?? entityIdOf(key),
        value: key,
      };
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
        // raises no pending flag of its own (FR-3724).
        (!!controllableOpen && !deferredOpen) ||
        controllableValue !== deferredControllableValue ||
        searchStr !== deferredSearchStr ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.scopedVFoldersV2?.count ?? undefined}
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

export default BAIVFolderSelect;
