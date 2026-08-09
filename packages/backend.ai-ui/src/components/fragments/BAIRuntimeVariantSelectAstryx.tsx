/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIRuntimeVariantSelectAstryx — ticket-27 Astryx sibling of
 `BAIRuntimeVariantSelect`, built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIRuntimeVariantSelect` is NOT touched. It keeps serving every unmigrated
 call site until this wrapper's last consumer is converted. This file's OUTER
 value contract is deliberately the same plain key (`string | undefined`) the
 antd wrapper exposes today — `labelInValue` lives strictly between this
 wrapper and `BAIComplexSelect`.

 Single-value only: the antd original never handled `mode="multiple"` in its
 `onChange`, so this sibling keeps that same single-value assumption.

 PILOT-DECISIONs: none. The antd original used no `optionRender` /
 `labelRender` / `onClickVFolder`-style rich rendering, so there is nothing
 beyond the standard `notFoundContent={<Skeleton.Input/>}` drop (P26-7) to
 record here.
*/
import { BAIRuntimeVariantSelectAstryxPaginatedQuery } from '../../__generated__/BAIRuntimeVariantSelectAstryxPaginatedQuery.graphql';
import { BAIRuntimeVariantSelectAstryxValueQuery } from '../../__generated__/BAIRuntimeVariantSelectAstryxValueQuery.graphql';
import { convertToUUID, toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue, useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type RuntimeVariantNode = NonNullable<
  NonNullable<
    BAIRuntimeVariantSelectAstryxPaginatedQuery['response']['runtimeVariants']
  >['edges'][number]
>['node'];

export interface BAIRuntimeVariantSelectAstryxRef {
  refetch: () => void;
}

export interface BAIRuntimeVariantSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key, as the antd `BAIRuntimeVariantSelect` exposes. */
  value?: string | null;
  onChange?: (value: string | undefined) => void;
  /**
   * Notifies the parent of resolved id→name pairs as the paginated list and
   * selected-value point lookup fan in. The parent typically merges these
   * into a local map so it can resolve the *currently selected* variant id
   * back to its name elsewhere in the form (e.g., for `variantName === 'custom'`
   * branching) without re-querying.
   */
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
  ref?: React.Ref<BAIRuntimeVariantSelectAstryxRef>;
}

const BAIRuntimeVariantSelectAstryx: React.FC<
  BAIRuntimeVariantSelectAstryxProps
> = ({ onResolvedNamesChange, isLoading, ref, ...selectProps }) => {
  'use memo';
  const { t } = useBAIi18n();
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
      defaultValuePropName: 'defaultOpen',
    },
  );

  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>('');
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const deferredControllableValue = useDeferredValue(controllableValue);

  // Selected-value name lookup. `RuntimeVariantFilter` only exposes `name` —
  // no id filter — so the single selected variant is resolved via the
  // `runtimeVariant(id:)` point lookup. `@skip` collapses the request when
  // nothing is selected.
  const selectedUuid = deferredControllableValue
    ? convertToUUID(_.toString(deferredControllableValue))
    : '';
  const { runtimeVariant: selectedVariant } =
    useLazyLoadQuery<BAIRuntimeVariantSelectAstryxValueQuery>(
      graphql`
        query BAIRuntimeVariantSelectAstryxValueQuery(
          $id: UUID!
          $skip: Boolean!
        ) {
          runtimeVariant(id: $id) @skip(if: $skip) {
            id
            name
          }
        }
      `,
      {
        id: selectedUuid,
        skip: !selectedUuid,
      },
      {
        fetchPolicy: selectedUuid ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const mergedFilter: NonNullable<
    BAIRuntimeVariantSelectAstryxPaginatedQuery['variables']['filter']
  > | null = debouncedDeferredValue
    ? { name: { iContains: debouncedDeferredValue } }
    : null;

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIRuntimeVariantSelectAstryxPaginatedQuery,
      RuntimeVariantNode
    >(
      graphql`
        query BAIRuntimeVariantSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: RuntimeVariantFilter
        ) {
          runtimeVariants(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: "ASC" }]
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
      { limit: 20 },
      {
        filter: mergedFilter,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.runtimeVariants?.count ?? undefined,
        getItem: (r) => r.runtimeVariants?.edges?.map((edge) => edge?.node),
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

  // Notify parent of resolved id→name pairs. We feed *both* the currently
  // selected variant (from the point lookup) and the visible page (from the
  // paginated list), so callers get name resolution as soon as either lands.
  const notifyResolvedNames = useEffectEvent(() => {
    if (!onResolvedNamesChange) return;
    const nameMap: Record<string, string> = {};
    if (selectedVariant?.id && selectedVariant.name) {
      const uuid = toLocalId(selectedVariant.id);
      if (uuid) nameMap[uuid] = selectedVariant.name;
    }
    for (const node of paginationData ?? []) {
      if (node?.id && node.name) {
        const uuid = toLocalId(node.id);
        if (uuid) nameMap[uuid] = node.name;
      }
    }
    if (!_.isEmpty(nameMap)) onResolvedNamesChange(nameMap);
  });

  useEffect(() => {
    notifyResolvedNames();
  }, [selectedVariant, paginationData]);

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = item?.id ? toLocalId(item.id) : undefined;
      return key
        ? {
            value: key,
            label: item?.name ?? key,
          }
        : null;
    }),
  );

  /** Plain key -> labelInValue, resolving the label where we can. */
  const labeledValue: BAIComplexSelectValue = deferredControllableValue
    ? {
        label: selectedVariant?.name ?? _.toString(deferredControllableValue),
        value: _.toString(deferredControllableValue),
      }
    : null;

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIRuntimeVariantSelect.SelectRuntimeVariant')}
      {...selectProps}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.runtimeVariants?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const v = _.isArray(next) ? next[0] : next;
        setControllableValue(v?.value, undefined);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIRuntimeVariantSelectAstryx;
