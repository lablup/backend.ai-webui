import { BAIAdminKeypairResourcePolicySelectPaginatedQuery } from '../../__generated__/BAIAdminKeypairResourcePolicySelectPaginatedQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAISelect, { BAISelectProps } from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, Skeleton } from 'antd';
import * as _ from 'lodash-es';
import {
  useDeferredValue,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { graphql } from 'react-relay';

export type AdminKeypairResourcePolicyNode = NonNullable<
  NonNullable<
    BAIAdminKeypairResourcePolicySelectPaginatedQuery['response']['adminKeypairResourcePoliciesV2']
  >['edges'][number]
>['node'];

export interface BAIAdminKeypairResourcePolicySelectRef {
  refetch: () => void;
}

export interface BAIAdminKeypairResourcePolicySelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  ref?: React.Ref<BAIAdminKeypairResourcePolicySelectRef>;
}

const BAIAdminKeypairResourcePolicySelect: React.FC<
  BAIAdminKeypairResourcePolicySelectProps
> = ({ loading, ref, ...selectProps }) => {
  'use memo';
  const { t } = useBAIi18n();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [controllableValue, setControllableValue] = useControllableValue<
    string | string[] | undefined
  >(selectProps);
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
      defaultValuePropName: 'defaultOpen',
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const debouncedDeferredValue = useDebouncedDeferredValue(searchStr);
  const [optimisticSearchStr, setOptimisticSearchStr] =
    useOptimistic(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminKeypairResourcePolicySelectPaginatedQuery,
      AdminKeypairResourcePolicyNode
    >(
      graphql`
        query BAIAdminKeypairResourcePolicySelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: KeypairResourcePolicyV2Filter
        ) {
          adminKeypairResourcePoliciesV2(
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
          result.adminKeypairResourcePoliciesV2?.count ?? undefined,
        getItem: (result) =>
          result.adminKeypairResourcePoliciesV2?.edges?.map(
            (edge) => edge?.node,
          ),
        getId: (item) => item?.name,
      },
    );

  // Expose refetch function through ref
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

  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.name,
    value: item?.name,
  }));

  // KRP `name` is both the identifier and the display label, so there is no
  // separate "value query" — the bare value string is a valid label.
  const controllableValueWithLabel = !_.isEmpty(deferredControllableValue)
    ? _.castArray(deferredControllableValue).map((value) => ({
        label: value,
        value: value,
      }))
    : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t(
        'comp:BAIAdminKeypairResourcePolicySelect.SelectKeypairResourcePolicy',
      )}
      loading={
        loading ||
        controllableValue !== deferredControllableValue ||
        searchStr !== debouncedDeferredValue ||
        isPendingRefetch
      }
      {...selectProps}
      searchAction={async (value) => {
        setOptimisticSearchStr(value);
        setSearchStr(value);
        await selectProps.searchAction?.(value);
      }}
      showSearch={
        selectProps.showSearch === false
          ? false
          : {
              searchValue: optimisticSearchStr,
              autoClearSearchValue: true,
              ...(_.isObject(selectProps.showSearch)
                ? _.omit(selectProps.showSearch, ['searchValue'])
                : {}),
              filterOption: false,
            }
      }
      value={
        controllableValue !== deferredControllableValue
          ? optimisticValueWithLabel
          : controllableValueWithLabel
      }
      labelInValue
      onChange={(value, option) => {
        const castedValue = _.isEmpty(value) ? [] : _.castArray(value);
        const valueWithOriginalLabel = castedValue.map((v) => {
          const label = _.isString(v.label) ? v.label : v.value;
          return { label, value: v.value };
        });
        setOptimisticValueWithLabel(valueWithOriginalLabel);
        const isMultiple =
          selectProps.mode === 'multiple' || selectProps.mode === 'tags';
        const nameArray = castedValue.map((v) => _.toString(v.value));
        setControllableValue(
          isMultiple ? nameArray : (nameArray[0] ?? undefined),
          option,
        );
      }}
      options={availableOptions}
      endReached={() => {
        loadNext();
      }}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(result.adminKeypairResourcePoliciesV2?.count) &&
        result.adminKeypairResourcePoliciesV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminKeypairResourcePoliciesV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminKeypairResourcePolicySelect;
