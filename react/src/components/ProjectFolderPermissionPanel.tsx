/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectFolderPermissionPanelPermissionQuery } from '../__generated__/ProjectFolderPermissionPanelPermissionQuery.graphql';
import { ProjectFolderPermissionPanelQuery } from '../__generated__/ProjectFolderPermissionPanelQuery.graphql';
import { ProjectFolderPermissionPanel_storageVolumeFrgmt$key } from '../__generated__/ProjectFolderPermissionPanel_storageVolumeFrgmt.graphql';
import { useCurrentDomainValue } from '../hooks';
import { theme } from '../theme-shim';
import DomainStoragePermissionTable from './DomainStoragePermissionTable';
import ProjectStoragePermissionTable from './ProjectStoragePermissionTable';
import { Space, Typography } from 'antd';
import {
  BAIAlert,
  BAICard,
  BAIDomainSelect,
  BAIFetchKeyButton,
  BAIFlex,
  BAISelect,
  useFetchKey,
} from 'backend.ai-ui';
import { CircleCheck } from 'lucide-react';
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
            {/* The domain picker drives this panel's own query state rather
                than a GraphQL filter, so it is a plain compact pair (label
                select + domain select) instead of BAIGraphQLPropertyFilter,
                whose renderInput contract expects stateless controls committing
                via onAddCondition (FR-3405). */}
            <Space.Compact>
              <BAISelect
                popupMatchSelectWidth={false}
                options={[
                  {
                    label: t('storageHost.permission.Name'),
                    value: 'domainName',
                  },
                ]}
                value="domainName"
                style={{ minWidth: 150 }}
              />
              <BAIDomainSelect
                value={selectedDomainName ?? null}
                onChange={(value) =>
                  setSelectedDomainName(
                    (value as string | undefined) || undefined,
                  )
                }
                allowClear
                style={{ minWidth: 200 }}
              />
            </Space.Compact>
            <BAIFetchKeyButton
              value={domainFetchKey}
              onChange={updateDomainFetchKey}
              loading={
                deferredFetchKey !== domainFetchKey ||
                deferredQueryVariables !== queryVariables
              }
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
              <CircleCheck style={{ color: token.colorSuccess }} size="1em" />
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('storageHost.permission.LegendProject')}
              </Typography.Text>
            </BAIFlex>
            <BAIFlex gap="xxs" align="center">
              <CircleCheck style={{ color: token.purple5 }} size="1em" />
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
          loading={
            deferredFetchKey !== domainFetchKey ||
            deferredQueryVariables !== queryVariables
          }
        />
      </BAICard>
    </BAIFlex>
  );
};

export default ProjectFolderPermissionPanel;
