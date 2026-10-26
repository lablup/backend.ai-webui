/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIScopedProjectSelect — project picker over `scopedProjectsV2` (ADR 0012),
 built on `BAIComplexSelect`. The value is the project UUID (`entityId`); the
 caller passes the `scope`.
*/
import {
  BAIScopedProjectSelectPaginatedQuery,
  ProjectScope,
} from '../../__generated__/BAIScopedProjectSelectPaginatedQuery.graphql';
import { BAIScopedProjectSelectValueQuery } from '../../__generated__/BAIScopedProjectSelectValueQuery.graphql';
import { combineFilters } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useControllableValue } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIComplexSelect, {
  type BAIComplexSelectProps,
  type BAIComplexSelectValue,
  type BAILabeledValue,
} from '../BAIComplexSelect';
import * as _ from 'lodash-es';
import { useDeferredValue, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type BAIScopedProjectSelectFilter = NonNullable<
  BAIScopedProjectSelectPaginatedQuery['variables']['filter']
>;

export type ScopedProjectNode = NonNullable<
  NonNullable<
    BAIScopedProjectSelectPaginatedQuery['response']['scopedProjectsV2']
  >['edges'][number]
>['node'];

export interface BAIScopedProjectSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Project UUID(s). */
  value?: string | Array<string> | null;
  /** The second argument carries the name/UUID pair(s). */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  /** The projects this scope reaches are listed, usually the current domain (ADR 0012). */
  scope: ProjectScope;
  filter?: BAIScopedProjectSelectFilter;
  open?: boolean;
  defaultOpen?: boolean;
}

const PAGE_SIZE = 10;

const BAIScopedProjectSelect: React.FC<BAIScopedProjectSelectProps> = ({
  scope,
  filter,
  multiple = false,
  isLoading,
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

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  // A project chosen on page one is gone from `options` once `loadNext` pages past it.
  const selected = useLazyLoadQuery<BAIScopedProjectSelectValueQuery>(
    graphql`
      query BAIScopedProjectSelectValueQuery(
        $scope: ProjectScope!
        $selectedFilter: ProjectV2Filter
        $limit: Int!
        $skipSelected: Boolean!
      ) {
        scopedProjectsV2(scope: $scope, filter: $selectedFilter, limit: $limit)
          @skip(if: $skipSelected) {
          edges {
            node {
              id
              entityId
              basicInfo {
                name
              }
            }
          }
        }
      }
    `,
    {
      scope,
      selectedFilter: selectedKeys.length ? { id: { in: selectedKeys } } : null,
      limit: Math.max(selectedKeys.length, 1),
      skipSelected: selectedKeys.length === 0,
    },
    {
      fetchPolicy: selectedKeys.length ? 'store-or-network' : 'store-only',
    },
  );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIScopedProjectSelectPaginatedQuery,
      ScopedProjectNode
    >(
      graphql`
        query BAIScopedProjectSelectPaginatedQuery(
          $scope: ProjectScope!
          $offset: Int!
          $limit: Int!
          $filter: ProjectV2Filter
          $orderBy: [ProjectV2OrderBy!]
        ) {
          scopedProjectsV2(
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
                entityId
                basicInfo {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: PAGE_SIZE },
      {
        scope,
        filter: combineFilters<BAIScopedProjectSelectFilter>([
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
        getTotal: (r) => r.scopedProjectsV2?.count ?? undefined,
        getItem: (r) => _.compact(_.map(r.scopedProjectsV2?.edges, 'node')),
        getId: (item) => item?.id,
      },
    );

  const options = _.compact(
    _.map(paginationData, (item) =>
      item?.entityId
        ? { value: item.entityId, label: item.basicInfo?.name ?? item.entityId }
        : null,
    ),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const nameById = new Map(
      _.compact(
        _.map(selected.scopedProjectsV2?.edges, (edge) =>
          edge?.node
            ? ([edge.node.entityId, edge.node.basicInfo?.name] as const)
            : null,
        ),
      ),
    );
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
      label: nameById.get(key) ?? key,
      value: key,
    }));
    return multiple ? labeled : (labeled[0] ?? null);
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIProjectSelect.SelectProject')}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        (!!controllableOpen && !deferredOpen) ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue
      }
      isLoadingNext={isLoadingNext}
      total={result.scopedProjectsV2?.count ?? undefined}
      options={options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
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

export default BAIScopedProjectSelect;
