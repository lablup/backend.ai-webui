import { BAIAdminSessionSelectPaginatedQuery } from '../../__generated__/BAIAdminSessionSelectPaginatedQuery.graphql';
import { BAIAdminSessionSelectValueQuery } from '../../__generated__/BAIAdminSessionSelectValueQuery.graphql';
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

export type SessionNode = NonNullable<
  NonNullable<
    BAIAdminSessionSelectPaginatedQuery['response']['adminSessionsV2']
  >['edges'][number]
>['node'];

export interface BAIAdminSessionSelectRef {
  refetch: () => void;
}

export interface BAIAdminSessionSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIAdminSessionSelectRef>;
}

const BAIAdminSessionSelect: React.FC<BAIAdminSessionSelectProps> = ({
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

  // Defer query refetch to prevent flickering during session selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  // Use adminSessionsV2 with UUIDFilter to resolve selected value labels
  const { adminSessionsV2: selectedSessionNodes } =
    useLazyLoadQuery<BAIAdminSessionSelectValueQuery>(
      graphql`
        query BAIAdminSessionSelectValueQuery(
          $filter: SessionV2Filter
          $first: Int!
          $skipSelected: Boolean!
        ) {
          adminSessionsV2(filter: $filter, first: $first)
            @skip(if: $skipSelected) {
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
      {
        filter: !_.isEmpty(deferredControllableValue)
          ? {
              id: {
                in: _.castArray(deferredControllableValue),
              },
              status: {
                notIn: ['TERMINATING', 'TERMINATED', 'CANCELLED'],
              },
            }
          : null,
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
    useLazyPaginatedQuery<BAIAdminSessionSelectPaginatedQuery, SessionNode>(
      graphql`
        query BAIAdminSessionSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: SessionV2Filter
        ) {
          adminSessionsV2(offset: $offset, limit: $limit, filter: $filter) {
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
        filter: {
          status: {
            notIn: ['TERMINATING', 'TERMINATED', 'CANCELLED'],
          },
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
        getTotal: (result) => result.adminSessionsV2?.count ?? undefined,
        getItem: (result) =>
          result.adminSessionsV2?.edges?.map((edge) => edge?.node),
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

  // Use raw UUID (toLocalId) as value instead of Relay global ID
  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.metadata?.name,
    value: item?.id ? toLocalId(item.id) : item?.id,
  }));

  const controllableValueWithLabel = selectedSessionNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((value) => {
          const edge = selectedSessionNodes.edges.find(
            (edge) => edge?.node?.id && toLocalId(edge.node.id) === value,
          );
          return edge
            ? {
                label: edge.node?.metadata?.name,
                value: value,
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
      placeholder={t('comp:BAIAdminSessionSelect.SelectSession')}
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
        _.isNumber(result.adminSessionsV2?.count) &&
        result.adminSessionsV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminSessionsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminSessionSelect;
