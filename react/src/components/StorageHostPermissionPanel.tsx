/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostPermissionPanelQuery } from '../__generated__/StorageHostPermissionPanelQuery.graphql';
import DomainStoragePermissionTable from './DomainStoragePermissionTable';
import KeypairResourcePolicyStoragePermissionTable from './KeypairResourcePolicyStoragePermissionTable';
import ProjectStoragePermissionTable from './ProjectStoragePermissionTable';
import { Typography, theme } from 'antd';
import {
  BAIAdminKeypairResourcePolicySelect,
  BAIAdminProjectSelect,
  BAIAlert,
  BAICard,
  BAIDomainSelect,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface StorageHostPermissionPanelProps {
  storageHostId: string;
}

/**
 * Maximum number of entities a single permission card may show at once. The
 * cap exists for two reasons: (a) the V2 list-with-filter queries
 * (`adminProjectsV2` / `adminKeypairResourcePoliciesV2`) are paged and we want
 * to avoid hidden pagination here, and (b) reviewing more than ~10 rows of
 * permission matrices in one card defeats the purpose of the per-entity
 * inspection UX.
 */
const MAX_SELECTION = 10;

const StorageHostPermissionPanel: React.FC<StorageHostPermissionPanelProps> = ({
  storageHostId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  // Panel-level query for the canonical permission key list. Each card's
  // table then issues its own list-with-filter lazy query keyed on the card's
  // multi-select.
  const { vfolder_host_permissions } =
    useLazyLoadQuery<StorageHostPermissionPanelQuery>(
      graphql`
        query StorageHostPermissionPanelQuery {
          vfolder_host_permissions {
            vfolder_host_permission_list
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );
  const permissionKeys: string[] = _.compact(
    vfolder_host_permissions?.vfolder_host_permission_list ?? [],
  );

  const [selectedDomainNames, setSelectedDomainNames] = useState<string[]>([]);
  const [selectedProjectUuids, setSelectedProjectUuids] = useState<string[]>(
    [],
  );
  const [selectedPolicyNames, setSelectedPolicyNames] = useState<string[]>([]);

  // The select itself does not prevent the user from picking an 11th item —
  // it just goes into an error state, and the corresponding table caps its
  // fetched dataSource at `MAX_SELECTION` so over-selection never bloats the
  // network or the rendered DOM. Clearing one selection brings the count
  // back under the limit and the error state goes away.
  const renderLimitMessage = (count: number) =>
    count > MAX_SELECTION ? (
      <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM }}>
        {t('storageHost.permission.SelectionLimitExceeded', {
          max: MAX_SELECTION,
        })}
      </Typography.Text>
    ) : null;

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIAlert
        type="info"
        showIcon
        description={t('storageHost.permission.EffectivePermissionsNote')}
      />

      <BAICard
        title={t('storageHost.permission.Domains')}
        extra={
          <BAIFlex direction="column" align="end" gap="xxs">
            <BAIDomainSelect
              mode="multiple"
              maxTagCount="responsive"
              value={selectedDomainNames}
              onChange={(value) =>
                setSelectedDomainNames((value as string[]) ?? [])
              }
              status={
                selectedDomainNames.length > MAX_SELECTION ? 'error' : undefined
              }
              style={{ width: 320 }}
            />
            {renderLimitMessage(selectedDomainNames.length)}
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <DomainStoragePermissionTable
          storageHostId={storageHostId}
          selectedDomainNames={selectedDomainNames.slice(0, MAX_SELECTION)}
          permissionKeys={permissionKeys}
          onDeselectItem={(name) =>
            setSelectedDomainNames((prev) => prev.filter((n) => n !== name))
          }
          locale={{ emptyText: t('storageHost.permission.NoDomainSelected') }}
        />
      </BAICard>

      <BAICard
        title={t('storageHost.permission.Projects')}
        extra={
          <BAIFlex direction="column" align="end" gap="xxs">
            <BAIAdminProjectSelect
              mode="multiple"
              maxTagCount="responsive"
              value={selectedProjectUuids}
              onChange={(value) =>
                setSelectedProjectUuids((value as string[]) ?? [])
              }
              status={
                selectedProjectUuids.length > MAX_SELECTION
                  ? 'error'
                  : undefined
              }
              style={{ width: 320 }}
            />
            {renderLimitMessage(selectedProjectUuids.length)}
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <ProjectStoragePermissionTable
          storageHostId={storageHostId}
          selectedProjectUuids={selectedProjectUuids.slice(0, MAX_SELECTION)}
          permissionKeys={permissionKeys}
          onDeselectItem={(uuid) =>
            setSelectedProjectUuids((prev) => prev.filter((u) => u !== uuid))
          }
          locale={{ emptyText: t('storageHost.permission.NoProjectSelected') }}
        />
      </BAICard>

      <BAICard
        title={t('storageHost.permission.KeypairResourcePolicies')}
        extra={
          <BAIFlex direction="column" align="end" gap="xxs">
            <BAIAdminKeypairResourcePolicySelect
              mode="multiple"
              maxTagCount="responsive"
              value={selectedPolicyNames}
              onChange={(value) =>
                setSelectedPolicyNames((value as string[]) ?? [])
              }
              status={
                selectedPolicyNames.length > MAX_SELECTION ? 'error' : undefined
              }
              style={{ width: 320 }}
            />
            {renderLimitMessage(selectedPolicyNames.length)}
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <KeypairResourcePolicyStoragePermissionTable
          storageHostId={storageHostId}
          selectedPolicyNames={selectedPolicyNames.slice(0, MAX_SELECTION)}
          permissionKeys={permissionKeys}
          onDeselectItem={(name) =>
            setSelectedPolicyNames((prev) => prev.filter((n) => n !== name))
          }
          locale={{
            emptyText: t(
              'storageHost.permission.NoKeypairResourcePolicySelected',
            ),
          }}
        />
      </BAICard>
    </BAIFlex>
  );
};

export default StorageHostPermissionPanel;
