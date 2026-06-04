import { BAIAdminProjectSelectPaginatedQuery } from '../../__generated__/BAIAdminProjectSelectPaginatedQuery.graphql';
import { BAIAdminProjectSelectValueQuery } from '../../__generated__/BAIAdminProjectSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useBAIi18n } from '../../hooks/useBAIi18n';
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
import { graphql, useLazyLoadQuery } from 'react-relay';

export type AdminProjectNode = NonNullable<
  NonNullable<
    BAIAdminProjectSelectPaginatedQuery['response']['adminProjectsV2']
  >['edges'][number]
>['node'];

export interface BAIAdminProjectSelectRef {
  refetch: () => void;
}

export interface BAIAdminProjectSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  filter?: {
    type?: { equals?: 'GENERAL' | 'MODEL_STORE' };
  };
  ref?: React.Ref<BAIAdminProjectSelectRef>;
}

const BAIAdminProjectSelect: React.FC<BAIAdminProjectSelectProps> = ({
  loading,
  filter: filterFromProps,
  ref,
  ...selectProps
}) => {
  'use memo';
  const { t } = useBAIi18n();
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

  // Defer query refetch to prevent flickering during selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  // Resolve labels for ALL selected values (single or multi). The previous
  // implementation queried `projectV2(projectId: UUID!)` for one id at a
  // time — fine for single-mode, but in `mode="multiple"` only the first
  // selected id would have its name resolved, so only one chip rendered
  // and the rest of the multi-selection silently vanished from the
  // controlled value display.
  const selectedIds = _.castArray(deferredControllableValue ?? []).filter(
    (v): v is string => !!v,
  );
  const { adminProjectsV2: selectedProjects } =
    useLazyLoadQuery<BAIAdminProjectSelectValueQuery>(
      graphql`
        query BAIAdminProjectSelectValueQuery(
          $projectIds: [UUID!]!
          $skipSelected: Boolean!
        ) {
          adminProjectsV2(filter: { id: { in: $projectIds } }, limit: 100)
            @skip(if: $skipSelected) {
            edges {
              node {
                id
                basicInfo {
                  name
                }
              }
            }
          }
        }
      `,
      {
        projectIds: selectedIds,
        skipSelected: selectedIds.length === 0,
      },
      {
        fetchPolicy: selectedIds.length > 0 ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );
  const selectedNameByLocalId = new Map<string, string>();
  _.forEach(selectedProjects?.edges, (edge) => {
    const node = edge?.node;
    if (node?.id && node.basicInfo?.name) {
      selectedNameByLocalId.set(toLocalId(node.id), node.basicInfo.name);
    }
  });

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIAdminProjectSelectPaginatedQuery,
      AdminProjectNode
    >(
      graphql`
        query BAIAdminProjectSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $filter: ProjectV2Filter
        ) {
          adminProjectsV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
          ) {
            count
            edges {
              node {
                id
                basicInfo {
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
        getTotal: (result) => result.adminProjectsV2?.count ?? undefined,
        getItem: (result) =>
          result.adminProjectsV2?.edges?.map((edge) => edge?.node),
        getId: (item) => (item?.id ? toLocalId(item.id) : item?.id),
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
    label: item?.basicInfo?.name,
    value: item?.id ? toLocalId(item.id) : item?.id,
  }));

  // Map every selected id to a label — prefer the resolved name from
  // `selectedProjects`, fall back to the raw value (UUID) so the chip is at
  // least visible even before the name lookup settles. Always returns one
  // entry per selected id, which is what multi-mode needs to render all
  // chips.
  const controllableValueWithLabel = !_.isEmpty(deferredControllableValue)
    ? _.castArray(deferredControllableValue).map((value) => ({
        label: selectedNameByLocalId.get(value) ?? value,
        value: value,
      }))
    : undefined;

  const [optimisticValueWithLabel, setOptimisticValueWithLabel] = useState(
    controllableValueWithLabel,
  );

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIProjectSelect.SelectProject')}
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
        _.isNumber(result.adminProjectsV2?.count) &&
        result.adminProjectsV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.adminProjectsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminProjectSelect;
