/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import { RoleDetailDrawerContentFragment$key } from '../__generated__/RoleDetailDrawerContentFragment.graphql';
import { RolePermissionTabFragment$key } from '../__generated__/RolePermissionTabFragment.graphql';
import { RoleScopeTabFragment$key } from '../__generated__/RoleScopeTabFragment.graphql';
import RoleAssignmentTab from './RoleAssignmentTab';
import RolePermissionTab from './RolePermissionTab';
import RoleScopeTab from './RoleScopeTab';
import { Descriptions, Skeleton, Tabs, Tag } from 'antd';
import { toLocalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface RoleDetailDrawerContentProps {
  roleDetailFrgmt: RoleDetailDrawerContentFragment$key;
  scopeQueryRef: RoleScopeTabFragment$key;
  assignmentQueryRef: RoleAssignmentTabFragment$key;
  permissionQueryRef: RolePermissionTabFragment$key;
  onTabReset?: () => void;
  onDataChange?: () => void;
}

const RoleDetailDrawerContent: React.FC<RoleDetailDrawerContentProps> = ({
  roleDetailFrgmt,
  scopeQueryRef,
  assignmentQueryRef,
  permissionQueryRef,
  onTabReset: _onTabReset,
  onDataChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('scopes');

  const [, resetTabParams] = useQueryStates(
    {
      sCurrent: parseAsString,
      sPageSize: parseAsString,
      sOrder: parseAsString,
      sFilter: parseAsString,
      pCurrent: parseAsString,
      pPageSize: parseAsString,
      pOrder: parseAsString,
      pFilter: parseAsString,
      aCurrent: parseAsString,
      aPageSize: parseAsString,
      aOrder: parseAsString,
      aFilter: parseAsString,
    },
    { history: 'replace' },
  );

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    resetTabParams({
      sCurrent: null,
      sPageSize: null,
      sOrder: null,
      sFilter: null,
      pCurrent: null,
      pPageSize: null,
      pOrder: null,
      pFilter: null,
      aCurrent: null,
      aPageSize: null,
      aOrder: null,
      aFilter: null,
    });
  };

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
        ...RoleAssignmentTab_roleScopeFragment
        ...CreatePermissionModal_roleScopeFragment
      }
    `,
    roleDetailFrgmt,
  );

  const roleId = toLocalId(role.id);

  const source = role.source ?? 'CUSTOM';
  const status = role.status ?? 'ACTIVE';
  const sourceColor = source === 'SYSTEM' ? 'default' : 'green';
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
        <Descriptions.Item label={t('rbac.Source')}>
          <Tag color={sourceColor}>
            {source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('rbac.Status')}>
          <Tag color={statusColorMap[status] || 'default'}>
            {status === 'ACTIVE'
              ? t('rbac.Active')
              : status === 'INACTIVE'
                ? t('rbac.Inactive')
                : t('rbac.Inactive')}
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
        <Descriptions.Item label={t('rbac.RoleDescription')} span={2}>
          {role.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'scopes',
            label: t('rbac.RoleScopes'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <RoleScopeTab queryRef={scopeQueryRef} />
              </Suspense>
            ),
          },
          {
            key: 'permissions',
            label: t('rbac.Permissions'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <RolePermissionTab
                  queryRef={permissionQueryRef}
                  roleId={roleId}
                  roleScopeFrgmt={role}
                  onPermissionChange={onDataChange}
                />
              </Suspense>
            ),
          },
          {
            key: 'assignments',
            label: t('rbac.RoleAssignments'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <RoleAssignmentTab
                  queryRef={assignmentQueryRef}
                  roleId={roleId}
                  roleScopeFrgmt={role}
                  onAssignmentChange={onDataChange}
                />
              </Suspense>
            ),
          },
        ]}
      />
    </>
  );
};

export default RoleDetailDrawerContent;
