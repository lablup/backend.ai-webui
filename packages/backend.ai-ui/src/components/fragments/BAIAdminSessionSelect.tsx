/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminSessionSelect — ticket-27 Astryx sibling of the antd
 `BAIAdminSessionSelect` (Relay-paginated, id-valued select pattern B,
 following the recipe used across the Astryx migration).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIAdminSessionSelect` is NOT touched by this file. It keeps serving every
 unmigrated call site until a later ticket moves them over. This file is the
 Astryx-native sibling, and its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) the antd wrapper exposes — labelInValue
 lives strictly between the wrapper and `BAIComplexSelect`.

 PILOT-DECISIONs:
  - P26-6 The `open ? 'network-only' : 'store-only'` fetchPolicy switch is
    kept — `BAIComplexSelect.onOpenChange` re-exposes the open state that
    `ComplexSelector` otherwise keeps private.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped: the empty state is the shared "No results" text.
  - The antd original's explicit `onChange?: (value, option: any) => void`
    override is dropped in favor of the single-argument plain-key contract
    used by every other Astryx sibling (`BAIUserSelect` included) — no
    call site of this new component can rely on the antd `option` argument.
  - This wrapper's antd original had no `optionRender`/`labelRender`, so
    there is no rich-content-to-`description` migration to record here.
*/
import { BAIAdminSessionSelectPaginatedQuery } from '../../__generated__/BAIAdminSessionSelectPaginatedQuery.graphql';
import { BAIAdminSessionSelectValueQuery } from '../../__generated__/BAIAdminSessionSelectValueQuery.graphql';
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
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AstryxAdminSessionNode = NonNullable<
  NonNullable<
    BAIAdminSessionSelectPaginatedQuery['response']['adminSessionsV2']
  >['edges'][number]
>['node'];

export interface BAIAdminSessionSelectRef {
  refetch: () => void;
}

export interface BAIAdminSessionSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAdminSessionSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  ref?: React.Ref<BAIAdminSessionSelectRef>;
}

const BAIAdminSessionSelect: React.FC<BAIAdminSessionSelectProps> = ({
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
  const selectedIds = _.compact(_.castArray(deferredControllableValue ?? []));

  /**
   * The selected-id -> label resolution query. Mandatory on Astryx (the
   * trigger reads its text from the VALUE, and a value chosen on page 1 is
   * not in `options` after `loadNext` has paged past it).
   */
  const { adminSessionsV2: selectedSessionNodes } =
    useLazyLoadQuery<BAIAdminSessionSelectValueQuery>(
      graphql`
        query BAIAdminSessionSelectValueQuery(
          $filter: SessionV2Filter
          $first: Int!
          $skipSelected: Boolean!
        ) {
          adminSessionsV2(filter: $filter, first: $first)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      {
        filter: selectedIds.length
          ? {
              id: { in: selectedIds },
              status: {
                notIn: ['TERMINATING', 'TERMINATED', 'CANCELLED'],
              },
            }
          : null,
        first: Math.max(selectedIds.length, 1),
        skipSelected: selectedIds.length === 0,
      },
      {
        fetchPolicy: selectedIds.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminSessionSelectPaginatedQuery,
      AstryxAdminSessionNode
    >(
      graphql`
        query BAIAdminSessionSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: SessionV2Filter
        ) {
          adminSessionsV2(offset: $offset, limit: $limit, filter: $filter) {
            count
            edges {
              node {
                id
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
        filter: {
          status: {
            notIn: ['TERMINATING', 'TERMINATED', 'CANCELLED'],
          },
          ...(debouncedDeferredValue
            ? { name: { contains: debouncedDeferredValue } }
            : {}),
        },
      },
      {
        // P26-6: the open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminSessionsV2?.count ?? undefined,
        getItem: (r) => r.adminSessionsV2?.edges?.map((edge) => edge?.node),
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

  // id-valued (class B): the raw UUID (`toLocalId`), never the Relay global id.
  const keyOfNode = (
    node: { id: string } | null | undefined,
  ): string | undefined => (node?.id ? toLocalId(node.id) : undefined);

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: item?.metadata?.name ?? key,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedIds, (key) => {
      const edge = _.find(
        selectedSessionNodes?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: edge?.node?.metadata?.name ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIAdminSessionSelect.SelectSession')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminSessionsV2?.count ?? undefined}
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

export default BAIAdminSessionSelect;
