/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerContentFragment$key } from '../__generated__/RoleDetailDrawerContentFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import LegacyRolePermissionTab from './LegacyRolePermissionTab';
import LegacyRoleScopeTab from './LegacyRoleScopeTab';
import RoleAssignmentTab from './RoleAssignmentTab';
import RolePermissionDetailTab from './RolePermissionDetailTab';
import { Descriptions, Skeleton, Tabs, Tag } from 'antd';
import { toLocalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface RoleDetailDrawerContentProps {
  roleNodeFrgmt: RoleDetailDrawerContentFragment$key;
}

const RoleDetailDrawerContent: React.FC<RoleDetailDrawerContentProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  // Auto-assign is only supported on managers >= 26.4.4.
  const supportsAutoAssign = baiClient.supports('role-auto-assign');
  // Managers >= 26.8.0 can filter `Role.scopes` by scope type, which the
  // merged Detailed Permissions view depends on. Older managers get the
  // legacy separate Scopes / Permissions tabs instead.
  const supportsDetailedPermissions = baiClient.supports(
    'role-mapped-scope-filter',
  );
  const [activeTab, setActiveTab] = useState(
    supportsDetailedPermissions ? 'detailedPermissions' : 'scopes',
  );

  const role = useFragment(
    graphql`
      fragment RoleDetailDrawerContentFragment on Role {
        id
        name
        description
        source
        status
        autoAssign @since(version: "26.4.4")
        createdAt
        updatedAt
        deletedAt
        ...RoleAssignmentTabFragment
        ...RolePermissionDetailTab_roleScopeFragment
      }
    `,
    roleNodeFrgmt,
  );

  return (
    <>
      <Descriptions
        column={2}
        bordered
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Descriptions.Item label={t('rbac.Source')}>
          <Tag color={role.source === 'SYSTEM' ? 'default' : 'green'}>
            {role.source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('rbac.Status')}>
          <Tag
            color={
              role.status === 'ACTIVE'
                ? 'green'
                : role.status === 'INACTIVE'
                  ? 'orange'
                  : 'red'
            }
          >
            {role.status === 'ACTIVE' ? t('rbac.Active') : t('rbac.Inactive')}
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
        {supportsAutoAssign && (
          <Descriptions.Item label={t('rbac.AutoAssign')} span={2}>
            <Tag color={role.autoAssign ? 'green' : 'default'}>
              {role.autoAssign ? t('general.Active') : t('general.Inactive')}
            </Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t('rbac.RoleDescription')} span={2}>
          {role.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          ...(supportsDetailedPermissions
            ? [
                {
                  key: 'detailedPermissions',
                  label: t('rbac.Permissions'),
                  children: (
                    <Suspense fallback={<Skeleton active />}>
                      <RolePermissionDetailTab roleNodeFrgmt={role} />
                    </Suspense>
                  ),
                },
              ]
            : [
                {
                  key: 'scopes',
                  label: t('rbac.RoleScopes'),
                  children: (
                    <Suspense fallback={<Skeleton active />}>
                      <LegacyRoleScopeTab roleId={toLocalId(role.id)} />
                    </Suspense>
                  ),
                },
                {
                  key: 'permissions',
                  label: t('rbac.Permissions'),
                  children: (
                    <Suspense fallback={<Skeleton active />}>
                      <LegacyRolePermissionTab roleId={toLocalId(role.id)} />
                    </Suspense>
                  ),
                },
              ]),
          {
            key: 'assignments',
            label: t('rbac.RoleAssignments'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <RoleAssignmentTab roleNodeFrgmt={role} />
              </Suspense>
            ),
          },
        ]}
      />
    </>
  );
};

export default RoleDetailDrawerContent;
