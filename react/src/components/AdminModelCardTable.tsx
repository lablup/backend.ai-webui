/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminModelCardTableBulkDeleteMutation } from '../__generated__/AdminModelCardTableBulkDeleteMutation.graphql';
import type { AdminModelCardTableDeleteMutation } from '../__generated__/AdminModelCardTableDeleteMutation.graphql';
import type {
  AdminModelCardTableQuery as AdminModelCardTableQueryType,
  AdminModelCardTableQuery$data,
  ModelCardV2Filter,
  ModelCardV2OrderBy,
} from '../__generated__/AdminModelCardTableQuery.graphql';
import {
  convertOrderByToString,
  convertToOrderBy,
  handleRowSelectionChange,
} from '../helper';
import { useSetBAINotification } from '../hooks/useBAINotification';
import AdminModelCardSettingModal from './AdminModelCardSettingModal';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import VFolderNodeIdenticonV2 from './VFolderNodeIdenticonV2';
import { DeleteFilled, ExclamationCircleFilled } from '@ant-design/icons';
import { App, Checkbox, Tooltip, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIColumnType,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAILink,
  BAINameActionCell,
  BAISelectionLabel,
  BAIStorageHostSelect,
  BAITable,
  type BAITableSettings,
  BAIText,
  BAITag,
  BAIUnmountAfterClose,
  filterOutEmpty,
  filterOutNullAndUndefined,
  isValidUUID,
  toLocalId,
  useBAILogger,
  BAIAlert,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  useMutation,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

type ModelCardNode = NonNullableNodeOnEdges<
  AdminModelCardTableQuery$data['adminModelCardsV2']
>;

const availableModelCardSorterKeys = ['name', 'created_at'] as const;

export const availableModelCardSorterValues = [
  ...availableModelCardSorterKeys,
  ...availableModelCardSorterKeys.map((key) => `-${key}` as const),
] as const;

export const AdminModelCardTableQuery = graphql`
  query AdminModelCardTableQuery(
    $filter: ModelCardV2Filter
    $orderBy: [ModelCardV2OrderBy!]
    $limit: Int
    $offset: Int
    $currentProjectId: UUID!
  ) {
    adminModelCardsV2(
      filter: $filter
      orderBy: $orderBy
      limit: $limit
      offset: $offset
    ) {
      count
      edges {
        node {
          id
          name
          vfolderId
          vfolder {
            id
            metadata {
              name
            }
            ...VFolderNodeIdenticonV2Fragment
          }
          domainName
          projectId
          accessLevel
          createdAt
          metadata {
            title
            category
            task
          }
          ...AdminModelCardSettingModalFragment
        }
      }
    }
    group(id: $currentProjectId) {
      type
    }
    groups(is_active: true, type: ["MODEL_STORE"]) {
      id
      name
    }
  }
`;

export interface AdminModelCardTableProps {
  queryRef: PreloadedQuery<AdminModelCardTableQueryType>;
  onReload: (
    variables: AdminModelCardTableQueryType['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
  tableSettings: BAITableSettings;
}

const AdminModelCardTable: React.FC<AdminModelCardTableProps> = ({
  queryRef,
  onReload,
  tableSettings,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const { generateFolderPath } = useFolderExplorerOpener();

  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editingModelCardId, setEditingModelCardId] = useState<string | null>(
    null,
  );
  const [selectedModelCards, setSelectedModelCards] = useState<ModelCardNode[]>(
    [],
  );
  const [deletingModelCard, setDeletingModelCard] =
    useState<ModelCardNode | null>(null);
  const [alsoDeleteFolder, setAlsoDeleteFolder] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [alsoDeleteFoldersBulk, setAlsoDeleteFoldersBulk] = useState(false);

  const filter = queryRef.variables.filter ?? undefined;
  const order = convertOrderByToString(queryRef.variables.orderBy);
  const pageSize = queryRef.variables.limit ?? 10;
  const offset = queryRef.variables.offset ?? 0;
  const current = pageSize ? Math.floor(offset / pageSize) + 1 : 1;

  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetching = deferredQueryRef !== queryRef;

  const { adminModelCardsV2, group, groups } =
    usePreloadedQuery<AdminModelCardTableQueryType>(
      AdminModelCardTableQuery,
      deferredQueryRef,
    );

  const [commitDeleteModelCard] = useMutation<AdminModelCardTableDeleteMutation>(
    graphql`
      mutation AdminModelCardTableDeleteMutation(
        $id: UUID!
        $options: DeleteModelCardV2Options
      ) {
        adminDeleteModelCardV2(id: $id, options: $options) {
          id
        }
      }
    `,
  );

  const [commitBulkDeleteModelCards, isBulkDeleteInFlight] =
    useMutation<AdminModelCardTableBulkDeleteMutation>(graphql`
      mutation AdminModelCardTableBulkDeleteMutation(
        $input: BulkDeleteModelCardsV2Input!
      ) {
        adminBulkDeleteModelCardsV2(input: $input) {
          successes
          failed {
            cardId
            message
          }
        }
      }
    `);

  const handleDeleteModelCard = (modelCard: ModelCardNode) => {
    setDeletingModelCard(modelCard);
  };

  const handleBulkDelete = () => {
    if (selectedModelCards.length === 0) return;
    setIsBulkDeleteOpen(true);
  };

  const handleOpenEditModal = (modelCard: ModelCardNode) => {
    setEditingModelCardId(modelCard.id);
    setIsSettingModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingModelCardId(null);
    setIsSettingModalOpen(true);
  };

  const modelCards =
    adminModelCardsV2?.edges?.map((edge) => edge?.node) ?? [];

  const editingModelCard = editingModelCardId
    ? modelCards.find((mc) => mc?.id === editingModelCardId)
    : null;

  const columns: BAIColumnType<ModelCardNode>[] = filterOutEmpty([
    {
      key: 'name',
      title: t('adminModelCard.Name'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
      render: (name, modelCard) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SquarePenIcon />,
              onClick: () => handleOpenEditModal(modelCard),
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteFilled />,
              type: 'danger' as const,
              onClick: () => handleDeleteModelCard(modelCard),
            },
          ]}
        />
      ),
    },
    {
      key: 'title',
      title: t('adminModelCard.Title'),
      render: (_, record) =>
        record.metadata?.title ? (
          <Typography.Text ellipsis style={{ maxWidth: 200 }}>
            {record.metadata.title}
          </Typography.Text>
        ) : (
          '-'
        ),
    },
    {
      key: 'category',
      title: t('modelStore.Category'),
      render: (_, record) => record.metadata?.category || '-',
    },
    {
      key: 'task',
      title: t('modelStore.Task'),
      render: (_, record) => record.metadata?.task || '-',
    },
    {
      key: 'accessLevel',
      title: t('adminModelCard.AccessLevel'),
      dataIndex: 'accessLevel',
      render: (accessLevel) => (
        <BAITag color={accessLevel === 'PUBLIC' ? 'green' : 'default'}>
          {accessLevel === 'PUBLIC'
            ? t('adminModelCard.Public')
            : t('adminModelCard.Private')}
        </BAITag>
      ),
    },
    // TODO(needs-backend): FR-2417 - Add minResource column when ModelCardV2Metadata includes minResource field
    {
      key: 'domainName',
      title: t('adminModelCard.Domain'),
      dataIndex: 'domainName',
    },
    {
      key: 'projectId',
      title: t('adminModelCard.Project'),
      dataIndex: 'projectId',
      render: (projectId) => (
        <BAIText copyable ellipsis style={{ maxWidth: 150 }}>
          {projectId}
        </BAIText>
      ),
    },
    {
      key: 'createdAt',
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: true,
      render: (createdAt) =>
        createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter<ModelCardV2Filter>
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('adminModelCard.Name'),
                type: 'string',
              },
              {
                key: 'domainName',
                propertyLabel: t('adminModelCard.Domain'),
                type: 'string',
              },
              {
                key: 'projectId',
                propertyLabel: t('adminModelCard.Project'),
                type: 'uuid',
                rule: {
                  message: t('project.ProjectIDFilterRuleMessage'),
                  validate: (value) => isValidUUID(value),
                },
              },
              {
                key: 'storageHost',
                propertyLabel: t('import.StorageHost'),
                type: 'string',
                operators: ['equals', 'notEquals'],
                defaultOperator: 'equals',
                renderInput: ({ onAddCondition }) => (
                  <BAIStorageHostSelect
                    value={null}
                    onChange={(value) =>
                      // Single-select mode (no `mode` prop) always emits a
                      // single value.
                      onAddCondition(value as string | undefined)
                    }
                  />
                ),
              },
            ]}
            value={filter}
            onChange={(value) => {
              onReload(
                {
                  ...queryRef.variables,
                  filter: value ?? undefined,
                  offset: 0,
                },
                { fetchPolicy: 'network-only' },
              );
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          {selectedModelCards.length > 0 && (
            <>
              <BAISelectionLabel
                count={selectedModelCards.length}
                onClearSelection={() => setSelectedModelCards([])}
              />
              <BAIButton
                danger
                icon={<DeleteFilled />}
                onClick={handleBulkDelete}
                loading={isBulkDeleteInFlight}
              />
            </>
          )}
          <BAIFetchKeyButton
            loading={isRefetching}
            onChange={() =>
              onReload(queryRef.variables, { fetchPolicy: 'network-only' })
            }
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={handleOpenCreateModal}
          >
            {t('adminModelCard.CreateModelCard')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable<ModelCardNode>
        rowKey="id"
        dataSource={modelCards as ModelCardNode[]}
        columns={columns}
        scroll={{ x: 'max-content' }}
        loading={isRefetching}
        order={order}
        rowSelection={{
          type: 'checkbox',
          preserveSelectedRowKeys: true,
          onChange: (selectedRowKeys) => {
            handleRowSelectionChange(
              selectedRowKeys,
              filterOutNullAndUndefined(modelCards),
              setSelectedModelCards,
            );
          },
          selectedRowKeys: _.map(selectedModelCards, (i) => i.id),
        }}
        onChangeOrder={(order) => {
          onReload(
            {
              ...queryRef.variables,
              orderBy: convertToOrderBy<ModelCardV2OrderBy>(order),
              offset: 0,
            },
            { fetchPolicy: 'network-only' },
          );
        }}
        tableSettings={tableSettings}
        pagination={{
          pageSize,
          current,
          total: adminModelCardsV2?.count ?? 0,
          onChange: (nextCurrent, nextPageSize) => {
            onReload(
              {
                ...queryRef.variables,
                limit: nextPageSize,
                offset:
                  nextCurrent > 1 ? (nextCurrent - 1) * nextPageSize : 0,
              },
              { fetchPolicy: 'network-only' },
            );
          },
        }}
      />
      <BAIUnmountAfterClose>
        <AdminModelCardSettingModal
          open={isSettingModalOpen}
          modelCardFrgmt={editingModelCard ?? null}
          isModelStoreProject={group?.type === 'MODEL_STORE'}
          modelStoreProject={groups?.[0] ?? null}
          onRequestClose={(success) => {
            setIsSettingModalOpen(false);
            setEditingModelCardId(null);
            if (success) {
              onReload(queryRef.variables, { fetchPolicy: 'network-only' });
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIDeleteConfirmModal
        open={!!deletingModelCard}
        items={
          deletingModelCard
            ? [{ key: deletingModelCard.id, label: deletingModelCard.name }]
            : []
        }
        title={t('adminModelCard.DeleteModelCard')}
        description={t('adminModelCard.ConfirmDelete', {
          name: deletingModelCard?.name,
        })}
        requireConfirmInput
        extraContent={
          <BAIFlex direction="column" align="stretch" gap="xs">
            <BAIFlex align="start" gap="xs">
              <Tooltip title={t('adminModelCard.AlsoDeleteModelFolderTooltip')}>
                <Checkbox
                  checked={alsoDeleteFolder}
                  onChange={(e) => setAlsoDeleteFolder(e.target.checked)}
                />
              </Tooltip>
              <span>
                {t('adminModelCard.AlsoDeleteModelFolder')}
                {deletingModelCard?.vfolder && (
                  <span style={{ marginLeft: token.marginXXS }}>
                    {'('}
                    <VFolderNodeIdenticonV2
                      vfolderNodeIdenticonFrgmt={deletingModelCard.vfolder}
                      style={{
                        verticalAlign: 'middle',
                        marginInline: token.marginXXS,
                      }}
                    />
                    <BAILink
                      to={generateFolderPath(deletingModelCard.vfolderId)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {deletingModelCard.vfolder.metadata.name}
                    </BAILink>
                    {')'}
                  </span>
                )}
              </span>
            </BAIFlex>
            {alsoDeleteFolder && (
              <BAIAlert
                type="error"
                icon={<ExclamationCircleFilled />}
                showIcon
                description={t(
                  'adminModelCard.AlsoDeleteModelFolderCascadeWarning',
                )}
              />
            )}
          </BAIFlex>
        }
        onOk={() => {
          if (deletingModelCard) {
            return new Promise<void>((resolve, reject) => {
              const vfolderId = deletingModelCard.vfolderId;
              const folderName = deletingModelCard.vfolder?.metadata.name;
              const folderTrashSearch = new URLSearchParams({
                statusCategory: 'deleted',
                filter: folderName
                  ? `name == "${folderName}"`
                  : `id == "${vfolderId}"`,
              }).toString();

              commitDeleteModelCard({
                variables: {
                  id: toLocalId(deletingModelCard.id),
                  options: { deleteAssociatedVfolder: alsoDeleteFolder },
                },
                onCompleted: (_data, errors) => {
                  if (errors && errors.length > 0) {
                    logger.error(errors[0]);
                    message.error(
                      errors[0]?.message || t('general.ErrorOccurred'),
                    );
                    reject();
                    return;
                  }

                  if (alsoDeleteFolder) {
                    upsertNotification({
                      type: 'success',
                      message: t('adminModelCard.ModelCardAndFolderDeleted'),
                      to: {
                        pathname: '/admin-data',
                        search: folderTrashSearch,
                      },
                      toText: t('adminModelCard.GoToTrash'),
                      open: true,
                      extraData: null,
                    });
                  } else {
                    message.success(
                      t('adminModelCard.ModelCardDeletedFolderKept'),
                    );
                  }

                  setDeletingModelCard(null);
                  setAlsoDeleteFolder(false);
                  onReload(queryRef.variables, {
                    fetchPolicy: 'network-only',
                  });
                  resolve();
                },
                onError: (error) => {
                  logger.error(error);
                  message.error(error?.message || t('general.ErrorOccurred'));
                  reject();
                },
              });
            });
          }
        }}
        onCancel={() => {
          setDeletingModelCard(null);
          setAlsoDeleteFolder(false);
        }}
      />
      <BAIDeleteConfirmModal
        open={isBulkDeleteOpen}
        confirmLoading={isBulkDeleteInFlight}
        items={selectedModelCards.map((mc) => ({
          key: mc.id,
          label: mc.name,
        }))}
        title={t('adminModelCard.BulkDeleteModelCards')}
        description={t('adminModelCard.ConfirmBulkDelete', {
          count: selectedModelCards.length,
        })}
        extraContent={
          <BAIFlex direction="column" align="stretch" gap="xs">
            <BAIFlex align="center" gap="xs">
              <Tooltip title={t('adminModelCard.AlsoDeleteModelFolderTooltip')}>
                <Checkbox
                  checked={alsoDeleteFoldersBulk}
                  onChange={(e) => setAlsoDeleteFoldersBulk(e.target.checked)}
                />
              </Tooltip>
              <span>{t('adminModelCard.AlsoDeleteModelFolders')}</span>
            </BAIFlex>
            {alsoDeleteFoldersBulk && (
              <BAIAlert
                type="error"
                icon={<ExclamationCircleFilled />}
                showIcon
                description={t(
                  'adminModelCard.AlsoDeleteModelFoldersCascadeWarning',
                )}
              />
            )}
          </BAIFlex>
        }
        onOk={() => {
          const ids = selectedModelCards.map((mc) => toLocalId(mc.id));
          return new Promise<void>((resolve, reject) => {
            commitBulkDeleteModelCards({
              variables: {
                input: {
                  ids,
                  options: { deleteAssociatedVfolder: alsoDeleteFoldersBulk },
                },
              },
              onCompleted: (data, errors) => {
                if (errors && errors.length > 0) {
                  logger.error(errors[0]);
                  message.error(
                    errors[0]?.message || t('general.ErrorOccurred'),
                  );
                  reject();
                  return;
                }
                const { successes, failed } =
                  data.adminBulkDeleteModelCardsV2 ?? {
                    successes: [],
                    failed: [],
                  };
                if (failed.length > 0) {
                  const failedIds = new Set(
                    failed.map((f: { cardId: string }) => f.cardId),
                  );
                  setSelectedModelCards(
                    selectedModelCards.filter((mc) =>
                      failedIds.has(toLocalId(mc.id)),
                    ),
                  );
                  upsertNotification({
                    type: 'warning',
                    message: t('adminModelCard.BulkDeletePartiallyCompleted', {
                      successCount: successes.length,
                      failureCount: failed.length,
                    }),
                    description: (
                      <BAIFlex direction="column" gap="xs">
                        {failed.map((f) => {
                          const cardName =
                            selectedModelCards.find(
                              (mc) => toLocalId(mc.id) === f.cardId,
                            )?.name ?? f.cardId;
                          return (
                            <div key={f.cardId}>
                              <Typography.Text strong>
                                {cardName}
                              </Typography.Text>
                              <Typography.Text type="secondary">
                                {' — '}
                              </Typography.Text>
                              <Typography.Text
                                type="danger"
                                style={{ fontSize: token.fontSizeSM }}
                              >
                                {f.message}
                              </Typography.Text>
                            </div>
                          );
                        })}
                      </BAIFlex>
                    ),
                    open: true,
                    duration: 0,
                    extraData: null,
                  });
                } else if (alsoDeleteFoldersBulk) {
                  upsertNotification({
                    type: 'success',
                    message: t(
                      'adminModelCard.BulkDeleteModelCardsAndFoldersCompleted',
                      { count: successes.length },
                    ),
                    to: {
                      pathname: '/admin-data',
                      search: new URLSearchParams({
                        statusCategory: 'deleted',
                      }).toString(),
                    },
                    toText: t('adminModelCard.GoToTrash'),
                    open: true,
                    extraData: null,
                  });
                  setSelectedModelCards([]);
                } else {
                  message.success(
                    t('adminModelCard.BulkDeleteCompleted', {
                      count: successes.length,
                    }),
                  );
                  setSelectedModelCards([]);
                }
                setAlsoDeleteFoldersBulk(false);
                setIsBulkDeleteOpen(false);
                onReload(queryRef.variables, { fetchPolicy: 'network-only' });
                resolve();
              },
              onError: (error) => {
                logger.error(error);
                message.error(error?.message || t('general.ErrorOccurred'));
                reject();
              },
            });
          });
        }}
        onCancel={() => {
          setIsBulkDeleteOpen(false);
          setAlsoDeleteFoldersBulk(false);
        }}
      />
    </BAIFlex>
  );
};

export default AdminModelCardTable;
