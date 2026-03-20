import { BAIStorageHostSelectPaginatedQuery } from '../../__generated__/BAIStorageHostSelectPaginatedQuery.graphql';
import { BAIStorageHostSelectValueQuery } from '../../__generated__/BAIStorageHostSelectValueQuery.graphql';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import { mergeFilterValues } from '../BAIPropertyFilter';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
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

export type StorageHostNode = NonNullable<
  NonNullable<
    BAIStorageHostSelectPaginatedQuery['response']['storage_volume_list']
  >['items'][number]
>;

export interface BAIStorageHostSelectRef {
  refetch: () => void;
}

export interface BAIStorageHostSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: string;
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIStorageHostSelectRef>;
}

const BAIStorageHostSelect: React.FC<BAIStorageHostSelectProps> = ({
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

  // ValueQuery: fetch selected storage hosts by id filter
  const { storage_volume_list: selectedStorageVolumeList } =
    useLazyLoadQuery<BAIStorageHostSelectValueQuery>(
      graphql`
        query BAIStorageHostSelectValueQuery(
          $filter: String
          $limit: Int!
          $offset: Int!
          $skipSelected: Boolean!
        ) {
          storage_volume_list(filter: $filter, limit: $limit, offset: $offset)
            @skip(if: $skipSelected) {
            items {
              id
              backend
              path
              proxy
            }
            total_count
          }
        }
      `,
      {
        filter: !_.isEmpty(deferredControllableValue)
          ? mergeFilterValues(
              _.castArray(deferredControllableValue).map(
                (value) => `id == "${value}"`,
              ),
              '|',
            )
          : undefined,
        limit: _.castArray(deferredControllableValue).length || 1,
        offset: 0,
        skipSelected: _.isEmpty(deferredControllableValue),
      },
      {
        fetchPolicy: !_.isEmpty(deferredControllableValue)
          ? 'store-or-network'
          : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  // PaginatedQuery: fetch all storage hosts with pagination and search
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIStorageHostSelectPaginatedQuery, StorageHostNode>(
      graphql`
        query BAIStorageHostSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
          $order: String
        ) {
          storage_volume_list(
            offset: $offset
            limit: $limit
            filter: $filter
            order: $order
          ) {
            items {
              id
              backend
              path
              proxy
            }
            total_count
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          filter,
          debouncedDeferredValue
            ? `id ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) =>
          result.storage_volume_list?.total_count ?? undefined,
        getItem: (result) => result.storage_volume_list?.items,
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
    label: item?.id,
    value: item?.id,
  }));

  const controllableValueWithLabel = selectedStorageVolumeList?.items
    ? _.castArray(deferredControllableValue)
        .map((value) => {
          const item = selectedStorageVolumeList.items.find(
            (item) => item?.id === value,
          );
          return item
            ? {
                label: item.id,
                value: item.id,
              }
            : null;
        })
        .filter(
          (item): item is { label: string | null; value: string | null } =>
            item !== null,
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
      placeholder={t('comp:BAIStorageHostSelect.SelectStorageHost')}
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
      labelRender={({ label }) => {
        return _.isString(label) ? <BAIText monospace>{label}</BAIText> : label;
      }}
      optionRender={({ label }) => {
        return _.isString(label) ? <BAIText monospace>{label}</BAIText> : label;
      }}
      onChange={(value, option) => {
        const valueArray = _.isEmpty(value) ? [] : _.castArray(value);

        const valueWithOriginalLabel = valueArray.map((v) => {
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
        const idArray = valueArray.map((v) => _.toString(v.value));
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
        _.isNumber(result.storage_volume_list?.total_count) &&
        result.storage_volume_list.total_count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.storage_volume_list.total_count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIStorageHostSelect;
