/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostPermissionPanelQuery } from '../__generated__/StorageHostPermissionPanelQuery.graphql';
import DomainStoragePermissionTable from './DomainStoragePermissionTable';
import KeypairResourcePolicyStoragePermissionTable from './KeypairResourcePolicyStoragePermissionTable';
import ProjectStoragePermissionTable from './ProjectStoragePermissionTable';
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

const StorageHostPermissionPanel: React.FC<StorageHostPermissionPanelProps> = ({
  storageHostId,
}) => {
  'use memo';
  const { t } = useTranslation();

  // Panel-level query for the canonical permission key list. Each card's
  // table then issues its own single-entity lazy query keyed on its select.
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

  const [selectedDomainName, setSelectedDomainName] = useState<
    string | undefined
  >();
  const [selectedProjectUuid, setSelectedProjectUuid] = useState<
    string | undefined
  >();
  const [selectedPolicyName, setSelectedPolicyName] = useState<
    string | undefined
  >();

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
          <BAIDomainSelect
            value={selectedDomainName}
            onChange={(value) => setSelectedDomainName(value)}
            style={{ width: 210 }}
          />
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <DomainStoragePermissionTable
          storageHostId={storageHostId}
          selectedDomainName={selectedDomainName}
          permissionKeys={permissionKeys}
          locale={{ emptyText: t('storageHost.permission.NoDomainSelected') }}
        />
      </BAICard>

      <BAICard
        title={t('storageHost.permission.Projects')}
        extra={
          <BAIAdminProjectSelect
            value={selectedProjectUuid}
            onChange={(value) => setSelectedProjectUuid(value)}
            style={{ width: 210 }}
          />
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <ProjectStoragePermissionTable
          storageHostId={storageHostId}
          selectedProjectUuid={selectedProjectUuid}
          permissionKeys={permissionKeys}
          locale={{ emptyText: t('storageHost.permission.NoProjectSelected') }}
        />
      </BAICard>

      <BAICard
        title={t('storageHost.permission.KeypairResourcePolicies')}
        extra={
          <BAIAdminKeypairResourcePolicySelect
            value={selectedPolicyName}
            onChange={(value) => setSelectedPolicyName(value)}
            style={{ width: 210 }}
          />
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <KeypairResourcePolicyStoragePermissionTable
          storageHostId={storageHostId}
          selectedPolicyName={selectedPolicyName}
          permissionKeys={permissionKeys}
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
