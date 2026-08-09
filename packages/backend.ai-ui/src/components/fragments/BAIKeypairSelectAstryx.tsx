/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIKeypairSelectAstryx — ticket-27 Astryx sibling of `BAIKeypairSelect`,
 built on `BAIComplexSelect` (ticket 26). See
 `.scratch/astryx-migration/shots/26/CONVERSION-BRIEF.md` §2.A for the recipe
 this file follows (copy of `BAIUserSelectAstryx.tsx`, the worked example).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIKeypairSelect` is NOT touched by this change. It keeps serving every
 unmigrated call site until ticket 27 moves them. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) the antd wrapper exposes — labelInValue
 lives strictly between this wrapper and `BAIComplexSelect`.

 CLASS A (name-valued): the key is `access_key` (a display value in its own
 right), matching the antd original.

 PILOT-DECISIONs:
  - P26-3 antd's `labelRender`/`optionRender` rendered the access key in
    monospace (`<BAIText monospace>{label}</BAIText>`). `BAIComplexSelect`
    requires `label` to be a plain string (it is the trigger text, the
    accessible name and the live-region text), so the monospace styling is
    dropped — the label prints as plain text. No information is lost, only
    the font treatment.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped (see `BAIComplexSelect` header, general policy).
*/
import { BAIKeypairSelectAstryxPaginatedQuery } from '../../__generated__/BAIKeypairSelectAstryxPaginatedQuery.graphql';
import { BAIKeypairSelectAstryxValueQuery } from '../../__generated__/BAIKeypairSelectAstryxValueQuery.graphql';
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

export type AstryxKeypairNode = NonNullable<
  NonNullable<
    BAIKeypairSelectAstryxPaginatedQuery['response']['keypair_list']
  >['items'][number]
>;

export interface BAIKeypairSelectAstryxRef {
  refetch: () => void;
}

export interface BAIKeypairSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIKeypairSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  filter?: string;
  ref?: React.Ref<BAIKeypairSelectAstryxRef>;
}

const BAIKeypairSelectAstryx: React.FC<BAIKeypairSelectAstryxProps> = ({
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

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  const { keypair_list: selectedKeypairList } =
    useLazyLoadQuery<BAIKeypairSelectAstryxValueQuery>(
      graphql`
        query BAIKeypairSelectAstryxValueQuery(
          $filter: String
          $limit: Int!
          $offset: Int!
          $skipSelected: Boolean!
        ) {
          keypair_list(filter: $filter, limit: $limit, offset: $offset)
            @skip(if: $skipSelected) {
            items {
              access_key
              user_id
              is_active
            }
            total_count
          }
        }
      `,
      {
        filter: selectedKeys.length
          ? mergeFilterValues(
              _.map(selectedKeys, (value) => `access_key == "${value}"`),
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

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIKeypairSelectAstryxPaginatedQuery,
      AstryxKeypairNode
    >(
      graphql`
        query BAIKeypairSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
        ) {
          keypair_list(
            offset: $offset
            limit: $limit
            filter: $filter
            order: "-created_at"
          ) {
            items {
              access_key
              user_id
              is_active
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
            ? `access_key ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.keypair_list?.total_count ?? undefined,
        getItem: (r) => r.keypair_list?.items,
        getId: (item) => item?.access_key,
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

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.access_key;
      return key
        ? {
            value: key,
            label: key,
          }
        : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const item = _.find(
        selectedKeypairList?.items,
        (i) => i?.access_key === key,
      );
      return { label: item?.access_key ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIKeypairSelect.SelectKeypair')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.keypair_list?.total_count ?? undefined}
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

export default BAIKeypairSelectAstryx;
