/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 BAIScopedUserSelect — user picker over `scopedUsersV2` (ADR 0012), built on
 `BAIComplexSelect`: offset pagination with scroll-driven `loadNext`,
 server-side search, and a plain-key (`string` / `string[]`) value with
 label-in-value kept inside the wrapper. The caller passes the `scope`.
*/
import {
  BAIScopedUserSelectPaginatedQuery,
  UserScope,
} from '../../__generated__/BAIScopedUserSelectPaginatedQuery.graphql';
import { BAIScopedUserSelectValueQuery } from '../../__generated__/BAIScopedUserSelectValueQuery.graphql';
import { combineFilters } from '../../helper';
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

export type ScopedUserNode = NonNullable<
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
   * The second argument carries the labelInValue pair(s), so a caller can
   * show the email while the raw UUID goes into a filter or mutation input.
   */
  onChange?: (
    value: string | Array<string> | undefined,
    option?: BAIScopedUserSelectOption | Array<BAIScopedUserSelectOption>,
  ) => void;
  /** The users this scope reaches are listed, usually the current domain (ADR 0012). */
  scope: UserScope;
  /**
   * Offer the typed search text as an option when it is an e-mail address no
   * listed user matches, so an address outside the scope can still be picked.
   * The pick's value is that address and its option carries `isCustom`.
   * Only under `valuePropName="email"`.
   */
  allowCustomSelect?: boolean;
  filter?: BAIScopedUserSelectFilter;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIScopedUserSelectRef>;
}

const PAGE_SIZE = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BAIScopedUserSelect: React.FC<BAIScopedUserSelectProps> = ({
  scope,
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

  const baseFilter = combineFilters<BAIScopedUserSelectFilter>([
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

  const selected = useLazyLoadQuery<BAIScopedUserSelectValueQuery>(
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
              entityId
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
    useLazyPaginatedQuery<BAIScopedUserSelectPaginatedQuery, ScopedUserNode>(
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
                entityId
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
        // The open state comes back out of the Astryx popup.
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.scopedUsersV2?.count ?? undefined,
        getItem: (r) => _.compact(_.map(r.scopedUsersV2?.edges, 'node')),
        getId: (item) => item?.id,
      },
    );

  const keyOfUser = (
    user: ScopedUserNode | null | undefined,
  ): string | undefined => {
    if (!user) return undefined;
    return valuePropName === 'id'
      ? user.entityId
      : (user.basicInfo?.email ?? undefined);
  };

  const options = _.compact(
    _.map(paginationData, (item) => {
      const key = keyOfUser(item);
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
        _.map(selected.scopedUsersV2?.edges, (edge) => {
          const key = keyOfUser(edge?.node);
          return key ? ([key, edge?.node?.basicInfo?.email] as const) : null;
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
      total={result.scopedUsersV2?.count ?? undefined}
      options={customOption ? [...options, customOption] : options}
      value={labeledValue}
      onChange={(next) => {
        const labeled = _.compact(_.castArray(next ?? []));
        const keys = _.map(labeled, (v) => v.value);
        // Beside the pair: the listed user's local id, or the custom mark.
        const picked: Array<BAIScopedUserSelectOption> = _.map(labeled, (v) => {
          const user = _.find(
            paginationData,
            (item) => keyOfUser(item) === v.value,
          );
          if (user) return { ...v, userId: user.entityId };
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
