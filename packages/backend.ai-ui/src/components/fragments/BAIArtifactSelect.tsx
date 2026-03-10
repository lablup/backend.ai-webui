import { BAIArtifactSelectPaginatedQuery } from '../../__generated__/BAIArtifactSelectPaginatedQuery.graphql';
import { BAIArtifactSelectValueQuery } from '../../__generated__/BAIArtifactSelectValueQuery.graphql';
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

export type ArtifactNode = NonNullable<
  NonNullable<
    BAIArtifactSelectPaginatedQuery['response']['artifacts']
  >['edges'][number]
>['node'];

export interface BAIArtifactSelectRef {
  refetch: () => void;
}

export interface BAIArtifactSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: BAIArtifactSelectPaginatedQuery['variables']['filter'];
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIArtifactSelectRef>;
}

const BAIArtifactSelect: React.FC<BAIArtifactSelectProps> = ({
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

  // NOTE: ArtifactFilter does not support filtering by Global ID.
  // The ValueQuery is always skipped; labels are preserved through the optimistic state.
  useLazyLoadQuery<BAIArtifactSelectValueQuery>(
    graphql`
      query BAIArtifactSelectValueQuery(
        $filter: ArtifactFilter
        $first: Int!
        $skipSelected: Boolean!
      ) {
        artifacts(filter: $filter, first: $first) @skip(if: $skipSelected) {
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
      filter: null,
      first: 1,
      // Always skip: ArtifactFilter has no Global ID field, so id-based
      // lookup is not possible. Labels are maintained via optimistic state.
      skipSelected: true,
    },
    {
      fetchPolicy: 'store-only',
      fetchKey: deferredFetchKey,
    },
  );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIArtifactSelectPaginatedQuery, ArtifactNode>(
      graphql`
        query BAIArtifactSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ArtifactFilter
        ) {
          artifacts(offset: $offset, limit: $limit, filter: $filter) {
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
        filter:
          filter || debouncedDeferredValue
            ? _.merge(
                {},
                filter,
                debouncedDeferredValue
                  ? { name: { iContains: debouncedDeferredValue } }
                  : null,
              )
            : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.artifacts?.count ?? undefined,
        getItem: (result) => result.artifacts?.edges?.map((edge) => edge?.node),
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

  // Since the ValueQuery is always skipped, derive label from optimistic state
  // or fall back to showing the value (id) as the label.
  const controllableValueWithLabel = !_.isEmpty(deferredControllableValue)
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
      placeholder={t('comp:BAIArtifactSelect.SelectArtifact')}
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
        _.isNumber(result.artifacts?.count) && result.artifacts.count > 0 ? (
          <TotalFooter loading={isLoadingNext} total={result.artifacts.count} />
        ) : undefined
      }
    />
  );
};

export default BAIArtifactSelect;
