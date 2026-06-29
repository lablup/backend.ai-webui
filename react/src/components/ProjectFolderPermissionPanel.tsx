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
import { CheckCircleOutlined } from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAIAlert,
  BAICard,
  BAIDomainSelect,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  useFetchKey,
} from 'backend.ai-ui';
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
  const [selectedDomainName, setSelectedDomainName] = useState<
    string | undefined
  >(currentDomain);

  const [domainFetchKey, updateDomainFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(domainFetchKey);

  const queryVariables = {
    domainName: selectedDomainName ?? null,
    skipDomain: !selectedDomainName,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { domain } = useLazyLoadQuery<ProjectFolderPermissionPanelQuery>(
    graphql`
      query ProjectFolderPermissionPanelQuery(
        $domainName: String
        $skipDomain: Boolean!
      ) {
        domain(name: $domainName) @skip(if: $skipDomain) {
          ...DomainStoragePermissionTable_domainFrgmt
          ...ProjectStoragePermissionTable_domainFrgmt
        }
      }
    `,
    deferredQueryVariables,
    { fetchPolicy: 'store-and-network', fetchKey: deferredFetchKey },
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
        styles={{ body: { paddingTop: 0 } }}
      >
        <BAIFlex direction="column" align="stretch" gap="xs">
          <BAIFlex align="center" justify="between" gap="md" wrap="wrap">
            <BAIGraphQLPropertyFilter
              filterProperties={[
                {
                  key: 'domainName',
                  propertyLabel: t('storageHost.permission.Name'),
                  type: 'uuid',
                  fixedOperator: 'equals',
                  renderInput: () => (
                    <BAIDomainSelect
                      value={selectedDomainName}
                      onChange={(value) =>
                        setSelectedDomainName(
                          (value as string | undefined) || undefined,
                        )
                      }
                      allowClear
                      placeholder={t('storageHost.permission.SelectDomain')}
                      style={{ minWidth: 200 }}
                    />
                  ),
                },
              ]}
            />
            <BAIFetchKeyButton
              value={domainFetchKey}
              onChange={updateDomainFetchKey}
              loading={deferredFetchKey !== domainFetchKey}
            />
          </BAIFlex>
          <DomainStoragePermissionTable
            storageVolumeFrgmt={storageVolume}
            domainFrgmt={domain}
            permissionFrgmt={vfolder_host_permissions}
            onSaved={updateDomainFetchKey}
          />
        </BAIFlex>
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
          domainFrgmt={domain}
          permissionFrgmt={vfolder_host_permissions}
        />
      </BAICard>
    </BAIFlex>
  );
};

export default ProjectFolderPermissionPanel;
