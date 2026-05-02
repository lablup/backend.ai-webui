import { BAIImageSelectPaginatedQuery } from '../../__generated__/BAIImageSelectPaginatedQuery.graphql';
import { BAIImageSelectValueQuery } from '../../__generated__/BAIImageSelectValueQuery.graphql';
import { toGlobalId, toLocalId } from '../../helper';
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

export type ImageV2Node = NonNullable<
  NonNullable<
    BAIImageSelectPaginatedQuery['response']['adminImagesV2']
  >['edges'][number]
>['node'];

export interface BAIImageSelectRef {
  refetch: () => void;
}

export interface BAIImageSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  /** Additional GraphQL filter to narrow the image list. */
  filter?: {
    status?: { equals?: 'ALIVE' | 'DELETED' };
    name?: { contains?: string };
    architecture?: { equals?: string };
    registryId?: { equals?: string };
  };
  ref?: React.Ref<BAIImageSelectRef>;
}

/**
 * Paginated image selector backed by `adminImagesV2` (ImageV2).
 * Stored value is the image UUID so callers can pass it directly to
 * mutation inputs that expect `UUID`. The component re-encodes the UUID
 * to a Relay global ID internally when resolving the selected option's
 * label via `imageV2(id: ID!)`.
 */
const BAIImageSelect: React.FC<BAIImageSelectProps> = ({
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

  const deferredControllableValue = useDeferredValue(controllableValue);

  // Resolve label for the currently selected value
  const { imageV2: selectedImage } = useLazyLoadQuery<BAIImageSelectValueQuery>(
    graphql`
      query BAIImageSelectValueQuery($id: ID!, $skipSelected: Boolean!) {
        imageV2(id: $id) @skip(if: $skipSelected) {
          id
          identity {
            canonicalName
          }
        }
      }
    `,
    {
      // Stored value is a UUID; `imageV2(id: ID!)` expects a Relay global ID,
      // so re-encode here.
      id: !_.isEmpty(deferredControllableValue)
        ? toGlobalId(
            'ImageV2',
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
    useLazyPaginatedQuery<BAIImageSelectPaginatedQuery, ImageV2Node>(
      graphql`
        query BAIImageSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ImageV2Filter
        ) {
          adminImagesV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                identity {
                  canonicalName
                }
              }
            }
          }
        }
      `,
      { limit: 20 },
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
        getTotal: (r) => r.adminImagesV2?.count ?? undefined,
        getItem: (r) => r.adminImagesV2?.edges?.map((e) => e?.node),
        // Store UUID (via toLocalId) so callers can pass the value directly to UUID! mutation inputs
        getId: (item) => (item?.id ? toLocalId(item.id) : item?.id),
      },
    );

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
    label: item?.identity?.canonicalName,
    value: item?.id ? toLocalId(item.id) : item?.id,
  }));

  const controllableValueWithLabel = selectedImage
    ? [
        {
          label: selectedImage.identity?.canonicalName,
          value: toLocalId(selectedImage.id),
        },
      ]
    : !_.isEmpty(deferredControllableValue)
      ? _.castArray(deferredControllableValue).map((value) => ({
          label: value,
          value,
        }))
      : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIImageSelect.SelectImage')}
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
          return { label, value: v.value };
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
        _.isNumber(result.adminImagesV2?.count) &&
        result.adminImagesV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminImagesV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIImageSelect;
