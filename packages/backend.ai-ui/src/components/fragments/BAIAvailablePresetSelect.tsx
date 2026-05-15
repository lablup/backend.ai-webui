import { BAIAvailablePresetSelectPaginatedQuery } from '../../__generated__/BAIAvailablePresetSelectPaginatedQuery.graphql';
import { BAIAvailablePresetSelectValueQuery } from '../../__generated__/BAIAvailablePresetSelectValueQuery.graphql';
import { convertToUUID, toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIFlex from '../BAIFlex';
import BAISelect, { BAISelectProps } from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, Skeleton, Typography, theme } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
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

export type DeploymentRevisionPresetNode = NonNullable<
  NonNullable<
    NonNullable<
      BAIAvailablePresetSelectPaginatedQuery['response']['deploymentRevisionPresets']
    >['edges'][number]
  >['node']
>;

export interface BAIAvailablePresetSelectRef {
  refetch: () => void;
}

export interface BAIAvailablePresetSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  runtimeVariantId?: string;
  ref?: React.Ref<BAIAvailablePresetSelectRef>;
}

const BAIAvailablePresetSelect: React.FC<BAIAvailablePresetSelectProps> = ({
  loading,
  runtimeVariantId,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
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

  // Resolved (typed) UUIDs of currently selected presets. Each entry should be
  // a raw UUID so it can be fed into `DeploymentRevisionPresetFilter.id.in`.
  const selectedIds = _.compact(
    _.castArray(deferredControllableValue).map((v) =>
      v ? convertToUUID(_.toString(v)) : null,
    ),
  );

  // Fetch labels for the currently selected preset ids in one round-trip via
  // the `id: { in: [...] }` filter. `@skip(if: $skip)` collapses the request
  // when nothing is selected. We do not paginate this query — `first` is
  // sized exactly to the selection so all labels arrive together.
  const { deploymentRevisionPresets: selectedPresets } =
    useLazyLoadQuery<BAIAvailablePresetSelectValueQuery>(
      graphql`
        query BAIAvailablePresetSelectValueQuery(
          $ids: [UUID!]
          $first: Int!
          $skip: Boolean!
        ) {
          deploymentRevisionPresets(
            filter: { id: { in: $ids } }
            first: $first
          ) @skip(if: $skip) {
            edges {
              node {
                id
                name
                description
                runtimeVariantId
                runtimeVariant {
                  name
                }
              }
            }
          }
        }
      `,
      {
        ids: selectedIds,
        first: Math.max(selectedIds.length, 1),
        skip: selectedIds.length === 0,
      },
      {
        fetchPolicy: selectedIds.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  // `DeploymentRevisionPresetFilter` has no AND/OR combinators — its fields
  // already AND together — so we merge by setting each field on a single
  // object. `null` when no filter is active so the query field receives the
  // schema default.
  const mergedFilter: NonNullable<
    BAIAvailablePresetSelectPaginatedQuery['variables']['filter']
  > | null =
    runtimeVariantId || deferredSearchStr
      ? {
          ...(runtimeVariantId
            ? { runtimeVariantId: { equals: convertToUUID(runtimeVariantId) } }
            : {}),
          ...(deferredSearchStr
            ? { name: { iContains: deferredSearchStr } }
            : {}),
        }
      : null;

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAvailablePresetSelectPaginatedQuery,
      DeploymentRevisionPresetNode
    >(
      graphql`
        query BAIAvailablePresetSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: DeploymentRevisionPresetFilter
        ) {
          deploymentRevisionPresets(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: RANK, direction: "ASC" }]
          ) {
            count
            edges {
              node {
                id
                name
                description
                rank
                runtimeVariantId
                runtimeVariant {
                  name
                }
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergedFilter,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.deploymentRevisionPresets?.count ?? undefined,
        getItem: (r) =>
          r.deploymentRevisionPresets?.edges?.map((edge) => edge?.node),
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

  // Build base option list (raw UUID values + name/description metadata).
  type PresetOption = DefaultOptionType & {
    description?: string | null;
    runtimeVariantId?: string | null;
    runtimeVariantName?: string | null;
  };
  const flatOptions: PresetOption[] = _.compact(
    _.map(paginationData, (item) => {
      if (!item?.id) return null;
      return {
        label: item.name,
        value: toLocalId(item.id) ?? item.id,
        description: item.description,
        runtimeVariantId: item.runtimeVariantId,
        runtimeVariantName: item.runtimeVariant?.name,
      };
    }),
  );

  // Group options by runtime variant. When only one variant is present in the
  // current page we render a flat list — otherwise an optgroup per variant.
  const grouped = _.groupBy(flatOptions, 'runtimeVariantId');
  const variantIds = Object.keys(grouped);
  const availableOptions: DefaultOptionType[] =
    variantIds.length <= 1
      ? flatOptions
      : variantIds.map((variantId) => {
          const group = grouped[variantId];
          // Fall back to the variant id when the joined `runtimeVariant` is
          // missing (e.g., the variant row was deleted).
          const variantLabel = group[0]?.runtimeVariantName ?? variantId;
          return {
            label: variantLabel,
            options: group,
          };
        });

  // Whether the underlying Select is multi-select. In single mode antd's
  // `labelInValue` expects a single `{label, value}` object, not an array;
  // multi/tags modes expect an array. We must unwrap accordingly.
  const isMultiple =
    selectProps.mode === 'multiple' || selectProps.mode === 'tags';

  // Reconstruct labeled value objects for `labelInValue`. Falls back to the
  // raw id string when the label hasn't resolved yet.
  const selectedLabelMap: Record<string, string> = {};
  for (const edge of selectedPresets?.edges ?? []) {
    const node = edge?.node;
    if (!node?.id) continue;
    const uuid = toLocalId(node.id) ?? node.id;
    if (node.name) selectedLabelMap[uuid] = node.name;
  }
  const controllableValueWithLabelArray = !_.isEmpty(deferredControllableValue)
    ? _.castArray(deferredControllableValue).map((value) => {
        const v = _.toString(value);
        return { label: selectedLabelMap[v] ?? v, value: v };
      })
    : undefined;
  const controllableValueWithLabel = controllableValueWithLabelArray
    ? isMultiple
      ? controllableValueWithLabelArray
      : controllableValueWithLabelArray[0]
    : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIAvailablePresetSelect.SelectPreset')}
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
      optionRender={(option) => (
        <BAIFlex direction="column" align="start">
          {option.label}
          {option.data.description && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
              ellipsis
            >
              {option.data.description}
            </Typography.Text>
          )}
        </BAIFlex>
      )}
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
            : (flatOptions.find((opt) => opt.value === v.value)?.label ??
              v.value);
          return { label, value: v.value };
        });
        setOptimisticValueWithLabel(
          _.isEmpty(valueWithOriginalLabel)
            ? undefined
            : isMultiple
              ? valueWithOriginalLabel
              : valueWithOriginalLabel[0],
        );
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
        _.isNumber(result.deploymentRevisionPresets?.count) &&
        result.deploymentRevisionPresets.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.deploymentRevisionPresets.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAvailablePresetSelect;
