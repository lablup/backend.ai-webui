/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIStorageHostSelectAstryx — ticket-27 Astryx sibling of
 `BAIStorageHostSelect`, built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIStorageHostSelect` is NOT touched. It keeps serving every unmigrated call
 site until this wrapper's last consumer is converted. This file's OUTER
 value contract is deliberately the same plain key(s) (`string | string[] |
 undefined`) the antd wrapper exposes today — `labelInValue` lives strictly
 between this wrapper and `BAIComplexSelect`.

 `mode="multiple"` support is kept: the antd original's `onChange` already
 branches on `selectProps.mode === 'multiple' || 'tags'` and its value prop is
 typed `string | string[] | undefined`, so `multiple` is passed straight
 through to `BAIComplexSelect` (inherited, not `Omit`-ed, from
 `BAIComplexSelectProps`).

 PILOT-DECISIONs:
  - The antd original rendered both the trigger label and each option's label
    in `BAIText monospace` via `labelRender`/`optionRender`. `label` must be a
    plain string for `BAIComplexSelect` (P26-3 — it is the trigger text, the
    accessible name, and the live-region text), so the monospace styling is
    dropped; the storage host id string itself (already a plain, readable
    identifier) is used verbatim as the label.
  - antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder is
    dropped (P26-7); the empty state is the shared "No results" text.
*/
import { BAIStorageHostSelectAstryxPaginatedQuery } from '../../__generated__/BAIStorageHostSelectAstryxPaginatedQuery.graphql';
import { BAIStorageHostSelectAstryxValueQuery } from '../../__generated__/BAIStorageHostSelectAstryxValueQuery.graphql';
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
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type StorageHostNode = NonNullable<
  NonNullable<
    BAIStorageHostSelectAstryxPaginatedQuery['response']['storage_volume_list']
  >['items'][number]
>;

export interface BAIStorageHostSelectAstryxRef {
  refetch: () => void;
}

export interface BAIStorageHostSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIStorageHostSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  filter?: string;
  ref?: React.Ref<BAIStorageHostSelectAstryxRef>;
}

const BAIStorageHostSelectAstryx: React.FC<BAIStorageHostSelectAstryxProps> = ({
  filter,
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
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  // ValueQuery: fetch selected storage hosts by id filter
  const { storage_volume_list: selectedStorageVolumeList } =
    useLazyLoadQuery<BAIStorageHostSelectAstryxValueQuery>(
      graphql`
        query BAIStorageHostSelectAstryxValueQuery(
          $filter: String
          $limit: Int!
          $offset: Int!
          $skipSelected: Boolean!
        ) {
          storage_volume_list(filter: $filter, limit: $limit, offset: $offset)
            @skip(if: $skipSelected) {
            items {
              id
              backend
              path
              proxy
            }
            total_count
          }
        }
      `,
      {
        filter: selectedKeys.length
          ? mergeFilterValues(
              _.map(selectedKeys, (value) => `id == "${value}"`),
              '|',
            )
          : undefined,
        limit: Math.max(selectedKeys.length, 1),
        offset: 0,
        skipSelected: selectedKeys.length === 0,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  // PaginatedQuery: fetch all storage hosts with pagination and search
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIStorageHostSelectAstryxPaginatedQuery,
      StorageHostNode
    >(
      graphql`
        query BAIStorageHostSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
          $order: String
        ) {
          storage_volume_list(
            offset: $offset
            limit: $limit
            filter: $filter
            order: $order
          ) {
            items {
              id
              backend
              path
              proxy
            }
            total_count
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          filter,
          debouncedDeferredValue
            ? `id ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) =>
          result.storage_volume_list?.total_count ?? undefined,
        getItem: (result) => result.storage_volume_list?.items,
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

  const options = _.compact(
    _.map(paginationData, (item) =>
      item?.id
        ? {
            value: item.id,
            label: item.id,
          }
        : null,
    ),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const item = _.find(
        selectedStorageVolumeList?.items,
        (i) => i?.id === key,
      );
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: item?.id ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIStorageHostSelect.SelectStorageHost')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.storage_volume_list?.total_count ?? undefined}
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

export default BAIStorageHostSelectAstryx;
