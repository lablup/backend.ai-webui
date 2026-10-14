/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIAdminContainerRegistrySelect — admin container-registry picker on
 `BAIComplexSelect`. The outer value contract is a plain key (`string` /
 `string[]`), the registry UUID (`entityId`); `labelInValue` stays
 between this wrapper and `BAIComplexSelect`.
*/
import { BAIAdminContainerRegistrySelectPaginatedQuery } from '../../__generated__/BAIAdminContainerRegistrySelectPaginatedQuery.graphql';
import { BAIAdminContainerRegistrySelectValueQuery } from '../../__generated__/BAIAdminContainerRegistrySelectValueQuery.graphql';
import { combineFilters, toGlobalId } from '../../helper';
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

export type BAIAdminContainerRegistrySelectFilter = NonNullable<
  BAIAdminContainerRegistrySelectPaginatedQuery['variables']['filter']
>;

export type AstryxContainerRegistryNode = NonNullable<
  BAIAdminContainerRegistrySelectPaginatedQuery['response']['adminContainerRegistriesV2']
>['edges'][number]['node'];

export interface BAIAdminContainerRegistrySelectRef {
  refetch: () => void;
}

export interface BAIAdminContainerRegistrySelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s): the registry UUID. */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  /** AND-ed into the page query filter; the search term owns `registryName`. */
  filter?: BAIAdminContainerRegistrySelectFilter | null;
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminContainerRegistrySelectRef>;
}

const BAIAdminContainerRegistrySelect: React.FC<
  BAIAdminContainerRegistrySelectProps
> = ({
  filter: filterFromProps,
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
  const keyOfNode = (node: AstryxContainerRegistryNode) => node.entityId;

  // Resolves the selected key to a label: a value chosen on page 1 is not in
  // `options` once `loadNext` has paged past it. `ContainerRegistryV2Filter`
  // has no id filter, so only the first key goes through `node(id:)`.
  const selectedKey = selectedKeys[0];
  const { node: selectedNode } =
    useLazyLoadQuery<BAIAdminContainerRegistrySelectValueQuery>(
      graphql`
        query BAIAdminContainerRegistrySelectValueQuery(
          $nodeId: ID!
          $skipSelected: Boolean!
        ) {
          node(id: $nodeId) @skip(if: $skipSelected) {
            ... on ContainerRegistryV2 {
              id
              entityId
              registryName
              project
            }
          }
        }
      `,
      {
        nodeId: selectedKey
          ? toGlobalId('ContainerRegistryV2', selectedKey)
          : '',
        skipSelected: !selectedKey,
      },
      {
        fetchPolicy: selectedKey ? 'store-or-network' : 'store-only',
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
          $filter: ContainerRegistryV2Filter
        ) {
          adminContainerRegistriesV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: REGISTRY_NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                entityId
                registryName
                project
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: combineFilters<BAIAdminContainerRegistrySelectFilter>([
          filterFromProps,
          debouncedDeferredValue
            ? { registryName: { iContains: debouncedDeferredValue } }
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminContainerRegistriesV2?.count ?? undefined,
        getItem: (r) =>
          r.adminContainerRegistriesV2?.edges?.map((edge) => edge.node),
        getId: (item) => (item ? keyOfNode(item) : undefined),
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

  const loadedNodes = _.compact(paginationData);
  const options = _.map(loadedNodes, (item) => ({
    value: keyOfNode(item),
    label: formatLabel(item),
  }));

  // `node(id:)` answers any Node, so the inline-fragment fields are optional.
  const resolvedNode: AstryxContainerRegistryNode | null =
    selectedNode?.id && selectedNode.entityId && selectedNode.registryName
      ? {
          id: selectedNode.id,
          entityId: selectedNode.entityId,
          registryName: selectedNode.registryName,
          project: selectedNode.project,
        }
      : null;

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      const node = _.find(
        resolvedNode ? [resolvedNode, ...loadedNodes] : loadedNodes,
        (n) => keyOfNode(n) === key,
      );
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
      total={result.adminContainerRegistriesV2?.count ?? undefined}
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
