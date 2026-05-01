/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { AdminDeploymentPresetListPageDeleteMutation } from '../__generated__/AdminDeploymentPresetListPageDeleteMutation.graphql';
import type { AdminDeploymentPresetListPageImageQuery } from '../__generated__/AdminDeploymentPresetListPageImageQuery.graphql';
import type {
  AdminDeploymentPresetListPageQuery,
  AdminDeploymentPresetListPageQuery$data,
  DeploymentRevisionPresetFilter,
  DeploymentRevisionPresetOrderBy,
} from '../__generated__/AdminDeploymentPresetListPageQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { SettingOutlined } from '@ant-design/icons';
import { App } from 'antd';
import {
  BAIButton,
  BAIColumnType,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  BAITableColumnOverrideRecord,
  BAITrashBinIcon,
  filterOutEmpty,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { parseAsJson, parseAsString, useQueryStates } from 'nuqs';
import React, {
  SetStateAction,
  Suspense,
  useDeferredValue,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DeploymentPresetNode = NonNullableNodeOnEdges<
  AdminDeploymentPresetListPageQuery$data['deploymentRevisionPresets']
>;

const ImageCanonicalName: React.FC<{ imageId: string }> = ({ imageId }) => {
  'use memo';
  const data = useLazyLoadQuery<AdminDeploymentPresetListPageImageQuery>(
    graphql`
      query AdminDeploymentPresetListPageImageQuery($id: ID!) {
        imageV2(id: $id) {
          identity {
            canonicalName
          }
        }
      }
    `,
    { id: imageId },
    { fetchPolicy: 'store-or-network' },
  );
  return <>{data.imageV2?.identity.canonicalName ?? imageId}</>;
};

const availablePresetSorterKeys = ['name', 'rank', 'createdAt'] as const;

export const availablePresetSorterValues = [
  ...availablePresetSorterKeys,
  ...availablePresetSorterKeys.map((key) => `-${key}` as const),
] as const;

interface AdminDeploymentPresetTableProps {
  customizeColumns?: (
    columns: BAIColumnType<DeploymentPresetNode>[],
  ) => BAIColumnType<DeploymentPresetNode>[];
}

const AdminDeploymentPresetTable: React.FC<
  AdminDeploymentPresetTableProps & {
    queryRef: AdminDeploymentPresetListPageQuery$data;
    queryVariables?: object;
    fetchKey?: string;
    onEdit: (preset: DeploymentPresetNode) => void;
    onDelete: (preset: DeploymentPresetNode) => void;
    columnOverrides: BAITableColumnOverrideRecord;
    setColumnOverrides: (
      value: SetStateAction<BAITableColumnOverrideRecord>,
    ) => void;
    tablePaginationOption: { pageSize: number; current: number };
    setTablePaginationOption: (opt: {
      current?: number;
      pageSize?: number;
    }) => void;
    setQueryParams: (params: { order?: string | null }) => void;
  }
> = ({
  queryRef,
  queryVariables: _queryVariables,
  fetchKey: _fetchKey,
  onEdit,
  onDelete,
  columnOverrides,
  setColumnOverrides,
  tablePaginationOption,
  setTablePaginationOption,
  setQueryParams,
  customizeColumns,
}) => {
  'use memo';
  const { t } = useTranslation();

  const presets =
    queryRef.deploymentRevisionPresets?.edges?.map((edge) => edge?.node) ?? [];

  const baseColumns: BAIColumnType<DeploymentPresetNode>[] = filterOutEmpty([
    {
      key: 'name',
      title: t('adminDeploymentPreset.Name'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
      render: (name: string, preset: DeploymentPresetNode) => (
        <BAINameActionCell
          title={name}
          showActions="always"
          actions={[
            {
              key: 'edit',
              title: t('button.Edit'),
              icon: <SettingOutlined />,
              onClick: () => onEdit(preset),
            },
            {
              key: 'delete',
              title: t('button.Delete'),
              icon: <BAITrashBinIcon />,
              type: 'danger' as const,
              onClick: () => onDelete(preset),
            },
          ]}
        />
      ),
    },
    {
      key: 'description',
      title: t('adminDeploymentPreset.Description'),
      dataIndex: 'description',
      defaultHidden: true,
      render: (desc: string | null) => desc || '-',
    },
    {
      key: 'runtime',
      title: t('adminDeploymentPreset.Runtime'),
      render: (_: unknown, record: DeploymentPresetNode) =>
        record.runtimeVariant?.name ?? '-',
    },
    {
      key: 'image',
      title: t('adminDeploymentPreset.Image'),
      render: (_: unknown, record: DeploymentPresetNode) =>
        record.execution?.imageId ? (
          <Suspense fallback={record.execution.imageId}>
            <ImageCanonicalName imageId={record.execution.imageId} />
          </Suspense>
        ) : (
          '-'
        ),
    },
    {
      key: 'cluster',
      title: t('adminDeploymentPreset.Cluster'),
      defaultHidden: true,
      render: (_: unknown, record: DeploymentPresetNode) => {
        const { clusterMode, clusterSize } = record.cluster ?? {};
        if (!clusterMode) return '-';
        return `${clusterMode} × ${clusterSize}`;
      },
    },
    {
      key: 'replicaCount',
      title: t('adminDeploymentPreset.Replicas'),
      render: (_: unknown, record: DeploymentPresetNode) =>
        record.deploymentDefaults?.replicaCount ?? '-',
    },
    {
      key: 'strategy',
      title: t('adminDeploymentPreset.Strategy'),
      defaultHidden: true,
      render: (_: unknown, record: DeploymentPresetNode) =>
        record.deploymentDefaults?.deploymentStrategy ?? '-',
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

  const columns = customizeColumns
    ? customizeColumns(baseColumns)
    : baseColumns;

  return (
    <BAITable<DeploymentPresetNode>
      rowKey="id"
      dataSource={presets as DeploymentPresetNode[]}
      columns={columns}
      scroll={{ x: 'max-content' }}
      loading={false}
      onChangeOrder={(order) => {
        setQueryParams({
          order:
            (order as (typeof availablePresetSorterValues)[number]) || null,
        });
      }}
      tableSettings={{
        columnOverrides: columnOverrides,
        onColumnOverridesChange: setColumnOverrides,
      }}
      pagination={{
        pageSize: tablePaginationOption.pageSize,
        current: tablePaginationOption.current,
        total: queryRef.deploymentRevisionPresets?.count ?? 0,
        onChange: (current, pageSize) => {
          setTablePaginationOption({ current, pageSize });
        },
      }}
    />
  );
};

const AdminDeploymentPresetListPage: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const webuiNavigate = useWebUINavigate();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminDeploymentPresetListPage',
  );

  const [deletingPreset, setDeletingPreset] =
    useState<DeploymentPresetNode | null>(null);

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
      order: parseAsString.withDefault('-createdAt'),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const buildFilter = (
    filter: GraphQLFilter | undefined,
  ): DeploymentRevisionPresetFilter | undefined => {
    if (!filter) return undefined;
    // Flatten AND wrapper if present
    const flat =
      filter.AND && Array.isArray(filter.AND)
        ? (Object.assign({}, ...filter.AND) as Record<string, unknown>)
        : (filter as Record<string, unknown>);

    const result: DeploymentRevisionPresetFilter = {};
    if (flat.name) {
      result.name = flat.name as DeploymentRevisionPresetFilter['name'];
    }
    if (flat.runtimeVariantId) {
      const raw = flat.runtimeVariantId;
      // Normalise both plain-string and { equals: "..." } forms from URL state
      const value =
        typeof raw === 'string'
          ? raw
          : raw && typeof raw === 'object'
            ? ((raw as { equals?: string | null }).equals ?? null)
            : null;
      if (value) result.runtimeVariantId = { equals: value };
    }
    return result;
  };

  const queryVariables = {
    filter: buildFilter(queryParams.filter ?? undefined),
    orderBy: convertToOrderBy<DeploymentRevisionPresetOrderBy>(
      queryParams.order,
    ),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryRef = useLazyLoadQuery<AdminDeploymentPresetListPageQuery>(
    graphql`
      query AdminDeploymentPresetListPageQuery(
        $filter: DeploymentRevisionPresetFilter
        $orderBy: [DeploymentRevisionPresetOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        deploymentRevisionPresets(
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
              description
              rank
              runtimeVariantId
              runtimeVariant {
                id
                name
              }
              cluster {
                clusterMode
                clusterSize
              }
              execution {
                imageId
              }
              deploymentDefaults {
                replicaCount
                deploymentStrategy
              }
              createdAt
              ...DeploymentPresetDetailContentFragment
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

  const [commitDeletePreset] =
    useMutation<AdminDeploymentPresetListPageDeleteMutation>(graphql`
      mutation AdminDeploymentPresetListPageDeleteMutation($id: UUID!) {
        adminDeleteDeploymentRevisionPreset(id: $id) {
          id
        }
      }
    `);

  const handleDeletePreset = (preset: DeploymentPresetNode) => {
    setDeletingPreset(preset);
  };

  const handleEditPreset = (preset: DeploymentPresetNode) => {
    webuiNavigate(
      `/admin-deployments/deployment-presets/${toLocalId(preset.id)}/edit`,
    );
  };

  const handleOpenCreateModal = () => {
    webuiNavigate('/admin-deployments/deployment-presets/new');
  };

  const isSupported = baiClient.supports('deployment-preset');

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
        <BAIFlex gap={'sm'} align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIGraphQLPropertyFilter
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('adminDeploymentPreset.Name'),
                type: 'string',
              },
              {
                key: 'runtimeVariantId',
                propertyLabel: t('adminDeploymentPreset.RuntimeVariantId'),
                type: 'uuid',
                valueMode: 'scalar',
                fixedOperator: 'equals',
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
          <BAIButton type="primary" onClick={handleOpenCreateModal}>
            {t('adminDeploymentPreset.CreatePreset')}
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
      {isSupported ? (
        <AdminDeploymentPresetTable
          queryRef={queryRef}
          queryVariables={queryVariables}
          fetchKey={fetchKey}
          onEdit={handleEditPreset}
          onDelete={handleDeletePreset}
          columnOverrides={columnOverrides}
          setColumnOverrides={setColumnOverrides}
          tablePaginationOption={tablePaginationOption}
          setTablePaginationOption={setTablePaginationOption}
          setQueryParams={setQueryParams}
        />
      ) : (
        <BAIFlex justify="center" style={{ padding: 32 }}>
          {t('adminDeploymentPreset.NotSupported')}
        </BAIFlex>
      )}
      <BAIDeleteConfirmModal
        open={!!deletingPreset}
        items={
          deletingPreset
            ? [{ key: deletingPreset.id, label: deletingPreset.name }]
            : []
        }
        onOk={async () => {
          if (deletingPreset) {
            await new Promise<void>((resolve, reject) => {
              commitDeletePreset({
                variables: { id: toLocalId(deletingPreset.id) },
                onCompleted: (_data, errors) => {
                  if (errors && errors.length > 0) {
                    logger.error(errors[0]);
                    message.error(
                      errors[0]?.message || t('general.ErrorOccurred'),
                    );
                    reject();
                    return;
                  }
                  message.success(t('adminDeploymentPreset.PresetDeleted'));
                  setDeletingPreset(null);
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
        onCancel={() => setDeletingPreset(null)}
      />
    </BAIFlex>
  );
};

export default AdminDeploymentPresetListPage;
