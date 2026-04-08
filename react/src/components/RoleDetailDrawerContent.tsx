/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleAssignmentTabFragment$key } from '../__generated__/RoleAssignmentTabFragment.graphql';
import { RoleDetailDrawerContentFragment$key } from '../__generated__/RoleDetailDrawerContentFragment.graphql';
import { RoleDetailDrawerContentProjectQuery } from '../__generated__/RoleDetailDrawerContentProjectQuery.graphql';
import { RolePermissionTabFragment$key } from '../__generated__/RolePermissionTabFragment.graphql';
import RoleAssignmentTab from './RoleAssignmentTab';
import RolePermissionTab from './RolePermissionTab';
import { Descriptions, Skeleton, Tabs, Tag } from 'antd';
import { toLocalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface RoleDetailDrawerContentProps {
  roleDetailFrgmt: RoleDetailDrawerContentFragment$key;
  assignmentQueryRef: RoleAssignmentTabFragment$key;
  permissionQueryRef: RolePermissionTabFragment$key;
  onTabReset?: () => void;
  onDataChange?: () => void;
}

const RoleDetailDrawerContent: React.FC<RoleDetailDrawerContentProps> = ({
  roleDetailFrgmt,
  assignmentQueryRef,
  permissionQueryRef,
  onTabReset: _onTabReset,
  onDataChange,
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
        scopes(first: 1) {
          edges {
            node {
              scopeType
              scopeId
            }
          }
        }
        ...RoleAssignmentTab_roleScopeFragment
        ...CreatePermissionModal_roleScopeFragment
      }
    `,
    roleDetailFrgmt,
  );

  const roleId = toLocalId(role.id);

  const scopeNode = role.scopes?.edges?.[0]?.node;
  const projectScopeId =
    scopeNode?.scopeType === 'PROJECT' ? scopeNode.scopeId : undefined;

  const projectData = useLazyLoadQuery<RoleDetailDrawerContentProjectQuery>(
    graphql`
      query RoleDetailDrawerContentProjectQuery(
        $projectId: UUID!
        $skip: Boolean!
      ) {
        projectV2(projectId: $projectId) @skip(if: $skip) {
          basicInfo {
            name
          }
        }
      }
    `,
    {
      projectId: projectScopeId ?? '',
      skip: !projectScopeId,
    },
    {
      fetchPolicy: projectScopeId ? 'store-or-network' : 'store-only',
    },
  );

  const projectName = projectScopeId
    ? (projectData.projectV2?.basicInfo?.name ?? projectScopeId)
    : null;

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
                : // The backend does not use INACTIVE status; DELETED serves as a
                  // soft-delete and is displayed as Inactive in the UI.
                  t('rbac.Inactive')}
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
        <Descriptions.Item label={t('general.Project')} span={2}>
          {projectName ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('rbac.RoleDescription')} span={2}>
          {role.description || '-'}
        </Descriptions.Item>
      </Descriptions>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
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
        ]}
      />
    </>
  );
};

export default RoleDetailDrawerContent;
