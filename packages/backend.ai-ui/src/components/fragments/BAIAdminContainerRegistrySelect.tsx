/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminContainerRegistrySelect — ticket-27 Astryx sibling of
 `BAIAdminContainerRegistrySelect`, built on `BAIComplexSelect` (ticket 26).

 FRONTIER RULE (MIGRATION-SPEC §0 / CONVERSION-BRIEF §2.A): the antd
 `BAIAdminContainerRegistrySelect` is NOT touched by this file and keeps
 serving every unmigrated call site until ticket 27 moves them. This is the
 Astryx-native sibling; its OUTER value contract is deliberately the same
 plain key (`string` / `string[]`) the antd wrapper exposes today —
 `labelInValue` lives strictly between this wrapper and `BAIComplexSelect`.

 CLASS: B (id-valued) when `valuePropName === 'id'` (default); A
 (name-valued, on the `row_id` field) when `valuePropName === 'row_id'`.
 Both branches echo the antd original's field selection verbatim, including
 its quirk of NOT `toLocalId`-normalizing the exposed `id`-mode value (only
 the filter-building step does that conversion) — preserved as-is per the
 "do not change which field is the key" rule.

 PILOT-DECISIONs:
  - The antd original passed the raw rc-select `option` object as a second
    `onChange` argument; `BAIComplexSelect.onChange` only emits the
    labelInValue-derived value, so that second argument is dropped — no
    consumer of this wrapper used it.
  - `notFoundContent={<Skeleton.Input/>}` first-load placeholder dropped
    (P26-7); the shared "No results" text is used instead.
  - This wrapper never used `optionRender`/`labelRender`; the antd version
    already composed a single formatted string label
    (`"registry_name - project"`), which carries over unchanged.
*/
import { BAIAdminContainerRegistrySelectPaginatedQuery } from '../../__generated__/BAIAdminContainerRegistrySelectPaginatedQuery.graphql';
import { BAIAdminContainerRegistrySelectValueQuery } from '../../__generated__/BAIAdminContainerRegistrySelectValueQuery.graphql';
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

export type AstryxContainerRegistryNode = NonNullable<
  NonNullable<
    BAIAdminContainerRegistrySelectPaginatedQuery['response']['container_registry_nodes']
  >['edges'][number]
>['node'];

export interface BAIAdminContainerRegistrySelectRef {
  refetch: () => void;
}

export interface BAIAdminContainerRegistrySelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIAdminContainerRegistrySelect` exposes. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  filter?: string;
  valuePropName?: 'id' | 'row_id';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminContainerRegistrySelectRef>;
}

const BAIAdminContainerRegistrySelect: React.FC<
  BAIAdminContainerRegistrySelectProps
> = ({
  filter,
  valuePropName = 'id',
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

  /**
   * The selected-key -> label resolution query. In antd this was a NICETY
   * (antd renders the raw value when no option matches); on Astryx it is
   * MANDATORY infrastructure — the trigger reads its text from the VALUE,
   * and a value chosen on page 1 is not in `options` after `loadNext` has
   * paged past it.
   */
  const { container_registry_nodes: selectedRegistryNodes } =
    useLazyLoadQuery<BAIAdminContainerRegistrySelectValueQuery>(
      graphql`
        query BAIAdminContainerRegistrySelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelected: Boolean!
        ) {
          container_registry_nodes(filter: $selectedFilter, first: $first)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                row_id
                registry_name
                project
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
                  _.map(selectedKeys, (value) => {
                    // Convert Global ID to local UUID for filtering when valuePropName is 'id'
                    const filterValue =
                      valuePropName === 'id' ? toLocalId(value) : value;
                    return valuePropName === 'id'
                      ? `id == "${filterValue}"`
                      : `row_id == "${filterValue}"`;
                  }),
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
      BAIAdminContainerRegistrySelectPaginatedQuery,
      AstryxContainerRegistryNode
    >(
      graphql`
        query BAIAdminContainerRegistrySelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
        ) {
          container_registry_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            order: "registry_name"
          ) {
            count
            edges {
              node {
                id
                row_id
                registry_name
                project
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
            ? `registry_name ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.container_registry_nodes?.count ?? undefined,
        getItem: (r) =>
          r.container_registry_nodes?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.[valuePropName],
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

  const formatLabel = (
    registryName?: string | null,
    project?: string | null,
  ) => (project ? `${registryName} - ${project}` : (registryName ?? ''));

  const keyOfNode = (
    node: { id?: string | null; row_id?: string | null } | null | undefined,
  ): string | undefined => {
    if (!node) return undefined;
    return (valuePropName === 'id' ? node.id : node.row_id) ?? undefined;
  };

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: formatLabel(item?.registry_name, item?.project),
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const edge = _.find(
        selectedRegistryNodes?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      return {
        label: edge?.node
          ? formatLabel(edge.node.registry_name, edge.node.project)
          : key,
        value: key,
      };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t(
        'comp:BAIAdminContainerRegistrySelect.SelectContainerRegistry',
      )}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.container_registry_nodes?.count ?? undefined}
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

export default BAIAdminContainerRegistrySelect;
