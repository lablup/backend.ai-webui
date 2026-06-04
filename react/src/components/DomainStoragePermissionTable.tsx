/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DomainStoragePermissionTableModifyDomainMutation } from '../__generated__/DomainStoragePermissionTableModifyDomainMutation.graphql';
import { DomainStoragePermissionTableQuery as DomainStoragePermissionTableQueryType } from '../__generated__/DomainStoragePermissionTableQuery.graphql';
import {
  PERMISSION_DISPLAY_MAP,
  buildAllowedHostsPayload,
  parseAllowedHosts,
} from '../helper/storageHostPermission';
import StoragePermissionEditModal from './StoragePermissionEditModal';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditFilled,
} from '@ant-design/icons';
import { Typography, theme } from 'antd';
import {
  BAIFlex,
  BAINameActionCell,
  BAITable,
  type BAITableProps,
  BAIUnmountAfterClose,
  useFetchKey,
} from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DomainRow = NonNullable<
  DomainStoragePermissionTableQueryType['response']['domain']
>;

export interface DomainStoragePermissionTableProps extends BAITableProps<DomainRow> {
  storageHostId: string;
  /** Domain name picked via `BAIDomainSelect`. Undefined keeps the query skipped. */
  selectedDomainName?: string;
  /** Canonical permission key list (driven by `vfolder_host_permissions`). */
  permissionKeys: string[];
}

const DomainStoragePermissionTable: React.FC<
  DomainStoragePermissionTableProps
> = ({ storageHostId, selectedDomainName, permissionKeys, ...tableProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);

  // Bump on successful save to re-fetch the (otherwise cached) entity so the
  // table reflects the new permissions immediately. Deferred so the previous
  // row stays visible while the new data loads.
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  // Defer query variables so a scope switch keeps the previous row visible
  // (with `loading` spinner) instead of falling through to a Suspense
  // fallback for one render.
  const queryVariables = {
    name: selectedDomainName ?? '',
    skip: !selectedDomainName,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { domain } = useLazyLoadQuery<DomainStoragePermissionTableQueryType>(
    graphql`
      query DomainStoragePermissionTableQuery($name: String!, $skip: Boolean!) {
        domain(name: $name) @skip(if: $skip) {
          name
          allowed_vfolder_hosts
        }
      }
    `,
    deferredQueryVariables,
    {
      // `@skip` alone still issues the request; pair with `store-only` to
      // suppress the network call entirely when nothing is picked.
      fetchPolicy: deferredQueryVariables.skip ? 'store-only' : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  // V1 path: the JSON has a key for every host the domain is allowed on. An
  // absent key means the host is not allowed at all; an empty array means
  // allowed with zero permissions granted yet. Distinguish via `in`.
  const parsedHosts = parseAllowedHosts(domain?.allowed_vfolder_hosts);
  const isHostAllowed = storageHostId in parsedHosts;
  const enabledKeys = parsedHosts[storageHostId] ?? [];
  const enabledSet = new Set(enabledKeys);

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

  const handleSave = async (
    newKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    const domainName = domain?.name;
    if (!domainName) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayload(
      domain?.allowed_vfolder_hosts,
      storageHostId,
      newKeys,
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
            // Refetch so the table reflects the just-saved permissions.
            // `modify_domain` returns only `{ ok, msg }`, so Relay can't
            // auto-update the cached `domain(name)` entry — we have to
            // re-issue the read query.
            updateFetchKey();
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
        rowKey="name"
        resizable={false}
        pagination={false}
        loading={queryVariables !== deferredQueryVariables}
        dataSource={domain ? [domain] : []}
        columns={[
          {
            title: t('storageHost.permission.Name'),
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 220,
            render: (name: string) => (
              <BAIFlex direction="column" align="start" gap="xxs">
                <BAINameActionCell
                  title={name}
                  showActions="always"
                  actions={[
                    {
                      key: 'edit',
                      title: t('storageHost.permission.EditPermissionsAction'),
                      icon: <EditFilled />,
                      onClick: () => setIsEditOpen(true),
                    },
                  ]}
                />
                <BAIFlex gap="xxs" align="center">
                  {isHostAllowed ? (
                    <>
                      <CheckCircleOutlined
                        style={{ color: token.colorSuccess }}
                      />
                      <Typography.Text type="secondary">
                        {t('storageHost.permission.HostAllowed')}
                      </Typography.Text>
                    </>
                  ) : (
                    <>
                      <CloseCircleOutlined
                        style={{ color: token.colorError }}
                      />
                      <Typography.Text type="secondary">
                        {t('storageHost.permission.HostNotAllowed')}
                      </Typography.Text>
                    </>
                  )}
                </BAIFlex>
              </BAIFlex>
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
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
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
          open={isEditOpen}
          title={t('storageHost.permission.EditPermissions', {
            name: domain?.name ?? '',
          })}
          permissionKeys={permissionKeys}
          initialEnabled={enabledSet}
          onRequestClose={() => setIsEditOpen(false)}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DomainStoragePermissionTable;
