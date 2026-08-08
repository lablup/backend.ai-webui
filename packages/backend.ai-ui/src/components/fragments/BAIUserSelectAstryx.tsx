/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIUserSelectAstryx — the ticket-26 demonstration consumer of
 `BAIComplexSelect`.

 `BAIUserSelect` is the hardest select in this repo and the template the other
 ~17 Relay-backed `*Select` wrappers follow: Relay OFFSET pagination with
 scroll-driven `loadNext`, server-side search, `labelInValue`, and
 single/multiple modes all at once (cn-oss-removal ticket 12 §"이식 대상 선정").
 Porting it first is what proves the foundation; ticket 27 converts the rest.

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIUserSelect` is NOT touched. It keeps serving every unmigrated call site
 until ticket 27 moves them. This file is the Astryx-native sibling, and its
 OUTER value contract is deliberately the same plain key (`string` /
 `string[]`) the antd wrapper exposes — labelInValue lives strictly between
 the wrapper and `BAIComplexSelect`, exactly as it does between
 `BAIUserSelect` and `BAISelect` today.

 PILOT-DECISIONs:
  - P26-5 `useControllableValue` (ahooks) is kept for the value/open pair, so
    the wrapper stays drop-in for both controlled and uncontrolled callers.
  - P26-6 The `open ? 'network-only' : 'store-only'` fetchPolicy switch
    survives — `BAIComplexSelect.onOpenChange` re-exposes the open state that
    `ComplexSelector` otherwise keeps private.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped: `emptyContent` takes a ReactNode but a skeleton row inside an
    Astryx popup adds an antd dependency back into a migrated surface. The
    empty state is the shared "No results" text (simplicity policy).
*/
import { BAIUserSelectAstryxPaginatedQuery } from '../../__generated__/BAIUserSelectAstryxPaginatedQuery.graphql';
import { BAIUserSelectAstryxValueQuery } from '../../__generated__/BAIUserSelectAstryxValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import { mergeFilterValues } from '../BAIPropertyFilter';
import { useControllableValue } from 'ahooks';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AstryxUserNode = NonNullable<
  NonNullable<
    BAIUserSelectAstryxPaginatedQuery['response']['user_nodes']
  >['edges'][number]
>['node'];

export interface BAIUserSelectAstryxRef {
  refetch: () => void;
}

export interface BAIUserSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIUserSelect` exposes. */
  value?: string | Array<string> | null;
  /**
   * P3C-1: the second `option` argument survives here (and only here). antd's
   * `onChange(value, option)` was dropped wholesale by ticket 27, but
   * `BAIGraphQLPropertyFilter.renderInput` needs the human-readable label to
   * put on the filter chip while the raw UUID goes into the GraphQL filter —
   * and the label is not derivable at the call site. Shape is the
   * `labelInValue` pair the wrapper already holds, so nothing is rebuilt.
   */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  filter?: string;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIUserSelectAstryxRef>;
}

/** Same rationale as `BAIUserSelect`: `user_nodes` filters on the enum. */
const defaultActiveUserFilter = 'status == "active"';

const BAIUserSelectAstryx: React.FC<BAIUserSelectAstryxProps> = ({
  filter,
  excludeInactive = false,
  valuePropName = 'email',
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

  const mergedFilter = mergeFilterValues([
    excludeInactive ? defaultActiveUserFilter : null,
    filter,
  ]);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  /**
   * The selected-key -> label resolution query. In antd this was a NICETY
   * (antd renders the raw value when no option matches); on Astryx it is
   * MANDATORY infrastructure — the trigger reads its text from the VALUE, and
   * a value chosen on page 1 is not in `options` after `loadNext` has paged
   * past it (cn-oss-removal ticket 12 §2b).
   */
  const { user_nodes: selectedUserNodes } =
    useLazyLoadQuery<BAIUserSelectAstryxValueQuery>(
      graphql`
        query BAIUserSelectAstryxValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelected: Boolean!
        ) {
          user_nodes(filter: $selectedFilter, first: $first)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                email
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
                  _.map(selectedKeys, (value) =>
                    valuePropName === 'id'
                      ? `uuid == "${value}"`
                      : `email == "${value}"`,
                  ),
                  '|',
                )
              : null,
            mergedFilter,
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
    useLazyPaginatedQuery<BAIUserSelectAstryxPaginatedQuery, AstryxUserNode>(
      graphql`
        query BAIUserSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
          $order: String
        ) {
          user_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            order: $order
          ) {
            count
            edges {
              node {
                id
                email
                username
                full_name
                status
                role
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          mergedFilter,
          debouncedDeferredValue
            ? `email ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
        order: 'email',
      },
      {
        // P26-6: the open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.user_nodes?.count ?? undefined,
        getItem: (r) => r.user_nodes?.edges?.map((edge) => edge?.node),
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

  const keyOfNode = (
    node: { id: string; email?: string | null } | null | undefined,
  ): string | undefined => {
    if (!node) return undefined;
    return valuePropName === 'id'
      ? toLocalId(node.id)
      : (node.email ?? undefined);
  };

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: item?.email ?? key,
            description: item?.full_name ?? undefined,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const edge = _.find(
        selectedUserNodes?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: edge?.node?.email ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIUserSelect.SelectUser')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.user_nodes?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
        // P3C-1: second argument carries the labelInValue pair(s).
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

export default BAIUserSelectAstryx;
