/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RoleDetailDrawerContentV2Fragment$key } from '../__generated__/RoleDetailDrawerContentV2Fragment.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import { resolveRBACScopeName } from '../helper/rbacScopeName';
import { useBAIBreakpoint } from '../theme-shim';
import RoleAssignmentTab from './RoleAssignmentTab';
import RolePermissionSummaryTable from './RolePermissionSummaryTable';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Token } from '@astryxdesign/core/Token';
import {
  BAIAlert,
  BAICard,
  BAIDoubleToken,
  BAIFlex,
  BAILink,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  tokenColorForTagColor,
  tokenColorForStatus,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface RoleDetailDrawerContentV2Props {
  roleNodeFrgmt: RoleDetailDrawerContentV2Fragment$key;
}

/**
 * Body of `RoleDetailDrawerV2` (managers >= 26.9.0a4): the role's name and
 * description, its metadata with the one scope it belongs to, and the
 * Permissions / Role Assignments tabs. The scope fields carry `@since` because
 * this fragment rides the role list query every manager receives (ADR 0006).
 */
const RoleDetailDrawerContentV2: React.FC<RoleDetailDrawerContentV2Props> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const [activeTab, setActiveTab] = useState('permissions');

  const role = useFragment(
    graphql`
      fragment RoleDetailDrawerContentV2Fragment on Role {
        id
        name
        description
        source
        status
        autoAssign @since(version: "26.4.4")
        createdAt
        updatedAt
        scopeType @since(version: "26.9.0a4")
        scopeId @since(version: "26.9.0a4")
        # Aliases only where nullability differs: the manager caps a document
        # at 20 aliases and the list query carries every drawer fragment.
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
        rolePreset @since(version: "26.9.0rc1") {
          id
        }
        ...RoleAssignmentTabFragment
        ...RolePermissionSummaryTableFragment
      }
    `,
    roleNodeFrgmt,
  );

  const scopeName = resolveRBACScopeName(role);
  // Before 26.9.0rc1 a role does not name its preset, so the link falls back to the
  // kind in the name (`project_member-1a2b3c4d`); the last match beats a scope name.
  const roleKind = role.name?.match(/.*(admin|member)/i)?.[1]?.toLowerCase();
  const presetFilter = role.rolePreset
    ? { id: { equals: toLocalId(role.rolePreset.id) } }
    : {
        ...(role.scopeType && {
          scopeType: { equals: role.scopeType.toLowerCase() },
        }),
        ...(roleKind && { name: { iContains: roleKind } }),
      };

  return (
    <BAIFlex direction="column" gap="lg" align="stretch">
      <BAIFlex direction="column" align="start" gap="xxs">
        {/* Not an <h3>: Astryx has no copyable Heading, so the name renders as
            large text with the shared copy control, as in the other drawers. */}
        <BAIText strong copyable size="2xl">
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
            {role.scopeType ? (
              <BAIDoubleToken
                values={[
                  {
                    label: t(rbacTypeI18nKey(role.scopeType), {
                      defaultValue: role.scopeType,
                    }),
                    color: 'blue',
                  },
                  // The raw id stands in for a missing name, with a copy
                  // control since nobody retypes a uuid.
                  scopeName
                    ? { label: scopeName, color: 'default' }
                    : {
                        label: role.scopeId ?? '-',
                        color: 'default',
                        copyable: !!role.scopeId,
                      },
                ]}
              />
            ) : (
              '-'
            )}
          </MetadataListItem>
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
          <Tab value="permissions" label={t('rbac.Permissions')} />
          <Tab value="assignments" label={t('rbac.RoleAssignments')} />
        </TabList>
        {activeTab === 'permissions' && role.source === 'SYSTEM' && (
          <BAIAlert
            type="warning"
            showIcon
            title={t('rbac.SystemRolePermissionReadOnly')}
            action={
              <BAILink
                style={{
                  fontSize: 'var(--text-body-size)',
                  marginTop: 'var(--spacing-1)',
                }}
                to={`/admin/rbac?${new URLSearchParams({
                  tab: 'presets',
                  ...(!_.isEmpty(presetFilter) && {
                    filter: JSON.stringify(presetFilter),
                  }),
                }).toString()}`}
              >
                {t('rbac.ViewPresets')}
              </BAILink>
            }
          />
        )}
        <Suspense fallback={<BAISkeleton />}>
          {activeTab === 'permissions' && (
            <RolePermissionSummaryTable
              // Keyed by role: history navigation swaps the role without closing the drawer.
              key={role.id}
              roleNodeFrgmt={role}
              scopeName={scopeName}
              scopeId={role.scopeId ?? ''}
            />
          )}
          {activeTab === 'assignments' && (
            <RoleAssignmentTab roleNodeFrgmt={role} />
          )}
        </Suspense>
      </BAIFlex>
    </BAIFlex>
  );
};

export default RoleDetailDrawerContentV2;
