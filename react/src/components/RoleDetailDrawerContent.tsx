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
import { Badge } from '@astryxdesign/core/Badge';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import {
  BAICard,
  BAIMetadataList,
  BAISkeleton,
  badgeVariantForStatus,
  badgeVariantForTagColor,
  toLocalId,
} from 'backend.ai-ui';
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
      {/* antd `Descriptions` -> `MetadataList` (MAPPING §4). `bordered`,
          `size="small"` and per-item `span` have no destination and are
          dropped — the project-wide decision established in tickets 15/18.
          The two `span={2}` full-width rows keep their content; they simply
          flow in the 2-column grid like every other row. */}
      <BAICard>
        <BAIMetadataList columns={2} label={{ position: 'start', width: 160 }}>
          <MetadataListItem label={t('rbac.Source')}>
            {/* Tag -> Badge through the repo-global lookup (ticket 13); no
                per-file colour map. */}
            <Badge
              variant={badgeVariantForStatus('role', role.source ?? undefined)}
              label={
                role.source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')
              }
            />
          </MetadataListItem>
          <MetadataListItem label={t('rbac.Status')}>
            <Badge
              variant={badgeVariantForStatus('role', role.status ?? undefined)}
              label={
                role.status === 'ACTIVE' ? t('rbac.Active') : t('rbac.Inactive')
              }
            />
          </MetadataListItem>
          <MetadataListItem label={t('general.CreatedAt')}>
            {role.createdAt
              ? dayjs(role.createdAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </MetadataListItem>
          <MetadataListItem label={t('general.UpdatedAt')}>
            {role.updatedAt
              ? dayjs(role.updatedAt).format('YYYY-MM-DD HH:mm:ss')
              : '-'}
          </MetadataListItem>
          {supportsAutoAssign ? (
            <MetadataListItem label={t('rbac.AutoAssign')}>
              <Badge
                variant={badgeVariantForTagColor(
                  role.autoAssign ? 'green' : 'default',
                )}
                label={
                  role.autoAssign ? t('general.Active') : t('general.Inactive')
                }
              />
            </MetadataListItem>
          ) : null}
          <MetadataListItem label={t('rbac.RoleDescription')}>
            {role.description || '-'}
          </MetadataListItem>
        </BAIMetadataList>
      </BAICard>
      {/* antd `Tabs` -> `TabList` + `Tab` (MAPPING §4): navigation only, the
          panel is rendered by this component below the bar. */}
      <TabList hasDivider value={activeTab} onChange={setActiveTab}>
        {supportsDetailedPermissions ? (
          <Tab value="detailedPermissions" label={t('rbac.Permissions')} />
        ) : (
          <>
            <Tab value="scopes" label={t('rbac.RoleScopes')} />
            <Tab value="permissions" label={t('rbac.Permissions')} />
          </>
        )}
        <Tab value="assignments" label={t('rbac.RoleAssignments')} />
      </TabList>
      <Suspense fallback={<BAISkeleton />}>
        {activeTab === 'detailedPermissions' && (
          <RolePermissionDetailTab roleNodeFrgmt={role} />
        )}
        {activeTab === 'scopes' && (
          <LegacyRoleScopeTab roleId={toLocalId(role.id)} />
        )}
        {activeTab === 'permissions' && (
          <LegacyRolePermissionTab roleId={toLocalId(role.id)} />
        )}
        {activeTab === 'assignments' && (
          <RoleAssignmentTab roleNodeFrgmt={role} />
        )}
      </Suspense>
    </>
  );
};

export default RoleDetailDrawerContent;
