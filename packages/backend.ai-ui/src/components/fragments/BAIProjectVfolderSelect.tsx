import { BAIProjectVfolderSelectPaginatedQuery } from '../../__generated__/BAIProjectVfolderSelectPaginatedQuery.graphql';
import { BAIProjectVfolderSelectValueQuery } from '../../__generated__/BAIProjectVfolderSelectValueQuery.graphql';
import { convertToUUID, toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAILink from '../BAILink';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
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

export type ProjectVfolderNode = NonNullable<
  NonNullable<
    BAIProjectVfolderSelectPaginatedQuery['response']['projectVfolders']
  >['edges'][number]
>['node'];

export type BAIProjectVfolderSelectFilter = NonNullable<
  BAIProjectVfolderSelectPaginatedQuery['variables']['filter']
>;

export interface BAIProjectVfolderSelectRef {
  refetch: () => void;
}

export interface BAIProjectVfolderSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  projectId: string;
  onClickVFolder?: (value: string) => void;
  filter?: BAIProjectVfolderSelectFilter | null;
  excludeDeleted?: boolean;
  ref?: React.Ref<BAIProjectVfolderSelectRef>;
}

const EXCLUDED_DELETION_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
  'DELETE_COMPLETE',
] as const;

const BAIProjectVfolderSelect: React.FC<BAIProjectVfolderSelectProps> = ({
  loading,
  projectId,
  onClickVFolder,
  filter,
  excludeDeleted,
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

  // `VFolderFilter` allows each field at most once at the top level. We
  // compose the caller's `filter` with the search and `excludeDeleted`
  // shortcuts via the `AND` combinator so they cannot clobber each other
  // (e.g., caller passing `status: { equals: READY }` while we also want to
  // add `status: { notIn: [DELETE_*] }`).
  const subFilters: BAIProjectVfolderSelectFilter[] = [];
  if (filter) subFilters.push(filter);
  if (excludeDeleted) {
    subFilters.push({
      status: { notIn: EXCLUDED_DELETION_STATUSES },
    });
  }
  if (deferredSearchStr) {
    subFilters.push({ name: { iContains: deferredSearchStr } });
  }
  const mergedFilter: BAIProjectVfolderSelectFilter | null =
    subFilters.length === 0
      ? null
      : subFilters.length === 1
        ? subFilters[0]
        : { AND: subFilters };

  // Selected-value name lookup. `VFolderFilter` does not expose an id
  // filter, so we resolve the single selected vfolder via the
  // `vfolderV2(vfolderId:)` point lookup. The `@skip` directive collapses
  // the request when nothing is selected.
  const selectedUuid = deferredControllableValue
    ? convertToUUID(_.toString(deferredControllableValue))
    : '';
  const { vfolderV2: selectedVfolder } =
    useLazyLoadQuery<BAIProjectVfolderSelectValueQuery>(
      graphql`
        query BAIProjectVfolderSelectValueQuery(
          $vfolderId: UUID!
          $skip: Boolean!
        ) {
          vfolderV2(vfolderId: $vfolderId) @skip(if: $skip) {
            id
            metadata {
              name
            }
          }
        }
      `,
      {
        vfolderId: selectedUuid,
        skip: !selectedUuid,
      },
      {
        fetchPolicy: selectedUuid ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<
      BAIProjectVfolderSelectPaginatedQuery,
      ProjectVfolderNode
    >(
      graphql`
        query BAIProjectVfolderSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $projectId: UUID!
          $filter: VFolderFilter
        ) {
          projectVfolders(
            projectId: $projectId
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: [{ field: CREATED_AT, direction: DESC }]
          ) {
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
        projectId: convertToUUID(projectId),
        filter: mergedFilter,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (r) => r.projectVfolders?.count ?? undefined,
        getItem: (r) => r.projectVfolders?.edges?.map((edge) => edge?.node),
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

  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.metadata?.name,
    // Emit the raw (dashed) local UUID — matches the
    // `vfolderV2(vfolderId: UUID!)` shape and is what mutation callers feed
    // to `deployVfolderV2` etc.
    value: item?.id ? toLocalId(item.id) : undefined,
  }));

  const selectedLabel = selectedVfolder?.metadata?.name;
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
      placeholder={t('comp:BAIProjectVfolderSelect.SelectFolder')}
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
      labelRender={({ label, value }) => {
        // While the dropdown is open antd renders the search input on
        // top of the selected label. The input overlay only covers the
        // label node — the trailing `(id)` lives in a sibling span and
        // would visually leak alongside the user's typed query — so
        // suppress the suffix during search.
        if (controllableOpen) {
          return label;
        }
        return onClickVFolder ? (
          <BAILink onClick={() => onClickVFolder(_.toString(value))}>
            {label}
          </BAILink>
        ) : (
          <>
            {label}
            <BAIText type="secondary">
              &nbsp; (
              <BAIText
                ellipsis
                type="secondary"
                style={{ width: 80 }}
                monospace
              >
                {_.toString(value)}
              </BAIText>
              )
            </BAIText>
          </>
        );
      }}
      optionRender={({ label, value }) => (
        <>
          {label}
          <BAIText type="secondary">
            &nbsp; (
            <BAIText ellipsis style={{ width: 80 }} type="secondary" monospace>
              {_.toString(value)}
            </BAIText>
            )
          </BAIText>
        </>
      )}
      value={
        controllableValue !== deferredControllableValue
          ? optimisticValueWithLabel
          : controllableValueWithLabel
      }
      labelInValue
      onChange={(value, option) => {
        // Single-value select only — `labelInValue` returns a single object
        // (or undefined when cleared).
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
        _.isNumber(result.projectVfolders?.count) &&
        result.projectVfolders.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.projectVfolders.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIProjectVfolderSelect;
