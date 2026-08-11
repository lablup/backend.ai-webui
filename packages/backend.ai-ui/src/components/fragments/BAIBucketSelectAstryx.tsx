/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIBucketSelectAstryx — ticket-27 Astryx sibling of the antd
 `BAIBucketSelect` (Relay-paginated, id-valued select, see
 `.scratch/astryx-migration/shots/26/CONVERSION-BRIEF.md` §2.B).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIBucketSelect` is NOT touched by this file. It keeps serving every
 unmigrated call site until a later ticket moves them over. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) — labelInValue lives strictly between the
 wrapper and `BAIComplexSelect`. (Note: the antd original did not even wrap
 `value`/`onChange` itself — it forwarded the caller's own antd `Select`
 props straight through with no `labelInValue`. `BAIComplexSelect` always
 needs a labelInValue-shaped value, so this sibling adds the same
 `useControllableValue` plain-key wrapping every other Astryx sibling in this
 batch uses, for consistency and because it is now load-bearing.)

 PILOT-DECISIONs:
  - The `ObjectStorage.namespaces` field (schema: data/schema.graphql) exposes only
    pagination arguments (`before`/`after`/`first`/`last`/`limit`/`offset`) —
    no `filter` input. Unlike every other wrapper in ticket 27, there is no
    GraphQL shape that can resolve "give me the label for this one selected
    namespace id" out of band, so the mandatory value-resolution query
    (CONVERSION-BRIEF §2.A) cannot be built here. This wrapper instead
    resolves the selected label from whichever page of `namespaces` is
    already loaded (`paginationData`), falling back to echoing the raw id as
    the label — the same "raw value in the trigger" fallback antd used when
    no option matched, just sourced locally instead of from a dedicated
    query.
  - antd `autoSelectOption` (auto-picks the sole/first matching option) has
    no `BAIComplexSelect` equivalent — dropped.
  - The original's `selectRef.current?.scrollTo(0)` effect (scroll the
    option list to the top whenever the debounced search settles) relied on
    `BAISelect`'s imperative ref, which `BAIComplexSelect` does not expose
    (see `BAIComplexSelect.tsx` prop table, "no imperative handle") — dropped.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped: the empty state is the shared "No results" text.
*/
import { BAIBucketSelectAstryxQuery } from '../../__generated__/BAIBucketSelectAstryxQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { graphql } from 'react-relay';

export interface BAIBucketSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  objectStorageId: string;
  fetchKey?: string;
  /** Plain key(s), as the antd `BAIBucketSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
}

const BAIBucketSelectAstryx: React.FC<BAIBucketSelectAstryxProps> = ({
  objectStorageId,
  fetchKey,
  multiple = false,
  isLoading,
  ...selectProps
}) => {
  'use memo';
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

  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  const {
    paginationData,
    result: { objectStorage },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    BAIBucketSelectAstryxQuery,
    NonNullable<
      NonNullable<
        BAIBucketSelectAstryxQuery['response']['objectStorage']
      >['namespaces']
    >['edges'][number]
  >(
    graphql`
      query BAIBucketSelectAstryxQuery(
        $offset: Int!
        $limit: Int!
        $objectStorageId: ID!
        $first: Int
        $last: Int
        $before: String
        $after: String
      ) {
        objectStorage(id: $objectStorageId) {
          namespaces(
            offset: $offset
            limit: $limit
            first: $first
            last: $last
            before: $before
            after: $after
          ) {
            count
            edges {
              node {
                id
                namespace
              }
            }
          }
        }
      }
    `,
    {
      limit: 1,
    },
    {
      objectStorageId,
      first: null,
      last: null,
      before: null,
      after: null,
    },
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.objectStorage?.namespaces?.count,
      getItem: (result) => result.objectStorage?.namespaces?.edges,
      getId: (item) => item?.node.id,
    },
  );

  // id-valued: the raw Relay node id, exactly as the antd original used it
  // (never converted via `toLocalId`).
  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.node?.id;
      return key ? { value: key, label: item?.node?.namespace ?? key } : null;
    }),
  );

  /**
   * Plain keys -> labelInValue. See header PILOT-DECISION: without a
   * value-resolution query, this can only resolve labels for keys present in
   * the already-loaded `paginationData` window; anything else echoes the raw
   * key as its own label.
   */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const edge = _.find(paginationData, (item) => item?.node?.id === key);
      return { label: edge?.node?.namespace ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue
      }
      isLoadingNext={isLoadingNext}
      total={objectStorage?.namespaces?.count ?? undefined}
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

export default BAIBucketSelectAstryx;
