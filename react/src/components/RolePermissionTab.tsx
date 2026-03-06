/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionTabDeleteMutation } from '../__generated__/RolePermissionTabDeleteMutation.graphql';
import { RolePermissionTabFragment$key } from '../__generated__/RolePermissionTabFragment.graphql';
import { PermissionOrderBy } from '../__generated__/RolePermissionTabRefetchQuery.graphql';
import { convertToOrderBy } from '../helper';
import CreatePermissionModal from './CreatePermissionModal';
import { App, Tag } from 'antd';
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
import { PlusIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment, useMutation } from 'react-relay';

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
  const { modal, message } = App.useApp();
  const { logger } = useBAILogger();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<GraphQLFilter>();
  const [order, setOrder] = useState<string | null>(null);
  const [isPendingRefetch, startRefetchTransition] = useTransition();

  const [data, refetch] = useRefetchableFragment(
    graphql`
      fragment RolePermissionTabFragment on Query
      @argumentDefinitions(
        filter: { type: "PermissionFilter" }
        orderBy: { type: "[PermissionOrderBy!]" }
      )
      @refetchable(queryName: "RolePermissionTabRefetchQuery") {
        adminPermissions(filter: $filter, orderBy: $orderBy, limit: 100) {
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

  const handleFilterChange = (newFilter: GraphQLFilter | undefined) => {
    setFilter(newFilter);
    startRefetchTransition(() => {
      refetch(
        {
          filter: {
            roleId,
            ...newFilter,
          },
          orderBy: convertToOrderBy<PermissionOrderBy>(order),
        },
        { fetchPolicy: 'network-only' },
      );
    });
  };

  const handleRefresh = () => {
    startRefetchTransition(() => {
      refetch(
        {
          filter: {
            roleId,
            ...filter,
          },
          orderBy: convertToOrderBy<PermissionOrderBy>(order),
        },
        { fetchPolicy: 'network-only' },
      );
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
                { label: 'DOMAIN', value: 'DOMAIN' },
                { label: 'PROJECT', value: 'PROJECT' },
                { label: 'USER', value: 'USER' },
                { label: 'SESSION', value: 'SESSION' },
                { label: 'VFOLDER', value: 'VFOLDER' },
                { label: 'DEPLOYMENT', value: 'DEPLOYMENT' },
                { label: 'RESOURCE_GROUP', value: 'RESOURCE_GROUP' },
                { label: 'IMAGE', value: 'IMAGE' },
              ],
              strictSelection: true,
            },
            {
              key: 'entityType',
              propertyLabel: t('rbac.EntityType'),
              type: 'enum',
              valueMode: 'scalar',
              options: [
                { label: 'DOMAIN', value: 'DOMAIN' },
                { label: 'PROJECT', value: 'PROJECT' },
                { label: 'USER', value: 'USER' },
                { label: 'SESSION', value: 'SESSION' },
                { label: 'VFOLDER', value: 'VFOLDER' },
                { label: 'DEPLOYMENT', value: 'DEPLOYMENT' },
                { label: 'RESOURCE_GROUP', value: 'RESOURCE_GROUP' },
                { label: 'IMAGE', value: 'IMAGE' },
              ],
              strictSelection: true,
            },
          ]}
          value={filter}
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
        pagination={false}
        order={order}
        onChangeOrder={(newOrder) => {
          setOrder(newOrder ?? null);
          startRefetchTransition(() => {
            refetch(
              {
                filter: {
                  roleId,
                  ...filter,
                },
                orderBy: convertToOrderBy<PermissionOrderBy>(newOrder ?? null),
              },
              { fetchPolicy: 'network-only' },
            );
          });
        }}
        columns={[
          {
            key: 'scopeType',
            title: t('rbac.ScopeType'),
            dataIndex: 'scopeType',
            render: (value: string) => <Tag>{value}</Tag>,
          },
          {
            key: 'scopeId',
            title: t('rbac.ScopeId'),
            dataIndex: 'scopeId',
            ellipsis: true,
          },
          {
            key: 'entityType',
            dataIndex: 'entityType',
            title: t('rbac.EntityType'),
            sorter: true,
            render: (value: string) => <Tag>{value}</Tag>,
          },
          {
            key: 'operation',
            title: t('rbac.Operation'),
            dataIndex: 'operation',
            render: (value: string) => <Tag color="blue">{value}</Tag>,
          },
          {
            key: 'control',
            title: t('general.Control'),
            width: 60,
            render: (_, record) => (
              <BAIButton
                type="text"
                danger
                icon={<BAITrashBinIcon />}
                size="small"
                title={t('rbac.DeletePermission')}
                onClick={() => handleDelete(toLocalId(record?.id))}
              />
            ),
          },
        ]}
      />
      <CreatePermissionModal
        open={isCreateModalOpen}
        roleId={roleId}
        onRequestClose={(success) => {
          setIsCreateModalOpen(false);
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
