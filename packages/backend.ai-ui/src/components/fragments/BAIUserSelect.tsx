/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The user picker the admin and project-admin forms share, built on
 `BAIComplexSelect`: offset pagination with scroll-driven `loadNext`,
 server-side search, and a plain-key (`string` / `string[]`) value with
 label-in-value kept inside the wrapper. `scope` picks the V2 connection —
 `adminUsersV2`, `domainUsersV2` or `projectUsersV2` (managers >= 26.2.0).
*/
import { BAIUserSelectPaginatedQuery } from '../../__generated__/BAIUserSelectPaginatedQuery.graphql';
import { BAIUserSelectValueQuery } from '../../__generated__/BAIUserSelectValueQuery.graphql';
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
import useConnectedBAIClient from '../provider/BAIClientProvider/hooks/useConnectedBAIClient';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type BAIUserSelectFilter = NonNullable<
  BAIUserSelectPaginatedQuery['variables']['filter']
>;

/**
 * Which users the picker lists. `admin` needs a super-admin, `domain` a
 * domain admin of that domain, `project` a member of that project.
 */
export type BAIUserSelectScope =
  | { type: 'admin' }
  | { type: 'domain'; domainName: string }
  | { type: 'project'; projectId: string };

export interface BAIUserSelectUser {
  id: string;
  email: string | null | undefined;
  fullName: string | null | undefined;
}

export interface BAIUserSelectRef {
  refetch: () => void;
}

export interface BAIUserSelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** Plain key(s) — the email, or the local user id under `valuePropName="id"`. */
  value?: string | Array<string> | null;
  /**
   * The second argument carries the labelInValue pair(s), so a caller can
   * show the email while the raw UUID goes into a filter or mutation input.
   */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAILabeledValue | Array<BAILabeledValue>,
  ) => void;
  /**
   * Defaults to every user the caller may administer: all users for a
   * super-admin, the caller's own domain otherwise.
   */
  scope?: BAIUserSelectScope;
  filter?: BAIUserSelectFilter;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIUserSelectRef>;
}

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

type PaginatedResponse = BAIUserSelectPaginatedQuery['response'];
type ValueResponse = BAIUserSelectValueQuery['response'];

const readConnection = (result: PaginatedResponse | ValueResponse) =>
  result.adminUsersV2 ?? result.domainUsersV2 ?? result.projectUsersV2;

const readUsers = (
  result: PaginatedResponse | ValueResponse,
): Array<BAIUserSelectUser> =>
  _.compact(
    _.map(readConnection(result)?.edges, (edge) =>
      edge?.node
        ? {
            id: edge.node.id,
            email: edge.node.basicInfo?.email,
            fullName: edge.node.basicInfo?.fullName,
          }
        : null,
    ),
  );

const readCount = (result: PaginatedResponse) =>
  (result.adminUsersV2 ?? result.domainUsersV2 ?? result.projectUsersV2)
    ?.count ?? undefined;

const BAIUserSelect: React.FC<BAIUserSelectProps> = ({
  scope: scopeFromProps,
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
  const baiClient = useConnectedBAIClient();
  const scope: BAIUserSelectScope =
    scopeFromProps ??
    (baiClient.is_superadmin
      ? { type: 'admin' }
      : { type: 'domain', domainName: baiClient._config.domainName });
  // The scope arguments are non-null, so the two unused ones carry a
  // placeholder; their field is `@include`d out and never reads it.
  const scopeVariables = {
    useAdmin: scope.type === 'admin',
    useDomain: scope.type === 'domain',
    useProject: scope.type === 'project',
    domainName: scope.type === 'domain' ? scope.domainName : '',
    projectId: scope.type === 'project' ? scope.projectId : NIL_UUID,
  };

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

  const baseFilter = combineFilters<BAIUserSelectFilter>([
    excludeInactive ? { status: { equals: 'ACTIVE' } } : null,
    filterFromProps,
  ]);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  /**
   * The selected-key -> label resolution query. Mandatory on Astryx: the
   * trigger reads its text from the VALUE, and a value chosen on page 1 is
   * not in `options` after `loadNext` has paged past it. Under
   * `valuePropName="email"` the key already IS the label, so it is skipped.
   */
  const shouldResolveSelected =
    valuePropName === 'id' && selectedKeys.length > 0;
  const selectedUsersResult = useLazyLoadQuery<BAIUserSelectValueQuery>(
    graphql`
      query BAIUserSelectValueQuery(
        $selectedFilter: UserV2Filter
        $limit: Int!
        $domainName: String!
        $projectId: UUID!
        $useAdmin: Boolean!
        $useDomain: Boolean!
        $useProject: Boolean!
      ) {
        adminUsersV2(filter: $selectedFilter, limit: $limit)
          @include(if: $useAdmin) {
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
        domainUsersV2(
          scope: { domainName: $domainName }
          filter: $selectedFilter
          limit: $limit
        ) @include(if: $useDomain) {
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
        projectUsersV2(
          scope: { projectId: $projectId }
          filter: $selectedFilter
          limit: $limit
        ) @include(if: $useProject) {
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
      }
    `,
    {
      ...scopeVariables,
      useAdmin: shouldResolveSelected && scopeVariables.useAdmin,
      useDomain: shouldResolveSelected && scopeVariables.useDomain,
      useProject: shouldResolveSelected && scopeVariables.useProject,
      selectedFilter: shouldResolveSelected
        ? combineFilters<BAIUserSelectFilter>([
            { uuid: { in: selectedKeys } },
            baseFilter,
          ])
        : null,
      limit: Math.max(selectedKeys.length, 1),
    },
    {
      fetchPolicy: shouldResolveSelected ? 'store-or-network' : 'store-only',
      fetchKey: deferredFetchKey,
    },
  );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIUserSelectPaginatedQuery, BAIUserSelectUser>(
      graphql`
        query BAIUserSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: UserV2Filter
          $orderBy: [UserV2OrderBy!]
          $domainName: String!
          $projectId: UUID!
          $useAdmin: Boolean!
          $useDomain: Boolean!
          $useProject: Boolean!
        ) {
          adminUsersV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) @include(if: $useAdmin) {
            count
            edges {
              node {
                id
                basicInfo {
                  email
                  fullName
                }
              }
            }
          }
          domainUsersV2(
            scope: { domainName: $domainName }
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) @include(if: $useDomain) {
            count
            edges {
              node {
                id
                basicInfo {
                  email
                  fullName
                }
              }
            }
          }
          projectUsersV2(
            scope: { projectId: $projectId }
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) @include(if: $useProject) {
            count
            edges {
              node {
                id
                basicInfo {
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
        ...scopeVariables,
        filter: combineFilters<BAIUserSelectFilter>([
          baseFilter,
          debouncedDeferredValue
            ? { email: { iContains: debouncedDeferredValue } }
            : null,
        ]),
        orderBy: [{ field: 'EMAIL', direction: 'ASC' }],
      },
      {
        // The open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: readCount,
        getItem: readUsers,
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

  const keyOfUser = (
    user: BAIUserSelectUser | null | undefined,
  ): string | undefined => {
    if (!user) return undefined;
    return valuePropName === 'id'
      ? toLocalId(user.id)
      : (user.email ?? undefined);
  };

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfUser(item);
      return key
        ? {
            value: key,
            label: item?.email ?? key,
            description: item?.fullName ?? undefined,
          }
        : null;
    }),
  );

  /** Plain keys -> labelInValue, resolving each label where we can. */
  const labeledValue: BAIComplexSelectValue = (() => {
    const emailByKey = new Map(
      _.compact(
        _.map(readUsers(selectedUsersResult), (user) => {
          const key = keyOfUser(user);
          return key ? ([key, user.email] as const) : null;
        }),
      ),
    );
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
      // Echoing the key as its own label is the antd fallback, made explicit.
      label: emailByKey.get(key) ?? key,
      value: key,
    }));
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
        // The open-driven `network-only` refetch is a deferred update and
        // raises no pending flag of its own (FR-3724); only opening counts.
        (!!controllableOpen && !deferredOpen) ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={readCount(result)}
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

export default BAIUserSelect;
