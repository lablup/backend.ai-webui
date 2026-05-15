import { BAIRuntimeVariantSelectPaginatedQuery } from '../../__generated__/BAIRuntimeVariantSelectPaginatedQuery.graphql';
import { BAIRuntimeVariantSelectValueQuery } from '../../__generated__/BAIRuntimeVariantSelectValueQuery.graphql';
import { convertToUUID, toLocalId } from '../../helper';
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
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type RuntimeVariantNode = NonNullable<
  NonNullable<
    BAIRuntimeVariantSelectPaginatedQuery['response']['runtimeVariants']
  >['edges'][number]
>['node'];

export interface BAIRuntimeVariantSelectRef {
  refetch: () => void;
}

export interface BAIRuntimeVariantSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  /**
   * Notifies the parent of resolved id→name pairs as the paginated list and
   * selected-value point lookup fan in. The parent typically merges these
   * into a local map so it can resolve the *currently selected* variant id
   * back to its name elsewhere in the form (e.g., for `variantName === 'custom'`
   * branching) without re-querying.
   */
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
  ref?: React.Ref<BAIRuntimeVariantSelectRef>;
}

const BAIRuntimeVariantSelect: React.FC<BAIRuntimeVariantSelectProps> = ({
  loading,
  onResolvedNamesChange,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [controllableValue, setControllableValue] = useControllableValue<
    string | undefined
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

  const deferredControllableValue = useDeferredValue(controllableValue);

  // Selected-value name lookup. `RuntimeVariantFilter` only exposes `name` —
  // no id filter — so we resolve the single selected variant via the
  // `runtimeVariant(id:)` point lookup. `@skip` collapses the request when
  // nothing is selected.
  const selectedUuid = deferredControllableValue
    ? convertToUUID(_.toString(deferredControllableValue))
    : '';
  const { runtimeVariant: selectedVariant } =
    useLazyLoadQuery<BAIRuntimeVariantSelectValueQuery>(
      graphql`
        query BAIRuntimeVariantSelectValueQuery($id: UUID!, $skip: Boolean!) {
          runtimeVariant(id: $id) @skip(if: $skip) {
            id
            name
          }
        }
      `,
      {
        id: selectedUuid,
        skip: !selectedUuid,
      },
      {
        fetchPolicy: selectedUuid ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const mergedFilter: NonNullable<
    BAIRuntimeVariantSelectPaginatedQuery['variables']['filter']
  > | null = deferredSearchStr
    ? { name: { iContains: deferredSearchStr } }
    : null;

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIRuntimeVariantSelectPaginatedQuery,
      RuntimeVariantNode
    >(
      graphql`
        query BAIRuntimeVariantSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: RuntimeVariantFilter
        ) {
          runtimeVariants(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: "ASC" }]
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
      { limit: 20 },
      {
        filter: mergedFilter,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.runtimeVariants?.count ?? undefined,
        getItem: (r) => r.runtimeVariants?.edges?.map((edge) => edge?.node),
        getId: (item) => item?.id,
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

  // Notify parent of resolved id→name pairs. We feed *both* the currently
  // selected variant (from the point lookup) and the visible page (from the
  // paginated list), so callers get name resolution as soon as either lands.
  const notifyResolvedNames = useEffectEvent(() => {
    if (!onResolvedNamesChange) return;
    const nameMap: Record<string, string> = {};
    if (selectedVariant?.id && selectedVariant.name) {
      const uuid = toLocalId(selectedVariant.id);
      if (uuid) nameMap[uuid] = selectedVariant.name;
    }
    for (const node of paginationData ?? []) {
      if (node?.id && node.name) {
        const uuid = toLocalId(node.id);
        if (uuid) nameMap[uuid] = node.name;
      }
    }
    if (!_.isEmpty(nameMap)) onResolvedNamesChange(nameMap);
  });

  useEffect(() => {
    notifyResolvedNames();
  }, [selectedVariant, paginationData]);

  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.name,
    value: item?.id ? toLocalId(item.id) : undefined,
  }));

  const selectedLabel = selectedVariant?.name;
  const controllableValueWithLabel = deferredControllableValue
    ? {
        label: selectedLabel ?? _.toString(deferredControllableValue),
        value: _.toString(deferredControllableValue),
      }
    : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIRuntimeVariantSelect.SelectRuntimeVariant')}
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
        if (_.isUndefined(value) || _.isNull(value)) {
          setOptimisticValueWithLabel(undefined);
          setControllableValue(undefined, option);
          return;
        }
        const v = _.castArray(value)[0];
        const label = _.isString(v.label)
          ? v.label
          : (availableOptions.find((opt) => opt.value === v.value)?.label ??
            _.toString(v.value));
        const next = { label, value: _.toString(v.value) };
        setOptimisticValueWithLabel(next);
        setControllableValue(next.value, option);
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
        _.isNumber(result.runtimeVariants?.count) &&
        result.runtimeVariants.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.runtimeVariants.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIRuntimeVariantSelect;
