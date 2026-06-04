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
  MinusCircleOutlined,
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
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DomainRow = NonNullable<
  NonNullable<
    DomainStoragePermissionTableQueryType['response']['domains']
  >[number]
>;

export interface DomainStoragePermissionTableProps extends BAITableProps<DomainRow> {
  storageHostId: string;
  /**
   * Names picked via `BAIDomainSelect` (multi-mode). Empty array keeps the
   * query skipped — `@skip` + `store-only` suppresses the network entirely.
   *
   * V1 `domains` has no name filter, so when at least one name is picked we
   * fetch the full active-domains list and client-filter to the selection.
   * Backend.AI domain counts are small (typically <20) so the cost is
   * negligible.
   *
   * TODO(DomainV2): when `DomainV2` adds `allowedVfolderHosts`, switch this
   *   table to `domainsV2(filter: { name: { in: $names } })` for parity with
   *   the Project / KRP tables (which already use V2 list-with-filter).
   */
  selectedDomainNames: string[];
  /** Canonical permission key list (driven by `vfolder_host_permissions`). */
  permissionKeys: string[];
  /**
   * Called when the user clicks the row's deselect action. The panel should
   * remove the name from its `selectedDomainNames` array, which causes the
   * row to disappear on next render.
   */
  onDeselectItem?: (name: string) => void;
}

const DomainStoragePermissionTable: React.FC<
  DomainStoragePermissionTableProps
> = ({
  storageHostId,
  selectedDomainNames,
  permissionKeys,
  onDeselectItem,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [editingRow, setEditingRow] = useState<DomainRow | null>(null);

  // Bump on successful save to re-fetch so the table reflects new permissions.
  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryVariables = { skip: selectedDomainNames.length === 0 };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { domains } = useLazyLoadQuery<DomainStoragePermissionTableQueryType>(
    graphql`
      query DomainStoragePermissionTableQuery($skip: Boolean!) {
        domains(is_active: true) @skip(if: $skip) {
          name
          allowed_vfolder_hosts
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchPolicy: deferredQueryVariables.skip ? 'store-only' : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  // Client-side filter to the multi-selected names, ordered by the selection
  // order so the user sees rows in the order they picked.
  const deferredSelectedNames = useDeferredValue(selectedDomainNames);
  const byName = new Map<string, DomainRow>();
  _.forEach(domains, (d) => {
    if (d?.name) byName.set(d.name, d);
  });
  const rows: DomainRow[] = _.compact(
    deferredSelectedNames.map((name) => byName.get(name) ?? null),
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

  const handleSave = async (
    newKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    const domainName = editingRow?.name;
    if (!domainName) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }
    const payload = buildAllowedHostsPayload(
      editingRow?.allowed_vfolder_hosts,
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
            updateFetchKey();
            resolve({ ok: true });
          }
        },
        onError: (err) => resolve({ ok: false, msg: err?.message }),
      });
    });
  };

  const editingParsed = parseAllowedHosts(editingRow?.allowed_vfolder_hosts);
  const editingEnabledSet = new Set(editingParsed[storageHostId] ?? []);

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
        dataSource={rows}
        columns={[
          {
            title: t('storageHost.permission.Name'),
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 240,
            render: (name: string, row: DomainRow) => {
              const parsed = parseAllowedHosts(row.allowed_vfolder_hosts);
              const isHostAllowed = storageHostId in parsed;
              return (
                <BAIFlex direction="column" align="start" gap="xxs">
                  <BAINameActionCell
                    title={
                      <Typography.Text
                        ellipsis={{ tooltip: row.name }}
                        style={{ maxWidth: 160 }}
                      >
                        {row.name}
                      </Typography.Text>
                    }
                    showActions="always"
                    actions={[
                      {
                        key: 'edit',
                        title: t(
                          'storageHost.permission.EditPermissionsAction',
                        ),
                        icon: <EditFilled />,
                        onClick: () => setEditingRow(row),
                      },
                      {
                        key: 'deselect',
                        title: t('storageHost.permission.DeselectItem'),
                        icon: (
                          <MinusCircleOutlined
                            style={{ color: token.colorTextTertiary }}
                          />
                        ),
                        onClick: () => onDeselectItem?.(name),
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
              );
            },
          },
          ...permissionKeys.map((permKey) => {
            const display = PERMISSION_DISPLAY_MAP[permKey];
            return {
              title: display ? t(display.labelKey) : permKey,
              key: permKey,
              align: 'center' as const,
              render: (_value: DomainRow, row: DomainRow) => {
                const parsed = parseAllowedHosts(row.allowed_vfolder_hosts);
                const enabled = new Set(parsed[storageHostId] ?? []);
                return enabled.has(permKey) ? (
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                ) : (
                  <CloseCircleOutlined
                    style={{ color: token.colorTextDisabled }}
                  />
                );
              },
            };
          }),
        ]}
      />
      <BAIUnmountAfterClose>
        <StoragePermissionEditModal
          open={!!editingRow}
          title={t('storageHost.permission.EditPermissions', {
            name: editingRow?.name ?? '',
          })}
          permissionKeys={permissionKeys}
          initialEnabled={editingEnabledSet}
          onRequestClose={() => setEditingRow(null)}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default DomainStoragePermissionTable;
