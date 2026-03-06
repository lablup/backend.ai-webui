/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionTabDeleteMutation } from '../__generated__/RolePermissionTabDeleteMutation.graphql';
import { RolePermissionTabQuery } from '../__generated__/RolePermissionTabQuery.graphql';
import CreatePermissionModal from './CreatePermissionModal';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Table, Tag, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

interface RolePermissionTabProps {
  roleId: string;
  fetchKey: string;
  onPermissionChange?: () => void;
}

const RolePermissionTab: React.FC<RolePermissionTabProps> = ({
  roleId,
  fetchKey,
  onPermissionChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { modal, message } = App.useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const data = useLazyLoadQuery<RolePermissionTabQuery>(
    graphql`
      query RolePermissionTabQuery($filter: PermissionFilter) {
        adminPermissions(filter: $filter) {
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
    { filter: { roleId } },
    { fetchPolicy: 'network-only', fetchKey },
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
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.PermissionDeleted'));
              onPermissionChange?.();
              resolve();
            },
            onError: (error) => {
              message.error(error?.message || t('general.ErrorOccurred'));
              reject();
            },
          });
        }),
    });
  };

  return (
    <>
      <BAIFlex justify="end" style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          {t('rbac.CreatePermission')}
        </Button>
      </BAIFlex>
      <Table
        rowKey="id"
        dataSource={permissions}
        size="small"
        pagination={false}
        locale={{
          emptyText: (
            <Typography.Text type="secondary">
              {t('rbac.NoPermissionsToDisplay')}
            </Typography.Text>
          ),
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
            title: t('rbac.EntityType'),
            dataIndex: 'entityType',
            render: (value: string) => <Tag>{value}</Tag>,
          },
          {
            key: 'operation',
            title: t('rbac.Operation'),
            dataIndex: 'operation',
            render: (value: string) => <Tag color="blue">{value}</Tag>,
          },
          {
            key: 'actions',
            title: '',
            width: 60,
            render: (_, record) => (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                onClick={() => handleDelete(record?.id)}
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
            onPermissionChange?.();
          }
        }}
      />
    </>
  );
};

export default RolePermissionTab;
