import { BAIUserSelectPaginatedQuery } from '../../__generated__/BAIUserSelectPaginatedQuery.graphql';
import { BAIUserSelectValueQuery } from '../../__generated__/BAIUserSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { mergeFilterValues } from '../BAIPropertyFilter';
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

export type UserNode = NonNullable<
  NonNullable<
    BAIUserSelectPaginatedQuery['response']['user_nodes']
  >['edges'][number]
>['node'];

export interface BAIUserSelectRef {
  refetch: () => void;
}

export interface BAIUserSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: string;
  excludeInactive?: boolean;
  valuePropName?: 'id' | 'email';
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIUserSelectRef>;
}

// Default filter for active users only
const defaultActiveUserFilter = 'is_active == true';

const BAIUserSelect: React.FC<BAIUserSelectProps> = ({
  loading,
  filter,
  excludeInactive = false,
  valuePropName = 'email',
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
                  _.castArray(deferredControllableValue).map((value) => {
                    return valuePropName === 'id'
                      ? `uuid == "${value}"`
                      : `email == "${value}"`;
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
          debouncedDeferredValue
            ? `email ilike "%${debouncedDeferredValue}%"`
            : null,
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

  const getValueFromNode = (
    node: { id: string; email?: string | null } | null | undefined,
  ): string | undefined => {
    if (!node) return undefined;
    return valuePropName === 'id'
      ? toLocalId(node.id)
      : (node.email ?? undefined);
  };

  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.email,
    value: getValueFromNode(item),
  }));

  const controllableValueWithLabel = selectedUserNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((value) => {
          const edge = selectedUserNodes.edges.find(
            (edge) => getValueFromNode(edge?.node) === value,
          );
          return edge
            ? {
                label: edge.node?.email,
                value: getValueFromNode(edge.node),
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
      placeholder={t('comp:BAIUserSelect.SelectUser')}
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
      labelRender={({ label }) => label}
      optionRender={({ label }) => label}
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

        const isMultiple =
          selectProps.mode === 'multiple' || selectProps.mode === 'tags';
        const valuesArray = valueArray.map((v) => _.toString(v.value));
        setControllableValue(
          isMultiple ? valuesArray : (valuesArray[0] ?? undefined),
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
