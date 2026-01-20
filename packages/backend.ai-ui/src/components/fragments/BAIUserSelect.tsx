import { BAIUserSelectPaginatedQuery } from '../../__generated__/BAIUserSelectPaginatedQuery.graphql';
import { BAIUserSelectValueQuery } from '../../__generated__/BAIUserSelectValueQuery.graphql';
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

export type UserNode = NonNullable<
  NonNullable<
    BAIUserSelectPaginatedQuery['response']['user_nodes']
  >['edges'][number]
>['node'];

export interface BAIUserSelectRef {
  refetch: () => void;
}

export interface BAIUserSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue' | 'ref'> {
  filter?: string;
  excludeInactive?: boolean;
  ref?: React.Ref<BAIUserSelectRef>;
}

// Default filter for active users only
const defaultActiveUserFilter = 'is_active == true';

const BAIUserSelect: React.FC<BAIUserSelectProps> = ({
  loading,
  filter,
  excludeInactive = false,
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
    },
  );
  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const [optimisticSearchStr, setOptimisticSearchStr] = useOptimistic(
    searchStr,
    (_s, newS: string) => newS,
  );
  const [isPendingRefetch, startRefetchTransition] = useTransition();
  const mergedFilter = mergeFilterValues([
    excludeInactive ? defaultActiveUserFilter : null,
    filter,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  const { user_nodes: selectedUserNodes } =
    useLazyLoadQuery<BAIUserSelectValueQuery>(
      graphql`
        query BAIUserSelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelected: Boolean!
        ) {
          user_nodes(filter: $selectedFilter, first: $first)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                email
                username
                full_name
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
                  _.castArray(deferredControllableValue).map((email) => {
                    return `email == "${email}"`;
                  }),
                  '|',
                )
              : null,
            mergedFilter,
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
    useLazyPaginatedQuery<BAIUserSelectPaginatedQuery, UserNode>(
      graphql`
        query BAIUserSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
          $order: String
        ) {
          user_nodes(
            offset: $offset
            first: $limit
            filter: $filter
            order: $order
          ) {
            count
            edges {
              node {
                id
                email
                username
                full_name
                status
                role
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          mergedFilter,
          searchStr ? `email ilike "%${searchStr}%"` : null,
        ]),
        order: 'email',
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.user_nodes?.count ?? undefined,
        getItem: (result) =>
          result.user_nodes?.edges?.map((edge) => edge?.node),
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
    label: item?.email,
    value: item?.email,
  }));

  const controllableValueWithLabel = selectedUserNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((email) => {
          const edge = selectedUserNodes.edges.find(
            (edge) => edge?.node?.email === email,
          );
          return edge
            ? {
                label: edge.node?.email,
                value: edge.node?.email,
              }
            : null;
        })
        .filter(
          (item): item is { label: string; value: string } => item !== null,
        )
    : !_.isEmpty(deferredControllableValue)
      ? _.castArray(deferredControllableValue).map((email) => ({
          label: email,
          value: email,
        }))
      : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIUserSelect.SelectUser')}
      loading={
        loading ||
        controllableValue !== deferredControllableValue ||
        isPendingRefetch
      }
      {...selectProps}
      searchAction={async (value) => {
        setOptimisticSearchStr(value);
        await selectProps.searchAction?.(value);
        setSearchStr(value);
      }}
      showSearch={{
        searchValue: optimisticSearchStr,
        autoClearSearchValue: true,
        filterOption: false,
        ...(_.isObject(selectProps.showSearch)
          ? _.omit(selectProps.showSearch, ['searchValue'])
          : {}),
      }}
      value={
        controllableValue !== deferredControllableValue
          ? optimisticValueWithLabel
          : controllableValueWithLabel
      }
      labelInValue
      onChange={(value, option) => {
        // _.castArray to handle both single and multiple mode uniformly
        const valueArray = _.castArray(value);

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

        const emailArray = valueArray.map((v) => _.toString(v.value));
        setControllableValue(emailArray, option);
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
        _.isNumber(result.user_nodes?.count) && result.user_nodes.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.user_nodes.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIUserSelect;
