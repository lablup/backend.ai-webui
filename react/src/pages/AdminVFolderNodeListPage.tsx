/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  AdminVFolderNodeListPageQuery,
  AdminVFolderNodeListPageQuery$data,
  VFolderFilter,
  VFolderOrderBy,
} from '../__generated__/AdminVFolderNodeListPageQuery.graphql';
import { AstryxAdminTheme } from '../astryx-theme';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIRadioGroup from '../components/BAIRadioGroup';
import BAITabs from '../components/BAITabs';
import DeleteForeverVFolderModalV2 from '../components/DeleteForeverVFolderModalV2';
import DeleteVFolderModalV2 from '../components/DeleteVFolderModalV2';
import FolderCreateModalV2 from '../components/FolderCreateModalV2';
import RestoreVFolderModalV2 from '../components/RestoreVFolderModalV2';
import VFolderNodesV2, {
  VFolderNodeInList,
  availableVFolderSorterValues,
} from '../components/VFolderNodesV2';
import { convertToOrderBy, handleRowSelectionChange } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { isDeletedCategory } from './VFolderNodeListPage';
import { Badge } from '@lablup/ui-common/Badge';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import {
  BAISkeleton,
  BAICard,
  BAIGraphQLPropertyFilter,
  BAISelectionLabel,
  INITIAL_FETCH_KEY,
  filterOutEmpty,
  filterOutNullAndUndefined,
  useFetchKey,
  useToggle,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon, RotateCcwIcon, Trash2Icon, TrashIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, {
  Suspense,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type VFolderNodesType = NonNullableNodeOnEdges<
  AdminVFolderNodeListPageQuery$data['adminVfoldersV2']
>;

const DELETE_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
  'DELETE_COMPLETE',
] as const;

const STATUS_FILTER_ACTIVE = {
  status: { notIn: DELETE_STATUSES },
} as const;
const STATUS_FILTER_DELETED = {
  status: { in: DELETE_STATUSES },
} as const;

const DEFAULT_ORDER = '-created_at';
const statusCategoryValues = ['active', 'deleted'] as const;
const modeValues = ['all', 'general', 'data', 'automount', 'model'] as const;

// Module constants so each mode's filter keeps a stable identity (FR-3594);
// see ProjectAdminDataPage, this page's V2 reference.
const USAGE_MODE_FILTERS: Partial<
  Record<(typeof modeValues)[number], VFolderFilter>
> = {
  general: {
    AND: [
      { name: { iNotStartsWith: '.' } },
      { usageMode: { equals: 'GENERAL' } },
    ],
  },
  data: { usageMode: { equals: 'DATA' } },
  automount: { name: { iStartsWith: '.' } },
  model: { usageMode: { equals: 'MODEL' } },
};

const VFOLDER_STATUS_OPTIONS = [
  'READY',
  'CLONING',
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
] as const;

const AdminVFolderNodeListPage: React.FC = (props) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminVFolderNodeListPage',
  );

  const [selectedFolderList, setSelectedFolderList] = useState<
    Array<VFolderNodesType>
  >([]);

  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);
  const [isOpenCreateModal, { toggle: toggleCreateModal }] = useToggle(false);
  const [isOpenDeleteForeverModal, { toggle: toggleDeleteForeverModal }] =
    useToggle(false);

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
      order: parseAsStringLiteral(availableVFolderSorterValues),
      filter: parseAsJson<VFolderFilter>((value) => value as VFolderFilter),
      statusCategory:
        parseAsStringLiteral(statusCategoryValues).withDefault('active'),
      mode: parseAsStringLiteral(modeValues).withDefault('all'),
    },
    { history: 'replace' },
  );

  const queryMapRef = useRef({
    [queryParams.statusCategory]: { queryParams, tablePaginationOption },
  });

  // Written in an effect: a render-phase ref write is a react-hooks/refs
  // violation that made the React Compiler bail out of this component, which
  // re-created `queryVariables` every render and flashed the deferred-value
  // loading states on unrelated re-renders (same symptom as FR-3510).
  useEffect(() => {
    queryMapRef.current[queryParams.statusCategory] = {
      queryParams,
      tablePaginationOption,
    };
  }, [queryParams, tablePaginationOption]);

  const usageModeFilter = USAGE_MODE_FILTERS[queryParams.mode];

  const [fetchKey, updateFetchKey] = useFetchKey();

  const statusFilter =
    queryParams.statusCategory === 'deleted'
      ? STATUS_FILTER_DELETED
      : STATUS_FILTER_ACTIVE;

  // Built from literals and stable references only (no helper call): the
  // compiler keeps unknown calls with mutable arguments un-memoized, and any
  // per-render identity here re-fires the deferred-value loading flash.
  const combinedFilter: VFolderFilter = {
    AND: [
      statusFilter,
      ...(usageModeFilter ? [usageModeFilter] : []),
      ...(queryParams.filter ? [queryParams.filter] : []),
    ],
  };

  // scope is intentionally omitted: `adminVfoldersV2` (superadmin only) has
  // no project/domain argument, so this page always sees every vfolder.
  const queryVariables = {
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.limit,
    filter: combinedFilter,
    orderBy: convertToOrderBy<VFolderOrderBy>(
      queryParams.order || DEFAULT_ORDER,
    ),
    filterForActiveCount: STATUS_FILTER_ACTIVE,
    filterForDeletedCount: STATUS_FILTER_DELETED,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { adminVfoldersV2, ...folderCounts } =
    useLazyLoadQuery<AdminVFolderNodeListPageQuery>(
      graphql`
        query AdminVFolderNodeListPageQuery(
          $offset: Int
          $limit: Int
          $filter: VFolderFilter
          $orderBy: [VFolderOrderBy!]
          $filterForActiveCount: VFolderFilter
          $filterForDeletedCount: VFolderFilter
        ) {
          adminVfoldersV2(
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                vfolderStatus: status
                ...VFolderNodesV2Fragment
                ...DeleteVFolderModalV2Fragment
                ...DeleteForeverVFolderModalV2Fragment
                ...RestoreVFolderModalV2Fragment
              }
            }
            count
          }
          active: adminVfoldersV2(filter: $filterForActiveCount) {
            count
          }
          deleted: adminVfoldersV2(filter: $filterForDeletedCount) {
            count
          }
        }
      `,
      deferredQueryVariables,
      {
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
        fetchKey: deferredFetchKey,
      },
    );

  return (
    // ADMIN page: nested admin accent — the Astryx counterpart of
    // `ThemeAdminProvider` (mode is re-passed explicitly inside).
    <AstryxAdminTheme>
      <VStack align="stretch" gap={5} {...props}>
        <BAICard
          // ORIGINAL FIDELITY: the card header carries only the title on
          // `main` for this page — the refresh + create buttons live at the
          // right edge of the action row above the table.
          title={t('data.Folders')}
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
              setQuery(
                {
                  ...storedQuery.queryParams,
                  statusCategory: key as 'active' | 'deleted',
                },
                { history: 'replace' },
              );
              setTablePaginationOption(
                storedQuery.tablePaginationOption || { current: 1 },
              );
              setSelectedFolderList([]);
            }}
            items={_.map(
              {
                active: t('data.Active'),
                deleted: t('data.folders.TrashBin'),
              },
              (label, key) => {
                const count =
                  folderCounts[key as keyof typeof folderCounts]?.count ?? 0;
                return {
                  key,
                  // Astryx `Tab` takes a STRING label plus a native `endContent`
                  // slot, so the original's BAIFlex-wrapped JSX label is split in
                  // two. This also restores a correct `aria-label` on the tab.
                  label,
                  endContent:
                    count > 0 ? (
                      // PILOT-DECISION: antd's Badge took an arbitrary `color`
                      // (brand accent when selected, disabled grey otherwise).
                      // Astryx's Badge exposes only a closed `variant` set.
                      <Badge
                        label={count}
                        variant={
                          queryParams.statusCategory === key
                            ? 'info'
                            : 'neutral'
                        }
                      />
                    ) : undefined,
                };
              },
            )}
          />
          <VStack align="stretch" gap={3}>
            <HStack justify="between" wrap="wrap" gap={3}>
              <HStack
                gap={3}
                align="start"
                style={{ flexShrink: 1 }}
                wrap="wrap"
              >
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
                <BAIGraphQLPropertyFilter<VFolderFilter>
                  data-testid="vfolder-filter"
                  // TODO(needs-backend): V2 `VFolderFilter` does not expose
                  // group/project, creator, last_used, max_size,
                  // ownership_type, or permission filters — only
                  // name/host/status/usageMode/cloneable/createdAt are
                  // supported (FR-4114).
                  filterProperties={[
                    {
                      key: 'name',
                      propertyLabel: t('data.folders.Name'),
                      type: 'string',
                    },
                    {
                      key: 'host',
                      propertyLabel: t('data.folders.Location'),
                      type: 'string',
                    },
                    {
                      key: 'status',
                      propertyLabel: t('data.folders.Status'),
                      type: 'enum',
                      strictSelection: true,
                      options: _.map([...VFOLDER_STATUS_OPTIONS], (status) => ({
                        label: status,
                        value: status,
                      })),
                    },
                    {
                      key: 'createdAt',
                      propertyLabel: t('data.folders.CreatedAt'),
                      type: 'datetime',
                    },
                    {
                      key: 'cloneable',
                      propertyLabel: t('data.folders.Cloneable'),
                      type: 'boolean',
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
                    <HStack gap={1} align="center">
                      <BAISelectionLabel
                        count={selectedFolderList.length}
                        onClearSelection={() => setSelectedFolderList([])}
                      />
                      <IconButton
                        label={t('data.folders.MoveToTrash')}
                        tooltip={t('data.folders.MoveToTrash')}
                        icon={<TrashIcon />}
                        variant="ghost"
                        className="bai-name-action-cell-danger"
                        onClick={() => {
                          toggleDeleteModal();
                        }}
                      />
                    </HStack>
                  )}
                {selectedFolderList.length > 0 &&
                  queryParams.statusCategory === 'deleted' && (
                    <HStack gap={1} align="center">
                      <BAISelectionLabel
                        count={selectedFolderList.length}
                        onClearSelection={() => setSelectedFolderList([])}
                      />
                      <IconButton
                        label={t('data.folders.Restore')}
                        tooltip={t('data.folders.Restore')}
                        icon={<RotateCcwIcon />}
                        variant="ghost"
                        onClick={() => {
                          toggleRestoreModal();
                        }}
                      />
                      <IconButton
                        label={t('data.folders.Delete')}
                        tooltip={t('data.folders.Delete')}
                        icon={<Trash2Icon />}
                        className="bai-name-action-cell-danger"
                        variant="ghost"
                        onClick={() => {
                          toggleDeleteForeverModal();
                        }}
                      />
                    </HStack>
                  )}
                <AutoUpdateFetchKeyButton
                  settingId="admin-vfolder-list"
                  loading={
                    deferredQueryVariables !== queryVariables ||
                    deferredFetchKey !== fetchKey
                  }
                  value={fetchKey}
                  onChange={(newFetchKey) => {
                    updateFetchKey(newFetchKey);
                  }}
                />
                <Button
                  variant="primary"
                  icon={<PlusIcon />}
                  label={t('data.CreateFolder')}
                  onClick={() => {
                    toggleCreateModal();
                  }}
                />
              </HStack>
            </HStack>
            {/* FR-4009: a query suspending inside the table (useCurrentUserProjectRoles
                refetches after a folder mutation) must not blank the whole page. */}
            <Suspense fallback={<BAISkeleton rows={4} />}>
              <VFolderNodesV2
                order={queryParams.order}
                loading={deferredQueryVariables !== queryVariables}
                // ADR-0001: super-admin page — no ambient project context. The
                // deployment-creation escalation modal embeds its own required
                // project selector.
                project={null}
                // FR-3423: deployments are project-scoped, and this page is an
                // oversight surface across every project — deploying from here
                // would create an endpoint in a project the admin may not
                // belong to and can't afterwards see or clean up. Mirrors the
                // FileBrowser/SFTP disabled-with-tooltip treatment already
                // applied to this page (FR-3412).
                noDeployTooltip={t('data.folders.CannotDeployFromAdminMenu')}
                vfoldersFrgmt={filterOutNullAndUndefined(
                  _.map(adminVfoldersV2?.edges, 'node'),
                )}
                rowSelection={{
                  type: 'checkbox',
                  preserveSelectedRowKeys: true,
                  getCheckboxProps(record: VFolderNodeInList) {
                    return {
                      disabled:
                        isDeletedCategory(record.vfolderStatus) &&
                        record.vfolderStatus !== 'DELETE_PENDING',
                    };
                  },
                  onChange: (selectedRowKeys) => {
                    handleRowSelectionChange(
                      selectedRowKeys,
                      filterOutNullAndUndefined(
                        _.map(adminVfoldersV2?.edges, 'node'),
                      ),
                      setSelectedFolderList,
                    );
                  },
                  selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
                }}
                pagination={{
                  pageSize: tablePaginationOption.pageSize,
                  current: tablePaginationOption.current,
                  total: adminVfoldersV2?.count ?? 0,
                  onChange(current, pageSize) {
                    if (_.isNumber(current) && _.isNumber(pageSize)) {
                      setTablePaginationOption({ current, pageSize });
                    }
                  },
                }}
                onChangeOrder={(order) => {
                  setQuery({
                    order:
                      (order as (typeof availableVFolderSorterValues)[number]) ??
                      null,
                  });
                }}
                onRemoveRow={(removedId) => {
                  setSelectedFolderList((prevSelected) =>
                    _.filter(prevSelected, (folder) => folder.id !== removedId),
                  );
                  updateFetchKey();
                }}
                tableSettings={{
                  columnOverrides: columnOverrides,
                  // Storage oversight is this page's job, so the quota/usage and
                  // creation columns start visible here but stay hidden on /data.
                  defaultColumnOverrides: {
                    cur_size: { hidden: false },
                    max_size: { hidden: false },
                    created_at: { hidden: false },
                  },
                  onColumnOverridesChange: setColumnOverrides,
                }}
              />
            </Suspense>
          </VStack>
        </BAICard>
        <DeleteVFolderModalV2
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
        <RestoreVFolderModalV2
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
        <DeleteForeverVFolderModalV2
          vfolderFrgmts={selectedFolderList}
          open={isOpenDeleteForeverModal}
          onRequestClose={(success) => {
            if (success) {
              updateFetchKey();
              setSelectedFolderList([]);
            }
            toggleDeleteForeverModal();
          }}
        />
        <FolderCreateModalV2
          open={isOpenCreateModal}
          // ADR-0001: no ambient project context on the admin Data page — the
          // modal renders its own required project selector.
          project={null}
          folderType="project"
          alertMessage={t('data.folders.AdminDataPageAlert')}
          onRequestClose={(result) => {
            toggleCreateModal();
            if (result) {
              updateFetchKey();
            }
          }}
        />
      </VStack>
    </AstryxAdminTheme>
  );
};

export default AdminVFolderNodeListPage;
