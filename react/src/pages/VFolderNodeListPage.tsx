import {
  VFolderNodeListPageQuery,
  VFolderNodeListPageQuery$data,
  VFolderNodeListPageQuery$variables,
} from '../__generated__/VFolderNodeListPageQuery.graphql';
import ActionItemContent from '../components/ActionItemContent';
import BAICard from '../components/BAICard';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import NewFolderIcon from '../components/BAIIcons/NewFolderIcon';
import RestoreIcon from '../components/BAIIcons/RestoreIcon';
import TrashBinIcon from '../components/BAIIcons/TrashBinIcon';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import DeleteVFolderModal from '../components/DeleteVFolderModal';
import Flex from '../components/Flex';
import FolderCreateModal from '../components/FolderCreateModal';
import FolderInvitationResponseModal from '../components/FolderInvitationResponseModal';
import QuotaPerStorageVolumePanelCard from '../components/QuotaPerStorageVolumePanelCard';
import RestoreVFolderModal from '../components/RestoreVFolderModal';
import StorageStatusPanelCard from '../components/StorageStatusPanelCard';
import VFolderNodes, { VFolderNodeInList } from '../components/VFolderNodes';
import {
  filterEmptyItem,
  filterNonNullItems,
  handleRowSelectionChange,
} from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useVFolderInvitations } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import { useToggle } from 'ahooks';
import {
  Badge,
  Button,
  Col,
  Grid,
  Row,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import _ from 'lodash';
import React, {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { StringParam, withDefault } from 'use-query-params';

export const isDeletedCategory = (status?: string | null) => {
  return _.includes(
    ['delete-pending', 'delete-ongoing', 'delete-complete', 'delete-error'],
    status,
  );
};

type VFolderNodesType = NonNullableNodeOnEdges<
  VFolderNodeListPageQuery$data['vfolder_nodes']
>;

const VFOLDER_STATUSES = [
  'READY',
  'PERFORMING',
  'CLONING',
  'MOUNTED',
  'ERROR',
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
];

interface VFolderNodeListPageProps {}

const FILTER_BY_STATUS_CATEGORY = {
  active:
    'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"',
  deleted: 'status in ["DELETE_PENDING", "DELETE_ONGOING", "DELETE_ERROR"]',
};

const VFolderNodeListPage: React.FC<VFolderNodeListPageProps> = ({
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderNodesType>
  >([]);

  useEffect(() => {
    setSelectedFolderList([]);
    // Reset selectedRowKeys when currentProject changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject.id]);

  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);
  const [isInvitationResponseModalOpen, setIsInvitationResponseModalOpen] =
    useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(StringParam, undefined),
    statusCategory: withDefault(StringParam, 'active'),
    mode: withDefault(StringParam, 'all'),
  });

  const queryMapRef = useRef({
    [queryParams.statusCategory]: { queryParams, tablePaginationOption },
  });
  queryMapRef.current[queryParams.statusCategory] = {
    queryParams,
    tablePaginationOption,
  };

  const statusFilter =
    queryParams.statusCategory === 'active' ||
    queryParams.statusCategory === undefined
      ? FILTER_BY_STATUS_CATEGORY['active']
      : FILTER_BY_STATUS_CATEGORY['deleted'];

  function getUsageModeFilter(mode: string) {
    switch (mode) {
      case 'all':
      case undefined:
        return undefined;
      case 'general':
        return `(! name ilike ".%")&(usage_mode == "${mode}")`;
      case 'pipeline':
        return `usage_mode == "data"`;
      case 'automount':
        return `name ilike ".%"`;
      default:
        return `usage_mode == "${mode}"`;
    }
  }
  const usageModeFilter = getUsageModeFilter(queryParams.mode);

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');
  const queryVariables: VFolderNodeListPageQuery$variables = useMemo(
    () => ({
      projectId: currentProject.id,
      offset: baiPaginationOption.offset,
      first: baiPaginationOption.first ?? 20,
      filter: mergeFilterValues([
        statusFilter,
        queryParams.filter,
        usageModeFilter,
      ]),
      order: queryParams.order,
      permission: 'read_attribute',
    }),
    [
      currentProject.id,
      baiPaginationOption.offset,
      baiPaginationOption.first,
      statusFilter,
      queryParams.filter,
      usageModeFilter,
      queryParams.order,
    ],
  );
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [{ count, isFetching, isPendingMutation }] =
    useVFolderInvitations(deferredFetchKey);

  const { vfolder_nodes, ...folderCounts } =
    useLazyLoadQuery<VFolderNodeListPageQuery>(
      graphql`
        query VFolderNodeListPageQuery(
          $projectId: UUID!
          $offset: Int
          $first: Int
          $filter: String
          $order: String
          $permission: VFolderPermissionValueField
          $filterForActiveCount: String
          $filterForDeletedCount: String
        ) {
          vfolder_nodes(
            project_id: $projectId
            offset: $offset
            first: $first
            filter: $filter
            order: $order
            permission: $permission
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                status
                ...VFolderNodesFragment
                ...DeleteVFolderModalFragment
                ...EditableVFolderNameFragment
                ...RestoreVFolderModalFragment
                ...VFolderNodeIdenticonFragment
                ...SharedFolderPermissionInfoModalFragment
              }
            }
            count
          }
          active: vfolder_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: $filterForActiveCount
            permission: $permission
          ) {
            count
          }
          deleted: vfolder_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: $filterForDeletedCount
            permission: $permission
          ) {
            count
          }
        }
      `,
      {
        ...deferredQueryVariables,
        filterForActiveCount: FILTER_BY_STATUS_CATEGORY['active'],
        filterForDeletedCount: FILTER_BY_STATUS_CATEGORY['deleted'],
      },
      {
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
      },
    );

  return (
    <Flex direction="column" align="stretch" gap={'md'} {...props}>
      <Flex direction="column" align="stretch">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={8} xl={4}>
            <BAICard
              styles={{
                body: {
                  padding: 0,
                },
              }}
              style={{ height: lg ? 200 : undefined }}
              size={lg ? undefined : 'small'}
            >
              <ActionItemContent
                title={
                  <Typography.Text
                    style={{
                      maxWidth: lg ? 120 : undefined,
                      wordBreak: 'keep-all',
                    }}
                  >
                    {t('data.CreateFolderAndUploadFiles')}
                  </Typography.Text>
                }
                buttonText={t('data.CreateFolder')}
                icon={<NewFolderIcon />}
                type="simple"
                onClick={() => toggleCreateModal()}
              />
            </BAICard>
          </Col>
          <Col xs={24} lg={16} xl={8}>
            <Suspense
              fallback={
                <BAICard
                  style={{ height: 200 }}
                  title={t('data.StorageStatus')}
                  loading
                />
              }
            >
              <StorageStatusPanelCard
                style={{ height: lg ? 200 : undefined }}
                fetchKey={deferredFetchKey}
                onRequestBadgeClick={() => {
                  setIsInvitationResponseModalOpen(true);
                }}
              />
            </Suspense>
          </Col>
          <Col xs={24} xl={12}>
            <Suspense
              fallback={
                <BAICard
                  style={{ height: 200 }}
                  title={t('data.QuotaPerStorageVolume')}
                  loading
                />
              }
            >
              <QuotaPerStorageVolumePanelCard
                style={{ height: lg ? 200 : undefined }}
              />
            </Suspense>
          </Col>
        </Row>
      </Flex>
      <BAICard
        variant="borderless"
        title={t('data.Folders')}
        extra={
          <Flex gap={'xs'}>
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
            <Button type="primary" onClick={() => toggleCreateModal()}>
              {t('data.CreateFolder')}
            </Button>
          </Flex>
        }
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
              'replace',
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
                <Flex justify="center" gap={10}>
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
                </Flex>
              ),
            }),
          )}
        />
        <Flex direction="column" align="stretch" gap={'sm'}>
          <Flex justify="between" wrap="wrap" gap={'sm'}>
            <Flex
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
                  setQuery({ mode: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
                options={filterEmptyItem([
                  {
                    label: t('data.All'),
                    value: 'all',
                  },
                  {
                    label: t('data.General'),
                    value: 'general',
                  },
                  {
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
              <BAIPropertyFilter
                data-testid="vfolder-filter"
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('data.folders.Name'),
                    type: 'string',
                  },
                  {
                    key: 'status',
                    propertyLabel: t('data.folders.Status'),
                    type: 'string',
                    strictSelection: true,
                    defaultOperator: '==',
                    options: _.map(VFOLDER_STATUSES, (status) => ({
                      label: status,
                      value: status,
                    })),
                  },
                  {
                    key: 'host',
                    propertyLabel: t('data.folders.Location'),
                    type: 'string',
                  },
                  {
                    key: 'ownership_type',
                    propertyLabel: t('data.Type'),
                    type: 'string',
                    strictSelection: true,
                    defaultOperator: '==',
                    options: [
                      {
                        label: t('data.User'),
                        value: 'user',
                      },
                      {
                        label: t('data.Project'),
                        value: 'group',
                      },
                    ],
                  },
                  {
                    key: 'permission',
                    propertyLabel: t('data.Permission'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter || undefined}
                onChange={(value) => {
                  setQuery({ filter: value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
              />
            </Flex>
            <Flex gap={'sm'}>
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'active' && (
                  <>
                    {t('general.NSelected', {
                      count: selectedFolderList.length,
                    })}
                    <Tooltip title={t('data.folders.MoveToTrash')}>
                      <Button
                        style={{
                          color: token.colorError,
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        icon={<TrashBinIcon />}
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
                    {t('general.NSelected', {
                      count: selectedFolderList.length,
                    })}
                    <Tooltip title={t('data.folders.Restore')}>
                      <Button
                        style={{
                          color: token.colorInfo,
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        icon={<RestoreIcon />}
                        onClick={() => {
                          toggleRestoreModal();
                        }}
                      />
                    </Tooltip>
                  </>
                )}
            </Flex>
          </Flex>
          <VFolderNodes
            order={queryParams.order}
            loading={deferredQueryVariables !== queryVariables}
            vfoldersFrgmt={filterNonNullItems(
              _.map(vfolder_nodes?.edges, 'node'),
            )}
            rowSelection={{
              type: 'checkbox',
              // Preserve selected rows between pages, but clear when filter changes
              preserveSelectedRowKeys: true,
              getCheckboxProps(record: VFolderNodeInList) {
                return {
                  disabled:
                    isDeletedCategory(record.status) &&
                    record.status !== 'delete-pending',
                };
              },
              onChange: (selectedRowKeys) => {
                // Using selectedRowKeys to retrieve selected rows since selectedRows lack nested fragment types
                handleRowSelectionChange(
                  selectedRowKeys,
                  filterNonNullItems(_.map(vfolder_nodes?.edges, 'node')),
                  setSelectedFolderList,
                );
              },
              selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
            }}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: vfolder_nodes?.count ?? 0,
              showTotal: (total) => (
                <Typography.Text type="secondary">
                  {t('general.TotalItems', { total: total })}
                </Typography.Text>
              ),
              onChange(current, pageSize) {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            onChangeOrder={(order) => {
              setQuery({ order }, 'replaceIn');
            }}
            onRequestChange={(updatedFolderId) => {
              setSelectedFolderList((prevSelected) =>
                _.filter(
                  prevSelected,
                  (folder) => folder.id !== updatedFolderId,
                ),
              );
              updateFetchKey();
            }}
          />
        </Flex>
      </BAICard>
      <FolderCreateModal
        open={isOpenCreateModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
          }
          toggleCreateModal();
        }}
        usageMode={queryParams.mode === 'model' ? 'model' : undefined}
      />
      <DeleteVFolderModal
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
      <RestoreVFolderModal
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
      <Suspense>
        <FolderInvitationResponseModal
          open={isInvitationResponseModalOpen}
          loading={
            isFetching || isPendingMutation || deferredFetchKey !== fetchKey
          }
          fetchKey={deferredFetchKey}
          onRequestClose={(success) => {
            if (success) {
              if (count === 1) {
                setIsInvitationResponseModalOpen(false);
              }
              updateFetchKey();
            } else {
              setIsInvitationResponseModalOpen(false);
            }
          }}
        />
      </Suspense>
    </Flex>
  );
};

export default VFolderNodeListPage;
