/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePresetDetailDrawerFragment$key } from '../__generated__/RolePresetDetailDrawerFragment.graphql';
import { RolePresetDetailDrawerRefetchQuery } from '../__generated__/RolePresetDetailDrawerRefetchQuery.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import RolePresetPermissionTable from './RolePresetPermissionTable';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { Tab, TabList } from '@lablup/ui-common/TabList';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIAlert,
  BAICard,
  BAIDrawer,
  type BAIDrawerProps,
  BAIFetchKeyButton,
  BAIFlex,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  tokenColorForTagColor,
  useFetchKey,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useRefetchableFragment } from 'react-relay';

interface RolePresetDetailDrawerProps extends Omit<
  BAIDrawerProps,
  'title' | 'extra' | 'label' | 'size' | 'side' | 'children'
> {
  /** The preset selected in the list; the drawer issues no fetch of its own on open. */
  rolePresetFrgmt?: RolePresetDetailDrawerFragment$key | null;
}

const RolePresetDetailDrawer: React.FC<RolePresetDetailDrawerProps> = ({
  rolePresetFrgmt,
  open = false,
  onClose,
  ...drawerProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const [isPendingReload, startReloadTransition] = useTransition();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [activeTab, setActiveTab] = useState('permissions');

  // Keeps the last preset painted through the exit animation (same as RoleDetailDrawerV2).
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
        id
        name
        scopeType
        autoAssign
        deleted
        createdAt
        updatedAt
        ...RolePresetPermissionTableFragment
      }
    `,
    effectiveRolePresetFrgmt,
  );

  const rbacTypeLabel = (type: string) =>
    t(rbacTypeI18nKey(type), { defaultValue: type });

  return (
    <BAIDrawer
      {...drawerProps}
      open={open}
      onClose={onClose}
      side="end"
      size={800}
      title={t('rbac.RolePresetDetailInfo')}
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
        <BAIFlex direction="column" gap="lg" align="stretch">
          <BAIText strong copyable size="2xl">
            {rolePreset.name}
          </BAIText>
          <BAICard>
            <BAIMetadataList columns={md ? 2 : 1}>
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
              <MetadataListItem label={t('rbac.ScopeType')}>
                <Token
                  color={tokenColorForTagColor('blue')}
                  label={rbacTypeLabel(rolePreset.scopeType)}
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
          <BAIFlex direction="column" gap="sm" align="stretch">
            {/* Same tab strip as the role drawer, minus Role Assignments: a preset has no users. */}
            <TabList hasDivider value={activeTab} onChange={setActiveTab}>
              <Tab value="permissions" label={t('rbac.Permissions')} />
            </TabList>
            <BAIAlert
              type="warning"
              showIcon
              title={t('rbac.PresetPermissionSyncWarning')}
            />
            <Suspense fallback={<BAISkeleton />}>
              {activeTab === 'permissions' && (
                <RolePresetPermissionTable
                  // Keyed by preset: history navigation swaps the preset without closing the drawer.
                  key={rolePreset.id}
                  rolePresetFrgmt={rolePreset}
                />
              )}
            </Suspense>
          </BAIFlex>
        </BAIFlex>
      )}
    </BAIDrawer>
  );
};

export default RolePresetDetailDrawer;
