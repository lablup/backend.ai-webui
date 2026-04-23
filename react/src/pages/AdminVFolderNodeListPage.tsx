/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminVFolderNodeListPageQuery,
  AdminVFolderNodeListPageQuery$data,
  VFolderOrderBy,
} from '../__generated__/AdminVFolderNodeListPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import DeleteForeverVFolderModalV2 from '../components/DeleteForeverVFolderModalV2';
import DeleteVFolderModalV2 from '../components/DeleteVFolderModalV2';
import FolderCreateModalV2 from '../components/FolderCreateModalV2';
import RestoreVFolderModalV2 from '../components/RestoreVFolderModalV2';
import VFolderNodesV2, {
  VFolderNodeInList,
  availableVFolderSorterValues,
} from '../components/VFolderNodesV2';
import { convertToOrderBy, handleRowSelectionChange } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { isDeletedCategory } from './VFolderNodeListPage';
import { useToggle } from 'ahooks';
import { Badge, theme, Tooltip } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIPurgeIcon,
  BAIRestoreIcon,
  BAISelectionLabel,
  BAIVFolderDeleteButtonV2,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type VFolderNodesType = NonNullableNodeOnEdges<
  AdminVFolderNodeListPageQuery$data['adminVfoldersV2']
>;

// Tab categories: active excludes every DELETE_* status; deleted lists rows
// still visible in the trash bin (DELETE_COMPLETE stays hidden in both).
const DELETE_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
  'DELETE_COMPLETE',
] as const;
const VISIBLE_DELETED_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
] as const;

const STATUS_FILTER_ACTIVE = {
  status: { notIn: DELETE_STATUSES },
} as const;
const STATUS_FILTER_DELETED = {
  status: { in: VISIBLE_DELETED_STATUSES },
} as const;

const statusCategoryValues = ['active', 'deleted'] as const;
const modeValues = ['all', 'general', 'data', 'automount', 'model'] as const;

function getUsageModeFilter(mode: (typeof modeValues)[number]) {
  switch (mode) {
    case 'all':
      return undefined;
    case 'general':
      // Exclude automount (names starting with `.`) and keep only GENERAL.
      return {
        AND: [
          { name: { iNotStartsWith: '.' } },
          { usageMode: { equals: 'GENERAL' } },
        ],
      } as const;
    case 'data':
      return { usageMode: { equals: 'DATA' } } as const;
    case 'automount':
      return { name: { iStartsWith: '.' } } as const;
    case 'model':
      return { usageMode: { equals: 'MODEL' } } as const;
    default:
      return undefined;
  }
}

const AdminVFolderNodeListPage: React.FC = (props) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminVFolderNodeListPage',
  );

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderNodesType>
  >([]);

  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);
  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteForeverModal, { toggle: toggleDeleteForeverModal }] =
    useToggle(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useQueryStates(
    {
      order: parseAsStringLiteral(availableVFolderSorterValues).withDefault(
        '-created_at',
      ),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
      statusCategory:
        parseAsStringLiteral(statusCategoryValues).withDefault('active'),
      mode: parseAsStringLiteral(modeValues).withDefault('all'),
    },
    { history: 'replace' },
  );

  const queryMapRef = useRef({
    [queryParams.statusCategory]: { queryParams, tablePaginationOption },
  });

  // eslint-disable-next-line react-hooks/refs
  queryMapRef.current[queryParams.statusCategory] = {
    queryParams,
    tablePaginationOption,
  };

  const usageModeFilter = getUsageModeFilter(queryParams.mode);

  const [fetchKey, updateFetchKey] = useFetchKey();

  const statusFilter =
    queryParams.statusCategory === 'deleted'
      ? STATUS_FILTER_DELETED
      : STATUS_FILTER_ACTIVE;

  // Combine tab-derived status filter, radio-derived usage-mode filter, and
  // user-supplied `BAIGraphQLPropertyFilter` conditions under an `AND` node so
  // each is applied independently without clobbering structured sub-filters.
  const combinedFilter = {
    AND: filterOutEmpty([
      statusFilter,
      usageModeFilter,
      queryParams.filter ?? undefined,
    ]),
  };

  const queryVariables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.first,
    filter: combinedFilter,
    // `VFolderOrderBy.field` is optional in generated types because the schema
    // provides a default; widen the type param to a shape compatible with
    // `convertToOrderBy` and cast back to the generated type.
    orderBy: convertToOrderBy<{ field: string; direction?: string }>(
      queryParams.order,
    ) as ReadonlyArray<VFolderOrderBy> | undefined,
    filterForActiveCount: STATUS_FILTER_ACTIVE,
    filterForDeletedCount: STATUS_FILTER_DELETED,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { adminVfoldersV2, ...folderCounts } =
    useLazyLoadQuery<AdminVFolderNodeListPageQuery>(
      graphql`
        query AdminVFolderNodeListPageQuery(
          $offset: Int
          $limit: Int
          $filter: VFolderFilter
          $orderBy: [VFolderOrderBy!]
          $filterForActiveCount: VFolderFilter
          $filterForDeletedCount: VFolderFilter
        ) {
          adminVfoldersV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                vfolderStatus: status
                ...VFolderNodesV2Fragment
                ...DeleteVFolderModalV2Fragment
                ...DeleteForeverVFolderModalV2Fragment
                ...RestoreVFolderModalV2Fragment
                ...BAIVFolderDeleteButtonV2Fragment
              }
            }
            count
          }
          active: adminVfoldersV2(filter: $filterForActiveCount) {
            count
          }
          deleted: adminVfoldersV2(filter: $filterForDeletedCount) {
            count
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
        fetchKey: deferredFetchKey,
      },
    );

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'} {...props}>
      <BAICard
        variant="borderless"
        title={t('data.Folders')}
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAITabs
          activeKey={queryParams.statusCategory}
          onChange={(key) => {
            const storedQuery = queryMapRef.current[key] || {
              mode: 'all',
            };
            setQuery(
              {
                ...storedQuery.queryParams,
                statusCategory: key as 'active' | 'deleted',
              },
              { history: 'replace' },
            );
            setTablePaginationOption(
              storedQuery.tablePaginationOption || { current: 1 },
            );
            setSelectedFolderList([]);
          }}
          items={_.map(
            {
              active: t('data.Active'),
              deleted: t('data.folders.TrashBin'),
            },
            (label, key) => ({
              key,
              label: (
                <BAIFlex justify="center" gap={10}>
                  {label}
                  {
                    // display badge only if count is greater than 0
                    // @ts-ignore
                    (folderCounts[key]?.count || 0) > 0 && (
                      <Badge
                        // @ts-ignore
                        count={folderCounts[key].count}
                        color={
                          queryParams.statusCategory === key
                            ? token.colorPrimary
                            : token.colorTextDisabled
                        }
                        size="small"
                        showZero
                        style={{
                          paddingRight: token.paddingXS,
                          paddingLeft: token.paddingXS,
                          fontSize: 10,
                        }}
                      />
                    )
                  }
                </BAIFlex>
              ),
            }),
          )}
        />
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                value={queryParams.mode}
                onChange={(e) => {
                  setQuery({ mode: e.target.value });
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
                options={filterOutEmpty([
                  {
                    label: t('data.All'),
                    value: 'all',
                  },
                  {
                    label: t('data.General'),
                    value: 'general',
                  },
                  baiClient?._config?.fasttrackEndpoint && {
                    label: t('data.Pipeline'),
                    value: 'data',
                  },
                  {
                    label: t('data.AutoMount'),
                    value: 'automount',
                  },
                  baiClient._config.enableModelFolders && {
                    label: t('data.Models'),
                    value: 'model',
                  },
                ])}
              />
              <BAIGraphQLPropertyFilter
                data-testid="vfolder-filter"
                // TODO(needs-backend): V2 `VFolderFilter` does not expose
                // ownership_type or mount-permission filters; only
                // name/host/status/usageMode/cloneable/createdAt are supported.
                // Re-add those filters once the backend extends the filter
                // input. Status is handled by the tab, so it is omitted here.
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('data.folders.Name'),
                    type: 'string',
                  },
                  {
                    key: 'host',
                    propertyLabel: t('data.folders.Location'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter ?? undefined}
                onChange={(value) => {
                  setQuery({ filter: value ?? null });
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
              />
            </BAIFlex>
            <BAIFlex gap={'sm'}>
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'active' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip title={t('data.folders.MoveToTrash')}>
                      <BAIVFolderDeleteButtonV2
                        vfolderFrgmt={selectedFolderList}
                        style={{
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        onClick={() => {
                          toggleDeleteModal();
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'deleted' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip title={t('data.folders.Restore')}>
                      <BAIButton
                        style={{
                          color: token.colorInfo,
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        icon={<BAIRestoreIcon />}
                        onClick={() => {
                          toggleRestoreModal();
                        }}
                      />
                    </Tooltip>
                    <Tooltip title={t('data.folders.Delete')}>
                      <BAIButton
                        style={{
                          color: token.colorError,
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        icon={<BAIPurgeIcon />}
                        onClick={() => {
                          toggleDeleteForeverModal();
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              <BAIFetchKeyButton
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                autoUpdateDelay={15_000}
                value={fetchKey}
                onChange={(newFetchKey) => {
                  updateFetchKey(newFetchKey);
                }}
              />
              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                onClick={() => {
                  toggleCreateModal();
                }}
              >
                {t('data.CreateFolder')}
              </BAIButton>
            </BAIFlex>
          </BAIFlex>
          <VFolderNodesV2
            order={queryParams.order}
            loading={deferredQueryVariables !== queryVariables}
            vfoldersFrgmt={filterOutNullAndUndefined(
              _.map(adminVfoldersV2?.edges, 'node'),
            )}
            rowSelection={{
              type: 'checkbox',
              // Preserve selected rows between pages, but clear when filter changes
              preserveSelectedRowKeys: true,
              getCheckboxProps(record: VFolderNodeInList) {
                return {
                  disabled:
                    isDeletedCategory(record.vfolderStatus) &&
                    record.vfolderStatus !== 'DELETE_PENDING',
                };
              },
              onChange: (selectedRowKeys) => {
                // Using selectedRowKeys to retrieve selected rows since selectedRows lack nested fragment types
                handleRowSelectionChange(
                  selectedRowKeys,
                  filterOutNullAndUndefined(
                    _.map(adminVfoldersV2?.edges, 'node'),
                  ),
                  setSelectedFolderList,
                );
              },
              selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
            }}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: adminVfoldersV2?.count ?? 0,
              onChange(current, pageSize) {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            onChangeOrder={(order) => {
              setQuery({
                order:
                  (order as (typeof availableVFolderSorterValues)[number]) ??
                  null,
              });
            }}
            onRemoveRow={(removedId) => {
              setSelectedFolderList((prevSelected) =>
                _.filter(prevSelected, (folder) => folder.id !== removedId),
              );
              updateFetchKey();
            }}
            tableSettings={{
              columnOverrides: columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
          />
        </BAIFlex>
      </BAICard>
      <DeleteVFolderModalV2
        vfolderFrgmts={selectedFolderList}
        open={isOpenDeleteModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleDeleteModal();
        }}
      />
      <RestoreVFolderModalV2
        vfolderFrgmts={selectedFolderList}
        open={isOpenRestoreModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleRestoreModal();
        }}
      />
      <DeleteForeverVFolderModalV2
        vfolderFrgmts={selectedFolderList}
        open={isOpenDeleteForeverModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleDeleteForeverModal();
        }}
      />
      <FolderCreateModalV2
        open={isOpenCreateModal}
        folderType="project"
        alertMessage={t('data.folders.AdminDataPageAlert')}
        onRequestClose={(result) => {
          toggleCreateModal();
          if (result) {
            updateFetchKey();
          }
        }}
      />
    </BAIFlex>
  );
};

export default AdminVFolderNodeListPage;
