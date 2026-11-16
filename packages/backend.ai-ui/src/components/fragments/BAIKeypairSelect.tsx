/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIKeypairSelect — ticket-27 Astryx sibling of `BAIKeypairSelect`,
 built on `BAIComplexSelect` (ticket 26), following pattern A of the
 recipe used across the Astryx migration (copy of `BAIUserSelect.tsx`,
 the worked example).

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
import {
  BAIKeypairSelectPaginatedQuery,
  KeypairFilter,
} from '../../__generated__/BAIKeypairSelectPaginatedQuery.graphql';
import { BAIKeypairSelectValueQuery } from '../../__generated__/BAIKeypairSelectValueQuery.graphql';
import { combineFilters } from '../../helper';
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

export type AstryxKeypairNode = NonNullable<
  BAIKeypairSelectPaginatedQuery['response']['adminKeypairsV2']
>['edges'][number]['node'];

export interface BAIKeypairSelectRef {
  refetch: () => void;
}

export interface BAIKeypairSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIKeypairSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  filter?: KeypairFilter;
  ref?: React.Ref<BAIKeypairSelectRef>;
}

const BAIKeypairSelect: React.FC<BAIKeypairSelectProps> = ({
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

  // Keypair management is superadmin-only (ADR 0012), so the reads are admin*.
  const { adminKeypairsV2: selectedKeypairs } =
    useLazyLoadQuery<BAIKeypairSelectValueQuery>(
      graphql`
        query BAIKeypairSelectValueQuery(
          $filter: KeypairFilter
          $limit: Int!
          $skipSelected: Boolean!
        ) {
          adminKeypairsV2(filter: $filter, limit: $limit)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                accessKey
              }
            }
          }
        }
      `,
      {
        filter: selectedKeys.length
          ? combineFilters<KeypairFilter>([
              { accessKey: { in: selectedKeys } },
              filter,
            ])
          : null,
        limit: Math.max(selectedKeys.length, 1),
        skipSelected: selectedKeys.length === 0,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIKeypairSelectPaginatedQuery, AstryxKeypairNode>(
      graphql`
        query BAIKeypairSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: KeypairFilter
        ) {
          adminKeypairsV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
            count
            edges {
              node {
                id
                accessKey
                userId
                isActive
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: combineFilters<KeypairFilter>([
          filter,
          debouncedDeferredValue
            ? { accessKey: { iContains: debouncedDeferredValue } }
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminKeypairsV2?.count ?? undefined,
        getItem: (r) => _.map(r.adminKeypairsV2?.edges, 'node'),
        getId: (item) => item?.accessKey,
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
      const key = item?.accessKey;
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
        selectedKeypairs?.edges,
        (edge) => edge.node.accessKey === key,
      );
      return { label: item?.node.accessKey ?? key, value: key };
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
        // The open-driven `network-only` refetch is a deferred update and
        // raises no pending flag of its own (FR-3724). Only the opening
        // half counts; closing would flash the spinner for nothing.
        (!!controllableOpen && !deferredOpen) ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminKeypairsV2?.count ?? undefined}
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

export default BAIKeypairSelect;
