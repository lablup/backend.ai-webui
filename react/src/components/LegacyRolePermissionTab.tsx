/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { LegacyCreatePermissionModalPermissionMatrixQuery } from '../__generated__/LegacyCreatePermissionModalPermissionMatrixQuery.graphql';
import { LegacyRolePermissionTabDeleteMutation } from '../__generated__/LegacyRolePermissionTabDeleteMutation.graphql';
import {
  LegacyRolePermissionTabQuery,
  type PermissionFilter,
  type PermissionOrderBy,
} from '../__generated__/LegacyRolePermissionTabQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import LegacyCreatePermissionModal, {
  PermissionMatrixQuery,
} from './LegacyCreatePermissionModal';
import { DeleteFilled } from '@ant-design/icons';
import { App, Tag } from 'antd';
import {
  BAIButton,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import { EditIcon, PlusIcon } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useLazyLoadQuery,
  useQueryLoader,
  useRelayEnvironment,
} from 'react-relay';

interface EditingPermission {
  id: string;
  scopeType: string;
  scopeId: string;
  entityType: string;
  operation: string;
}

interface PermissionScopeRecord {
  scopeType: string;
  scope?: {
    basicInfo?: {
      domainName?: string | null;
      projectName?: string | null;
      email?: string | null;
    } | null;
    vfolderName?: string | null;
    metadata?: {
      sessionName?: string | null;
      deploymentName?: string | null;
    } | null;
    resourceGroupName?: string | null;
    registryName?: string | null;
    project?: string | null;
  } | null;
}

/**
 * Resolve a scope record to its human-readable target name (project name,
 * user email, vfolder name, …). Single source of truth shared by the
 * ScopeId table column and the delete-confirm modal label so the two never
 * drift apart.
 */
const resolveScopeName = (
  record: PermissionScopeRecord,
): string | null | undefined => {
  const scope = record?.scope;
  if (!scope) return null;
  switch (record.scopeType) {
    case 'DOMAIN':
      return scope.basicInfo?.domainName;
    case 'PROJECT':
      return scope.basicInfo?.projectName;
    case 'USER':
      return scope.basicInfo?.email;
    case 'VFOLDER':
      return scope.vfolderName;
    case 'SESSION':
      return scope.metadata?.sessionName;
    case 'MODEL_DEPLOYMENT':
      return scope.metadata?.deploymentName;
    case 'RESOURCE_GROUP':
      return scope.resourceGroupName;
    case 'CONTAINER_REGISTRY':
      return scope.project
        ? `${scope.registryName} - ${scope.project}`
        : scope.registryName;
    default:
      return null;
  }
};

type PermissionOrder = 'ENTITY_TYPE_ASC' | 'ENTITY_TYPE_DESC';

interface LegacyRolePermissionTabProps {
  roleId: string;
}

/**
 * Legacy Permissions tab for managers without `role-mapped-scope-filter`
 * (< 26.8.0). Managers with the flag get the merged Detailed Permissions view
 * (`RolePermissionDetailTab`) instead. Filtering, ordering, and pagination all
 * run server-side via query variables.
 */
const LegacyRolePermissionTab: React.FC<LegacyRolePermissionTabProps> = ({
  roleId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const supportsRbacFilterWrapper = baiClient.supports('rbac-filter-wrapper');
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const relayEnvironment = useRelayEnvironment();
  const [matrixQueryRef, loadMatrixQuery] =
    useQueryLoader<LegacyCreatePermissionModalPermissionMatrixQuery>(
      PermissionMatrixQuery,
    );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<EditingPermission | null>(null);
  const [deletingPermission, setDeletingPermission] = useState<{
    id: string;
    scopeType: string;
    scopeTarget: string;
    entityType: string;
    operation: string;
  } | null>(null);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  // Drawer-internal view state — nothing inside the drawer writes to the URL.
  const [order, setOrder] = useState<PermissionOrder | null>(null);
  const [filter, setFilter] = useState<PermissionFilter | undefined>();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const roleIdFilter = (
    supportsRbacFilterWrapper ? { equals: roleId } : roleId
  ) as { equals: string };

  const queryVariables: LegacyRolePermissionTabQuery['variables'] = {
    roleId,
    filter: { roleId: roleIdFilter, ...filter },
    orderBy: convertToOrderBy<PermissionOrderBy>(order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };
  // Defer the variables / fetchKey so a refresh / page change / search updates
  // the table inline (previous rows stay visible) instead of re-suspending the
  // tab.
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<LegacyRolePermissionTabQuery>(
    graphql`
      query LegacyRolePermissionTabQuery(
        $roleId: UUID!
        $filter: PermissionFilter
        $orderBy: [PermissionOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        adminPermissions(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              scopeType
              scopeId
              entityType
              operation
              scope {
                ... on DomainV2 {
                  basicInfo {
                    domainName: name
                  }
                }
                ... on ProjectV2 {
                  basicInfo {
                    projectName: name
                  }
                }
                ... on UserV2 {
                  basicInfo {
                    email
                  }
                }
                ... on VirtualFolderNode {
                  vfolderName: name
                }
                ... on SessionV2 {
                  metadata {
                    sessionName: name
                  }
                }
                ... on ModelDeployment {
                  metadata {
                    deploymentName: name
                  }
                }
                ... on ResourceGroup {
                  resourceGroupName: name
                }
                ... on ContainerRegistryV2 {
                  registryName
                  project
                }
              }
            }
          }
        }
        adminRole(id: $roleId) {
          ...LegacyCreatePermissionModal_roleScopeFragment
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const mutateDeletePermission =
    useMutationWithPromise<LegacyRolePermissionTabDeleteMutation>(graphql`
      mutation LegacyRolePermissionTabDeleteMutation(
        $input: DeletePermissionInput!
      ) {
        adminDeletePermission(input: $input) {
          id
        }
      }
    `);

  const permissions =
    data.adminPermissions?.edges?.map((edge) => edge?.node) ?? [];

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  // Render-as-you-fetch: warm the store before opening so the modal's
  // usePreloadedQuery renders synchronously (no Suspense fallback flash);
  // the awaiting trigger button shows its own loading state meanwhile.
  const openPermissionModal = async (editing: EditingPermission | null) => {
    try {
      await fetchQuery<LegacyCreatePermissionModalPermissionMatrixQuery>(
        relayEnvironment,
        PermissionMatrixQuery,
        {},
      ).toPromise();
    } catch (error) {
      logger.error('Failed to load permission matrix', error);
      message.error(t('general.ErrorOccurred'));
      return;
    }
    loadMatrixQuery({});
    if (editing) {
      setEditingPermission(editing);
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleEdit = (record: {
    id: string;
    scopeType: string;
    scopeId: string;
    entityType: string;
    operation: string;
  }) =>
    openPermissionModal({
      id: toLocalId(record.id),
      scopeType: record.scopeType,
      scopeId: record.scopeId,
      entityType: record.entityType,
      operation: record.operation,
    });

  const handleDelete = (
    record: {
      id: string;
      entityType: string;
      operation: string;
      scopeId?: string;
    } & PermissionScopeRecord,
  ) => {
    const scopeName = resolveScopeName(record);
    setDeletingPermission({
      id: toLocalId(record.id),
      scopeType: record.scopeType,
      scopeTarget: scopeName || record.scopeId || '-',
      entityType: record.entityType,
      operation: record.operation,
    });
  };

  return (
    <>
      <BAIFlex
        justify="between"
        align="start"
        gap="sm"
        wrap="wrap"
        style={{ marginBottom: 12 }}
      >
        <BAIGraphQLPropertyFilter<PermissionFilter>
          filterProperties={[
            {
              key: 'scopeType',
              propertyLabel: t('rbac.ScopeType'),
              type: 'enum',
              valueMode: supportsRbacFilterWrapper ? 'operator' : 'scalar',
              options: [
                'DOMAIN',
                'PROJECT',
                'USER',
                'SESSION',
                'VFOLDER',
                'MODEL_DEPLOYMENT',
                'RESOURCE_GROUP',
                'IMAGE',
              ].map((type) => ({
                label: t(`rbac.types.${type}`, { defaultValue: type }),
                value: type,
              })),
              strictSelection: true,
            },
            {
              key: 'entityType',
              propertyLabel: t('rbac.EntityType'),
              type: 'enum',
              valueMode: supportsRbacFilterWrapper ? 'operator' : 'scalar',
              options: [
                'DOMAIN',
                'PROJECT',
                'USER',
                'SESSION',
                'VFOLDER',
                'MODEL_DEPLOYMENT',
                'RESOURCE_GROUP',
                'IMAGE',
              ].map((type) => ({
                label: t(`rbac.types.${type}`, { defaultValue: type }),
                value: type,
              })),
              strictSelection: true,
            },
          ]}
          value={filter}
          onChange={(value) => {
            setFilter(value);
            // The filter narrows the result set — land back on page 1 so the
            // offset stays in range.
            setTablePaginationOption({ current: 1 });
          }}
        />
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            loading={isLoading}
            value={fetchKey}
            onChange={updateFetchKey}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            action={() => openPermissionModal(null)}
          >
            {t('rbac.CreatePermission')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey="id"
        dataSource={permissions}
        loading={isLoading}
        size="small"
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: data.adminPermissions?.count ?? 0,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
        order={order}
        onChangeOrder={(newOrder) => {
          setOrder((newOrder as PermissionOrder) ?? null);
        }}
        columns={[
          {
            key: 'scopeType',
            title: t('rbac.ScopeType'),
            dataIndex: 'scopeType',
            render: (value: string) => (
              <Tag>{t(`rbac.types.${value}`, { defaultValue: value })}</Tag>
            ),
          },
          {
            key: 'scopeId',
            title: t('rbac.ScopeId'),
            dataIndex: 'scopeId',
            render: (value: string, record) => {
              const label = resolveScopeName(record);
              const displayValue = label || value || '-';
              return (
                <BAINameActionCell
                  title={displayValue}
                  showActions="always"
                  actions={[
                    {
                      key: 'edit',
                      title: t('button.Edit'),
                      icon: <EditIcon />,
                      action: () => handleEdit(record),
                    },
                    {
                      key: 'delete',
                      title: t('rbac.RemovePermission'),
                      icon: <DeleteFilled />,
                      type: 'danger',
                      onClick: () => handleDelete(record),
                    },
                  ]}
                />
              );
            },
          },
          {
            key: 'entityType',
            dataIndex: 'entityType',
            title: t('rbac.EntityType'),
            sorter: true,
            render: (value: string) => (
              <Tag>{t(`rbac.types.${value}`, { defaultValue: value })}</Tag>
            ),
          },
          {
            key: 'operation',
            title: t('rbac.Operation'),
            dataIndex: 'operation',
            render: (value: string) => (
              <Tag color="blue">
                {t(`rbac.operations.${value}`, { defaultValue: value })}
              </Tag>
            ),
          },
        ]}
      />
      {matrixQueryRef != null && (
        <BAIUnmountAfterClose>
          <LegacyCreatePermissionModal
            open={isCreateModalOpen || !!editingPermission}
            roleId={roleId}
            queryRef={matrixQueryRef}
            roleScopeFrgmt={data.adminRole ?? null}
            editingPermission={editingPermission}
            onRequestClose={(success) => {
              setIsCreateModalOpen(false);
              setEditingPermission(null);
              if (success) {
                updateFetchKey();
              }
            }}
          />
        </BAIUnmountAfterClose>
      )}
      <BAIDeleteConfirmModal
        open={!!deletingPermission}
        title={t('rbac.RemovePermission')}
        description={t('rbac.ConfirmDeletePermissionWithDetail')}
        plainItems
        items={
          deletingPermission
            ? [
                {
                  key: deletingPermission.id,
                  label: (
                    <BAITable
                      rowKey="id"
                      size="small"
                      resizable={false}
                      pagination={false}
                      style={{ width: '100%' }}
                      columns={[
                        {
                          key: 'scopeType',
                          title: t('rbac.ScopeType'),
                          dataIndex: 'scopeType',
                          render: (v: string) => (
                            <Tag>
                              {t(`rbac.types.${v}`, { defaultValue: v })}
                            </Tag>
                          ),
                        },
                        {
                          key: 'scopeTarget',
                          title: t('rbac.ScopeId'),
                          dataIndex: 'scopeTarget',
                        },
                        {
                          key: 'entityType',
                          title: t('rbac.EntityType'),
                          dataIndex: 'entityType',
                          render: (v: string) => (
                            <Tag>
                              {t(`rbac.types.${v}`, { defaultValue: v })}
                            </Tag>
                          ),
                        },
                        {
                          key: 'operation',
                          title: t('rbac.Operation'),
                          dataIndex: 'operation',
                          render: (v: string) => (
                            <Tag color="blue">
                              {t(`rbac.operations.${v}`, {
                                defaultValue: v,
                              })}
                            </Tag>
                          ),
                        },
                      ]}
                      dataSource={[deletingPermission]}
                    />
                  ),
                },
              ]
            : []
        }
        reversible
        okText={t('rbac.RemovePermission')}
        onOk={() => {
          if (!deletingPermission) return;
          return mutateDeletePermission({
            input: { id: deletingPermission.id },
          })
            .then(() => {
              message.success(t('rbac.PermissionRemoved'));
              setDeletingPermission(null);
              updateFetchKey();
            })
            .catch((error) => {
              logger.error('Failed to delete permission', error);
              message.error(error?.message || t('general.ErrorOccurred'));
              setDeletingPermission(null);
            });
        }}
        onCancel={() => setDeletingPermission(null)}
      />
    </>
  );
};

export default LegacyRolePermissionTab;
