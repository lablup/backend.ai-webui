/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabBulkAssignMutation } from '../__generated__/RoleAssignmentTabBulkAssignMutation.graphql';
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import { RoleAssignmentTabRevokeMutation } from '../__generated__/RoleAssignmentTabRevokeMutation.graphql';
import AssignRoleModal from './AssignRoleModal';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { App, Button, Table, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface RoleAssignmentTabProps {
  roleFrgmt: RoleAssignmentTabFragment$key;
  fetchKey: string;
  onAssignmentChange?: () => void;
}

const RoleAssignmentTab: React.FC<RoleAssignmentTabProps> = ({
  roleFrgmt,
  fetchKey: _fetchKey,
  onAssignmentChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { modal, message } = App.useApp();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const role = useFragment(
    graphql`
      fragment RoleAssignmentTabFragment on Role {
        id
        users(first: 100) {
          count
          edges {
            node {
              id
              userId
              grantedBy
              grantedAt
              user {
                id
                basicInfo {
                  email
                  fullName
                }
              }
            }
          }
        }
      }
    `,
    roleFrgmt,
  );

  const roleId = role.id;

  const [commitBulkAssignRole, isInFlightBulkAssign] =
    useMutation<RoleAssignmentTabBulkAssignMutation>(graphql`
      mutation RoleAssignmentTabBulkAssignMutation(
        $input: BulkAssignRoleInput!
      ) {
        adminBulkAssignRole(input: $input) {
          assigned {
            id
            userId
            grantedBy
            grantedAt
          }
          failed {
            userId
            message
          }
        }
      }
    `);

  const [commitRevokeRole] = useMutation<RoleAssignmentTabRevokeMutation>(
    graphql`
      mutation RoleAssignmentTabRevokeMutation($input: RevokeRoleInput!) {
        adminRevokeRole(input: $input) {
          id
        }
      }
    `,
  );

  const assignments = role.users?.edges?.map((edge) => edge?.node) ?? [];

  const handleBulkAssign = (userIds: string[]) => {
    commitBulkAssignRole({
      variables: { input: { userIds, roleId } },
      onCompleted: (data, errors) => {
        if (errors && errors.length > 0) {
          message.error(errors[0]?.message || t('general.ErrorOccurred'));
          return;
        }
        const failed = data.adminBulkAssignRole?.failed ?? [];
        if (failed.length > 0) {
          message.warning(
            t('rbac.BulkAssignPartialFailure', { count: failed.length }),
          );
        } else {
          message.success(t('rbac.UsersAssigned'));
        }
        setIsAssignModalOpen(false);
        onAssignmentChange?.();
      },
      onError: (error) => {
        message.error(error?.message || t('general.ErrorOccurred'));
      },
    });
  };

  const handleRevoke = (userId: string) => {
    modal.confirm({
      title: t('rbac.RevokeUser'),
      content: t('rbac.ConfirmRevoke'),
      okText: t('rbac.RevokeUser'),
      okButtonProps: { danger: true, type: 'primary' },
      onOk: () =>
        new Promise<void>((resolve, reject) => {
          commitRevokeRole({
            variables: { input: { userId, roleId } },
            onCompleted: (_data, errors) => {
              if (errors && errors.length > 0) {
                message.error(errors[0]?.message || t('general.ErrorOccurred'));
                reject();
                return;
              }
              message.success(t('rbac.UserRevoked'));
              onAssignmentChange?.();
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
          onClick={() => setIsAssignModalOpen(true)}
        >
          {t('rbac.AssignUser')}
        </Button>
      </BAIFlex>
      <Table
        rowKey="id"
        dataSource={assignments}
        size="small"
        pagination={false}
        locale={{
          emptyText: (
            <Typography.Text type="secondary">
              {t('rbac.NoUsersAssigned')}
            </Typography.Text>
          ),
        }}
        columns={[
          {
            key: 'email',
            title: t('credential.UserID'),
            render: (_, record) => record?.user?.basicInfo?.email || '-',
          },
          {
            key: 'fullName',
            title: t('credential.FullName'),
            render: (_, record) => record?.user?.basicInfo?.fullName || '-',
          },
          {
            key: 'grantedAt',
            title: t('rbac.GrantedAt'),
            render: (_, record) =>
              record?.grantedAt
                ? dayjs(record.grantedAt).format('YYYY-MM-DD HH:mm')
                : '-',
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
                onClick={() => handleRevoke(record?.userId)}
              />
            ),
          },
        ]}
      />
      <AssignRoleModal
        open={isAssignModalOpen}
        confirmLoading={isInFlightBulkAssign}
        onCancel={() => setIsAssignModalOpen(false)}
        onAssign={handleBulkAssign}
      />
    </>
  );
};

export default RoleAssignmentTab;
