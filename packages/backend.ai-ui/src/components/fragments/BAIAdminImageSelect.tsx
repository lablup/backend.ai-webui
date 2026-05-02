import { BAIAdminImageSelectPaginatedQuery } from '../../__generated__/BAIAdminImageSelectPaginatedQuery.graphql';
import { BAIAdminImageSelectValueQuery } from '../../__generated__/BAIAdminImageSelectValueQuery.graphql';
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

export type ImageV2Node = NonNullable<
  NonNullable<
    BAIAdminImageSelectPaginatedQuery['response']['adminImagesV2']
  >['edges'][number]
>['node'];

export interface BAIAdminImageSelectRef {
  refetch: () => void;
}

export interface BAIAdminImageSelectProps extends Omit<
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
  ref?: React.Ref<BAIAdminImageSelectRef>;
}

/**
 * Paginated image selector backed by `adminImagesV2` (ImageV2).
 * Stored value is the image UUID so callers can pass it directly to
 * mutation inputs that expect `UUID`.
 */
const BAIAdminImageSelect: React.FC<BAIAdminImageSelectProps> = ({
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

  const isMultiple =
    selectProps.mode === 'multiple' || selectProps.mode === 'tags';

  const deferredControllableValue = useDeferredValue(controllableValue);

  // Label cache maps UUID -> canonicalName for all selected items.
  // Updated in onChange so multiple-mode selections retain labels after
  // the deferred transition completes (selectedImage only resolves the first UUID).
  const [labelCache, setLabelCache] = useState<Record<string, string>>({});

  const selectedUUID = _.isArray(deferredControllableValue)
    ? (deferredControllableValue[0] ?? '')
    : (deferredControllableValue ?? '');
  const hasValue = !_.isEmpty(selectedUUID);

  // Resolve the label for the currently selected value via adminImagesV2 so
  // admin users can see images that may be filtered by user-level permissions.
  const { adminImagesV2: selectedImageResult } =
    useLazyLoadQuery<BAIAdminImageSelectValueQuery>(
      graphql`
        query BAIAdminImageSelectValueQuery(
          $id: UUID!
          $skipSelected: Boolean!
        ) {
          adminImagesV2(filter: { id: { equals: $id } }, limit: 1)
            @skip(if: $skipSelected) {
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
      {
        id: selectedUUID,
        skipSelected: !hasValue,
      },
      {
        fetchPolicy: hasValue ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );
  const selectedImage = selectedImageResult?.edges?.[0]?.node ?? null;

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIAdminImageSelectPaginatedQuery, ImageV2Node>(
      graphql`
        query BAIAdminImageSelectPaginatedQuery(
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

  const controllableValueWithLabel = (() => {
    if (_.isEmpty(deferredControllableValue)) return undefined;
    const allValues = _.castArray(deferredControllableValue);
    const items = allValues.map((value) => {
      // Use the GraphQL-resolved label when it matches (always the first UUID).
      if (selectedImage && toLocalId(selectedImage.id) === value) {
        return {
          label: selectedImage.identity?.canonicalName,
          value: toLocalId(selectedImage.id),
        };
      }
      // Fall back to labels cached from previous onChange calls.
      return { label: labelCache[value] ?? value, value };
    });
    if (items.length === 0) return undefined;
    return isMultiple ? items : items[0];
  })();

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
        // Cache UUID -> label for every selected item so controllableValueWithLabel
        // can display all tags after the deferred transition completes.
        setLabelCache((prev) => ({
          ...prev,
          ...Object.fromEntries(
            valueWithOriginalLabel.map(({ label, value }) => [
              value,
              _.toString(label),
            ]),
          ),
        }));
        setOptimisticValueWithLabel(
          isMultiple
            ? valueWithOriginalLabel
            : (valueWithOriginalLabel[0] ?? undefined),
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

export default BAIAdminImageSelect;
