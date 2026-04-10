import { BAIAdminProjectSelectPaginatedQuery } from '../../__generated__/BAIAdminProjectSelectPaginatedQuery.graphql';
import { BAIAdminProjectSelectValueQuery } from '../../__generated__/BAIAdminProjectSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
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
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AdminProjectNode = NonNullable<
  NonNullable<
    BAIAdminProjectSelectPaginatedQuery['response']['adminProjectsV2']
  >['edges'][number]
>['node'];

export interface BAIAdminProjectSelectRef {
  refetch: () => void;
}

export interface BAIAdminProjectSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: {
    type?: { equals?: 'GENERAL' | 'MODEL_STORE' };
  };
  ref?: React.Ref<BAIAdminProjectSelectRef>;
}

const BAIAdminProjectSelect: React.FC<BAIAdminProjectSelectProps> = ({
  loading,
  filter: filterFromProps,
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
  const { projectV2: selectedProject } =
    useLazyLoadQuery<BAIAdminProjectSelectValueQuery>(
      graphql`
        query BAIAdminProjectSelectValueQuery(
          $projectId: UUID!
          $skipSelected: Boolean!
        ) {
          projectV2(projectId: $projectId) @skip(if: $skipSelected) {
            id
            basicInfo {
              name
            }
          }
        }
      `,
      {
        projectId: !_.isEmpty(deferredControllableValue)
          ? _.isArray(deferredControllableValue)
            ? (deferredControllableValue[0] ?? '')
            : (deferredControllableValue ?? '')
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
      BAIAdminProjectSelectPaginatedQuery,
      AdminProjectNode
    >(
      graphql`
        query BAIAdminProjectSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ProjectV2Filter
        ) {
          adminProjectsV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                basicInfo {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: {
          ...(filterFromProps ?? {}),
          ...(debouncedDeferredValue
            ? { name: { contains: debouncedDeferredValue } }
            : {}),
        },
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.adminProjectsV2?.count ?? undefined,
        getItem: (result) =>
          result.adminProjectsV2?.edges?.map((edge) => edge?.node),
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
    label: item?.basicInfo?.name,
    value: item?.id ? toLocalId(item.id) : item?.id,
  }));

  const controllableValueWithLabel = selectedProject
    ? [
        {
          label: selectedProject.basicInfo?.name,
          value: toLocalId(selectedProject.id),
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
      placeholder={t('comp:BAIProjectSelect.SelectProject')}
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
        _.isNumber(result.adminProjectsV2?.count) &&
        result.adminProjectsV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminProjectsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminProjectSelect;
