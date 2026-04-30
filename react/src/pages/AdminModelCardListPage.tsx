/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminModelCardListPageBulkDeleteMutation } from '../__generated__/AdminModelCardListPageBulkDeleteMutation.graphql';
import type { AdminModelCardListPageDeleteMutation } from '../__generated__/AdminModelCardListPageDeleteMutation.graphql';
import type {
  AdminModelCardListPageQuery,
  AdminModelCardListPageQuery$data,
  ModelCardV2OrderBy,
} from '../__generated__/AdminModelCardListPageQuery.graphql';
import AdminModelCardSettingModal from '../components/AdminModelCardSettingModal';
import { useFolderExplorerOpener } from '../components/FolderExplorerOpener';
import StorageHostFilterInput from '../components/StorageHostFilterInput';
import VFolderNodeIdenticonV2 from '../components/VFolderNodeIdenticonV2';
import { convertToOrderBy, handleRowSelectionChange } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { SettingOutlined } from '@ant-design/icons';
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
  BAITable,
  BAIText,
  BAITag,
  BAITrashBinIcon,
  BAIUnmountAfterClose,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  isValidUUID,
  toLocalId,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PlusIcon } from 'lucide-react';
import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ModelCardNode = NonNullableNodeOnEdges<
  AdminModelCardListPageQuery$data['adminModelCardsV2']
>;

const availableModelCardSorterKeys = ['name', 'created_at'] as const;

export const availableModelCardSorterValues = [
  ...availableModelCardSorterKeys,
  ...availableModelCardSorterKeys.map((key) => `-${key}` as const),
] as const;

const AdminModelCardListPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const { generateFolderPath } = useFolderExplorerOpener();
  const currentProject = useCurrentProjectValue();
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminModelCardListPage',
  );

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
  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsString,
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    filter: queryParams.filter,
    orderBy: convertToOrderBy<ModelCardV2OrderBy>(queryParams.order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    currentProjectId: currentProject.id!,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<AdminModelCardListPageQuery>(
    graphql`
      query AdminModelCardListPageQuery(
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
          type @since(version: "24.03.0")
        }
        groups(is_active: true, type: ["MODEL_STORE"]) {
          id
          name
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

  const [commitDeleteModelCard] =
    useMutation<AdminModelCardListPageDeleteMutation>(graphql`
      mutation AdminModelCardListPageDeleteMutation(
        $id: UUID!
        $options: DeleteModelCardV2Options
      ) {
        adminDeleteModelCardV2(id: $id, options: $options) {
          id
        }
      }
    `);

  const [commitBulkDeleteModelCards, isBulkDeleteInFlight] =
    useMutation<AdminModelCardListPageBulkDeleteMutation>(graphql`
      mutation AdminModelCardListPageBulkDeleteMutation(
        $input: DeleteModelCardsV2Input!
      ) {
        adminDeleteModelCardsV2(input: $input) {
          deletedCount
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
    queryRef.adminModelCardsV2?.edges?.map((edge) => edge?.node) ?? [];

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
              icon: <SettingOutlined />,
              onClick: () => handleOpenEditModal(modelCard),
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <BAITrashBinIcon />,
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
          <BAIGraphQLPropertyFilter
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
                renderInput: ({ onConfirm }) => (
                  <StorageHostFilterInput onConfirm={onConfirm} />
                ),
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'sm'}>
          {selectedModelCards.length > 0 && (
            <>
              <BAISelectionLabel
                count={selectedModelCards.length}
                onClearSelection={() => setSelectedModelCards([])}
              />
              <BAIButton
                danger
                icon={<BAITrashBinIcon />}
                onClick={handleBulkDelete}
                loading={isBulkDeleteInFlight}
              />
            </>
          )}
          <BAIButton
            type="primary"
            icon={<PlusIcon size={16} />}
            onClick={handleOpenCreateModal}
          >
            {t('adminModelCard.CreateModelCard')}
          </BAIButton>
          <BAIFetchKeyButton
            loading={
              deferredQueryVariables !== queryVariables ||
              deferredFetchKey !== fetchKey
            }
            value={fetchKey}
            onChange={(newFetchKey) => {
              updateFetchKey(newFetchKey);
            }}
          />
        </BAIFlex>
      </BAIFlex>
      <BAITable<ModelCardNode>
        rowKey="id"
        dataSource={modelCards as ModelCardNode[]}
        columns={columns}
        scroll={{ x: 'max-content' }}
        loading={deferredQueryVariables !== queryVariables}
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
          setQueryParams({
            order:
              (order as (typeof availableModelCardSorterValues)[number]) ||
              null,
          });
        }}
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: queryRef.adminModelCardsV2?.count ?? 0,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
      />
      <BAIUnmountAfterClose>
        <AdminModelCardSettingModal
          open={isSettingModalOpen}
          modelCardFrgmt={editingModelCard ?? null}
          isModelStoreProject={queryRef.group?.type === 'MODEL_STORE'}
          modelStoreProject={queryRef.groups?.[0] ?? null}
          onRequestClose={(success) => {
            setIsSettingModalOpen(false);
            setEditingModelCardId(null);
            if (success) {
              updateFetchKey();
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
          <Tooltip title={t('adminModelCard.AlsoDeleteModelFolderTooltip')}>
            <Checkbox
              checked={alsoDeleteFolder}
              onChange={(e) => setAlsoDeleteFolder(e.target.checked)}
            >
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
            </Checkbox>
          </Tooltip>
        }
        onOk={() => {
          if (deletingModelCard) {
            return new Promise<void>((resolve, reject) => {
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
                    const vfolderId = deletingModelCard.vfolderId;
                    const folderName = deletingModelCard.vfolder?.metadata.name;
                    const folderTrashSearch = new URLSearchParams({
                      statusCategory: 'deleted',
                      filter: folderName
                        ? `name == "${folderName}"`
                        : `id == "${vfolderId}"`,
                    }).toString();
                    upsertNotification({
                      type: 'success',
                      message: t('adminModelCard.ModelCardAndFolderDeleted'),
                      to: {
                        pathname: '/admin-data',
                        search: folderTrashSearch,
                      },
                      toText: t('adminModelCard.GoToTrash'),
                      open: true,
                      duration: 4,
                      extraData: null,
                    });
                  } else {
                    message.success(
                      t('adminModelCard.ModelCardDeletedFolderKept'),
                    );
                  }

                  setDeletingModelCard(null);
                  setAlsoDeleteFolder(false);
                  updateFetchKey();
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
        items={selectedModelCards.map((mc) => ({
          key: mc.id,
          label: mc.name,
        }))}
        title={t('adminModelCard.BulkDeleteModelCards')}
        description={t('adminModelCard.ConfirmBulkDelete', {
          count: selectedModelCards.length,
        })}
        onOk={() => {
          const ids = selectedModelCards.map((mc) => toLocalId(mc.id));
          return new Promise<void>((resolve, reject) => {
            commitBulkDeleteModelCards({
              variables: { input: { ids } },
              onCompleted: (data, errors) => {
                if (errors && errors.length > 0) {
                  logger.error(errors[0]);
                  message.error(
                    errors[0]?.message || t('general.ErrorOccurred'),
                  );
                  reject();
                  return;
                }
                message.success(
                  t('adminModelCard.BulkDeleteCompleted', {
                    count: data.adminDeleteModelCardsV2.deletedCount,
                  }),
                );
                setSelectedModelCards([]);
                setIsBulkDeleteOpen(false);
                updateFetchKey();
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
        onCancel={() => setIsBulkDeleteOpen(false)}
      />
    </BAIFlex>
  );
};

export default AdminModelCardListPage;
