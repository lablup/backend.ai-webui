/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIObjectStorageSelectAstryx — ticket-27 Astryx sibling of
 `BAIObjectStorageSelect`, built on `BAIComplexSelect` (ticket 26). See
 `.scratch/astryx-migration/shots/26/CONVERSION-BRIEF.md` §2.B for the recipe
 this file follows (copy of `BAIUserSelectAstryx.tsx`, the worked example).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIObjectStorageSelect` is NOT touched by this change. It keeps serving
 every unmigrated call site until ticket 27 moves them. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string`) the antd wrapper exposes.

 CLASS B (id-valued): the key is the object storage's raw GraphQL `id`.

 PILOT-DECISIONs:
  - The antd original had NO selected-value resolution query at all — it
    passed `value`/`onChange` straight through to `BAISelect` WITHOUT
    `labelInValue`, relying on plain antd `Select`'s fallback of printing the
    raw value string in the trigger when no matching option is loaded. Astryx
    has no such fallback (the trigger always reads `value.label`), so per
    CONVERSION-BRIEF §2.A ("the value query is no longer optional") this file
    ADDS one, backed by the singular `objectStorage(id: ID!)` field. Because
    that field only resolves one id at a time (the `objectStorages`
    connection takes no id-list filter), this wrapper stays single-select
    only, same as the antd original was exercised in practice (no call site
    or story ever set `mode="multiple"`).
  - antd's `labelRender` wrapped the label in `<BAIText>{label}</BAIText>`
    (a plain, non-monospace `Text`, purely for consistent typography). Dropped
    — `BAIComplexSelect` requires `label` to be a plain string; no
    information is lost, only that styling wrapper.
  - The original called `selectRef.current?.scrollTo(0)` (an antd `BAISelect`
    imperative ref API) to reset scroll position once a debounced search
    settled. `BAIComplexSelect` has no imperative ref, so this is dropped —
    the option list simply re-renders from the top of its DOM on a fresh
    result set instead of forcing a scroll reset.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped (see `BAIComplexSelect` header, general policy).
*/
import { BAIObjectStorageSelectAstryxQuery } from '../../__generated__/BAIObjectStorageSelectAstryxQuery.graphql';
import { BAIObjectStorageSelectAstryxValueQuery } from '../../__generated__/BAIObjectStorageSelectAstryxValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
} from '../BAIComplexSelect';
import { useControllableValue } from 'ahooks';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AstryxObjectStorageNode = NonNullable<
  NonNullable<
    BAIObjectStorageSelectAstryxQuery['response']['objectStorages']
  >['edges'][number]
>['node'];

export interface BAIObjectStorageSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  | 'options'
  | 'value'
  | 'onChange'
  | 'searchValue'
  | 'onSearch'
  | 'total'
  // Single-select only — see the header PILOT-DECISION on the value query.
  | 'multiple'
> {
  /** Plain key, as the antd `BAIObjectStorageSelect` exposes. */
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  fetchKey?: string;
}

const BAIObjectStorageSelectAstryx: React.FC<
  BAIObjectStorageSelectAstryxProps
> = ({ fetchKey, isLoading, ...selectProps }) => {
  'use memo';
  const [controllableValue, setControllableValue] = useControllableValue<
    string | null | undefined
  >(selectProps as Record<string, unknown>, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps as Record<string, unknown>,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
    },
  );

  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>('');
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const skipSelected = !deferredControllableValue;

  const { objectStorage: selectedObjectStorage } =
    useLazyLoadQuery<BAIObjectStorageSelectAstryxValueQuery>(
      graphql`
        query BAIObjectStorageSelectAstryxValueQuery(
          $id: ID!
          $skipSelected: Boolean!
        ) {
          objectStorage(id: $id) @skip(if: $skipSelected) {
            id
            name
          }
        }
      `,
      {
        id: deferredControllableValue ?? '',
        skipSelected,
      },
      {
        fetchPolicy: !skipSelected ? 'store-or-network' : 'store-only',
        fetchKey,
      },
    );

  const {
    paginationData,
    result: { objectStorages },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    BAIObjectStorageSelectAstryxQuery,
    AstryxObjectStorageNode
  >(
    graphql`
      query BAIObjectStorageSelectAstryxQuery($offset: Int!, $limit: Int!) {
        objectStorages(offset: $offset, limit: $limit) {
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
    // Preserved verbatim from the antd original — do not widen the page size.
    { limit: 1 },
    {},
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (r) => r.objectStorages?.count ?? undefined,
      getItem: (r) => r.objectStorages?.edges?.map((edge) => edge?.node),
      getId: (item) => item?.id,
    },
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

  const labeledValue: BAIComplexSelectValue = deferredControllableValue
    ? {
        label:
          selectedObjectStorage?.id === deferredControllableValue
            ? (selectedObjectStorage?.name ?? deferredControllableValue)
            : deferredControllableValue,
        value: deferredControllableValue,
      }
    : null;

  return (
    <BAIComplexSelect
      placeholder="Select Storage"
      {...selectProps}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue
      }
      isLoadingNext={isLoadingNext}
      total={objectStorages?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const picked = _.isArray(next) ? next[0] : next;
        setControllableValue(picked?.value, undefined);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIObjectStorageSelectAstryx;
