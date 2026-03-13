import { BAIArtifactRevisionSelectPaginatedQuery } from '../../__generated__/BAIArtifactRevisionSelectPaginatedQuery.graphql';
import { BAIArtifactRevisionSelectValueQuery } from '../../__generated__/BAIArtifactRevisionSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
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

export type ArtifactRevisionNode = NonNullable<
  NonNullable<
    BAIArtifactRevisionSelectPaginatedQuery['response']['artifactRevisions']
  >['edges'][number]
>['node'];

export interface BAIArtifactRevisionSelectRef {
  refetch: () => void;
}

export interface BAIArtifactRevisionSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: BAIArtifactRevisionSelectPaginatedQuery['variables']['filter'];
  onChange?: (value: string | string[] | undefined, option: any) => void;
  ref?: React.Ref<BAIArtifactRevisionSelectRef>;
}

const BAIArtifactRevisionSelect: React.FC<BAIArtifactRevisionSelectProps> = ({
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

  // NOTE: ArtifactRevisionFilter does not support filtering by Global ID.
  // The ValueQuery is always skipped; labels are preserved through the optimistic state.
  useLazyLoadQuery<BAIArtifactRevisionSelectValueQuery>(
    graphql`
      query BAIArtifactRevisionSelectValueQuery(
        $filter: ArtifactRevisionFilter
        $first: Int!
        $skipSelected: Boolean!
      ) {
        artifactRevisions(filter: $filter, first: $first)
          @skip(if: $skipSelected) {
          edges {
            node {
              id
              version
              status
            }
          }
        }
      }
    `,
    {
      filter: null,
      first: 1,
      // Always skip: ArtifactRevisionFilter has no Global ID field, so id-based
      // lookup is not possible. Labels are maintained via optimistic state.
      skipSelected: true,
    },
    {
      fetchPolicy: 'store-only',
      fetchKey: deferredFetchKey,
    },
  );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIArtifactRevisionSelectPaginatedQuery,
      ArtifactRevisionNode
    >(
      graphql`
        query BAIArtifactRevisionSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ArtifactRevisionFilter
        ) {
          artifactRevisions(offset: $offset, limit: $limit, filter: $filter) {
            count
            edges {
              node {
                id
                version
                status
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
                  ? { version: { contains: debouncedDeferredValue } }
                  : null,
              )
            : null,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.artifactRevisions?.count ?? undefined,
        getItem: (result) =>
          result.artifactRevisions?.edges?.map((edge) => edge?.node),
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
    label: item?.version,
    value: item?.id,
  }));

  // Since the ValueQuery is always skipped, derive label from optimistic state
  // or fall back to showing the local id as the label.
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
      placeholder={t('comp:BAIArtifactRevisionSelect.SelectArtifactRevision')}
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
        return _.isString(label) ? (
          <BAIText monospace>{toLocalId(label)}</BAIText>
        ) : (
          label
        );
      }}
      optionRender={({ label }) => {
        return _.isString(label) ? (
          <BAIText monospace>{toLocalId(label)}</BAIText>
        ) : (
          label
        );
      }}
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

        const idArray = valueArray.map((v) => _.toString(v.value));
        setControllableValue(idArray, option);
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
        _.isNumber(result.artifactRevisions?.count) &&
        result.artifactRevisions.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.artifactRevisions.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIArtifactRevisionSelect;
