/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIProjectSelectAstryx — ticket-27 Astryx sibling of `BAIProjectSelect`,
 built on `BAIComplexSelect` (ticket 26), following pattern B of the
 recipe used across the Astryx migration (copy of `BAIUserSelectAstryx.tsx`,
 the worked example).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIProjectSelect` is NOT touched by this change. It keeps serving every
 unmigrated call site until ticket 27 moves them. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) the antd wrapper exposes — labelInValue
 lives strictly between this wrapper and `BAIComplexSelect`.

 CLASS B (id-valued): the key is the project's raw GraphQL `id` (matching the
 antd original — `toLocalId` is used ONLY when building the `id == "..."`
 filter clause for the value-resolution query, never as the stored key
 itself; this file preserves that exact split).

 PILOT-DECISIONs:
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped (see `BAIComplexSelect` header, general policy).
  - None of this wrapper's other antd affordances (`optionRender`,
    `labelRender`, `tagRender`) were used by the original, so there is
    nothing else to record.
*/
import { BAIProjectSelectAstryxPaginatedQuery } from '../../__generated__/BAIProjectSelectAstryxPaginatedQuery.graphql';
import { BAIProjectSelectAstryxValueQuery } from '../../__generated__/BAIProjectSelectAstryxValueQuery.graphql';
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
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AstryxProjectNode = NonNullable<
  NonNullable<
    BAIProjectSelectAstryxPaginatedQuery['response']['group_nodes']
  >['edges'][number]
>['node'];

export interface BAIProjectSelectAstryxRef {
  refetch: () => void;
}

export interface BAIProjectSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIProjectSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  filter?: string;
  ref?: React.Ref<BAIProjectSelectAstryxRef>;
}

const BAIProjectSelectAstryx: React.FC<BAIProjectSelectAstryxProps> = ({
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

  const { group_nodes: selectedGroupNodes } =
    useLazyLoadQuery<BAIProjectSelectAstryxValueQuery>(
      graphql`
        query BAIProjectSelectAstryxValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelected: Boolean!
        ) {
          group_nodes(
            filter: $selectedFilter
            first: $first
            permission: "read_attribute"
          ) @skip(if: $skipSelected) {
            edges {
              node {
                id
                name
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
                  _.map(selectedKeys, (value) => `id == "${toLocalId(value)}"`),
                  '|',
                )
              : null,
            filter,
          ],
          '&',
        ),
        first: Math.max(selectedKeys.length, 1),
        skipSelected: selectedKeys.length === 0,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIProjectSelectAstryxPaginatedQuery,
      AstryxProjectNode
    >(
      graphql`
        query BAIProjectSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
        ) {
          group_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            permission: "read_attribute"
            order: "-created_at"
          ) {
            count
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          filter,
          debouncedDeferredValue
            ? `name ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.group_nodes?.count ?? undefined,
        getItem: (r) => r.group_nodes?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
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
      const key = item?.id;
      return key
        ? {
            value: key,
            label: item?.name ?? key,
          }
        : null;
    }),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const edge = _.find(
        selectedGroupNodes?.edges,
        (e) => e?.node?.id === key,
      );
      return { label: edge?.node?.name ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIProjectSelect.SelectProject')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.group_nodes?.count ?? undefined}
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

export default BAIProjectSelectAstryx;
