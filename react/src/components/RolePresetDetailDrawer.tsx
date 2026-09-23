/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePresetDetailDrawerFragment$key } from '../__generated__/RolePresetDetailDrawerFragment.graphql';
import { RolePresetDetailDrawerRefetchQuery } from '../__generated__/RolePresetDetailDrawerRefetchQuery.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import {
  BAICard,
  BAIDrawer,
  BAIFetchKeyButton,
  BAIFlex,
  BAIMetadataList,
  BAITable,
  BAIText,
  tokenColorForTagColor,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

// The order the permission bits are listed in, matching the role permission grid.
const PERMISSION_BIT_ORDER = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
];

interface RolePresetDetailDrawerProps {
  open?: boolean;
  onClose?: () => void;
  /** The preset selected in the list; the drawer issues no fetch of its own on open. */
  rolePresetFrgmt?: RolePresetDetailDrawerFragment$key | null;
}

const RolePresetDetailDrawer: React.FC<RolePresetDetailDrawerProps> = ({
  rolePresetFrgmt,
  open = false,
  onClose,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();

  // Keeps the last preset painted while the drawer animates out after the
  // parent clears its selection (same as RoleDetailDrawer).
  const [lastRolePresetFrgmt, setLastRolePresetFrgmt] =
    useState<RolePresetDetailDrawerFragment$key | null>(
      rolePresetFrgmt ?? null,
    );
  if (rolePresetFrgmt && rolePresetFrgmt !== lastRolePresetFrgmt) {
    setLastRolePresetFrgmt(rolePresetFrgmt);
  }
  const effectiveRolePresetFrgmt = rolePresetFrgmt ?? lastRolePresetFrgmt;

  const [rolePreset, refetch] = useRefetchableFragment<
    RolePresetDetailDrawerRefetchQuery,
    RolePresetDetailDrawerFragment$key
  >(
    graphql`
      fragment RolePresetDetailDrawerFragment on RolePreset
      @refetchable(queryName: "RolePresetDetailDrawerRefetchQuery") {
        name
        scopeType
        autoAssign
        deleted
        createdAt
        updatedAt
        # Without a limit the manager answers only the first 10 entries.
        permissionEntries: permissionPresets(limit: 500) {
          count
          edges {
            node {
              id
              entityType
              permission
            }
          }
        }
      }
    `,
    effectiveRolePresetFrgmt,
  );

  const rbacTypeLabel = (type: string) =>
    t(rbacTypeI18nKey(type), { defaultValue: type });

  const permissionsByEntityType = _.groupBy(
    (rolePreset?.permissionEntries?.edges ?? []).map((edge) => edge.node),
    (node) => node.entityType,
  );
  const permissionRows = _.sortBy(
    Object.entries(permissionsByEntityType).map(([entityType, nodes]) => ({
      entityType,
      permissions: _.sortBy(
        _.uniq(nodes.map((node) => node.permission as string)),
        (permission) => PERMISSION_BIT_ORDER.indexOf(permission),
      ),
    })),
    (row) => rbacTypeLabel(row.entityType),
  );

  return (
    <BAIDrawer
      open={open}
      onClose={onClose}
      side="end"
      size={736}
      label={t('rbac.RolePresetDetailInfo')}
      title={
        <BAIText
          strong
          copyable
          style={{
            fontSize: 'var(--text-large-size)',
            lineHeight: 'var(--text-large-leading)',
          }}
        >
          {rolePreset?.name ?? t('rbac.RolePresetDetailInfo')}
        </BAIText>
      }
      extra={
        <BAIFetchKeyButton
          loading={isPendingReload}
          value={fetchKey}
          onChange={(newFetchKey) => {
            if (!rolePreset) return;
            startReloadTransition(() => {
              updateFetchKey(newFetchKey);
              refetch({}, { fetchPolicy: 'network-only' });
            });
          }}
        />
      }
    >
      {rolePreset && (
        <BAIFlex direction="column" gap="sm" align="stretch">
          <BAICard>
            <BAIMetadataList
              columns={2}
              label={{ position: 'start', width: 160 }}
            >
              <MetadataListItem label={t('rbac.ScopeType')}>
                <Token
                  color={tokenColorForTagColor('blue')}
                  label={rbacTypeLabel(rolePreset.scopeType)}
                />
              </MetadataListItem>
              <MetadataListItem label={t('rbac.Status')}>
                <Token
                  color={tokenColorForTagColor(
                    rolePreset.deleted ? 'default' : 'green',
                  )}
                  label={
                    rolePreset.deleted ? t('rbac.Deleted') : t('rbac.Active')
                  }
                />
              </MetadataListItem>
              <MetadataListItem label={t('rbac.AutoAssign')}>
                <Token
                  color={tokenColorForTagColor(
                    rolePreset.autoAssign ? 'green' : 'default',
                  )}
                  label={
                    rolePreset.autoAssign
                      ? t('general.Active')
                      : t('general.Inactive')
                  }
                />
              </MetadataListItem>
              <MetadataListItem label={t('general.CreatedAt')}>
                {dayjs(rolePreset.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </MetadataListItem>
              <MetadataListItem label={t('general.UpdatedAt')}>
                {dayjs(rolePreset.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
              </MetadataListItem>
            </BAIMetadataList>
          </BAICard>
          <BAICard title={t('rbac.Permissions')}>
            <BAITable
              rowKey="entityType"
              dataSource={permissionRows}
              pagination={false}
              locale={{ emptyText: t('rbac.NoPermissionsToDisplay') }}
              columns={[
                {
                  key: 'entityType',
                  title: t('rbac.PermissionType'),
                  render: (_value, row) => (
                    <Text>{rbacTypeLabel(row.entityType)}</Text>
                  ),
                },
                {
                  key: 'permissions',
                  title: t('rbac.Permission'),
                  render: (_value, row) => (
                    <BAIFlex gap="xxs" wrap="wrap">
                      {row.permissions.map((permission) => (
                        <Token
                          key={permission}
                          color={tokenColorForTagColor('default')}
                          label={t(`rbac.operations.${permission}`, {
                            defaultValue: permission,
                          })}
                        />
                      ))}
                    </BAIFlex>
                  ),
                },
              ]}
            />
          </BAICard>
        </BAIFlex>
      )}
    </BAIDrawer>
  );
};

export default RolePresetDetailDrawer;
