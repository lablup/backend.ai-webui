/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The policy `name` is both the key and the label, so there is no
// selected-value resolution query (same as BAIAdminKeypairResourcePolicySelect).
import { BAIAdminUserResourcePolicySelectPaginatedQuery } from '../../__generated__/BAIAdminUserResourcePolicySelectPaginatedQuery.graphql';
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
import { graphql } from 'react-relay';

export type AdminUserResourcePolicyNode = NonNullable<
  NonNullable<
    BAIAdminUserResourcePolicySelectPaginatedQuery['response']['adminUserResourcePoliciesV2']
  >['edges'][number]
>['node'];

export interface BAIAdminUserResourcePolicySelectRef {
  refetch: () => void;
}

export interface BAIAdminUserResourcePolicySelectProps extends Omit<
  BAIComplexSelectProps,
  'options' | 'value' | 'onChange' | 'searchValue' | 'onSearch' | 'total'
> {
  /** The policy name(s). */
  value?: string | Array<string> | null;
  onChange?: (value: string | Array<string> | undefined) => void;
  open?: boolean;
  defaultOpen?: boolean;
  ref?: React.Ref<BAIAdminUserResourcePolicySelectRef>;
}

const BAIAdminUserResourcePolicySelect: React.FC<
  BAIAdminUserResourcePolicySelectProps
> = ({ multiple = false, isLoading, ref, ...selectProps }) => {
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

  const deferredControllableValue = useDeferredValue(controllableValue);
  const selectedKeys = _.compact(_.castArray(deferredControllableValue ?? []));

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminUserResourcePolicySelectPaginatedQuery,
      AdminUserResourcePolicyNode
    >(
      graphql`
        query BAIAdminUserResourcePolicySelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: UserResourcePolicyV2Filter
        ) {
          adminUserResourcePoliciesV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
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
      { limit: 10 },
      {
        filter: debouncedDeferredValue
          ? { name: { contains: debouncedDeferredValue } }
          : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) =>
          result.adminUserResourcePoliciesV2?.count ?? undefined,
        getItem: (result) =>
          result.adminUserResourcePoliciesV2?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.name,
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

  const options = _.compact(
    _.map(paginationData, (item) =>
      item?.name ? { value: item.name, label: item.name } : null,
    ),
  );

  const labeledValue: BAIComplexSelectValue = (() => {
    const labeled: Array<BAILabeledValue> = _.map(selectedKeys, (key) => ({
      label: key,
      value: key,
    }));
    if (multiple) return labeled;
    return labeled[0] ?? null;
  })();

  return (
    <BAIComplexSelect
      placeholder={t(
        'comp:BAIAdminUserResourcePolicySelect.SelectUserResourcePolicy',
      )}
      {...selectProps}
      multiple={multiple}
      isLoading={
        isLoading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      isLoadingNext={isLoadingNext}
      total={result.adminUserResourcePoliciesV2?.count ?? undefined}
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

export default BAIAdminUserResourcePolicySelect;
