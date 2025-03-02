import ActionItemContent from '../components/ActionItemContent';
import BAICard from '../components/BAICard';
import BAIFetchKeyButton from '../components/BAIFetchKeyButton';
import NewFolderIcon from '../components/BAIIcons/NewFolderIcon';
import TrashBinIcon from '../components/BAIIcons/TrashBinIcon';
import BAIPropertyFilter, {
  mergeFilterValues,
} from '../components/BAIPropertyFilter';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import DeleteVFolderModal from '../components/DeleteVFolderModal';
import Flex from '../components/Flex';
import FolderCreateModal from '../components/FolderCreateModal';
import InviteFolderSettingModal from '../components/InviteFolderSettingModal';
import QuotaPerStorageVolumePanelCard from '../components/QuotaPerStorageVolumePanelCard';
import StorageStatusPanelCard from '../components/StorageStatusPanelCard';
import VFolderNodes, { VFolderNodeInList } from '../components/VFolderNodes';
import {
  filterNonNullItems,
  handleRowSelectionChange,
  transformSorterToOrderString,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useDeferredQueryParams } from '../hooks/useDeferredQueryParams';
import {
  VFolderNodeListPageQuery,
  VFolderNodeListPageQuery$data,
  VFolderNodeListPageQuery$variables,
} from './__generated__/VFolderNodeListPageQuery.graphql';
import { useToggle } from 'ahooks';
import { Badge, Button, Col, Grid, Row, theme, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, {
  Suspense,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
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

const VFolderNodeListPage: React.FC<VFolderNodeListPageProps> = ({
  ...props
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { lg } = Grid.useBreakpoint();
  const currentProject = useCurrentProjectValue();

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderNodesType>
  >([]);
  const [inviteFolderId, setInviteFolderId] = useState<string | null>(null);
  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useDeferredQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: StringParam,
    statusCategory: withDefault(StringParam, 'created'),
    mode: withDefault(StringParam, 'all'),
  });

  const queryMapRef = useRef({
    [queryParams.statusCategory]: queryParams,
  });
  queryMapRef.current[queryParams.statusCategory] = queryParams;

  const statusFilter =
    queryParams.statusCategory === 'created' ||
    queryParams.statusCategory === undefined
      ? 'status in ["READY", "PERFORMING", "CLONING", "MOUNTED", "ERROR"]'
      : 'status in ["DELETE_PENDING", "DELETE_ONGOING","DELETE_COMPLETE", "DELETE_ERROR"]';

  function getUsageModeFilter(mode: string) {
    switch (mode) {
      case 'all':
      case undefined:
        return undefined;
      case 'general':
        return `! name ilike ".%" & usage_mode == "${mode}"`;
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

  const { vfolder_nodes, ...folderCounts } =
    useLazyLoadQuery<VFolderNodeListPageQuery>(
      graphql`
        query VFolderNodeListPageQuery(
          $projectId: UUID 
          $offset: Int
          $first: Int
          $filter: String
          $order: String
          $permission: VFolderPermissionValueField
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
              }
            }
            count
          }
          created: vfolder_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status in [\"READY\", \"PERFORMING\", \"CLONING\", \"MOUNTED\", \"ERROR\"]"
            permission: $permission
          ) {
            count
          }
          deleted: vfolder_nodes(
            project_id: $projectId
            first: 0
            offset: 0
            filter: "status in [\"DELETE_PENDING\", \"DELETE_ONGOING\",\"DELETE_COMPLETE\", \"DELETE_ERROR\"]",
            permission: $permission
          ) {
            count
          }
        }
      `,
      deferredQueryVariables,
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
    <Flex direction="column" align="stretch" gap={'md'}>
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
        bordered={false}
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
              { ...storedQuery, statusCategory: key as 'created' | 'deleted' },
              'replace',
            );
            setTablePaginationOption({ current: 1 });
            setSelectedFolderList([]);
          }}
          items={_.map(
            {
              created: t('data.Created'),
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
                options={[
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
                  {
                    label: t('data.Models'),
                    value: 'model',
                  },
                ]}
              />
              <BAIPropertyFilter
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
              {selectedFolderList.length > 0 && (
                <>
                  {t('general.NSelected', {
                    count: selectedFolderList.length,
                  })}
                  <Button
                    style={{
                      color: token.colorError,
                    }}
                    icon={<TrashBinIcon />}
                    onClick={() => {
                      toggleDeleteModal();
                    }}
                  />
                </>
              )}
            </Flex>
          </Flex>
          <VFolderNodes
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
                  disabled: isDeletedCategory(record.status),
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
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total) => (
                <Typography.Text type="secondary">
                  {t('general.TotalItems', { total: total })}
                </Typography.Text>
              ),
            }}
            onChange={({ current, pageSize }, filters, sorter) => {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({ current, pageSize });
              }
              setQuery(
                { order: transformSorterToOrderString(sorter) },
                'replaceIn',
              );
            }}
            onRequestChange={() => {
              updateFetchKey();
            }}
          />
        </Flex>
      </BAICard>
      <InviteFolderSettingModal
        onRequestClose={() => {
          setInviteFolderId(null);
        }}
        vfolderId={inviteFolderId}
        open={inviteFolderId !== null}
      />
      <FolderCreateModal
        open={isOpenCreateModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
          }
          toggleCreateModal();
        }}
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
    </Flex>
  );
};

export default VFolderNodeListPage;
