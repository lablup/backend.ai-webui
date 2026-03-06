/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionTabDeleteMutation } from '../__generated__/RolePermissionTabDeleteMutation.graphql';
import { RolePermissionTabFragment$key } from '../__generated__/RolePermissionTabFragment.graphql';
import { PermissionOrderBy } from '../__generated__/RolePermissionTabRefetchQuery.graphql';
import { convertToOrderBy } from '../helper';
import CreatePermissionModal from './CreatePermissionModal';
import { App, Tag, Tooltip, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAITable,
  BAITrashBinIcon,
  type GraphQLFilter,
  toLocalId,
  useBAILogger,
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
import { graphql, useRefetchableFragment, useMutation } from 'react-relay';

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
  onPermissionChange?: () => void;
}

const RolePermissionTab: React.FC<RolePermissionTabProps> = ({
  queryRef,
  roleId,
  onPermissionChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
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
            }
          }
        }
      }
    `,
    queryRef,
  );

  const [commitDeletePermission] = useMutation<RolePermissionTabDeleteMutation>(
    graphql`
      mutation RolePermissionTabDeleteMutation($input: DeletePermissionInput!) {
        adminDeletePermission(input: $input) {
          id
        }
      }
    `,
  );

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

  const handleDelete = (permissionId: string) => {
    modal.confirm({
      title: t('rbac.DeletePermission'),
      content: t('rbac.ConfirmDeletePermission'),
      okText: t('button.Delete'),
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          commitDeletePermission({
            variables: { input: { id: permissionId } },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                logger.error(errors[0]);
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.PermissionDeleted'));
              handleRefresh();
              onPermissionChange?.();
              resolve();
            },
            onError: (error) => {
              logger.error(error);
              message.error(error?.message || t('general.ErrorOccurred'));
              reject();
            },
          });
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
        <BAIButton
          type="primary"
          icon={<PlusIcon />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          {t('rbac.CreatePermission')}
        </BAIButton>
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
            render: (value: string) => (
              <Tooltip title={value} placement="topLeft">
                <Typography.Text ellipsis style={{ maxWidth: 200 }}>
                  {value ?? '-'}
                </Typography.Text>
              </Tooltip>
            ),
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
          {
            key: 'control',
            title: t('general.Control'),
            width: 90,
            render: (_, record) => (
              <BAIFlex gap="xxs">
                <BAIButton
                  type="text"
                  icon={<EditIcon style={{ color: token.colorInfo }} />}
                  size="small"
                  onClick={() => handleEdit(record)}
                />
                <BAIButton
                  type="text"
                  danger
                  icon={<BAITrashBinIcon />}
                  size="small"
                  title={t('rbac.DeletePermission')}
                  onClick={() => handleDelete(toLocalId(record?.id))}
                />
              </BAIFlex>
            ),
          },
        ]}
      />
      <CreatePermissionModal
        open={isCreateModalOpen || !!editingPermission}
        roleId={roleId}
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
