/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DomainStoragePermissionTableModifyDomainMutation } from '../__generated__/DomainStoragePermissionTableModifyDomainMutation.graphql';
import { DomainStoragePermissionTable_domainFrgmt$key } from '../__generated__/DomainStoragePermissionTable_domainFrgmt.graphql';
import { DomainStoragePermissionTable_storageVolumeFrgmt$key } from '../__generated__/DomainStoragePermissionTable_storageVolumeFrgmt.graphql';
import {
  PERMISSION_DISPLAY_MAP,
  buildAllowedHostsPayload,
  parseAllowedHosts,
} from '../helper/storageHostPermission';
import StoragePermissionEditModal from './StoragePermissionEditModal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAINameActionCell,
  BAITable,
  type BAITableProps,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DomainRow {
  name: string;
  allowed_vfolder_hosts: string | null | undefined;
}

export interface DomainStoragePermissionTableProps extends BAITableProps<DomainRow> {
  /** Fragment for the storage host — its `id` is read internally. */
  storageVolumeFrgmt: DomainStoragePermissionTable_storageVolumeFrgmt$key;
  /**
   * Fragment for the selected domain (name + `allowed_vfolder_hosts`), read
   * internally. The parent owns the query (single source of truth, so the
   * sibling project table's union recomputes when this domain is edited).
   * Null/undefined renders the empty (select-a-domain) state.
   */
  domainFrgmt: DomainStoragePermissionTable_domainFrgmt$key | null | undefined;
  /** Canonical permission key list (driven by `vfolder_host_permissions`). */
  permissionKeys: string[];
  /** Called after a successful save so the parent can refetch the domain. */
  onSaved?: () => void;
}

const DomainStoragePermissionTable: React.FC<
  DomainStoragePermissionTableProps
> = ({
  storageVolumeFrgmt,
  domainFrgmt,
  permissionKeys,
  onSaved,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const storageVolume = useFragment(
    graphql`
      fragment DomainStoragePermissionTable_storageVolumeFrgmt on StorageVolume {
        id
      }
    `,
    storageVolumeFrgmt,
  );
  const storageHostId = storageVolume?.id ?? '';

  const domain = useFragment(
    graphql`
      fragment DomainStoragePermissionTable_domainFrgmt on Domain {
        name
        allowed_vfolder_hosts
      }
    `,
    domainFrgmt ?? null,
  );

  const [commitModifyDomain] =
    useMutation<DomainStoragePermissionTableModifyDomainMutation>(graphql`
      mutation DomainStoragePermissionTableModifyDomainMutation(
        $name: String!
        $props: ModifyDomainInput!
      ) {
        modify_domain(name: $name, props: $props) {
          ok
          msg
        }
      }
    `);

  const domainName = domain?.name ?? undefined;
  const allowedVfolderHostsRaw = domain?.allowed_vfolder_hosts;
  const parsed = parseAllowedHosts(allowedVfolderHostsRaw);
  const enabledSet = new Set(parsed[storageHostId] ?? []);

  const rows: DomainRow[] = domainName
    ? [{ name: domainName, allowed_vfolder_hosts: allowedVfolderHostsRaw }]
    : [];

  const handleSave = async (
    enabledKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    if (!domainName) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayload(
      allowedVfolderHostsRaw,
      storageHostId,
      enabledKeys,
    );
    return new Promise((resolve) => {
      commitModifyDomain({
        variables: {
          name: domainName,
          props: { allowed_vfolder_hosts: payload },
        },
        onCompleted: (res, errors) => {
          if (errors?.length || !res?.modify_domain?.ok) {
            resolve({ ok: false, msg: res?.modify_domain?.msg });
          } else {
            onSaved?.();
            resolve({ ok: true });
          }
        },
        onError: (err) => resolve({ ok: false, msg: err?.message }),
      });
    });
  };

  return (
    <>
      <BAITable
        size="small"
        scroll={{ x: 'max-content' }}
        {...tableProps}
        locale={{ emptyText: t('storageHost.permission.NoDomainSelected') }}
        rowKey="name"
        resizable={false}
        pagination={false}
        dataSource={rows}
        columns={[
          {
            title: t('storageHost.permission.Name'),
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            render: (name: string) => (
              <BAINameActionCell
                title={
                  <Typography.Text
                    ellipsis={{ tooltip: name }}
                    style={{ maxWidth: 160 }}
                  >
                    {name}
                  </Typography.Text>
                }
                showActions="always"
                actions={[
                  {
                    key: 'edit',
                    title: t('storageHost.permission.EditPermissionsAction'),
                    icon: <SettingOutlined />,
                    onClick: () => setIsEditing(true),
                  },
                ]}
              />
            ),
          },
          ...permissionKeys.map((permKey) => {
            const display = PERMISSION_DISPLAY_MAP[permKey];
            return {
              title: display ? t(display.labelKey) : permKey,
              key: permKey,
              align: 'center' as const,
              render: () =>
                enabledSet.has(permKey) ? (
                  <CheckCircleOutlined style={{ color: token.purple5 }} />
                ) : (
                  <CloseCircleOutlined
                    style={{ color: token.colorTextDisabled }}
                  />
                ),
            };
          }),
        ]}
      />
      <BAIUnmountAfterClose>
        <StoragePermissionEditModal
          open={isEditing}
          permissionKeys={permissionKeys}
          targets={
            domainName
              ? [{ id: domainName, name: domainName, enabled: enabledSet }]
              : []
          }
          onRequestClose={() => setIsEditing(false)}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DomainStoragePermissionTable;
