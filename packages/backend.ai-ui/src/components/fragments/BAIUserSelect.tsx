/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The user picker the admin and project-admin forms share, built on
 `BAIComplexSelect`: offset pagination with scroll-driven `loadNext`,
 server-side search, and a plain-key (`string` / `string[]`) value with
 label-in-value kept inside the wrapper. The required `scope` picks the V2
 connection — `adminUsersV2`, `domainUsersV2` or `projectUsersV2` (managers
 >= 26.2.0) — and each scope owns its two Relay documents, so a scope id is
 a required variable rather than a placeholder.
*/
import { BAIUserSelectAdminPaginatedQuery } from '../../__generated__/BAIUserSelectAdminPaginatedQuery.graphql';
import { BAIUserSelectAdminValueQuery } from '../../__generated__/BAIUserSelectAdminValueQuery.graphql';
import { BAIUserSelectDomainPaginatedQuery } from '../../__generated__/BAIUserSelectDomainPaginatedQuery.graphql';
import { BAIUserSelectDomainValueQuery } from '../../__generated__/BAIUserSelectDomainValueQuery.graphql';
import { BAIUserSelectProjectPaginatedQuery } from '../../__generated__/BAIUserSelectProjectPaginatedQuery.graphql';
import { BAIUserSelectProjectValueQuery } from '../../__generated__/BAIUserSelectProjectValueQuery.graphql';
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

export type BAIUserSelectFilter = NonNullable<
  BAIUserSelectAdminPaginatedQuery['variables']['filter']
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
  /** Required: an admin page takes it from `useAdminUserSelectScope()`. */
  scope: BAIUserSelectScope;
  filter?: BAIUserSelectFilter;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIUserSelectRef>;
}

type UserV2Edge =
  | {
      readonly node?: {
        readonly id: string;
        readonly basicInfo?: {
          readonly email?: string | null;
          readonly fullName?: string | null;
        } | null;
      } | null;
    }
  | null
  | undefined;

const readUsers = (
  edges: ReadonlyArray<UserV2Edge> | null | undefined,
): Array<BAIUserSelectUser> =>
  _.compact(
    _.map(edges, (edge) =>
      edge?.node
        ? {
            id: edge.node.id,
            email: edge.node.basicInfo?.email,
            fullName: edge.node.basicInfo?.fullName,
          }
        : null,
    ),
  );

const PAGE_SIZE = 10;

type ScopedProps = Omit<BAIUserSelectProps, 'scope'>;

/** Everything a scope variant feeds its two queries from, and the view reads. */
const useUserSelectState = ({
  filter: filterFromProps,
  excludeInactive = false,
  valuePropName = 'email',
  multiple = false,
  isLoading,
  ref,
  ...selectProps
}: ScopedProps) => {
  'use memo';
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

  const baseFilter = combineFilters<BAIUserSelectFilter>([
    excludeInactive ? { status: { equals: 'ACTIVE' } } : null,
    filterFromProps,
  ]);

  // Deferred so a fresh selection does not immediately re-run the value query.
  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));
  // The trigger reads its text from the VALUE, and a user chosen on page 1 is
  // not in `options` once `loadNext` paged past it, so ids are re-resolved.
  // Under `valuePropName="email"` the key already IS the label.
  const shouldResolveSelected =
    valuePropName === 'id' && selectedKeys.length > 0;

  return {
    multiple,
    isLoading,
    valuePropName,
    selectProps,
    selectedKeys,
    controllableValue,
    setControllableValue,
    controllableOpen,
    setControllableOpen,
    deferredOpen,
    deferredControllableValue,
    searchStr,
    setSearchStr,
    debouncedDeferredValue,
    isPendingRefetch,
    listVariables: {
      filter: combineFilters<BAIUserSelectFilter>([
        baseFilter,
        debouncedDeferredValue
          ? { email: { iContains: debouncedDeferredValue } }
          : null,
      ]),
      orderBy: [{ field: 'EMAIL', direction: 'ASC' }] as const,
    },
    listOptions: {
      // The open state comes back out of the Astryx popup.
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
      fetchKey: deferredFetchKey,
    } as const,
    valueVariables: {
      selectedFilter: shouldResolveSelected
        ? combineFilters<BAIUserSelectFilter>([
            { uuid: { in: selectedKeys } },
            baseFilter,
          ])
        : null,
      limit: Math.max(selectedKeys.length, 1),
      skipSelected: !shouldResolveSelected,
    },
    valueOptions: {
      fetchPolicy: shouldResolveSelected ? 'store-or-network' : 'store-only',
      fetchKey: deferredFetchKey,
    } as const,
  };
};

type UserSelectState = ReturnType<typeof useUserSelectState>;

interface UserSelectViewProps {
  state: UserSelectState;
  users: Array<BAIUserSelectUser> | undefined;
  selectedUsers: Array<BAIUserSelectUser>;
  total: number | null | undefined;
  loadNext: () => void;
  isLoadingNext: boolean;
}

const UserSelectView: React.FC<UserSelectViewProps> = ({
  state,
  users,
  selectedUsers,
  total,
  loadNext,
  isLoadingNext,
}) => {
  'use memo';
  const { t } = useBAIi18n();
  const {
    multiple,
    isLoading,
    valuePropName,
    selectProps,
    selectedKeys,
    controllableValue,
    setControllableValue,
    controllableOpen,
    setControllableOpen,
    deferredOpen,
    deferredControllableValue,
    searchStr,
    setSearchStr,
    debouncedDeferredValue,
    isPendingRefetch,
  } = state;

  const keyOfUser = (
    user: BAIUserSelectUser | null | undefined,
  ): string | undefined => {
    if (!user) return undefined;
    return valuePropName === 'id'
      ? toLocalId(user.id)
      : (user.email ?? undefined);
  };

  const options = _.compact(
    _.map(users, (item) => {
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
        _.map(selectedUsers, (user) => {
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
      total={total ?? undefined}
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

const AdminUserOptions: React.FC<ScopedProps> = (props) => {
  'use memo';
  const state = useUserSelectState(props);
  const selected = useLazyLoadQuery<BAIUserSelectAdminValueQuery>(
    graphql`
      query BAIUserSelectAdminValueQuery(
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
                fullName
              }
            }
          }
        }
      }
    `,
    state.valueVariables,
    state.valueOptions,
  );
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIUserSelectAdminPaginatedQuery, BAIUserSelectUser>(
      graphql`
        query BAIUserSelectAdminPaginatedQuery(
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
                  email
                  fullName
                }
              }
            }
          }
        }
      `,
      { limit: PAGE_SIZE },
      state.listVariables,
      state.listOptions,
      {
        getTotal: (r) => r.adminUsersV2?.count ?? undefined,
        getItem: (r) => readUsers(r.adminUsersV2?.edges),
        getId: (item) => item?.id,
      },
    );
  return (
    <UserSelectView
      state={state}
      users={paginationData}
      selectedUsers={readUsers(selected.adminUsersV2?.edges)}
      total={result.adminUsersV2?.count}
      loadNext={loadNext}
      isLoadingNext={isLoadingNext}
    />
  );
};

const DomainUserOptions: React.FC<ScopedProps & { domainName: string }> = ({
  domainName,
  ...props
}) => {
  'use memo';
  const state = useUserSelectState(props);
  const selected = useLazyLoadQuery<BAIUserSelectDomainValueQuery>(
    graphql`
      query BAIUserSelectDomainValueQuery(
        $domainName: String!
        $selectedFilter: UserV2Filter
        $limit: Int!
        $skipSelected: Boolean!
      ) {
        domainUsersV2(
          scope: { domainName: $domainName }
          filter: $selectedFilter
          limit: $limit
        ) @skip(if: $skipSelected) {
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
    { ...state.valueVariables, domainName },
    state.valueOptions,
  );
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIUserSelectDomainPaginatedQuery, BAIUserSelectUser>(
      graphql`
        query BAIUserSelectDomainPaginatedQuery(
          $domainName: String!
          $offset: Int!
          $limit: Int!
          $filter: UserV2Filter
          $orderBy: [UserV2OrderBy!]
        ) {
          domainUsersV2(
            scope: { domainName: $domainName }
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
                  email
                  fullName
                }
              }
            }
          }
        }
      `,
      { limit: PAGE_SIZE },
      { ...state.listVariables, domainName },
      state.listOptions,
      {
        getTotal: (r) => r.domainUsersV2?.count ?? undefined,
        getItem: (r) => readUsers(r.domainUsersV2?.edges),
        getId: (item) => item?.id,
      },
    );
  return (
    <UserSelectView
      state={state}
      users={paginationData}
      selectedUsers={readUsers(selected.domainUsersV2?.edges)}
      total={result.domainUsersV2?.count}
      loadNext={loadNext}
      isLoadingNext={isLoadingNext}
    />
  );
};

const ProjectUserOptions: React.FC<ScopedProps & { projectId: string }> = ({
  projectId,
  ...props
}) => {
  'use memo';
  const state = useUserSelectState(props);
  const selected = useLazyLoadQuery<BAIUserSelectProjectValueQuery>(
    graphql`
      query BAIUserSelectProjectValueQuery(
        $projectId: UUID!
        $selectedFilter: UserV2Filter
        $limit: Int!
        $skipSelected: Boolean!
      ) {
        projectUsersV2(
          scope: { projectId: $projectId }
          filter: $selectedFilter
          limit: $limit
        ) @skip(if: $skipSelected) {
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
    { ...state.valueVariables, projectId },
    state.valueOptions,
  );
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIUserSelectProjectPaginatedQuery,
      BAIUserSelectUser
    >(
      graphql`
        query BAIUserSelectProjectPaginatedQuery(
          $projectId: UUID!
          $offset: Int!
          $limit: Int!
          $filter: UserV2Filter
          $orderBy: [UserV2OrderBy!]
        ) {
          projectUsersV2(
            scope: { projectId: $projectId }
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
                  email
                  fullName
                }
              }
            }
          }
        }
      `,
      { limit: PAGE_SIZE },
      { ...state.listVariables, projectId },
      state.listOptions,
      {
        getTotal: (r) => r.projectUsersV2?.count ?? undefined,
        getItem: (r) => readUsers(r.projectUsersV2?.edges),
        getId: (item) => item?.id,
      },
    );
  return (
    <UserSelectView
      state={state}
      users={paginationData}
      selectedUsers={readUsers(selected.projectUsersV2?.edges)}
      total={result.projectUsersV2?.count}
      loadNext={loadNext}
      isLoadingNext={isLoadingNext}
    />
  );
};

const BAIUserSelect: React.FC<BAIUserSelectProps> = ({ scope, ...props }) => {
  'use memo';
  if (scope.type === 'project') {
    return <ProjectUserOptions projectId={scope.projectId} {...props} />;
  }
  if (scope.type === 'domain') {
    return <DomainUserOptions domainName={scope.domainName} {...props} />;
  }
  return <AdminUserOptions {...props} />;
};

export default BAIUserSelect;
