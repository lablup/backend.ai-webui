/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectStoragePermissionTableModifyGroupMutation } from '../__generated__/ProjectStoragePermissionTableModifyGroupMutation.graphql';
import {
  ProjectStoragePermissionTableQuery as ProjectStoragePermissionTableQueryType,
  type ProjectV2Filter,
  type ProjectV2OrderBy,
} from '../__generated__/ProjectStoragePermissionTableQuery.graphql';
import { ProjectStoragePermissionTable_domainFrgmt$key } from '../__generated__/ProjectStoragePermissionTable_domainFrgmt.graphql';
import { ProjectStoragePermissionTable_permissionFrgmt$key } from '../__generated__/ProjectStoragePermissionTable_permissionFrgmt.graphql';
import { ProjectStoragePermissionTable_storageVolumeFrgmt$key } from '../__generated__/ProjectStoragePermissionTable_storageVolumeFrgmt.graphql';
import { convertToOrderBy } from '../helper';
import {
  PERMISSION_DISPLAY_MAP,
  buildAllowedHostsPayloadFromV2,
  parseAllowedHosts,
  v2PermissionToKey,
} from '../helper/storageHostPermission';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import StoragePermissionEditModal, {
  type PermissionEditTarget,
} from './StoragePermissionEditModal';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Tooltip, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAITable,
  type BAITableProps,
  BAIUnmountAfterClose,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type ProjectRow = NonNullable<
  NonNullable<
    NonNullable<
      ProjectStoragePermissionTableQueryType['response']['domainProjectsV2']
    >['edges'][number]
  >['node']
>;

export interface ProjectStoragePermissionTableProps extends BAITableProps<ProjectRow> {
  /** Fragment for the storage host — its `id` is read internally. */
  storageVolumeFrgmt: ProjectStoragePermissionTable_storageVolumeFrgmt$key;
  /**
   * Fragment for the selected domain. Read internally for the domain `name`
   * (which scopes the project list query via `domainProjectsV2`) and
   * `allowed_vfolder_hosts` (to compute each project row's effective permission
   * = union(project, domain) and the inherited host-allowed status).
   * Null/undefined when no domain is selected → the project query is skipped
   * and the select-a-domain empty state is shown.
   */
  domainFrgmt: ProjectStoragePermissionTable_domainFrgmt$key | null | undefined;
  /**
   * Fragment for the global vfolder-host permission catalog
   * (`PredefinedAtomicPermission`). The canonical permission key list is
   * derived from it internally; null/undefined yields an empty key list.
   */
  permissionFrgmt:
    | ProjectStoragePermissionTable_permissionFrgmt$key
    | null
    | undefined;
}

const ProjectStoragePermissionTable: React.FC<
  ProjectStoragePermissionTableProps
> = ({ storageVolumeFrgmt, domainFrgmt, permissionFrgmt, ...tableProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const storageVolume = useFragment(
    graphql`
      fragment ProjectStoragePermissionTable_storageVolumeFrgmt on StorageVolume {
        id
      }
    `,
    storageVolumeFrgmt,
  );
  const storageHostId = storageVolume?.id ?? '';

  // The selected domain's permissions drive each project row's effective
  // (union) state and its inherited host-allowed status.
  const domain = useFragment(
    graphql`
      fragment ProjectStoragePermissionTable_domainFrgmt on Domain {
        name
        allowed_vfolder_hosts
      }
    `,
    domainFrgmt ?? null,
  );
  const domainParsed = parseAllowedHosts(domain?.allowed_vfolder_hosts);
  const domainPermissions = new Set(domainParsed[storageHostId] ?? []);

  // Domain name comes from the same fragment (single source of truth): it
  // scopes the project list query and drives the empty-state copy. Null when no
  // domain is selected.
  const selectedDomainName = domain?.name ?? undefined;

  // Global permission catalog (the universe of vfolder host permission keys);
  // not tied to this domain or host, so it arrives via a root-query fragment.
  const permission = useFragment(
    graphql`
      fragment ProjectStoragePermissionTable_permissionFrgmt on PredefinedAtomicPermission {
        vfolder_host_permission_list
      }
    `,
    permissionFrgmt,
  );
  const permissionKeys = _.compact(
    permission?.vfolder_host_permission_list ?? [],
  );

  // Empty when the modal is closed. One row → single-edit; many → bulk-edit.
  const [editingRows, setEditingRows] = useState<ProjectRow[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const [filter, setFilter] = useState<ProjectV2Filter | undefined>(undefined);
  const [order, setOrder] = useState<string | undefined>(undefined);

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);

  const queryVariables = {
    domainName: selectedDomainName ?? '',
    skip: !selectedDomainName,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    filter: filter ?? null,
    orderBy: convertToOrderBy<ProjectV2OrderBy>(order) ?? null,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  // Server-side paginated/filtered/ordered list of the selected domain's
  // projects. `domainProjectsV2` returns the same `ProjectV2` node shape as
  // `adminProjectsV2`, so the row type, V2 permission parsing, and
  // `modify_group` save path are unchanged.
  const { domainProjectsV2 } =
    useLazyLoadQuery<ProjectStoragePermissionTableQueryType>(
      graphql`
        query ProjectStoragePermissionTableQuery(
          $domainName: String!
          $skip: Boolean!
          $limit: Int
          $offset: Int
          $filter: ProjectV2Filter
          $orderBy: [ProjectV2OrderBy!]
        ) {
          domainProjectsV2(
            scope: { domainName: $domainName }
            limit: $limit
            offset: $offset
            filter: $filter
            orderBy: $orderBy
          ) @skip(if: $skip) {
            count
            edges {
              node {
                id
                basicInfo {
                  name
                }
                storage {
                  allowedVfolderHosts {
                    host
                    permissions
                  }
                }
              }
            }
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy: deferredQueryVariables.skip
          ? 'store-only'
          : 'network-only',
        fetchKey: deferredFetchKey,
      },
    );

  const rows: ProjectRow[] = _.compact(
    (domainProjectsV2?.edges ?? []).map((edge) => edge?.node ?? null),
  );

  const [commitModifyGroup] =
    useMutation<ProjectStoragePermissionTableModifyGroupMutation>(graphql`
      mutation ProjectStoragePermissionTableModifyGroupMutation(
        $gid: UUID!
        $props: ModifyGroupInput!
      ) {
        modify_group(gid: $gid, props: $props) {
          ok
          msg
        }
      }
    `);

  const enabledKeysOf = (row: ProjectRow): Set<string> => {
    const entry = row.storage?.allowedVfolderHosts?.find(
      (e) => e.host === storageHostId,
    );
    return new Set(entry?.permissions.map(v2PermissionToKey) ?? []);
  };

  const commitRow = (
    row: ProjectRow,
    newKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    const gid = row.id ? toLocalId(row.id) : undefined;
    if (!gid) {
      return Promise.resolve({ ok: false });
    }
    const payload = buildAllowedHostsPayloadFromV2(
      row.storage?.allowedVfolderHosts ?? [],
      storageHostId,
      newKeys,
    );
    return new Promise((resolve) => {
      commitModifyGroup({
        variables: { gid, props: { allowed_vfolder_hosts: payload } },
        onCompleted: (res, errors) =>
          resolve({
            ok: !errors?.length && !!res?.modify_group?.ok,
            msg: res?.modify_group?.msg,
          }),
        onError: (err) => resolve({ ok: false, msg: err?.message }),
      });
    });
  };

  const handleSave = async (
    enabledKeys: string[],
  ): Promise<{ ok: boolean; msg?: string | null }> => {
    if (editingRows.length === 0) {
      return { ok: false, msg: t('storageHost.permission.SaveFailed') };
    }

    // Apply the chosen permission set to every editing row (single or bulk
    // overwrite).
    const settled = await Promise.all(
      editingRows.map((row) => commitRow(row, enabledKeys)),
    );

    const okCount = settled.filter((s) => s.ok).length;
    const total = settled.length;
    if (okCount > 0) {
      updateFetchKey();
      setSelectedRowKeys([]);
    }
    if (okCount === total) {
      return { ok: true };
    }
    if (okCount === 0) {
      return {
        ok: false,
        msg: settled.find((s) => !s.ok)?.msg,
      };
    }
    return {
      ok: true,
      msg: t('storageHost.permission.PartialSaveSuccess', {
        success: okCount,
        total,
      }),
    };
  };

  const editingTargets: PermissionEditTarget[] = editingRows.map((row) => ({
    id: row.id ? toLocalId(row.id) : '',
    name: row.basicInfo?.name ?? '',
    enabled: enabledKeysOf(row),
  }));
  // Single-target title is built inside the modal (the project name is
  // ellipsized there); only the bulk-edit label is supplied from here.
  const editingTitle =
    editingRows.length > 1
      ? t('storageHost.permission.EditPermissionsMulti', {
          count: editingRows.length,
        })
      : undefined;

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIFlex align="center" gap="xs">
        <BAIFlex gap="xs" justify="between" align="start" style={{ flex: 1 }}>
          <BAIGraphQLPropertyFilter<ProjectV2Filter>
            style={{ flex: 1 }}
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('storageHost.permission.Name'),
                type: 'string',
              },
            ]}
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setTablePaginationOption({ current: 1 });
              setSelectedRowKeys([]);
            }}
          />
          {selectedRowKeys.length > 0 ? (
            <BAIFlex align="center" gap="xs" style={{ flexShrink: 0 }}>
              <BAISelectionLabel
                count={selectedRowKeys.length}
                onClearSelection={() => setSelectedRowKeys([])}
              />
              <Tooltip
                title={t('storageHost.permission.EditPermissionsAction')}
              >
                <BAIButton
                  icon={<SquarePenIcon style={{ color: token.colorInfo }} />}
                  style={{ backgroundColor: token.colorInfoBg }}
                  onClick={() =>
                    setEditingRows(
                      rows.filter((row) => selectedRowKeys.includes(row.id)),
                    )
                  }
                />
              </Tooltip>
            </BAIFlex>
          ) : null}
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={() => updateFetchKey()}
            loading={deferredQueryVariables !== queryVariables}
          />
        </BAIFlex>
      </BAIFlex>
      <BAITable
        size="small"
        scroll={{ x: 'max-content' }}
        {...tableProps}
        locale={{
          // No domain picked yet vs. a domain picked that simply has no
          // projects under it — distinct empty states.
          emptyText: selectedDomainName
            ? t('storageHost.permission.NoProjectsInDomain')
            : t('storageHost.permission.SelectDomainFirst'),
        }}
        rowKey="id"
        resizable={false}
        order={order}
        onChangeOrder={(newOrder) => {
          setOrder(newOrder);
          setTablePaginationOption({ current: 1 });
          setSelectedRowKeys([]);
        }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          current: tablePaginationOption.current,
          total: domainProjectsV2?.count ?? 0,
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({ current, pageSize });
              setSelectedRowKeys([]);
            }
          },
        }}
        loading={queryVariables !== deferredQueryVariables}
        dataSource={rows}
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={[
          {
            title: t('storageHost.permission.Name'),
            // `dataIndex` (not just `key`) is required so antd's sorter result
            // carries `field: 'name'` → order string 'name'/'-name'. Without it
            // `sorter.field` is undefined and the orderBy field becomes the
            // invalid enum value "UNDEFINED". The custom `render` still drives
            // display (the row has no top-level `name`; it lives at
            // `basicInfo.name`).
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            sorter: true,
            render: (_value: ProjectRow, row: ProjectRow) => (
              <BAINameActionCell
                title={
                  <Typography.Text
                    ellipsis={{ tooltip: row.basicInfo?.name }}
                    style={{ maxWidth: 160 }}
                  >
                    {row.basicInfo?.name}
                  </Typography.Text>
                }
                showActions="always"
                actions={[
                  {
                    key: 'edit',
                    title: t('storageHost.permission.EditPermissionsAction'),
                    icon: <SquarePenIcon />,
                    onClick: () => setEditingRows([row]),
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
              render: (_value: ProjectRow, row: ProjectRow) => {
                // Effective permission = union(project, domain): granted on the
                // project → green; inherited from the domain only → purple;
                // granted on neither → gray.
                if (enabledKeysOf(row).has(permKey)) {
                  return (
                    <CheckCircleOutlined
                      style={{ color: token.colorSuccess }}
                    />
                  );
                }
                if (domainPermissions.has(permKey)) {
                  return (
                    <CheckCircleOutlined style={{ color: token.purple5 }} />
                  );
                }
                return (
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
          open={editingRows.length > 0}
          title={editingTitle}
          permissionKeys={permissionKeys}
          targets={editingTargets}
          onRequestClose={() => setEditingRows([])}
          onSave={handleSave}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default ProjectStoragePermissionTable;
