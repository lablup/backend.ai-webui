import { BAIDeploymentSelectPaginatedQuery } from '../../__generated__/BAIDeploymentSelectPaginatedQuery.graphql';
import { BAIDeploymentSelectValueQuery } from '../../__generated__/BAIDeploymentSelectValueQuery.graphql';
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

export type DeploymentNode = NonNullable<
  NonNullable<
    BAIDeploymentSelectPaginatedQuery['response']['adminDeployments']
  >['edges'][number]
>['node'];

export interface BAIDeploymentSelectRef {
  refetch: () => void;
}

export interface BAIDeploymentSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  ref?: React.Ref<BAIDeploymentSelectRef>;
}

const BAIDeploymentSelect: React.FC<BAIDeploymentSelectProps> = ({
  loading,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
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

  // Use the deployment(id:) single-item query to look up the name when
  // a value (id) is already set (e.g., editing an existing permission).
  // TODO: This single-item lookup does not work in multi-select mode.
  //       Multi-select support is pending backend deployment API implementation.
  const skipSelected = _.isEmpty(deferredControllableValue);
  const selectedId = skipSelected
    ? undefined
    : _.castArray(deferredControllableValue)[0];

  const { deployment: selectedDeployment } =
    useLazyLoadQuery<BAIDeploymentSelectValueQuery>(
      graphql`
        query BAIDeploymentSelectValueQuery($id: ID!, $skipSelected: Boolean!) {
          deployment(id: $id) @skip(if: $skipSelected) {
            id
            metadata {
              name
            }
          }
        }
      `,
      {
        id: selectedId ?? '',
        skipSelected,
      },
      {
        fetchPolicy: !skipSelected ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIDeploymentSelectPaginatedQuery, DeploymentNode>(
      graphql`
        query BAIDeploymentSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: DeploymentFilter
        ) {
          adminDeployments(offset: $offset, limit: $limit, filter: $filter) {
            count
            edges {
              node {
                id
                metadata {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: debouncedDeferredValue
          ? { name: { iContains: debouncedDeferredValue } }
          : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.adminDeployments?.count ?? undefined,
        getItem: (result) =>
          result.adminDeployments?.edges?.map((edge) => edge?.node),
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
    label: item?.metadata?.name,
    value: item?.id,
  }));

  // Use the fetched deployment name as label, or fall back to the id.
  const controllableValueWithLabel = !_.isEmpty(deferredControllableValue)
    ? _.castArray(deferredControllableValue).map((value) => ({
        label:
          selectedDeployment?.id === value
            ? (selectedDeployment?.metadata?.name ?? value)
            : value,
        value: value,
      }))
    : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIDeploymentSelect.SelectDeployment')}
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
        const isMultiple =
          selectProps.mode === 'multiple' || selectProps.mode === 'tags';
        const idArray = castedValue.map((v) => _.toString(v.value));
        setControllableValue(
          isMultiple ? idArray : (idArray[0] ?? undefined),
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
        _.isNumber(result.adminDeployments?.count) &&
        result.adminDeployments.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminDeployments.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIDeploymentSelect;
