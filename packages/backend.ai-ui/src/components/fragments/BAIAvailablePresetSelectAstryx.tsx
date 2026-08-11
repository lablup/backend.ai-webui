/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAvailablePresetSelectAstryx — ticket-27 Astryx sibling of the antd
 `BAIAvailablePresetSelect` (Relay-paginated, id-valued select pattern B,
 following the recipe used across the Astryx migration).

 FRONTIER RULE (MIGRATION-SPEC §0 "번역 프런티어" / 래퍼 정책): the antd
 `BAIAvailablePresetSelect` is NOT touched by this file. It keeps serving
 every unmigrated call site until a later ticket moves them over. This file
 is the Astryx-native sibling, and its OUTER value contract is deliberately
 the same plain key (`string` / `string[]`) the antd wrapper exposes —
 labelInValue lives strictly between the wrapper and `BAIComplexSelect`.

 PILOT-DECISIONs:
  - P26-3 the antd `optionRender` (name + secondary `description` line via
    `BAIFlex`/`Typography.Text`) moves into `BAIComplexSelectOption.description`
    — a `ReactNode` slot is not needed here, the description is plain text.
  - The antd original grouped options into per-`runtimeVariant` optgroups
    (`_.groupBy` + nested `DefaultOptionType.options`) whenever more than one
    variant appeared on the loaded page. `BAIComplexSelectOption` has no
    group/section concept (flat `{value,label,description,extra,disabled}[]`
    only), so the grouping is DROPPED — options render as one flat list in
    the server's `RANK` order, same as when only one variant was present
    before. `runtimeVariantId` remains a filter prop that narrows the whole
    list to one variant, which is the primary way this grouping was used by
    callers.
  - P26-6 The `open ? 'network-only' : 'store-only'` fetchPolicy switch is
    kept — `BAIComplexSelect.onOpenChange` re-exposes the open state that
    `ComplexSelector` otherwise keeps private.
  - P26-7 antd's `notFoundContent={<Skeleton.Input/>}` first-load placeholder
    is dropped: the empty state is the shared "No results" text.
*/
import { BAIAvailablePresetSelectAstryxPaginatedQuery } from '../../__generated__/BAIAvailablePresetSelectAstryxPaginatedQuery.graphql';
import { BAIAvailablePresetSelectAstryxValueQuery } from '../../__generated__/BAIAvailablePresetSelectAstryxValueQuery.graphql';
import { convertToUUID, toLocalId } from '../../helper';
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

export type AstryxDeploymentRevisionPresetNode = NonNullable<
  NonNullable<
    NonNullable<
      BAIAvailablePresetSelectAstryxPaginatedQuery['response']['deploymentRevisionPresets']
    >['edges'][number]
  >['node']
>;

export interface BAIAvailablePresetSelectAstryxRef {
  refetch: () => void;
}

export interface BAIAvailablePresetSelectAstryxProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAvailablePresetSelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  runtimeVariantId?: string;
  ref?: React.Ref<BAIAvailablePresetSelectAstryxRef>;
}

const BAIAvailablePresetSelectAstryx: React.FC<
  BAIAvailablePresetSelectAstryxProps
> = ({
  runtimeVariantId,
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
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);

  // Resolved (typed) UUIDs of currently selected presets, for the `id.in` filter.
  const selectedIds = _.compact(
    _.castArray(deferredControllableValue ?? []).map((v) =>
      v ? convertToUUID(_.toString(v)) : null,
    ),
  );

  /**
   * The selected-id -> label resolution query. Mandatory on Astryx (the
   * trigger reads its text from the VALUE, and a value chosen on page 1 is
   * not in `options` after `loadNext` has paged past it). Not paginated —
   * `first` is sized exactly to the selection so all labels arrive together.
   */
  const { deploymentRevisionPresets: selectedPresets } =
    useLazyLoadQuery<BAIAvailablePresetSelectAstryxValueQuery>(
      graphql`
        query BAIAvailablePresetSelectAstryxValueQuery(
          $ids: [UUID!]
          $first: Int!
          $skip: Boolean!
        ) {
          deploymentRevisionPresets(
            filter: { id: { in: $ids } }
            first: $first
          ) @skip(if: $skip) {
            edges {
              node {
                id
                name
                description
              }
            }
          }
        }
      `,
      {
        ids: selectedIds,
        first: Math.max(selectedIds.length, 1),
        skip: selectedIds.length === 0,
      },
      {
        fetchPolicy: selectedIds.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  // Fields set on a single filter object are AND-ed together, so runtime
  // variant + search conditions merge onto one object. `null` when no filter
  // is active so the query field receives the schema default.
  const mergedFilter: NonNullable<
    BAIAvailablePresetSelectAstryxPaginatedQuery['variables']['filter']
  > | null =
    runtimeVariantId || deferredSearchStr
      ? {
          ...(runtimeVariantId
            ? { runtimeVariantId: { equals: convertToUUID(runtimeVariantId) } }
            : {}),
          ...(deferredSearchStr
            ? { name: { iContains: deferredSearchStr } }
            : {}),
        }
      : null;

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAvailablePresetSelectAstryxPaginatedQuery,
      AstryxDeploymentRevisionPresetNode
    >(
      graphql`
        query BAIAvailablePresetSelectAstryxPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: DeploymentRevisionPresetFilter
        ) {
          deploymentRevisionPresets(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: RANK, direction: "ASC" }]
          ) {
            count
            edges {
              node {
                id
                name
                description
                rank
                runtimeVariantId
                runtimeVariant {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergedFilter,
      },
      {
        // P26-6: the open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.deploymentRevisionPresets?.count ?? undefined,
        getItem: (r) =>
          r.deploymentRevisionPresets?.edges?.map((edge) => edge?.node),
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

  // Flat list, RANK-ordered — see header PILOT-DECISION on the dropped
  // runtime-variant optgroup grouping.
  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: item?.name ?? key,
            description: item?.description ?? undefined,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const selectedIdKeys = _.compact(
      _.castArray(deferredControllableValue ?? []),
    );
    const labeled: Array<BAILabeledValue> = _.map(selectedIdKeys, (key) => {
      const edge = _.find(
        selectedPresets?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: edge?.node?.name ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIAvailablePresetSelect.SelectPreset')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== deferredSearchStr ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.deploymentRevisionPresets?.count ?? undefined}
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

export default BAIAvailablePresetSelectAstryx;
