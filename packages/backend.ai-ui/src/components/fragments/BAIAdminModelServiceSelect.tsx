import { BAIAdminModelServiceSelectPaginatedQuery } from '../../__generated__/BAIAdminModelServiceSelectPaginatedQuery.graphql';
import { BAIAdminModelServiceSelectValueQuery } from '../../__generated__/BAIAdminModelServiceSelectValueQuery.graphql';
import { toGlobalId, toLocalId } from '../../helper';
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

export type ModelServiceNode = NonNullable<
  NonNullable<
    BAIAdminModelServiceSelectPaginatedQuery['response']['deployments']
  >['edges'][number]
>['node'];

export interface BAIAdminModelServiceSelectRef {
  refetch: () => void;
}

export interface BAIAdminModelServiceSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  ref?: React.Ref<BAIAdminModelServiceSelectRef>;
}

const BAIAdminModelServiceSelect: React.FC<BAIAdminModelServiceSelectProps> = ({
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

  // Use single-node query to resolve selected value's label
  // DeploymentFilter does not support id-based filtering,
  // so we use the deployment(id:) query instead
  const { deployment: selectedDeployment } =
    useLazyLoadQuery<BAIAdminModelServiceSelectValueQuery>(
      graphql`
        query BAIAdminModelServiceSelectValueQuery(
          $id: ID!
          $skipSelected: Boolean!
        ) {
          deployment(id: $id) @skip(if: $skipSelected) {
            id
            metadata {
              name
            }
          }
        }
      `,
      {
        id: !_.isEmpty(deferredControllableValue)
          ? toGlobalId(
              'ModelDeployment',
              _.isArray(deferredControllableValue)
                ? (deferredControllableValue[0] ?? '')
                : (deferredControllableValue ?? ''),
            )
          : '',
        skipSelected: _.isEmpty(deferredControllableValue),
      },
      {
        fetchPolicy: !_.isEmpty(deferredControllableValue)
          ? 'store-or-network'
          : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminModelServiceSelectPaginatedQuery,
      ModelServiceNode
    >(
      graphql`
        query BAIAdminModelServiceSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: DeploymentFilter
        ) {
          deployments(offset: $offset, limit: $limit, filter: $filter) {
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
          ? { name: { contains: debouncedDeferredValue } }
          : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.deployments?.count ?? undefined,
        getItem: (result) =>
          result.deployments?.edges?.map((edge) => edge?.node),
        getId: (item) => (item?.id ? toLocalId(item.id) : item?.id),
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

  // Use raw UUID (toLocalId) as value instead of Relay global ID
  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.metadata?.name,
    value: item?.id ? toLocalId(item.id) : item?.id,
  }));

  const controllableValueWithLabel = selectedDeployment
    ? [
        {
          label: selectedDeployment.metadata?.name,
          value: toLocalId(selectedDeployment.id),
        },
      ]
    : !_.isEmpty(deferredControllableValue)
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
      placeholder={t('comp:BAIAdminModelServiceSelect.SelectModelService')}
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
        _.isNumber(result.deployments?.count) &&
        result.deployments.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.deployments.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminModelServiceSelect;
