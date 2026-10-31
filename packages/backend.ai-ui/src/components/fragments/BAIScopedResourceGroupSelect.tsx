/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIScopedResourceGroupSelect — resource group picker over
 `scopedResourceGroups` (ADR 0012), built on `BAIComplexSelect`. A resource
 group's name is its key and its label, so no value query is needed.
*/
import {
  BAIScopedResourceGroupSelectPaginatedQuery,
  ResourceGroupScope,
} from '../../__generated__/BAIScopedResourceGroupSelectPaginatedQuery.graphql';
import { combineFilters } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { graphql } from 'react-relay';

export type BAIScopedResourceGroupSelectFilter = NonNullable<
  BAIScopedResourceGroupSelectPaginatedQuery['variables']['filter']
>;

type ScopedResourceGroupNode = NonNullable<
  NonNullable<
    BAIScopedResourceGroupSelectPaginatedQuery['response']['scopedResourceGroups']
  >['edges'][number]
>['node'];

export interface BAIScopedResourceGroupSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Resource group name(s). */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  /** The resource groups this scope reaches are listed (ADR 0012). */
  scope: ResourceGroupScope;
  filter?: BAIScopedResourceGroupSelectFilter;
  open?: boolean;
  defaultOpen?: boolean;
}

const PAGE_SIZE = 20;

const BAIScopedResourceGroupSelect: React.FC<
  BAIScopedResourceGroupSelectProps
> = ({ scope, filter, multiple = false, isLoading, ...selectProps }) => {
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

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIScopedResourceGroupSelectPaginatedQuery,
      ScopedResourceGroupNode
    >(
      graphql`
        query BAIScopedResourceGroupSelectPaginatedQuery(
          $scope: ResourceGroupScope!
          $offset: Int!
          $limit: Int!
          $filter: ResourceGroupFilter
          $orderBy: [ResourceGroupOrderBy!]
        ) {
          scopedResourceGroups(
            scope: $scope
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
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
      { limit: PAGE_SIZE },
      {
        scope,
        filter: combineFilters<BAIScopedResourceGroupSelectFilter>([
          filter,
          debouncedDeferredValue
            ? { name: { iContains: debouncedDeferredValue } }
            : null,
        ]),
        orderBy: [{ field: 'NAME', direction: 'ASC' }],
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
      },
      {
        getTotal: (r) => r.scopedResourceGroups?.count ?? undefined,
        getItem: (r) => _.compact(_.map(r.scopedResourceGroups?.edges, 'node')),
        getId: (item) => item?.id,
      },
    );

  const options = _.compact(
    _.map(paginationData, (item) =>
      item?.name ? { value: item.name, label: item.name } : null,
    ),
  );

  const selectedKeys = _.compact(_.castArray(controllableValue ?? []));
  const labeled = selectedKeys.map((key) => ({ label: key, value: key }));
  const labeledValue: BAIComplexSelectValue = multiple
    ? labeled
    : (labeled[0] ?? null);

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIResourceGroupSelect.SelectResourceGroup')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        (!!controllableOpen && !deferredOpen) ||
        searchStr !== debouncedDeferredValue
      }
      isLoadingNext={isLoadingNext}
      total={result.scopedResourceGroups?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const keys = _.map(_.compact(_.castArray(next ?? [])), 'value');
        setControllableValue(multiple ? keys : keys[0]);
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIScopedResourceGroupSelect;
