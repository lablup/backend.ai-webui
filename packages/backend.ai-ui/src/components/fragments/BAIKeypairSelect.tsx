import { BAIKeypairSelectPaginatedQuery } from '../../__generated__/BAIKeypairSelectPaginatedQuery.graphql';
import { BAIKeypairSelectValueQuery } from '../../__generated__/BAIKeypairSelectValueQuery.graphql';
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

export type KeypairNode = NonNullable<
  NonNullable<
    BAIKeypairSelectPaginatedQuery['response']['keypair_list']
  >['items'][number]
>;

export interface BAIKeypairSelectRef {
  refetch: () => void;
}

export interface BAIKeypairSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: string;
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIKeypairSelectRef>;
}

const BAIKeypairSelect: React.FC<BAIKeypairSelectProps> = ({
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

  // ValueQuery: fetch selected keypairs by access_key filter
  const { keypair_list: selectedKeypairList } =
    useLazyLoadQuery<BAIKeypairSelectValueQuery>(
      graphql`
        query BAIKeypairSelectValueQuery(
          $filter: String
          $limit: Int!
          $offset: Int!
          $skipSelected: Boolean!
        ) {
          keypair_list(filter: $filter, limit: $limit, offset: $offset)
            @skip(if: $skipSelected) {
            items {
              access_key
              user_id
              is_active
            }
            total_count
          }
        }
      `,
      {
        filter: !_.isEmpty(deferredControllableValue)
          ? mergeFilterValues(
              _.castArray(deferredControllableValue).map(
                (value) => `access_key == "${value}"`,
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

  // PaginatedQuery: fetch all keypairs with pagination and search
  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIKeypairSelectPaginatedQuery, KeypairNode>(
      graphql`
        query BAIKeypairSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: String
        ) {
          keypair_list(
            offset: $offset
            limit: $limit
            filter: $filter
            order: "-created_at"
          ) {
            items {
              access_key
              user_id
              is_active
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
            ? `access_key ilike "%${debouncedDeferredValue}%"`
            : null,
        ]),
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.keypair_list?.total_count ?? undefined,
        getItem: (result) => result.keypair_list?.items,
        getId: (item) => item?.access_key,
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
    label: item?.access_key,
    value: item?.access_key,
  }));

  const controllableValueWithLabel = selectedKeypairList?.items
    ? _.castArray(deferredControllableValue)
        .map((value) => {
          const item = selectedKeypairList.items.find(
            (item) => item?.access_key === value,
          );
          return item
            ? {
                label: item.access_key,
                value: item.access_key,
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
      placeholder={t('comp:BAIKeypairSelect.SelectKeypair')}
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
        const accessKeyArray = valueArray.map((v) => _.toString(v.value));
        setControllableValue(
          isMultiple ? accessKeyArray : (accessKeyArray[0] ?? undefined),
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
        _.isNumber(result.keypair_list?.total_count) &&
        result.keypair_list.total_count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.keypair_list.total_count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIKeypairSelect;
