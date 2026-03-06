/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerContentFragment$key } from '../__generated__/RoleDetailDrawerContentFragment.graphql';
import RoleAssignmentTab from './RoleAssignmentTab';
import RolePermissionTab from './RolePermissionTab';
import { Descriptions, Skeleton, Tabs, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface RoleDetailDrawerContentProps {
  roleDetailFrgmt: RoleDetailDrawerContentFragment$key;
  fetchKey: string;
  onTabReset?: () => void;
}

const RoleDetailDrawerContent: React.FC<RoleDetailDrawerContentProps> = ({
  roleDetailFrgmt,
  fetchKey,
  onTabReset: _onTabReset,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('assignments');

  const role = useFragment(
    graphql`
      fragment RoleDetailDrawerContentFragment on Role {
        id
        name
        description
        source
        status
        createdAt
        updatedAt
        deletedAt
      }
    `,
    roleDetailFrgmt,
  );

  const sourceColor = role.source === 'SYSTEM' ? 'default' : 'green';
  const statusColorMap: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'orange',
    DELETED: 'red',
  };

  return (
    <>
      <Descriptions
        column={2}
        bordered
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label={t('rbac.RoleDescription')} span={2}>
          {role.description || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('rbac.Source')}>
          <Tag color={sourceColor}>
            {role.source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('rbac.Status')}>
          <Tag color={statusColorMap[role.status] || 'default'}>
            {role.status === 'ACTIVE'
              ? t('rbac.Active')
              : role.status === 'INACTIVE'
                ? t('rbac.Inactive')
                : t('rbac.Deleted')}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('general.CreatedAt')}>
          {role.createdAt
            ? dayjs(role.createdAt).format('YYYY-MM-DD HH:mm:ss')
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('general.UpdatedAt')}>
          {role.updatedAt
            ? dayjs(role.updatedAt).format('YYYY-MM-DD HH:mm:ss')
            : '-'}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'assignments',
            label: t('rbac.Assignments'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <RoleAssignmentTab roleId={role.id} fetchKey={fetchKey} />
              </Suspense>
            ),
          },
          {
            key: 'permissions',
            label: t('rbac.Permissions'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <RolePermissionTab roleId={role.id} fetchKey={fetchKey} />
              </Suspense>
            ),
          },
        ]}
      />
    </>
  );
};

export default RoleDetailDrawerContent;
