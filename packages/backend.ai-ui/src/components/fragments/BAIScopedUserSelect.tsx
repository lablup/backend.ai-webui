/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Sibling of `BAIAdminUserV2Select` on `scopedUsersV2` (managers >= 26.9.0):
 same plain-key value contract and `UserV2Filter` object, but the rows are the
 users the given domain / project / role scopes reach (OR-combined, each
 authorized server-side), so an ordinary user can call it.
*/
import { BAIScopedUserSelectPaginatedQuery } from '../../__generated__/BAIScopedUserSelectPaginatedQuery.graphql';
import { BAIScopedUserSelectValueQuery } from '../../__generated__/BAIScopedUserSelectValueQuery.graphql';
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
import { MailPlusIcon } from 'lucide-react';
import {
  useDeferredValue,
  useImperativeHandle,
  useState,
  useTransition,
} from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type BAIScopedUserSelectFilter = NonNullable<
  BAIScopedUserSelectPaginatedQuery['variables']['filter']
>;

export type BAIScopedUserSelectScope =
  BAIScopedUserSelectPaginatedQuery['variables']['scope'];

export type ScopedUserV2Node = NonNullable<
  NonNullable<
    BAIScopedUserSelectPaginatedQuery['response']['scopedUsersV2']
  >['edges'][number]
>['node'];

export interface BAIScopedUserSelectRef {
  refetch: () => void;
}

/** What `onChange` hands back beside the key: a listed user's id, or the custom mark. */
export type BAIScopedUserSelectOption = BAILabeledValue & {
  /** Local user id of a listed user. */
  userId?: string;
  /** Set when the value was typed and offered through `allowCustomSelect`. */
  isCustom?: boolean;
};

export interface BAIScopedUserSelectProps extends Omit<
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
    option?: BAIScopedUserSelectOption | Array<BAIScopedUserSelectOption>,
  ) => void;
  /**
   * Offer the typed search text as an option when it is an e-mail address no
   * listed user matches, so an address outside the scope can still be picked.
   * The pick's value is that address and its option carries `isCustom`.
   * Only under `valuePropName="email"`.
   */
  allowCustomSelect?: boolean;
  /** Domain id(s) whose users are listed. Left out of the scope when omitted. */
  domainId?: string | Array<string> | null;
  /** Project id(s) whose users are listed. Left out of the scope when omitted. */
  projectId?: string | Array<string> | null;
  /** Role id(s) whose holders are listed. Left out of the scope when omitted. */
  roleId?: string | Array<string> | null;
  filter?: BAIScopedUserSelectFilter;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIScopedUserSelectRef>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const toUUIDScopes = (ids: string | Array<string> | null | undefined) =>
  _.map(_.compact(_.castArray(ids ?? [])), (value) => ({ value }));

const BAIScopedUserSelect: React.FC<BAIScopedUserSelectProps> = ({
  domainId,
  projectId,
  roleId,
  allowCustomSelect = false,
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

  // Only the scope keys a caller named go to the server; every `UserScope`
  // field is nullable, and an absent key reads as "no such scope".
  const domainScopes = toUUIDScopes(domainId);
  const projectScopes = toUUIDScopes(projectId);
  const roleScopes = toUUIDScopes(roleId);
  const scope: BAIScopedUserSelectScope = {
    ...(domainScopes.length ? { domain: domainScopes } : {}),
    ...(projectScopes.length ? { project: projectScopes } : {}),
    ...(roleScopes.length ? { role: roleScopes } : {}),
  };

  // `UserV2Filter` has no merge semantics of its own — combine through `AND`.
  const baseFilter = combineFilters<BAIScopedUserSelectFilter>([
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
  const { scopedUsersV2: selectedUsers } =
    useLazyLoadQuery<BAIScopedUserSelectValueQuery>(
      graphql`
        query BAIScopedUserSelectValueQuery(
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
                }
              }
            }
          }
        }
      `,
      {
        scope,
        selectedFilter: shouldResolveSelected
          ? combineFilters<BAIScopedUserSelectFilter>([
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
    useLazyPaginatedQuery<BAIScopedUserSelectPaginatedQuery, ScopedUserV2Node>(
      graphql`
        query BAIScopedUserSelectPaginatedQuery(
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
        scope,
        filter: combineFilters<BAIScopedUserSelectFilter>([
          baseFilter,
          debouncedDeferredValue
            ? { email: { iContains: debouncedDeferredValue } }
            : null,
        ]),
        orderBy: [{ field: 'EMAIL', direction: 'ASC' }],
      },
      {
        // P26-6: the open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.scopedUsersV2?.count ?? undefined,
        getItem: (r) => r.scopedUsersV2?.edges?.map((edge) => edge?.node),
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

  const typedText = debouncedDeferredValue.trim();
  const customOption =
    allowCustomSelect &&
    valuePropName === 'email' &&
    EMAIL_PATTERN.test(typedText) &&
    !_.some(options, (o) => o.value.toLowerCase() === typedText.toLowerCase())
      ? {
          value: typedText,
          label: typedText,
          description: t('comp:BAIScopedUserSelect.InviteByEmail'),
          icon: <MailPlusIcon size="1em" />,
        }
      : null;

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
        controllableOpen !== deferredOpen ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.scopedUsersV2?.count ?? undefined}
      options={customOption ? [...options, customOption] : options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
        // P3C-1: second argument carries the labelInValue pair(s), plus the
        // listed user's id or the custom mark.
        const picked: Array<BAIScopedUserSelectOption> = _.map(labeled, (v) => {
          const node = _.find(
            paginationData,
            (item) => keyOfNode(item) === v.value,
          );
          if (node) return { ...v, userId: toLocalId(node.id) };
          return customOption && v.value === customOption.value
            ? { ...v, isCustom: true }
            : v;
        });
        setControllableValue(
          multiple ? keys : keys[0],
          multiple ? picked : picked[0],
        );
      }}
      searchValue={searchStr}
      onSearch={setSearchStr}
      onOpenChange={setControllableOpen}
      endReached={loadNext}
    />
  );
};

export default BAIScopedUserSelect;
