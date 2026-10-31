/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIScopedProjectSelect — Relay-paginated, id-valued project select over
 `scopedProjectsV2` (ADR 0012). The outer value is a plain key (`string` /
 `string[]`); labelInValue stays between this wrapper and `BAIComplexSelect`.
 The page query refetches `network-only` while the popup is open
 (`BAIComplexSelect.onOpenChange`) and reads the store otherwise.
*/
import {
  BAIScopedProjectSelectPaginatedQuery,
  ProjectScope,
} from '../../__generated__/BAIScopedProjectSelectPaginatedQuery.graphql';
import { BAIScopedProjectSelectValueQuery } from '../../__generated__/BAIScopedProjectSelectValueQuery.graphql';
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

export type ScopedProjectNode = NonNullable<
  NonNullable<
    BAIScopedProjectSelectPaginatedQuery['response']['scopedProjectsV2']
  >['edges'][number]
>['node'];

export interface BAIScopedProjectSelectRef {
  refetch: () => void;
}

export interface BAIScopedProjectSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s), as the antd `BAIScopedProjectSelect` exposes. */
  value?: string | Array<string> | null;
  /**
   * P3C-1: like `BAIUserSelect`, this wrapper keeps antd's second
   * `option` argument because it is used inside
   * `BAIGraphQLPropertyFilter.renderInput`, where the filter chip must show
   * the project NAME while the raw UUID goes into the GraphQL filter.
   */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  /** Spread into the page query filter; the search term owns `name`. */
  filter?: Omit<
    NonNullable<BAIScopedProjectSelectPaginatedQuery['variables']['filter']>,
    'name'
  >;
  /** The projects this scope reaches are listed, usually the current domain (ADR 0012). */
  scope: ProjectScope;
  ref?: React.Ref<BAIScopedProjectSelectRef>;
}

const BAIScopedProjectSelect: React.FC<BAIScopedProjectSelectProps> = ({
  filter: filterFromProps,
  scope,
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
  const selectedProjectsData =
    useLazyLoadQuery<BAIScopedProjectSelectValueQuery>(
      graphql`
        query BAIScopedProjectSelectValueQuery(
          $projectIds: [UUID!]!
          $scope: ProjectScope!
          $skipSelected: Boolean!
        ) {
          scopedProjectsV2(
            scope: $scope
            filter: { id: { in: $projectIds } }
            limit: 100
          ) @skip(if: $skipSelected) {
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
        projectIds: selectedIds,
        scope,
        skipSelected: selectedIds.length === 0,
      },
      {
        fetchPolicy: selectedIds.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIScopedProjectSelectPaginatedQuery,
      ScopedProjectNode
    >(
      graphql`
        query BAIScopedProjectSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ProjectV2Filter
          $scope: ProjectScope!
        ) {
          scopedProjectsV2(
            scope: $scope
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
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
      { limit: 10 },
      {
        scope,
        filter: {
          ...(filterFromProps ?? {}),
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
        getTotal: (r) => r.scopedProjectsV2?.count ?? undefined,
        getItem: (r) => r.scopedProjectsV2?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.entityId,
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

  // id-valued: the project UUID (`entityId`), never the Relay global id.
  const keyOfNode = (
    node: { entityId: string } | null | undefined,
  ): string | undefined => node?.entityId;

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: item?.basicInfo?.name ?? key,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedIds, (key) => {
      const edge = _.find(
        selectedProjectsData.scopedProjectsV2?.edges,
        (e) => keyOfNode(e?.node) === key,
      );
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: edge?.node?.basicInfo?.name ?? key, value: key };
    });
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t('comp:BAIProjectSelect.SelectProject')}
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
      total={result.scopedProjectsV2?.count ?? undefined}
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

export default BAIScopedProjectSelect;
