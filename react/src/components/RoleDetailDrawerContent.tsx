/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerContentFragment$key } from '../__generated__/RoleDetailDrawerContentFragment.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import { resolveRBACScopeName } from '../helper/rbacScopeName';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIBreakpoint } from '../theme-shim';
import LegacyRolePermissionTab from './LegacyRolePermissionTab';
import LegacyRoleScopeTab from './LegacyRoleScopeTab';
import RoleAssignmentTab from './RoleAssignmentTab';
import RolePermissionDetailTab from './RolePermissionDetailTab';
import { Badge } from '@astryxdesign/core/Badge';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Token } from '@astryxdesign/core/Token';
import {
  BAICard,
  BAIDoubleToken,
  BAIFlex,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  badgeVariantForTagColor,
  toLocalId,
  tokenColorForTagColor,
  tokenColorForStatus,
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
  const { md } = useBAIBreakpoint();
  const baiClient = useSuspendedBackendaiClient();
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
        scopeType @since(version: "26.9.0a4")
        scopeId @since(version: "26.9.0a4")
        # Aliases only where nullability differs: this fragment rides the role
        # list query, and the manager caps a document at 20 aliases.
        scope @since(version: "26.9.0a4") {
          ... on DomainV2 {
            basicInfo {
              name
            }
          }
          ... on ProjectV2 {
            basicInfo {
              name
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
              name
            }
          }
          ... on ResourceGroup {
            name
          }
          ... on ContainerRegistryV2 {
            registryName
            project
          }
        }
        firstScope: scopes(first: 1) @deprecatedSince(version: "26.9.0a4") {
          count
          edges {
            node {
              scopeType
              scopeId
              scope {
                ... on DomainV2 {
                  basicInfo {
                    name
                  }
                }
                ... on ProjectV2 {
                  basicInfo {
                    name
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
                    name
                  }
                }
                ... on ResourceGroup {
                  name
                }
                ... on ContainerRegistryV2 {
                  registryName
                  project
                }
              }
            }
          }
        }
        ...RoleAssignmentTabFragment
        ...RolePermissionDetailTab_roleScopeFragment
      }
    `,
    roleNodeFrgmt,
  );

  // The role's one scope on managers >= 26.9.0a4; the first of its scopes
  // (plus how many more) before (ADR 0006).
  const firstScopeNode = role.firstScope?.edges?.[0]?.node;
  const roleScope = role.scopeType
    ? {
        scopeType: role.scopeType,
        scopeId: role.scopeId,
        scope: role.scope,
        extraCount: 0,
      }
    : {
        scopeType: firstScopeNode?.scopeType,
        scopeId: firstScopeNode?.scopeId,
        scope: firstScopeNode?.scope,
        extraCount: Math.max((role.firstScope?.count ?? 0) - 1, 0),
      };
  const scopeName = resolveRBACScopeName(roleScope);

  return (
    <BAIFlex direction="column" gap="lg" align="stretch">
      <BAIFlex direction="column" align="start" gap="xxs">
        {/* Not an <h3>: Astryx has no copyable Heading, so the name renders as
            large text with the shared copy control (same as the other drawers). */}
        <BAIText
          strong
          copyable
          style={{
            fontSize: 'var(--text-large-size)',
            lineHeight: 'var(--text-large-leading)',
          }}
        >
          {role.name}
        </BAIText>
        {role.description ? (
          <BAIText type="secondary">{role.description}</BAIText>
        ) : null}
      </BAIFlex>
      <BAICard>
        <BAIMetadataList columns={md ? 2 : 1}>
          <MetadataListItem label={t('rbac.Source')}>
            <Token
              color={tokenColorForStatus('role', role.source ?? undefined)}
              label={
                role.source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')
              }
            />
          </MetadataListItem>
          <MetadataListItem label={t('rbac.Status')}>
            <Token
              color={tokenColorForStatus('role', role.status ?? undefined)}
              label={
                role.status === 'ACTIVE' ? t('rbac.Active') : t('rbac.Inactive')
              }
            />
          </MetadataListItem>
          <MetadataListItem label={t('rbac.ScopeTypeAndId')}>
            {roleScope.scopeType ? (
              <BAIFlex gap="xxs" wrap="wrap" align="center">
                <BAIDoubleToken
                  values={[
                    {
                      label: t(rbacTypeI18nKey(roleScope.scopeType), {
                        defaultValue: roleScope.scopeType,
                      }),
                      color: 'blue',
                    },
                    // The raw id stands in for a missing name, with a copy
                    // control since nobody retypes a uuid.
                    scopeName
                      ? { label: scopeName, color: 'default' }
                      : {
                          label: roleScope.scopeId ?? '-',
                          color: 'default',
                          copyable: !!roleScope.scopeId,
                        },
                  ]}
                />
                {roleScope.extraCount > 0 && (
                  <Badge
                    variant={badgeVariantForTagColor('default')}
                    label={`+${roleScope.extraCount}`}
                  />
                )}
              </BAIFlex>
            ) : (
              '-'
            )}
          </MetadataListItem>
          {supportsAutoAssign ? (
            <MetadataListItem label={t('rbac.AutoAssign')}>
              <Token
                color={tokenColorForTagColor(
                  role.autoAssign ? 'green' : 'default',
                )}
                label={
                  role.autoAssign ? t('general.Active') : t('general.Inactive')
                }
              />
            </MetadataListItem>
          ) : null}
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
        </BAIMetadataList>
      </BAICard>
      <BAIFlex direction="column" gap="sm" align="stretch">
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
      </BAIFlex>
    </BAIFlex>
  );
};

export default RoleDetailDrawerContent;
