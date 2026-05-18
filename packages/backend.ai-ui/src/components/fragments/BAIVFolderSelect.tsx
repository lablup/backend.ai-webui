import FolderCreateModalV2 from '../../../../../react/src/components/FolderCreateModalV2';
import { BAIVFolderSelectPaginatedQuery } from '../../__generated__/BAIVFolderSelectPaginatedQuery.graphql';
import { BAIVFolderSelectValueQuery } from '../../__generated__/BAIVFolderSelectValueQuery.graphql';
import { toLocalId } from '../../helper';
import useDebouncedDeferredValue from '../../helper/useDebouncedDeferredValue';
import { useFetchKey } from '../../hooks';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAIFlex from '../BAIFlex';
import BAILink from '../BAILink';
import { mergeFilterValues } from '../BAIPropertyFilter';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
import TotalFooter from '../TotalFooter';
import { ReloadOutlined } from '@ant-design/icons';
import { useControllableValue } from 'ahooks';
import { Button, GetRef, Skeleton, Space, Tooltip } from 'antd';
import * as _ from 'lodash-es';
import { FolderOpenIcon, PlusIcon } from 'lucide-react';
import {
  useDeferredValue,
  useEffect,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useSearchParams } from 'react-router-dom';

export type VFolderNode = NonNullable<
  NonNullable<
    BAIVFolderSelectPaginatedQuery['response']['vfolder_nodes']
  >['edges'][number]
>['node'];

export interface BAIVFolderSelectRef {
  refetch: () => void;
}

export interface BAIVFolderSelectProps extends Omit<
  BAISelectProps,
  'options' | 'labelInValue' | 'ref'
> {
  currentProjectId?: string;
  onClickVFolder?: (value: string) => void;
  filter?: string;
  valuePropName?: 'id' | 'row_id';
  excludeDeleted?: boolean;
  onResolvedNamesChange?: (nameMap: Record<string, string>) => void;
  showOpenButton?: boolean;
  showCreateButton?: boolean;
  showRefreshButton?: boolean;
  ref?: React.Ref<BAIVFolderSelectRef>;
}

// Exclude deleted or deleting vfolders
const excludeDeletedStatusFilter =
  'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"';

const BAIVFolderSelect: React.FC<BAIVFolderSelectProps> = ({
  loading,
  currentProjectId,
  onClickVFolder,
  filter,
  excludeDeleted,
  valuePropName = 'id',
  onResolvedNamesChange,
  showOpenButton,
  showCreateButton,
  showRefreshButton,
  ref,
  labelRender: userLabelRender,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);
  const [, setSearchParams] = useSearchParams();
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
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
  const mergedFilter = mergeFilterValues([
    excludeDeleted ? excludeDeletedStatusFilter : null,
    filter,
  ]);
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query refetch to prevent flickering during user selection
  const deferredControllableValue = useDeferredValue(controllableValue);

  const { vfolder_nodes: selectedVFolderNodes } =
    useLazyLoadQuery<BAIVFolderSelectValueQuery>(
      graphql`
        query BAIVFolderSelectValueQuery(
          $selectedFilter: String
          $first: Int!
          $skipSelectedVFolder: Boolean!
          $scopeId: ScopeField
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            filter: $selectedFilter
            first: $first
            permission: "read_attribute"
          ) @skip(if: $skipSelectedVFolder) {
            edges {
              node {
                name
                id
                row_id
              }
            }
          }
        }
      `,
      {
        selectedFilter: mergeFilterValues(
          [
            !_.isEmpty(deferredControllableValue)
              ? mergeFilterValues(
                  _.castArray(deferredControllableValue).map((value) => {
                    // When valuePropName is 'id', convert Global ID to local UUID
                    // When valuePropName is 'row_id', use the value directly
                    const filterValue =
                      valuePropName === 'id' ? toLocalId(value) : value;
                    return `${valuePropName} == "${filterValue}"`;
                  }),
                  '|',
                )
              : null,
            mergedFilter,
          ],
          '&',
        ),
        first: _.castArray(deferredControllableValue).length,
        skipSelectedVFolder: _.isEmpty(deferredControllableValue),
        scopeId: currentProjectId ? `project:${currentProjectId}` : undefined,
      },
      {
        fetchPolicy: !_.isEmpty(deferredControllableValue)
          ? 'store-or-network'
          : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );

  const { paginationData, result, loadNext, isLoadingNext } =
    useLazyPaginatedQuery<BAIVFolderSelectPaginatedQuery, VFolderNode>(
      graphql`
        query BAIVFolderSelectPaginatedQuery(
          $offset: Int!
          $limit: Int!
          $scopeId: ScopeField
          $filter: String
          $permission: VFolderPermissionValueField
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            offset: $offset
            first: $limit
            filter: $filter
            permission: $permission
            order: "-created_at"
          ) {
            count
            edges {
              node {
                id
                name
                row_id
              }
            }
          }
        }
      `,
      { limit: 10 },
      {
        filter: mergeFilterValues([
          mergedFilter,
          deferredSearchStr ? `name ilike "%${deferredSearchStr}%"` : null,
        ]),
        scopeId: currentProjectId ? `project:${currentProjectId}` : undefined,
        permission: 'read_attribute' as const,
      },
      {
        fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
        fetchKey: deferredFetchKey,
      },
      {
        getTotal: (result) => result.vfolder_nodes?.count ?? undefined,
        getItem: (result) =>
          result.vfolder_nodes?.edges?.map((edge) => edge?.node),
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

  // Notify parent of resolved id→name mapping when selected nodes are loaded
  useEffect(() => {
    if (onResolvedNamesChange && selectedVFolderNodes?.edges) {
      const nameMap: Record<string, string> = {};
      selectedVFolderNodes.edges.forEach((edge) => {
        const key = edge?.node?.[valuePropName];
        const name = edge?.node?.name;
        if (key && name) {
          nameMap[key] = name;
        }
      });
      onResolvedNamesChange(nameMap);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVFolderNodes]);

  const availableOptions = _.map(paginationData, (item) => ({
    label: item?.name,
    value: item?.[valuePropName],
  }));

  const controllableValueWithLabel = selectedVFolderNodes?.edges
    ? // Sort by deferredControllableValue order to maintain selection order
      _.castArray(deferredControllableValue)
        .map((value) => {
          const edge = selectedVFolderNodes.edges.find(
            (edge) => edge?.node?.[valuePropName] === value,
          );
          return edge
            ? {
                label: edge.node?.name,
                value: edge.node?.[valuePropName],
              }
            : null;
        })
        .filter(
          (item): item is { label: string; value: string } => item !== null,
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

  const hasActionButton =
    showOpenButton || showCreateButton || showRefreshButton;
  const singleValueForOpen = _.toString(
    _.isArray(controllableValue) ? controllableValue[0] : controllableValue,
  );

  const baiSelectElement = (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIVFolderSelect.SelectFolder')}
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
      labelRender={
        userLabelRender ??
        (({ label, value }) => {
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
                  style={{
                    width: 80,
                  }}
                  monospace
                >
                  {valuePropName === 'id'
                    ? toLocalId(_.toString(value))
                    : _.toString(value)}
                </BAIText>
                )
              </BAIText>
            </>
          );
        })
      }
      optionRender={({ label, value }) => (
        <>
          {label}
          <BAIText type="secondary">
            &nbsp; (
            <BAIText
              ellipsis
              style={{
                width: 80,
              }}
              type="secondary"
              monospace
            >
              {valuePropName === 'id'
                ? toLocalId(_.toString(value))
                : _.toString(value)}
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
        // In multiple mode, when removing tags, value.label is a React element
        // So we need to find the original label from availableOptions
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
        _.isNumber(result.vfolder_nodes?.count) &&
        result.vfolder_nodes.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={result.vfolder_nodes.count}
          />
        ) : undefined
      }
    />
  );

  if (!hasActionButton) {
    return baiSelectElement;
  }

  return (
    <BAIFlex direction="row" gap="xs">
      {baiSelectElement}
      <Space.Compact>
        {showOpenButton ? (
          <Tooltip title={t('comp:BAIVFolderSelect.OpenFolder')}>
            <Button
              icon={<FolderOpenIcon />}
              disabled={!singleValueForOpen}
              onClick={() => {
                const folderId =
                  valuePropName === 'id'
                    ? toLocalId(singleValueForOpen)
                    : singleValueForOpen;
                if (folderId) {
                  setSearchParams(
                    (prev) => {
                      prev.set('folder', folderId);
                      return prev;
                    },
                    { replace: false },
                  );
                }
              }}
            />
          </Tooltip>
        ) : null}
        {showCreateButton ? (
          <Tooltip title={t('comp:BAIVFolderSelect.CreateANewStorageFolder')}>
            <Button
              icon={<PlusIcon />}
              variant="text"
              onClick={() => {
                setIsOpenCreateModal(true);
              }}
            />
          </Tooltip>
        ) : null}
        {showRefreshButton ? (
          <Tooltip title={t('comp:BAIVFolderSelect.Refresh')}>
            <Button
              icon={<ReloadOutlined />}
              variant="text"
              onClick={() => {
                startRefetchTransition(() => {
                  updateFetchKey();
                });
              }}
            />
          </Tooltip>
        ) : null}
      </Space.Compact>
      {showCreateButton ? (
        <FolderCreateModalV2
          open={isOpenCreateModal}
          initialValues={{ usage_mode: 'model' }}
          onRequestClose={(result) => {
            setIsOpenCreateModal(false);
            if (result) {
              startRefetchTransition(() => {
                updateFetchKey();
              });
            }
          }}
        />
      ) : null}
    </BAIFlex>
  );
};

export default BAIVFolderSelect;
