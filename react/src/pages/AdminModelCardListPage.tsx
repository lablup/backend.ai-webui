/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AdminModelCardListPageDeleteMutation,
  AdminModelCardListPageDeleteMutation$data,
} from '../__generated__/AdminModelCardListPageDeleteMutation.graphql';
import {
  AdminModelCardListPageQuery,
  ModelCardV2Filter,
  ModelCardV2OrderBy,
} from '../__generated__/AdminModelCardListPageQuery.graphql';
import AdminModelCardSettingModal from '../components/AdminModelCardSettingModal';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { App, Tooltip, Typography, theme } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BAIButton,
  BAICard,
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { PlusIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

export type ModelCardNode = NonNullable<
  NonNullable<
    AdminModelCardListPageQuery['response']['modelCardsV2']
  >['edges'][number]
>['node'];

const availableSorterKeys = ['name', 'created_at'] as const;
const availableSorterValues = [
  ...availableSorterKeys,
  ...availableSorterKeys.map((key) => `-${key}` as const),
] as const;

const AdminModelCardListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 20,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      order: parseAsStringLiteral(availableSorterValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [editingModelCard, setEditingModelCard] =
    useState<ModelCardNode | null>(null);
  const [deletingModelCard, setDeletingModelCard] = useState<{
    name: string;
    id: string;
  } | null>(null);

  const queryVariables = {
    filter: (queryParams.filter as ModelCardV2Filter | undefined) ?? undefined,
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
        modelCardsV2(
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
              vfolderId
              domainName
              projectId
              creatorId
              metadata {
                author
                title
                description
                task
                category
                architecture
                framework
                label
              }
              createdAt
              updatedAt
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

  const [commitDeleteModelCard, isInFlightDelete] =
    useMutation<AdminModelCardListPageDeleteMutation>(graphql`
      mutation AdminModelCardListPageDeleteMutation($id: UUID!) {
        adminDeleteModelCardV2(id: $id) {
          id
        }
      }
    `);

  const modelCards = filterOutNullAndUndefined(
    queryRef.modelCardsV2?.edges?.map((edge) => edge?.node) ?? [],
  );

  const columns: ColumnsType<ModelCardNode> = filterOutEmpty([
    {
      key: 'name',
      title: t('adminModelCard.Name'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
      render: (name: string, record: ModelCardNode) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'settings',
              title: t('button.Settings'),
              icon: <SettingOutlined />,
              onClick: () => {
                setEditingModelCard(record);
                setIsSettingModalOpen(true);
              },
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <DeleteOutlined />,
              type: 'danger' as const,
              onClick: () => {
                setDeletingModelCard({
                  name: record.name,
                  id: record.rowId,
                });
              },
            },
          ]}
        />
      ),
    },
    {
      key: 'title',
      title: t('adminModelCard.Title'),
      render: (_: unknown, record: ModelCardNode) => (
        <Tooltip title={record.metadata.title} placement="topLeft">
          <Typography.Text ellipsis style={{ maxWidth: 200 }}>
            {record.metadata.title ?? '-'}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      key: 'category',
      title: t('adminModelCard.Category'),
      render: (_: unknown, record: ModelCardNode) =>
        record.metadata.category ?? '-',
    },
    {
      key: 'task',
      title: t('adminModelCard.Task'),
      render: (_: unknown, record: ModelCardNode) =>
        record.metadata.task ?? '-',
    },
    {
      key: 'domainName',
      title: t('adminModelCard.Domain'),
      dataIndex: 'domainName',
    },
    {
      key: 'createdAt',
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: true,
      render: (createdAt: string) =>
        createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <BAICard
        title={t('adminModelCard.ModelCards')}
        extra={
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
        }
        styles={{
          body: {
            padding: 0,
            paddingTop: 1,
            overflow: 'hidden',
          },
        }}
      >
        <BAIFlex
          direction="column"
          align="stretch"
          gap={'sm'}
          style={{ padding: token.paddingMD }}
        >
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              wrap="wrap"
              style={{ flexShrink: 1 }}
            >
              <BAIGraphQLPropertyFilter
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('adminModelCard.Name'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter ?? undefined}
                onChange={(value) => {
                  setQueryParams({ filter: value ?? null });
                  setTablePaginationOption({ current: 1 });
                }}
              />
            </BAIFlex>
            <BAIButton
              type="primary"
              icon={<PlusIcon />}
              onClick={() => {
                setEditingModelCard(null);
                setIsSettingModalOpen(true);
              }}
            >
              {t('adminModelCard.CreateModelCard')}
            </BAIButton>
          </BAIFlex>
          <BAITable<ModelCardNode>
            rowKey="id"
            dataSource={modelCards as ModelCardNode[]}
            columns={columns}
            scroll={{ x: 'max-content' }}
            loading={
              deferredQueryVariables !== queryVariables ||
              deferredFetchKey !== fetchKey
            }
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: queryRef.modelCardsV2?.count ?? 0,
              onChange: (current, pageSize) => {
                setTablePaginationOption({ current, pageSize });
              },
            }}
            onChangeOrder={(order) => {
              setQueryParams({
                order:
                  (order as (typeof availableSorterValues)[number]) || null,
              });
            }}
          />
        </BAIFlex>
      </BAICard>

      <BAIConfirmModalWithInput
        open={!!deletingModelCard}
        title={t('adminModelCard.DeleteModelCard')}
        content={t('adminModelCard.TypeModelCardNameToDelete')}
        confirmText={deletingModelCard?.name ?? ''}
        okButtonProps={{
          loading: isInFlightDelete,
        }}
        onOk={() => {
          if (!deletingModelCard) return;
          commitDeleteModelCard({
            variables: { id: deletingModelCard.id },
            onCompleted: (
              _data: AdminModelCardListPageDeleteMutation$data,
              errors,
            ) => {
              if (errors && errors.length > 0) {
                message.error(errors[0]?.message);
                return;
              }
              message.success(t('adminModelCard.ModelCardDeleted'));
              setDeletingModelCard(null);
              updateFetchKey();
            },
            onError: (error) => {
              message.error(error?.message);
            },
          });
        }}
        onCancel={() => {
          setDeletingModelCard(null);
        }}
      />

      <Suspense>
        <AdminModelCardSettingModal
          open={isSettingModalOpen}
          modelCardNode={editingModelCard}
          onRequestClose={(success) => {
            setIsSettingModalOpen(false);
            setEditingModelCard(null);
            if (success) {
              updateFetchKey();
            }
          }}
        />
      </Suspense>
    </BAIFlex>
  );
};

export default AdminModelCardListPage;
