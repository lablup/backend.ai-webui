/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Sibling of `BAIUserSelect` on `adminUsersV2` (superadmin, managers >= 26.2.0):
 same plain-key value contract, but the filter is a `UserV2Filter` object
 rather than the query-filter minilang string.
*/
import { BAIAdminUserV2SelectPaginatedQuery } from '../../__generated__/BAIAdminUserV2SelectPaginatedQuery.graphql';
import { BAIAdminUserV2SelectValueQuery } from '../../__generated__/BAIAdminUserV2SelectValueQuery.graphql';
import { combineFilters, toLocalId } from '../../helper';
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

export type BAIAdminUserV2SelectFilter = NonNullable<
  BAIAdminUserV2SelectPaginatedQuery['variables']['filter']
>;

export type AstryxAdminUserV2Node = NonNullable<
  NonNullable<
    BAIAdminUserV2SelectPaginatedQuery['response']['adminUsersV2']
  >['edges'][number]
>['node'];

export interface BAIAdminUserV2SelectRef {
  refetch: () => void;
}

export interface BAIAdminUserV2SelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s) — the email, or the local user id under `valuePropName="id"`. */
  value?: string | Array<string> | null;
  /**
   * P3C-1: the second `option` argument carries the labelInValue pair(s), so a
   * caller can show the email while the raw UUID goes into a mutation input.
   */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  filter?: BAIAdminUserV2SelectFilter;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminUserV2SelectRef>;
}

const BAIAdminUserV2Select: React.FC<BAIAdminUserV2SelectProps> = ({
  filter: filterFromProps,
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

  // `UserV2Filter` has no merge semantics of its own — combine through `AND`.
  const baseFilter = combineFilters<BAIAdminUserV2SelectFilter>([
    excludeInactive ? { status: { equals: 'ACTIVE' } } : null,
    filterFromProps,
  ]);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  /**
   * The selected-key -> label resolution query. Mandatory on Astryx (the
   * trigger reads its text from the VALUE, and a value chosen on page 1 is
   * not in `options` after `loadNext` has paged past it). Under
   * `valuePropName="email"` the key already IS the label, and `StringFilter`
   * has no `in` for emails, so the query is skipped outright.
   */
  const shouldResolveSelected =
    valuePropName === 'id' && selectedKeys.length > 0;
  const { adminUsersV2: selectedUsers } =
    useLazyLoadQuery<BAIAdminUserV2SelectValueQuery>(
      graphql`
        query BAIAdminUserV2SelectValueQuery(
          $selectedFilter: UserV2Filter
          $limit: Int!
          $skipSelected: Boolean!
        ) {
          adminUsersV2(filter: $selectedFilter, limit: $limit)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                basicInfo {
                  email
                }
              }
            }
          }
        }
      `,
      {
        selectedFilter: shouldResolveSelected
          ? combineFilters<BAIAdminUserV2SelectFilter>([
              { uuid: { in: selectedKeys } },
              baseFilter,
            ])
          : null,
        limit: Math.max(selectedKeys.length, 1),
        skipSelected: !shouldResolveSelected,
      },
      {
        fetchPolicy: shouldResolveSelected ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminUserV2SelectPaginatedQuery,
      AstryxAdminUserV2Node
    >(
      graphql`
        query BAIAdminUserV2SelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: UserV2Filter
          $orderBy: [UserV2OrderBy!]
        ) {
          adminUsersV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) {
            count
            edges {
              node {
                id
                basicInfo {
                  username
                  email
                  fullName
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: combineFilters<BAIAdminUserV2SelectFilter>([
          baseFilter,
          debouncedDeferredValue
            ? { email: { iContains: debouncedDeferredValue } }
            : null,
        ]),
        orderBy: [{ field: 'EMAIL', direction: 'ASC' }],
      },
      {
        // Closed: serve the store but fetch once when it is empty, so the first
        // mount suspends into the caller's fallback. Open: refresh the list.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-or-network',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.adminUsersV2?.count ?? undefined,
        getItem: (r) => r.adminUsersV2?.edges?.map((edge) => edge?.node),
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
    node:
      | { id: string; basicInfo?: { email?: string | null } | null }
      | null
      | undefined,
  ): string | undefined => {
    if (!node) return undefined;
    return valuePropName === 'id'
      ? toLocalId(node.id)
      : (node.basicInfo?.email ?? undefined);
  };

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfNode(item);
      return key
        ? {
            value: key,
            label: item?.basicInfo?.email ?? key,
            description: item?.basicInfo?.fullName ?? undefined,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const emailByKey = new Map(
      _.compact(
        _.map(selectedUsers?.edges, (edge) => {
          const key = keyOfNode(edge?.node);
          return key ? ([key, edge?.node?.basicInfo?.email] as const) : null;
        }),
      ),
    );
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => {
      // Echoing the key as its own label is the antd fallback, made explicit.
      return { label: emailByKey.get(key) ?? key, value: key };
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
      total={result.adminUsersV2?.count ?? undefined}
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

export default BAIAdminUserV2Select;
