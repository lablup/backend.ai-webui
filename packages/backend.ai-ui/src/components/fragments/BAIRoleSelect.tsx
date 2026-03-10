import { BAIRoleSelectPaginatedQuery } from '../../__generated__/BAIRoleSelectPaginatedQuery.graphql';
import { BAIRoleSelectValueQuery } from '../../__generated__/BAIRoleSelectValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAISelect, { BAISelectProps } from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, Skeleton } from 'antd';
import _ from 'lodash';
import {
  useDeferredValue,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type RoleNode = NonNullable<
  NonNullable<
    BAIRoleSelectPaginatedQuery['response']['adminRoles']
  >['edges'][number]
>['node'];

export interface BAIRoleSelectRef {
  refetch: () => void;
}

export interface BAIRoleSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIRoleSelectRef>;
}

const BAIRoleSelect: React.FC<BAIRoleSelectProps> = ({
  loading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [controllableValue, setControllableValue] = useControllableValue<
    string | string[] | undefined
  >(selectProps, {
    valuePropName: 'value',
    trigger: 'onChange',
  });
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

  // RoleFilter does not support id-based filtering, so skipSelected is always true
  // We use optimistic state to display selected values
  const { adminRoles: selectedRoleNodes } =
    useLazyLoadQuery<BAIRoleSelectValueQuery>(
      graphql`
        query BAIRoleSelectValueQuery(
          $filter: RoleFilter
          $first: Int!
          $skipSelected: Boolean!
        ) {
          adminRoles(filter: $filter, first: $first) @skip(if: $skipSelected) {
            edges {
              node {
                id
                name
                description
              }
            }
          }
        }
      `,
      {
        filter: null,
        first: _.castArray(deferredControllableValue).length,
        // Always skip since RoleFilter has no id-based filter support
        skipSelected: true,
      },
      {
        fetchPolicy: 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIRoleSelectPaginatedQuery, RoleNode>(
      graphql`
        query BAIRoleSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: RoleFilter
        ) {
          adminRoles(offset: $offset, limit: $limit, filter: $filter) {
            count
            edges {
              node {
                id
                name
                description
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
        getTotal: (result) => result.adminRoles?.count ?? undefined,
        getItem: (result) =>
          result.adminRoles?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
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
    value: item?.id,
  }));

  // Since skipSelected is always true, use optimistic state for selected values
  // Build controllableValueWithLabel from available options when possible
  const controllableValueWithLabel = !_.isEmpty(deferredControllableValue)
    ? _.castArray(deferredControllableValue).map((value) => {
        const option = availableOptions.find((opt) => opt.value === value);
        return {
          label: option?.label ?? value,
          value,
        };
      })
    : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIRoleSelect.SelectRole')}
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
        // _.castArray to handle both single and multiple mode uniformly
        const valueArray = _.isEmpty(value) ? [] : _.castArray(value);

        // In multiple mode, when removing tags, value.label is a React element
        // So we need to find the original label from availableOptions
        const valueWithOriginalLabel = valueArray.map((v) => {
          // If label is string, use it directly; if React element, find from options
          const label = _.isString(v.label)
            ? v.label
            : (availableOptions.find((opt) => opt.value === v.value)?.label ??
              v.value);
          return {
            label,
            value: v.value,
          };
        });

        setOptimisticValueWithLabel(valueWithOriginalLabel);

        const idArray = valueArray.map((v) => _.toString(v.value));
        setControllableValue(idArray, option);
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
        _.isNumber(result.adminRoles?.count) && result.adminRoles.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminRoles.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIRoleSelect;
