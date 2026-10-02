/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The user picker the admin and project-admin forms share, built on
 `BAIComplexSelect`: offset pagination with scroll-driven `loadNext`,
 server-side search, and a plain-key (`string` / `string[]`) value with
 label-in-value kept inside the wrapper. Pages `scopedUsersV2` (manager
 >= 26.9.0): the members of `projectId`, else the users of `domainId`, else
 the users of the current domain (the WebUI assumes a single domain).
*/
import { BAIUserSelectCurrentDomainQuery } from '../../__generated__/BAIUserSelectCurrentDomainQuery.graphql';
import { BAIUserSelectScopedPaginatedQuery } from '../../__generated__/BAIUserSelectScopedPaginatedQuery.graphql';
import { BAIUserSelectScopedValueQuery } from '../../__generated__/BAIUserSelectScopedValueQuery.graphql';
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
  Suspense,
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type BAIUserSelectFilter = NonNullable<
  BAIUserSelectScopedPaginatedQuery['variables']['filter']
>;

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
  filter?: BAIUserSelectFilter;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIUserSelectRef>;
  /** Lists this project's members. Takes precedence over `domainId`. */
  projectId?: string;
  /** Lists this domain's users (domain UUID). Defaults to the current domain. */
  domainId?: string;
}

type ScopedProps = Omit<BAIUserSelectProps, 'projectId' | 'domainId'>;

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

type UserScope = BAIUserSelectScopedPaginatedQuery['variables']['scope'];

const ScopedUserOptions: React.FC<ScopedProps & { userScope: UserScope }> = ({
  userScope,
  ...props
}) => {
  'use memo';
  const state = useUserSelectState(props);
  const selected = useLazyLoadQuery<BAIUserSelectScopedValueQuery>(
    graphql`
      query BAIUserSelectScopedValueQuery(
        $scope: UserScope!
        $selectedFilter: UserV2Filter
        $limit: Int!
        $skipSelected: Boolean!
      ) {
        scopedUsersV2(scope: $scope, filter: $selectedFilter, limit: $limit)
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
    { ...state.valueVariables, scope: userScope },
    state.valueOptions,
  );
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIUserSelectScopedPaginatedQuery, BAIUserSelectUser>(
      graphql`
        query BAIUserSelectScopedPaginatedQuery(
          $scope: UserScope!
          $offset: Int!
          $limit: Int!
          $filter: UserV2Filter
          $orderBy: [UserV2OrderBy!]
        ) {
          scopedUsersV2(
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
      { ...state.listVariables, scope: userScope },
      state.listOptions,
      {
        getTotal: (r) => r.scopedUsersV2?.count ?? undefined,
        getItem: (r) => readUsers(r.scopedUsersV2?.edges),
        getId: (item) => item?.id,
      },
    );
  return (
    <UserSelectView
      state={state}
      users={paginationData}
      selectedUsers={readUsers(selected.scopedUsersV2?.edges)}
      total={result.scopedUsersV2?.count}
      loadNext={loadNext}
      isLoadingNext={isLoadingNext}
    />
  );
};

/** `UserScope.domain` takes a UUID; without `domainId` the current domain's is looked up. */
const UserOptions: React.FC<BAIUserSelectProps> = ({
  projectId,
  domainId,
  ...props
}) => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const { domainV2 } = useLazyLoadQuery<BAIUserSelectCurrentDomainQuery>(
    graphql`
      query BAIUserSelectCurrentDomainQuery(
        $domainName: String!
        $skip: Boolean!
      ) {
        domainV2(domainName: $domainName) @skip(if: $skip) {
          entityId
        }
      }
    `,
    {
      domainName: baiClient._config.domainName,
      skip: !!projectId || !!domainId,
    },
  );
  const resolvedDomainId = domainId ?? domainV2?.entityId;
  if (!projectId && !resolvedDomainId) {
    throw new Error(`Domain not found: ${baiClient._config.domainName}`);
  }
  const userScope: UserScope = projectId
    ? { project: [{ value: projectId }] }
    : { domain: [{ value: resolvedDomainId as string }] };
  return <ScopedUserOptions userScope={userScope} {...props} />;
};

// Suspends here, not at the caller: inside a filter popover a page-level
// fallback would unmount the popover before the picker shows.
const BAIUserSelect: React.FC<BAIUserSelectProps> = (props) => {
  'use memo';
  const { t } = useBAIi18n();
  return (
    <Suspense
      fallback={
        <BAIComplexSelect
          label={props.label}
          isLabelHidden={props.isLabelHidden}
          width={props.width}
          placeholder={props.placeholder ?? t('comp:BAIUserSelect.SelectUser')}
          options={[]}
          isLoading
          isDisabled
        />
      }
    >
      <UserOptions {...props} />
    </Suspense>
  );
};

export default BAIUserSelect;
