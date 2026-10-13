/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectFolderPermissionPanelPermissionQuery } from '../__generated__/ProjectFolderPermissionPanelPermissionQuery.graphql';
import { ProjectFolderPermissionPanelQuery } from '../__generated__/ProjectFolderPermissionPanelQuery.graphql';
import { ProjectFolderPermissionPanel_storageVolumeFrgmt$key } from '../__generated__/ProjectFolderPermissionPanel_storageVolumeFrgmt.graphql';
import { useCurrentDomainValue } from '../hooks';
import DomainStoragePermissionTable from './DomainStoragePermissionTable';
import ProjectStoragePermissionTable from './ProjectStoragePermissionTable';
import { Banner } from '@lablup/ui-common/Banner';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  useFetchKey,
} from 'backend.ai-ui';
import { CircleCheck } from 'lucide-react';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface ProjectFolderPermissionPanelProps {
  storageVolumeFrgmt: ProjectFolderPermissionPanel_storageVolumeFrgmt$key;
}

/**
 * "Project Folder Permissions" tab. Permissions applied to project folders are
 * the union of the current domain's grants and each project's own grants
 * (a project belongs to a domain and inherits its host permissions).
 *
 * The current domain's permission set is fetched HERE (single source of
 * truth) and passed to both the domain row and the project table, so editing
 * the domain re-computes every project row's effective (unioned) permission
 * without coupling the two sibling tables through a callback.
 */
const ProjectFolderPermissionPanel: React.FC<
  ProjectFolderPermissionPanelProps
> = ({ storageVolumeFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();

  const storageVolume = useFragment(
    graphql`
      fragment ProjectFolderPermissionPanel_storageVolumeFrgmt on StorageVolume {
        ...DomainStoragePermissionTable_storageVolumeFrgmt
        ...ProjectStoragePermissionTable_storageVolumeFrgmt
      }
    `,
    storageVolumeFrgmt,
  );

  const { vfolder_host_permissions } =
    useLazyLoadQuery<ProjectFolderPermissionPanelPermissionQuery>(
      graphql`
        query ProjectFolderPermissionPanelPermissionQuery {
          vfolder_host_permissions {
            ...DomainStoragePermissionTable_permissionFrgmt
            ...ProjectStoragePermissionTable_permissionFrgmt
          }
        }
      `,
      {},
      { fetchPolicy: 'store-or-network' },
    );

  const currentDomain = useCurrentDomainValue();

  const [domainFetchKey, updateDomainFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(domainFetchKey);

  const { domain } = useLazyLoadQuery<ProjectFolderPermissionPanelQuery>(
    graphql`
      query ProjectFolderPermissionPanelQuery($domainName: String) {
        domain(name: $domainName) {
          ...DomainStoragePermissionTable_domainFrgmt
          ...ProjectStoragePermissionTable_domainFrgmt
        }
      }
    `,
    { domainName: currentDomain },
    { fetchPolicy: 'store-and-network', fetchKey: deferredFetchKey },
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      {/* antd Alert type="info" showIcon description → Banner (MAPPING §4).
          `showIcon` drops (Banner always shows the status icon); the single
          `description` string becomes `title` since Banner requires one. */}
      <Banner
        status="info"
        title={t(
          'storageHost.permission.ProjectFolderPermissionsAlertDescription',
        )}
      />

      <BAICard
        title={t('storageHost.permission.Domains')}
        extra={
          <BAIFetchKeyButton
            value={domainFetchKey}
            onChange={updateDomainFetchKey}
            loading={deferredFetchKey !== domainFetchKey}
          />
        }
      >
        <DomainStoragePermissionTable
          storageVolumeFrgmt={storageVolume}
          domainFrgmt={domain}
          permissionFrgmt={vfolder_host_permissions}
          onSaved={updateDomainFetchKey}
        />
      </BAICard>

      <BAICard
        title={t('storageHost.permission.Projects')}
        extra={
          <BAIFlex gap="sm" align="center" wrap="wrap">
            <BAIFlex gap="xxs" align="center">
              <CircleCheck
                style={{ color: token('--color-success') }}
                size="1em"
              />
              <Text color="secondary" size="xsm">
                {t('storageHost.permission.LegendProject')}
              </Text>
            </BAIFlex>
            <BAIFlex gap="xxs" align="center">
              <CircleCheck
                style={{ color: token('--preset-purple-5') }}
                size="1em"
              />
              <Text color="secondary" size="xsm">
                {t('storageHost.permission.LegendInherited')}
              </Text>
            </BAIFlex>
          </BAIFlex>
        }
        styles={{ body: { paddingTop: 0 } }}
      >
        <ProjectStoragePermissionTable
          storageVolumeFrgmt={storageVolume}
          domainFrgmt={domain}
          permissionFrgmt={vfolder_host_permissions}
          loading={deferredFetchKey !== domainFetchKey}
        />
      </BAICard>
    </BAIFlex>
  );
};

export default ProjectFolderPermissionPanel;
