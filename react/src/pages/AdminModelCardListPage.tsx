/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminModelCardListPageDeleteMutation } from '../__generated__/AdminModelCardListPageDeleteMutation.graphql';
import type {
  AdminModelCardListPageQuery,
  AdminModelCardListPageQuery$data,
  ModelCardV2OrderBy,
} from '../__generated__/AdminModelCardListPageQuery.graphql';
import type { AdminModelCardListPageScanMutation } from '../__generated__/AdminModelCardListPageScanMutation.graphql';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { App, Form, Input, Typography } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAITag,
  BAITrashBinIcon,
  BAIUnmountAfterClose,
  filterOutEmpty,
  INITIAL_FETCH_KEY,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { ScanSearchIcon, SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type ModelCardNode = NonNullableNodeOnEdges<
  AdminModelCardListPageQuery$data['adminModelCardsV2']
>;

const availableModelCardSorterKeys = ['name', 'createdAt'] as const;

export const availableModelCardSorterValues = [
  ...availableModelCardSorterKeys,
  ...availableModelCardSorterKeys.map((key) => `-${key}` as const),
] as const;

const AdminModelCardListPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();

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
      order: parseAsStringLiteral(availableModelCardSorterValues),
      nameFilter: parseAsString,
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  // TODO: Add domainName and projectId filters per spec requirements
  const filter = useMemo(() => {
    if (!queryParams.nameFilter) return undefined;
    return {
      name: { iContains: queryParams.nameFilter },
    };
  }, [queryParams.nameFilter]);

  const queryVariables = {
    filter,
    orderBy: convertToOrderBy<ModelCardV2OrderBy>(queryParams.order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
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
              rowId
              name
              domainName
              projectId
              accessLevel
              createdAt
              metadata {
                title
                category
                task
              }
            }
          }
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
      mutation AdminModelCardListPageDeleteMutation($id: UUID!) {
        adminDeleteModelCardV2(id: $id) {
          id
        }
      }
    `);

  const [commitScanProjectModelCards, isScanInFlight] =
    useMutation<AdminModelCardListPageScanMutation>(graphql`
      mutation AdminModelCardListPageScanMutation($projectId: UUID!) {
        scanProjectModelCardsV2(projectId: $projectId) {
          createdCount
          updatedCount
          errors
        }
      }
    `);

  const handleDeleteModelCard = (modelCard: ModelCardNode) => {
    modal.confirm({
      title: t('adminModelCard.DeleteModelCard'),
      content: t('adminModelCard.ConfirmDelete', { name: modelCard.name }),
      okText: t('button.Delete'),
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () => {
        return new Promise<void>((resolve, reject) => {
          commitDeleteModelCard({
            variables: { id: modelCard.rowId },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('adminModelCard.ModelCardDeleted'));
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
      },
    });
  };

  const handleScanProjectModelCards = () => {
    let projectIdValue = '';
    modal.confirm({
      title: t('adminModelCard.ScanProjectModelCards'),
      content: (
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label={t('adminModelCard.ProjectId')} required>
            <Input
              placeholder={t('adminModelCard.EnterProjectId')}
              onChange={(e) => {
                projectIdValue = e.target.value;
              }}
            />
          </Form.Item>
        </Form>
      ),
      okText: t('adminModelCard.Scan'),
      onOk: () => {
        if (!projectIdValue.trim()) {
          message.error(t('adminModelCard.ProjectIdRequired'));
          return Promise.reject();
        }
        return new Promise<void>((resolve, reject) => {
          commitScanProjectModelCards({
            variables: { projectId: projectIdValue.trim() },
            onCompleted: (data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              const result = data.scanProjectModelCardsV2;
              message.success(
                t('adminModelCard.ScanCompleted', {
                  created: result.createdCount,
                  updated: result.updatedCount,
                }),
              );
              if (result.errors.length > 0) {
                result.errors.forEach((error) => {
                  message.warning(error);
                });
              }
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
      },
    });
  };

  const modelCards =
    queryRef.adminModelCardsV2?.edges?.map((edge) => edge?.node) ?? [];

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
            : t('adminModelCard.Internal')}
        </BAITag>
      ),
    },
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
        <Typography.Text ellipsis style={{ maxWidth: 150 }}>
          {projectId}
        </Typography.Text>
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
    <BAICard
      title={t('adminModelCard.ModelCards')}
      styles={{
        header: {
          borderBottom: 'none',
        },
        body: {
          paddingTop: 0,
        },
      }}
    >
      <BAIFlex direction="column" align="stretch" gap={'sm'}>
        <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
          <BAIFlex
            gap={'sm'}
            align="start"
            wrap="wrap"
            style={{ flexShrink: 1 }}
          >
            <Input
              prefix={<SearchIcon size={14} />}
              placeholder={t('modelStore.SearchModels')}
              allowClear
              value={queryParams.nameFilter ?? ''}
              onChange={(e) => {
                setQueryParams({ nameFilter: e.target.value || null });
                setTablePaginationOption({ current: 1 });
              }}
              style={{ width: 220 }}
            />
          </BAIFlex>
          <BAIFlex gap={'xs'}>
            <BAIButton
              icon={<ScanSearchIcon />}
              onClick={handleScanProjectModelCards}
              loading={isScanInFlight}
            >
              {t('adminModelCard.ScanProjectModelCards')}
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
          order={queryParams.order ?? undefined}
          onChangeOrder={(order) => {
            setQueryParams({
              order:
                (order as (typeof availableModelCardSorterValues)[number]) ||
                null,
            });
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
      </BAIFlex>
    </BAICard>
  );
};

export default AdminModelCardListPage;
