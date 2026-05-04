/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { CreatePermissionModal_roleScopeFragment$key } from '../__generated__/CreatePermissionModal_roleScopeFragment.graphql';
import { RolePermissionTabDeleteMutation } from '../__generated__/RolePermissionTabDeleteMutation.graphql';
import { RolePermissionTabFragment$key } from '../__generated__/RolePermissionTabFragment.graphql';
import { PermissionOrderBy } from '../__generated__/RolePermissionTabRefetchQuery.graphql';
import { convertToOrderBy } from '../helper';
import CreatePermissionModal from './CreatePermissionModal';
import { App, Tag } from 'antd';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAITable,
  BAITrashBinIcon,
  type GraphQLFilter,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import { EditIcon, PlusIcon } from 'lucide-react';
import {
  parseAsInteger,
  parseAsJson,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface EditingPermission {
  id: string;
  scopeType: string;
  scopeId: string;
  entityType: string;
  operation: string;
}

const permissionOrderValues = ['ENTITY_TYPE_ASC', 'ENTITY_TYPE_DESC'] as const;

interface RolePermissionTabProps {
  queryRef: RolePermissionTabFragment$key;
  roleId: string;
  roleScopeFrgmt?: CreatePermissionModal_roleScopeFragment$key | null;
  onPermissionChange?: () => void;
}

const RolePermissionTab: React.FC<RolePermissionTabProps> = ({
  queryRef,
  roleId,
  roleScopeFrgmt,
  onPermissionChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] =
    useState<EditingPermission | null>(null);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(permissionOrderValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'pCurrent',
        pageSize: 'pPageSize',
        order: 'pOrder',
        filter: 'pFilter',
      },
    },
  );

  const limit = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * limit : 0;

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RolePermissionTabFragment on Query
      @argumentDefinitions(
        filter: { type: "PermissionFilter" }
        orderBy: { type: "[PermissionOrderBy!]" }
        limit: { type: "Int" }
        offset: { type: "Int" }
      )
      @refetchable(queryName: "RolePermissionTabRefetchQuery") {
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
      }
    `,
    queryRef,
  );

  const mutateDeletePermission =
    useMutationWithPromise<RolePermissionTabDeleteMutation>(graphql`
      mutation RolePermissionTabDeleteMutation($input: DeletePermissionInput!) {
        adminDeletePermission(input: $input) {
          id
        }
      }
    `);

  const permissions =
    data.adminPermissions?.edges?.map((edge) => edge?.node) ?? [];

  const doRefetch = (overrides?: {
    filter?: GraphQLFilter | null;
    order?: string | null;
    limit?: number;
    offset?: number;
  }) => {
    startRefetchTransition(() => {
      refetch(
        {
          filter: {
            roleId,
            ...(overrides?.filter !== undefined
              ? overrides.filter
              : queryParams.filter),
          },
          orderBy: convertToOrderBy<PermissionOrderBy>(
            overrides?.order !== undefined
              ? overrides.order
              : queryParams.order,
          ),
          limit: overrides?.limit ?? limit,
          offset: overrides?.offset ?? offset,
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleFilterChange = (newFilter: GraphQLFilter | undefined) => {
    setQueryParams({ filter: newFilter ?? null, current: 1 });
    doRefetch({ filter: newFilter ?? null, offset: 0 });
  };

  const handleRefresh = () => {
    doRefetch();
  };

  const handleEdit = (record: {
    id: string;
    scopeType: string;
    scopeId: string;
    entityType: string;
    operation: string;
  }) => {
    setEditingPermission({
      id: toLocalId(record.id),
      scopeType: record.scopeType,
      scopeId: record.scopeId,
      entityType: record.entityType,
      operation: record.operation,
    });
  };

  const handleDelete = (record: {
    id: string;
    entityType: string;
    operation: string;
    scopeType: string;
  }) => {
    const permissionLabel = `${t(`rbac.types.${record.entityType}`, { defaultValue: record.entityType })} - ${t(`rbac.operations.${record.operation}`, { defaultValue: record.operation })} (${t(`rbac.types.${record.scopeType}`, { defaultValue: record.scopeType })})`;
    const localId = toLocalId(record.id);
    modal.confirm({
      title: t('rbac.RemovePermission'),
      content: (
        <BAIFlex direction="column" align="stretch" gap="xs">
          <span>{t('rbac.ConfirmDeletePermissionWithDetail')}</span>
          <ul style={{ margin: 0, paddingInlineStart: 20 }}>
            <li>{permissionLabel}</li>
          </ul>
        </BAIFlex>
      ),
      okText: t('rbac.RemovePermission'),
      okButtonProps: { danger: true },
      onOk: () =>
        mutateDeletePermission({
          input: { id: localId },
        })
          .then(() => {
            message.success(t('rbac.PermissionRemoved'));
            handleRefresh();
            onPermissionChange?.();
          })
          .catch((error) => {
            logger.error('Failed to delete permission', error);
            message.error(error?.message || t('general.ErrorOccurred'));
          }),
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
        <BAIGraphQLPropertyFilter
          filterProperties={[
            {
              key: 'scopeType',
              propertyLabel: t('rbac.ScopeType'),
              type: 'enum',
              valueMode: 'scalar',
              options: [
                'DOMAIN',
                'PROJECT',
                'USER',
                'SESSION',
                'VFOLDER',
                'DEPLOYMENT',
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
              valueMode: 'scalar',
              options: [
                'DOMAIN',
                'PROJECT',
                'USER',
                'SESSION',
                'VFOLDER',
                'DEPLOYMENT',
                'RESOURCE_GROUP',
                'IMAGE',
              ].map((type) => ({
                label: t(`rbac.types.${type}`, { defaultValue: type }),
                value: type,
              })),
              strictSelection: true,
            },
          ]}
          value={queryParams.filter ?? undefined}
          onChange={handleFilterChange}
        />
        <BAIFlex gap="xs">
          <BAIFetchKeyButton
            loading={isPendingRefetch}
            value=""
            onChange={() => handleRefresh()}
          />
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            {t('rbac.CreatePermission')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey="id"
        dataSource={permissions}
        loading={isPendingRefetch}
        size="small"
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: data.adminPermissions?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams({ current, pageSize });
            const newOffset = current > 1 ? (current - 1) * pageSize : 0;
            doRefetch({ limit: pageSize, offset: newOffset });
          },
        }}
        order={queryParams.order}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order: (newOrder as (typeof permissionOrderValues)[number]) ?? null,
          });
          doRefetch({ order: newOrder ?? null });
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
              const scope = record?.scope;
              let label: string | null | undefined = null;
              if (scope) {
                switch (record.scopeType) {
                  case 'DOMAIN':
                    label = scope.basicInfo?.domainName;
                    break;
                  case 'PROJECT':
                    label = scope.basicInfo?.projectName;
                    break;
                  case 'USER':
                    label = scope.basicInfo?.email;
                    break;
                  case 'VFOLDER':
                    label = scope.vfolderName;
                    break;
                  case 'SESSION':
                    label = scope.metadata?.sessionName;
                    break;
                  case 'MODEL_DEPLOYMENT':
                    label = scope.metadata?.deploymentName;
                    break;
                  case 'RESOURCE_GROUP':
                    label = scope.resourceGroupName;
                    break;
                  case 'CONTAINER_REGISTRY':
                    label = scope.project
                      ? `${scope.registryName} - ${scope.project}`
                      : scope.registryName;
                    break;
                }
              }
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
                      onClick: () => handleEdit(record),
                    },
                    {
                      key: 'delete',
                      title: t('rbac.RemovePermission'),
                      icon: <BAITrashBinIcon />,
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
      <CreatePermissionModal
        open={isCreateModalOpen || !!editingPermission}
        roleId={roleId}
        roleScopeFrgmt={roleScopeFrgmt}
        editingPermission={editingPermission}
        onRequestClose={(success) => {
          setIsCreateModalOpen(false);
          setEditingPermission(null);
          if (success) {
            handleRefresh();
            onPermissionChange?.();
          }
        }}
      />
    </>
  );
};

export default RolePermissionTab;
