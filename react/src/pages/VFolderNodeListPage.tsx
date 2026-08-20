/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderNodeListPageQuery,
  VFolderNodeListPageQuery$data,
  VFolderNodeListPageQuery$variables,
} from '../__generated__/VFolderNodeListPageQuery.graphql';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import DeleteVFolderModal from '../components/DeleteVFolderModal';
import FolderCreateModalV2 from '../components/FolderCreateModalV2';
import RestoreVFolderModal from '../components/RestoreVFolderModal';
import VFolderNodes, { VFolderNodeInList } from '../components/VFolderNodes';
import BAICard from '../components/astryx-bui/BAICardAstryx';
import BAISelectionLabel from '../components/astryx-bui/BAISelectionLabel';
import BAIVFolderDeleteButton from '../components/astryx-bui/BAIVFolderDeleteButtonAstryx';
import { handleRowSelectionChange } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import { toProjectContext } from '../types/projectContext';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Link } from '@astryxdesign/core/Link';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIPropertyFilter,
  filterOutEmpty,
  filterOutNullAndUndefined,
  mergeFilterValues,
  useToggle,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { RotateCcwIcon } from 'lucide-react';
import { parseAsString, useQueryState, useQueryStates } from 'nuqs';
import React, {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();
  const [invitations] = useVFolderInvitations();
  const [, setInvitationOpen] = useQueryState(
    'invitation',
    parseAsString.withOptions({ history: 'replace' }),
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.VFolderNodeListPage',
  );

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderNodesType>
  >([]);

  // Reset selectedRowKeys when currentProject changes
  const [prevProjectId, setPrevProjectId] = useState(currentProject.id);
  if (prevProjectId !== currentProject.id) {
    setPrevProjectId(currentProject.id);
    setSelectedFolderList([]);
  }

  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQuery] = useQueryStates(
    {
      order: parseAsString.withDefault('-created_at'),
      filter: parseAsString,
      statusCategory: parseAsString.withDefault('active'),
      mode: parseAsString.withDefault('all'),
    },
    { history: 'replace' },
  );

  const queryMapRef = useRef({
    [queryParams.statusCategory]: { queryParams, tablePaginationOption },
  });
  useEffect(() => {
    queryMapRef.current[queryParams.statusCategory] = {
      queryParams,
      tablePaginationOption,
    };
  }, [queryParams, tablePaginationOption]);

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

  // An eslint suppression here made the React Compiler skip this whole
  // component, so `queryVariables` lost memoization and any re-render (e.g. row
  // selection) flashed the deferred-comparison loading states (FR-3510).
  const refetchOnInvitationChange = useEffectEvent(() => {
    updateFetchKey();
  });
  useEffect(() => {
    refetchOnInvitationChange();
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
                ...BAIVFolderDeleteButtonAstryxFragment
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
    <VStack align="stretch" gap={5} {...props}>
      <BAICard
        title={t('data.Folders')}
        extra={
          <Button
            variant="primary"
            label={t('data.CreateFolder')}
            onClick={() => {
              toggleCreateModal();
            }}
          />
        }
      >
        <BAITabs
          activeKey={queryParams.statusCategory}
          onChange={(key: string) => {
            const storedQuery = queryMapRef.current[key] || {
              mode: 'all',
            };
            // Reset the whole group first: nuqs partial updates merge, so
            // without this the previous tab's filter/order/mode leak into a
            // tab that has no cached state (legacy 'replace' cleared them).
            setQuery(null);
            setQuery({
              ...storedQuery.queryParams,
              statusCategory: key as 'active' | 'deleted',
            });
            setTablePaginationOption(
              storedQuery.tablePaginationOption || { current: 1 },
            );
            setSelectedFolderList([]);
          }}
          tabBarExtraContent={
            invitations.length > 0 ? (
              <Link
                href="#"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  setInvitationOpen('true');
                }}
              >
                {`${t('data.invitation.PendingInvitations')} (${invitations.length})`}
              </Link>
            ) : undefined
          }
          items={_.map(
            {
              active: t('data.Active'),
              deleted: t('data.folders.TrashBin'),
            },
            (label, key) => ({
              key,
              // Astryx `Tab` takes a STRING label plus a native `endContent`
              // slot, so the original's BAIFlex-wrapped JSX label is split in
              // two. This also restores a correct `aria-label` on the tab.
              label,
              endContent:
                // display badge only if count is greater than 0
                // @ts-ignore
                (folderCounts[key]?.count || 0) > 0 ? (
                  // PILOT-DECISION: antd's Badge took an arbitrary `color`
                  // (brand accent when selected, disabled grey otherwise)
                  // plus explicit padding/fontSize. Astryx's Badge exposes
                  // only a closed `variant` set.
                  <Badge
                    // @ts-ignore
                    label={folderCounts[key].count}
                    variant={
                      queryParams.statusCategory === key ? 'info' : 'neutral'
                    }
                  />
                ) : undefined,
            }),
          )}
        />
        <VStack align="stretch" gap={3}>
          <HStack justify="between" wrap="wrap" gap={3}>
            <HStack gap={3} align="start" style={{ flexShrink: 1 }} wrap="wrap">
              <BAIRadioGroup
                optionType="button"
                value={queryParams.mode}
                onChange={(e) => {
                  setQuery({ mode: e.target.value });
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
              {/* The BUI antd composite is replaced by Astryx `PowerSearch`.
                  Same external contract (DSL string in, DSL string out) so
                  the URL round-trip and the GraphQL variable are untouched. */}
              <BAIPropertyFilter
                data-testid="vfolder-filter"
                style={{ minWidth: 320, flex: 1 }}
                label={t('settings.SearchPlaceholder')}
                placeholder={t('data.SearchByName')}
                applyLabel={t('button.Apply')}
                // Free text with no field prefix becomes a `name ilike` token.
                contentSearchFieldKey="name"
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
                value={queryParams.filter ?? undefined}
                onChange={(value) => {
                  setQuery({ filter: value ?? null });
                  setTablePaginationOption({ current: 1 });
                  setSelectedFolderList([]);
                }}
              />
            </HStack>
            <HStack gap={2}>
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'active' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <BAIVFolderDeleteButton
                      vfolderFrgmt={selectedFolderList}
                      // P8: the accessible name is now on the control itself,
                      // so the wrapping Tooltip that used to BE the name is
                      // gone — the component owns both.
                      label={t('data.folders.MoveToTrash')}
                      onClick={() => {
                        toggleDeleteModal();
                      }}
                    />
                  </>
                )}
              {selectedFolderList.length > 0 &&
                queryParams.statusCategory === 'deleted' && (
                  <>
                    <BAISelectionLabel
                      count={selectedFolderList.length}
                      onClearSelection={() => setSelectedFolderList([])}
                    />
                    <Tooltip content={t('data.folders.Restore')}>
                      <IconButton
                        // Astryx requires a real accessible name; the antd
                        // original had none (only the wrapping tooltip).
                        label={t('data.folders.Restore')}
                        icon={<RotateCcwIcon />}
                        onClick={() => {
                          toggleRestoreModal();
                        }}
                      />
                    </Tooltip>
                  </>
                )}
              <AutoUpdateFetchKeyButton
                settingId="vfolder-list"
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                value={fetchKey}
                onChange={(newFetchKey) => {
                  updateFetchKey(newFetchKey);
                }}
              />
            </HStack>
          </HStack>
          <VFolderNodes
            order={queryParams.order}
            loading={deferredQueryVariables !== queryVariables}
            disableProjectFolderActions
            project={toProjectContext(currentProject)}
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
              setQuery({ order: order ?? null });
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
        </VStack>
      </BAICard>
      <FolderCreateModalV2
        open={isOpenCreateModal}
        project={toProjectContext(currentProject)}
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
    </VStack>
  );
};

export default VFolderNodeListPage;
