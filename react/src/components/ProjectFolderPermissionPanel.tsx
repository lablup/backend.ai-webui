/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectFolderPermissionPanelQuery } from '../__generated__/ProjectFolderPermissionPanelQuery.graphql';
import { ProjectFolderPermissionPanel_storageVolumeFrgmt$key } from '../__generated__/ProjectFolderPermissionPanel_storageVolumeFrgmt.graphql';
import { useCurrentDomainValue } from '../hooks';
import DomainStoragePermissionTable from './DomainStoragePermissionTable';
import ProjectStoragePermissionTable from './ProjectStoragePermissionTable';
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAIAlert,
  BAICard,
  BAIDomainSelect,
  BAIFlex,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ProjectFolderPermissionPanelProps {
  storageVolumeFrgmt: ProjectFolderPermissionPanel_storageVolumeFrgmt$key;
}

/**
 * "Project Folder Permissions" tab. Permissions applied to project folders are
 * the union of the selected domain's grants and each project's own grants
 * (a project belongs to a domain and inherits its host permissions).
 *
 * The selected domain's permission set is fetched HERE (single source of
 * truth) and passed to both the domain row and the project table, so editing
 * the domain re-computes every project row's effective (unioned) permission
 * without coupling the two sibling tables through a callback.
 */
const ProjectFolderPermissionPanel: React.FC<
  ProjectFolderPermissionPanelProps
> = ({ storageVolumeFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const storageVolume = useFragment(
    graphql`
      fragment ProjectFolderPermissionPanel_storageVolumeFrgmt on StorageVolume {
        ...DomainStoragePermissionTable_storageVolumeFrgmt
        ...ProjectStoragePermissionTable_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  // Default to the current domain so the tab shows its folder permissions on
  // open; the user can still switch to or clear the selection.
  const currentDomain = useCurrentDomainValue();
  const [selectedDomainName, setSelectedDomainName] = useState<
    string | undefined
  >(currentDomain);

  // Bump after a domain permission save so the domain row AND the project
  // union both refetch from the single panel-level query.
  const [domainFetchKey, bumpDomainFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(domainFetchKey);

  const queryVariables = {
    domainName: selectedDomainName ?? null,
    skipDomain: !selectedDomainName,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  // Fetch only the selected domain (skipped until one is picked) and hand its
  // fragment to both tables; each reads what it needs (the domain row, and the
  // project union / inherited host-allowed status).
  const data = useLazyLoadQuery<ProjectFolderPermissionPanelQuery>(
    graphql`
      query ProjectFolderPermissionPanelQuery(
        $domainName: String
        $skipDomain: Boolean!
      ) {
        vfolder_host_permissions {
          vfolder_host_permission_list
        }
        domain(name: $domainName) @skip(if: $skipDomain) {
          ...DomainStoragePermissionTable_domainFrgmt
          ...ProjectStoragePermissionTable_domainFrgmt
        }
      }
    `,
    deferredQueryVariables,
    { fetchPolicy: 'store-and-network', fetchKey: deferredFetchKey },
  );

  const permissionKeys: string[] = _.compact(
    data.vfolder_host_permissions?.vfolder_host_permission_list ?? [],
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIAlert
        type="info"
        showIcon
        description={t(
          'storageHost.permission.ProjectFolderPermissionsAlertDescription',
        )}
      />

      <BAICard
        title={t('storageHost.permission.Domains')}
        extra={
          <BAIDomainSelect
            value={selectedDomainName}
            onChange={(value) =>
              setSelectedDomainName((value as string | undefined) || undefined)
            }
            allowClear
            placeholder={t('storageHost.permission.SelectDomain')}
            style={{ width: 320 }}
          />
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <DomainStoragePermissionTable
          storageVolumeFrgmt={storageVolume}
          domainFrgmt={data.domain}
          permissionKeys={permissionKeys}
          onSaved={bumpDomainFetchKey}
        />
      </BAICard>

      <BAICard
        title={t('storageHost.permission.Projects')}
        extra={
          <BAIFlex gap="sm" align="center" wrap="wrap">
            <BAIFlex gap="xxs" align="center">
              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('storageHost.permission.LegendProject')}
              </Typography.Text>
            </BAIFlex>
            <BAIFlex gap="xxs" align="center">
              <CheckCircleOutlined style={{ color: token.purple5 }} />
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('storageHost.permission.LegendInherited')}
              </Typography.Text>
            </BAIFlex>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <ProjectStoragePermissionTable
          storageVolumeFrgmt={storageVolume}
          selectedDomainName={selectedDomainName}
          domainFrgmt={data.domain}
          permissionKeys={permissionKeys}
        />
      </BAICard>
    </BAIFlex>
  );
};

export default ProjectFolderPermissionPanel;
