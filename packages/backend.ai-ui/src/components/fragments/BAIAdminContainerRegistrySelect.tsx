/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminContainerRegistrySelect — admin container-registry picker on
 `BAIComplexSelect`. The outer value contract is a plain key (`string` /
 `string[]`): the node's global `id` by default, or the registry UUID when
 `valuePropName === 'row_id'`; `labelInValue` stays between this wrapper and
 `BAIComplexSelect`.

 Managers with `container-registry-v2` (26.7.0) are read through
 `adminContainerRegistriesV2` + `node(id:)`; older managers keep the legacy
 `container_registry_nodes` pair. See the flag note in backend.ai-client.
*/
import { BAIAdminContainerRegistrySelectPaginatedQuery } from '../../__generated__/BAIAdminContainerRegistrySelectPaginatedQuery.graphql';
import { BAIAdminContainerRegistrySelectValueQuery } from '../../__generated__/BAIAdminContainerRegistrySelectValueQuery.graphql';
import { toGlobalId, toLocalId } from '../../helper';
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
import { useConnectedBAIClient } from '../provider/BAIClientProvider';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** One registry, normalized across the V2 and the legacy node shapes. */
export interface AstryxContainerRegistryNode {
  id: string;
  rowId: string;
  registryName: string;
  project: string | null;
}

export interface BAIAdminContainerRegistrySelectRef {
  refetch: () => void;
}

export interface BAIAdminContainerRegistrySelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s): the global `id`, or the registry UUID in `row_id` mode. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  valuePropName?: 'id' | 'row_id';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminContainerRegistrySelectRef>;
}

// `node(id:)` answers any Node, so the inline-fragment fields come back optional.
type V2Node = {
  readonly id?: string;
  readonly entityId?: string | null;
  readonly registryName?: string;
  readonly project?: string | null;
};

type LegacyNode = {
  readonly id: string;
  readonly row_id?: string | null;
  readonly registry_name?: string | null;
  readonly project?: string | null;
};

const normalizeV2Node = (
  node: V2Node | null | undefined,
): AstryxContainerRegistryNode | null =>
  node?.id
    ? {
        id: node.id,
        // `entityId` is 26.9.0; the global id carries the same UUID before it.
        rowId: node.entityId ?? toLocalId(node.id),
        registryName: node.registryName ?? '',
        project: node.project ?? null,
      }
    : null;

const normalizeLegacyNode = (
  node: LegacyNode | null | undefined,
): AstryxContainerRegistryNode | null =>
  node
    ? {
        id: node.id,
        rowId: node.row_id ?? toLocalId(node.id),
        registryName: node.registry_name ?? '',
        project: node.project ?? null,
      }
    : null;

const BAIAdminContainerRegistrySelect: React.FC<
  BAIAdminContainerRegistrySelectProps
> = ({
  valuePropName = 'id',
  multiple = false,
  isLoading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const baiClient = useConnectedBAIClient();
  const useV2 = baiClient.supports('container-registry-v2');
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
  const keyOfNode = (node: AstryxContainerRegistryNode) =>
    valuePropName === 'id' ? node.id : node.rowId;

  // Resolves the selected keys to labels: a value chosen on page 1 is not in
  // `options` once `loadNext` has paged past it. `ContainerRegistryV2Filter`
  // has no id filter, so the V2 path resolves the first key through `node`.
  const selectedKey = selectedKeys[0];
  const selectedResult =
    useLazyLoadQuery<BAIAdminContainerRegistrySelectValueQuery>(
      graphql`
        query BAIAdminContainerRegistrySelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $nodeId: ID!
          $skipLegacy: Boolean!
          $skipV2: Boolean!
        ) {
          container_registry_nodes(filter: $selectedFilter, first: $first)
            @skip(if: $skipLegacy) {
            edges {
              node {
                id
                row_id
                registry_name
                project
              }
            }
          }
          node(id: $nodeId) @since(version: "26.7.0") @skip(if: $skipV2) {
            ... on ContainerRegistryV2 {
              id
              entityId @since(version: "26.9.0")
              registryName
              project
            }
          }
        }
      `,
      {
        selectedFilter: selectedKeys.length
          ? mergeFilterValues(
              _.map(selectedKeys, (value) =>
                valuePropName === 'id'
                  ? `id == "${toLocalId(value)}"`
                  : `row_id == "${value}"`,
              ),
              '|',
            )
          : null,
        first: Math.max(selectedKeys.length, 1),
        nodeId: selectedKey
          ? valuePropName === 'id'
            ? selectedKey
            : toGlobalId('ContainerRegistryV2', selectedKey)
          : '',
        skipLegacy: selectedKeys.length === 0 || useV2,
        skipV2: selectedKeys.length === 0 || !useV2,
      },
      {
        fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );
  const selectedNodes: Array<AstryxContainerRegistryNode> = _.compact(
    useV2
      ? [normalizeV2Node(selectedResult.node)]
      : _.map(selectedResult.container_registry_nodes?.edges, (edge) =>
          normalizeLegacyNode(edge?.node),
        ),
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
          $filterV2: ContainerRegistryV2Filter
          $useV2: Boolean!
        ) {
          container_registry_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            order: "registry_name"
          ) @skip(if: $useV2) {
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
          adminContainerRegistriesV2(
            offset: $offset
            limit: $limit
            filter: $filterV2
            orderBy: [{ field: REGISTRY_NAME, direction: ASC }]
          ) @since(version: "26.4.2") @include(if: $useV2) {
            count
            edges {
              node {
                id
                entityId @since(version: "26.9.0")
                registryName
                project
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: debouncedDeferredValue
          ? `registry_name ilike "%${debouncedDeferredValue}%"`
          : null,
        filterV2: debouncedDeferredValue
          ? { registryName: { iContains: debouncedDeferredValue } }
          : null,
        useV2,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) =>
          (useV2
            ? r.adminContainerRegistriesV2?.count
            : r.container_registry_nodes?.count) ?? undefined,
        getItem: (r) =>
          _.compact(
            useV2
              ? r.adminContainerRegistriesV2?.edges?.map((edge) =>
                  normalizeV2Node(edge.node),
                )
              : r.container_registry_nodes?.edges?.map((edge) =>
                  normalizeLegacyNode(edge?.node),
                ),
          ),
        getId: keyOfNode,
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

  const formatLabel = (node: AstryxContainerRegistryNode) =>
    node.project ? `${node.registryName} - ${node.project}` : node.registryName;

  const options = _.map(paginationData, (item) => ({
    value: keyOfNode(item),
    label: formatLabel(item),
  }));

  const total =
    (useV2
      ? result.adminContainerRegistriesV2?.count
      : result.container_registry_nodes?.count) ?? undefined;

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const node =
        _.find(selectedNodes, (n) => keyOfNode(n) === key) ??
        _.find(paginationData, (n) => keyOfNode(n) === key);
      return { label: node ? formatLabel(node) : key, value: key };
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
        // The open-driven `network-only` refetch is a deferred update and
        // raises no pending flag of its own (FR-3724). Only the opening
        // half counts; closing would flash the spinner for nothing.
        (!!controllableOpen && !deferredOpen) ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={total}
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
