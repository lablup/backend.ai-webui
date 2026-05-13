/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderNodeListPageQuery,
  VFolderNodeListPageQuery$data,
  VFolderNodeListPageQuery$variables,
} from '../__generated__/VFolderNodeListPageQuery.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import DeleteVFolderModal from '../components/DeleteVFolderModal';
import FolderCreateModalV2 from '../components/FolderCreateModalV2';
import RestoreVFolderModal from '../components/RestoreVFolderModal';
import VFolderNodes, { VFolderNodeInList } from '../components/VFolderNodes';
import { handleRowSelectionChange } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import { useToggle } from 'ahooks';
import { Badge, theme, Tooltip } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAILink,
  BAIPropertyFilter,
  BAIRestoreIcon,
  BAISelectionLabel,
  BAIVFolderDeleteButton,
  filterOutEmpty,
  filterOutNullAndUndefined,
  mergeFilterValues,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import {
  StringParam,
  useQueryParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

export const isDeletedCategory = (status?: string | null) => {
  return _.includes(
    [
      // V1 `VirtualFolderNode.status` (kebab-case)
      'delete-pending',
      'delete-ongoing',
      'delete-complete',
      'delete-error',
      // V2 `VFolder.status` (UPPERCASE enum, VFolderOperationStatus)
      'DELETE_PENDING',
      'DELETE_ONGOING',
      'DELETE_COMPLETE',
      'DELETE_ERROR',
    ],
    status,
  );
};

type VFolderNodesType = NonNullableNodeOnEdges<
  VFolderNodeListPageQuery$data['vfolder_nodes']
>;

const VFOLDER_STATUSES = [
  'READY',
  'PERFORMING',
  'CLONING',
  'MOUNTED',
  'ERROR',
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
];

interface VFolderNodeListPageProps {}

const FILTER_BY_STATUS_CATEGORY = {
  active:
    'status != "DELETE_PENDING" & status != "DELETE_ONGOING" & status != "DELETE_ERROR" & status != "DELETE_COMPLETE"',
  deleted: 'status in ["DELETE_PENDING", "DELETE_ONGOING", "DELETE_ERROR"]',
};

const VFolderNodeListPage: React.FC<VFolderNodeListPageProps> = ({
  ...props
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const [invitations] = useVFolderInvitations();
  const [, setInvitationOpen] = useQueryParam('invitation', StringParam);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.VFolderNodeListPage',
  );

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderNodesType>
  >([]);

  useEffect(() => {
    setSelectedFolderList([]);

    // Reset selectedRowKeys when currentProject changes
  }, [currentProject.id]);

  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useQueryParams({
    order: withDefault(StringParam, '-created_at'),
    filter: withDefault(StringParam, undefined),
    statusCategory: withDefault(StringParam, 'active'),
    mode: withDefault(StringParam, 'all'),
  });

  const queryMapRef = useRef({
    [queryParams.statusCategory]: { queryParams, tablePaginationOption },
  });
  queryMapRef.current[queryParams.statusCategory] = {
    queryParams,
    tablePaginationOption,
  };

  function getUsageModeFilter(mode: string) {
    switch (mode) {
      case 'all':
      case undefined:
        return undefined;
      case 'general':
        return `(! name ilike ".%")&(usage_mode == "${mode}")`;
      case 'pipeline':
        return `usage_mode == "data"`;
      case 'automount':
        return `name ilike ".%"`;
      default:
        return `usage_mode == "${mode}"`;
    }
  }
  const usageModeFilter = getUsageModeFilter(queryParams.mode);

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const queryVariables: VFolderNodeListPageQuery$variables = {
    scopeId: `project:${currentProject.id}`,
    offset: baiPaginationOption.offset,
    first: baiPaginationOption.first,
    filter: mergeFilterValues([
      queryParams.statusCategory === 'active' ||
      queryParams.statusCategory === undefined
        ? FILTER_BY_STATUS_CATEGORY['active']
        : FILTER_BY_STATUS_CATEGORY['deleted'],
      queryParams.filter,
      usageModeFilter,
    ]),
    order: queryParams.order,
    permission: 'read_attribute',
    filterForActiveCount: FILTER_BY_STATUS_CATEGORY['active'],
    filterForDeletedCount: FILTER_BY_STATUS_CATEGORY['deleted'],
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  useEffect(() => {
    updateFetchKey();
    // Update fetchKey when invitation count changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitations.length]);

  const { vfolder_nodes, ...folderCounts } =
    useLazyLoadQuery<VFolderNodeListPageQuery>(
      graphql`
        query VFolderNodeListPageQuery(
          $scopeId: ScopeField
          $offset: Int
          $first: Int
          $filter: String
          $order: String
          $permission: VFolderPermissionValueField
          $filterForActiveCount: String
          $filterForDeletedCount: String
        ) {
          vfolder_nodes(
            scope_id: $scopeId
            offset: $offset
            first: $first
            filter: $filter
            order: $order
            permission: $permission
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                status
                permissions
                ...VFolderNodesFragment
                ...DeleteVFolderModalFragment
                ...EditableVFolderNameFragment
                ...RestoreVFolderModalFragment
                ...VFolderNodeIdenticonFragment
                ...SharedFolderPermissionInfoModalFragment
                ...BAIVFolderDeleteButtonFragment
              }
            }
            count
          }
          active: vfolder_nodes(
            scope_id: $scopeId
            first: 0
            offset: 0
            filter: $filterForActiveCount
            permission: $permission
          ) {
            count
          }
          deleted: vfolder_nodes(
            scope_id: $scopeId
            first: 0
            offset: 0
            filter: $filterForDeletedCount
            permission: $permission
          ) {
            count
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey:
          deferredFetchKey === 'initial-fetch' ? undefined : deferredFetchKey,
      },
    );

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'} {...props}>
      <BAICard
        variant="borderless"
        title={t('data.Folders')}
        extra={
          <BAIButton
            type="primary"
            onClick={() => {
              toggleCreateModal();
            }}
          >
            {t('data.CreateFolder')}
          </BAIButton>
        }
        styles={{
          header: {
            borderBottom: 'none',
          },
          body: {
            paddingTop: 0,
          },
        }}
      >
        <BAITabs
          activeKey={queryParams.statusCategory}
          onChange={(key) => {
            const storedQuery = queryMapRef.current[key] || {
              mode: 'all',
            };
            setQuery(
              {
                ...storedQuery.queryParams,
                statusCategory: key as 'active' | 'deleted',
              },
              'replace',
            );
            setTablePaginationOption(
              storedQuery.tablePaginationOption || { current: 1 },
            );
            setSelectedFolderList([]);
          }}
          tabBarExtraContent={
            invitations.length > 0 ? (
              <BAILink
                type="hover"
                onClick={() => {
                  setInvitationOpen('true', 'replaceIn');
                }}
              >
                {`${t('data.invitation.PendingInvitations')} (${invitations.length})`}
              </BAILink>
            ) : undefined
          }
          items={_.map(
            {
              active: t('data.Active'),
              deleted: t('data.folders.TrashBin'),
            },
            (label, key) => ({
              key,
              label: (
                <BAIFlex justify="center" gap={10}>
                  {label}
                  {
                    // display badge only if count is greater than 0
                    // @ts-ignore
                    (folderCounts[key]?.count || 0) > 0 && (
                      <Badge
                        // @ts-ignore
                        count={folderCounts[key].count}
                        color={
                          queryParams.statusCategory === key
                            ? token.colorPrimary
                            : token.colorTextDisabled
                        }
                        size="small"
                        showZero
                        style={{
                          paddingRight: token.paddingXS,
                          paddingLeft: token.paddingXS,
                          fontSize: 10,
                        }}
                      />
                    )
                  }
                </BAIFlex>
              ),
            }),
          )}
        />
        <BAIFlex direction="column" align="stretch" gap={'sm'}>
          <BAIFlex justify="between" wrap="wrap" gap={'sm'}>
            <BAIFlex
              gap={'sm'}
              align="start"
              style={{
                flexShrink: 1,
              }}
              wrap="wrap"
            >
              <BAIRadioGroup
                optionType="button"
                value={queryParams.mode}
                onChange={(e) => {
                  setQuery({ mode: e.target.value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
                options={filterOutEmpty([
                  {
                    label: t('data.All'),
                    value: 'all',
                  },
                  {
                    label: t('data.General'),
                    value: 'general',
                  },
                  baiClient?._config?.fasttrackEndpoint && {
                    label: t('data.Pipeline'),
                    value: 'data',
                  },
                  {
                    label: t('data.AutoMount'),
                    value: 'automount',
                  },
                  baiClient._config.enableModelFolders && {
                    label: t('data.Models'),
                    value: 'model',
                  },
                ])}
              />
              <BAIPropertyFilter
                data-testid="vfolder-filter"
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('data.folders.Name'),
                    type: 'string',
                  },
                  {
                    key: 'status',
                    propertyLabel: t('data.folders.Status'),
                    type: 'string',
                    strictSelection: true,
                    defaultOperator: '==',
                    options: _.map(VFOLDER_STATUSES, (status) => ({
                      label: status,
                      value: status,
                    })),
                  },
                  {
                    key: 'host',
                    propertyLabel: t('data.folders.Location'),
                    type: 'string',
                  },
                  {
                    key: 'ownership_type',
                    propertyLabel: t('data.Type'),
                    type: 'string',
                    strictSelection: true,
                    defaultOperator: '==',
                    options: [
                      {
                        label: t('data.User'),
                        value: 'user',
                      },
                      {
                        label: t('data.Project'),
                        value: 'group',
                      },
                    ],
                  },
                  {
                    key: 'permission',
                    propertyLabel: t('data.Permission'),
                    type: 'string',
                    strictSelection: true,
                    defaultOperator: '==',
                    options: [
                      {
                        label: t('data.ReadOnly'),
                        value: 'ro',
                      },
                      {
                        label: t('data.ReadWrite'),
                        value: 'rw',
                      },
                    ],
                  },
                  {
                    key: 'cloneable',
                    propertyLabel: t('data.folders.Cloneable'),
                    type: 'boolean',
                  },
                  {
                    key: 'quota_scope_id',
                    propertyLabel: t('data.QuotaScopeId'),
                    type: 'string',
                  },
                ]}
                value={queryParams.filter || undefined}
                onChange={(value) => {
                  setQuery({ filter: value }, 'replaceIn');
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
              />
            </BAIFlex>
            <BAIFlex gap={'sm'}>
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'active' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip title={t('data.folders.MoveToTrash')}>
                      <BAIVFolderDeleteButton
                        vfolderFrgmt={selectedFolderList}
                        style={{
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        onClick={() => {
                          toggleDeleteModal();
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'deleted' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip title={t('data.folders.Restore')}>
                      <BAIButton
                        style={{
                          color: token.colorInfo,
                          borderColor: token.colorBorder,
                        }}
                        type="text"
                        variant="outlined"
                        icon={<BAIRestoreIcon />}
                        onClick={() => {
                          toggleRestoreModal();
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              <BAIFetchKeyButton
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                autoUpdateDelay={15_000}
                value={fetchKey}
                onChange={(newFetchKey) => {
                  updateFetchKey(newFetchKey);
                }}
              />
            </BAIFlex>
          </BAIFlex>
          <VFolderNodes
            order={queryParams.order}
            loading={deferredQueryVariables !== queryVariables}
            disableProjectFolderActions
            vfoldersFrgmt={filterOutNullAndUndefined(
              _.map(vfolder_nodes?.edges, 'node'),
            )}
            rowSelection={{
              type: 'checkbox',
              preserveSelectedRowKeys: true,
              getCheckboxProps(record: VFolderNodeInList) {
                return {
                  disabled:
                    isDeletedCategory(record.status) &&
                    record.status !== 'delete-pending',
                };
              },
              onChange: (selectedRowKeys) => {
                handleRowSelectionChange(
                  selectedRowKeys,
                  filterOutNullAndUndefined(
                    _.map(vfolder_nodes?.edges, 'node'),
                  ),
                  setSelectedFolderList,
                );
              },
              selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
            }}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: vfolder_nodes?.count ?? 0,
              onChange(current, pageSize) {
                if (_.isNumber(current) && _.isNumber(pageSize)) {
                  setTablePaginationOption({ current, pageSize });
                }
              },
            }}
            onChangeOrder={(order) => {
              setQuery({ order }, 'replaceIn');
            }}
            onRemoveRow={(removedId) => {
              setSelectedFolderList((prevSelected) =>
                _.filter(prevSelected, (folder) => folder.id !== removedId),
              );
              updateFetchKey();
            }}
            tableSettings={{
              columnOverrides: columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
          />
        </BAIFlex>
      </BAICard>
      <FolderCreateModalV2
        open={isOpenCreateModal}
        initialValues={{
          usage_mode:
            queryParams.mode === 'model'
              ? 'model'
              : queryParams.mode === 'automount'
                ? 'automount'
                : 'general',
        }}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
          }
          toggleCreateModal();
        }}
      />
      <DeleteVFolderModal
        vfolderFrgmts={selectedFolderList}
        open={isOpenDeleteModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleDeleteModal();
        }}
      />
      <RestoreVFolderModal
        vfolderFrgmts={selectedFolderList}
        open={isOpenRestoreModal}
        onRequestClose={(success) => {
          if (success) {
            updateFetchKey();
            setSelectedFolderList([]);
          }
          toggleRestoreModal();
        }}
      />
    </BAIFlex>
  );
};

export default VFolderNodeListPage;
