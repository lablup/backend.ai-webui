import { BAIProjectSelectPaginatedQuery } from '../../__generated__/BAIProjectSelectPaginatedQuery.graphql';
import { BAIProjectSelectValueQuery } from '../../__generated__/BAIProjectSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { mergeFilterValues } from '../BAIPropertyFilter';
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

export type ProjectNode = NonNullable<
  NonNullable<
    BAIProjectSelectPaginatedQuery['response']['group_nodes']
  >['edges'][number]
>['node'];

export interface BAIProjectSelectRef {
  refetch: () => void;
}

export interface BAIProjectSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: string;
  ref?: React.Ref<BAIProjectSelectRef>;
}

const BAIProjectSelect: React.FC<BAIProjectSelectProps> = ({
  loading,
  filter,
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
  const deferredSearchStr = useDebouncedDeferredValue(searchStr);
  const [optimisticSearchStr, setOptimisticSearchStr] =
    useOptimistic(searchStr);
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  const { group_nodes: selectedGroupNodes } =
    useLazyLoadQuery<BAIProjectSelectValueQuery>(
      graphql`
        query BAIProjectSelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelected: Boolean!
        ) {
          group_nodes(
            filter: $selectedFilter
            first: $first
            permission: "read_attribute"
          ) @skip(if: $skipSelected) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      `,
      {
        selectedFilter: mergeFilterValues(
          [
            !_.isEmpty(deferredControllableValue)
              ? mergeFilterValues(
                  _.castArray(deferredControllableValue).map((value) => {
                    // Convert Global ID to local UUID for filtering
                    const filterValue = toLocalId(value);
                    return `id == "${filterValue}"`;
                  }),
                  '|',
                )
              : null,
            filter,
          ],
          '&',
        ),
        first: _.castArray(deferredControllableValue).length,
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
    useLazyPaginatedQuery<BAIProjectSelectPaginatedQuery, ProjectNode>(
      graphql`
        query BAIProjectSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
        ) {
          group_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            permission: "read_attribute"
            order: "-created_at"
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
        filter: mergeFilterValues([
          filter,
          deferredSearchStr ? `name ilike "%${deferredSearchStr}%"` : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.group_nodes?.count ?? undefined,
        getItem: (result) =>
          result.group_nodes?.edges?.map((edge) => edge?.node),
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

  const controllableValueWithLabel = selectedGroupNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((value) => {
          const edge = selectedGroupNodes.edges.find(
            (edge) => edge?.node?.id === value,
          );
          return edge
            ? {
                label: edge.node?.name,
                value: edge.node?.id,
              }
            : null;
        })
        .filter(
          (item): item is { label: string; value: string } => item !== null,
        )
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
        searchStr !== deferredSearchStr ||
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
        // In multiple mode, when removing tags, value.label is a React element
        // So we need to find the original label from availableOptions
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
        setControllableValue(
          castedValue.map((v) => _.toString(v.value)),
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
        _.isNumber(result.group_nodes?.count) &&
        result.group_nodes.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.group_nodes.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIProjectSelect;
