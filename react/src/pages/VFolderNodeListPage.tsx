/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  VFolderFilter,
  VFolderNodeListPageQuery,
  VFolderNodeListPageQuery$data,
  VFolderOrderBy,
} from '../__generated__/VFolderNodeListPageQuery.graphql';
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
import { useCurrentUserInfo } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCreateActionArrival } from '../hooks/useCreateActionArrival';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { useVFolderInvitations } from '../hooks/useVFolderInvitations';
import { toProjectContext } from '../types/projectContext';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Link } from '@lablup/ui-common/Link';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import {
  BAICard,
  BAISkeleton,
  BAIGraphQLPropertyFilter,
  BAIEntityLabelBulkEditButton,
  BAISelectionLabel,
  BAITabCountBadge,
  INITIAL_FETCH_KEY,
  filterOutEmpty,
  filterOutNullAndUndefined,
  useFetchKey,
  useToggle,
  toLocalId,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { RotateCcwIcon, Trash2Icon, TrashIcon } from 'lucide-react';
import {
  parseAsJson,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
  useQueryStates,
} from 'nuqs';
import React, {
  Suspense,
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
  VFolderNodeListPageQuery$data['scopedVFoldersV2']
>;

interface VFolderNodeListPageProps {}

const DEFAULT_ORDER = '-created_at';
const statusCategoryValues = ['active', 'deleted'] as const;
const modeValues = ['all', 'general', 'data', 'automount', 'model'] as const;

const DELETE_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
  'DELETE_COMPLETE',
] as const;
const VISIBLE_DELETED_STATUSES = [
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_ERROR',
] as const;

const STATUS_FILTER_ACTIVE = {
  status: { notIn: DELETE_STATUSES },
} as const;
const STATUS_FILTER_DELETED = {
  status: { in: VISIBLE_DELETED_STATUSES },
} as const;

// V2 `VFolderOperationStatus` has no PERFORMING / MOUNTED / ERROR values
// (unlike V1's `VirtualFolderNode.status`), so the status filter property
// below only offers the subset the schema actually supports.
const VFOLDER_STATUSES_V2 = [
  'READY',
  'CLONING',
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
] as const;

// Module constants so each mode's filter keeps a stable identity (FR-3594);
// see the same note on `ProjectAdminDataPage`.
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

const VFolderNodeListPage: React.FC<VFolderNodeListPageProps> = ({
  ...props
}) => {
  'use memo';

  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const projectContext = toProjectContext(currentProject);
  const [currentUser] = useCurrentUserInfo();
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

  const [
    isOpenCreateModal,
    { toggle: toggleCreateModal, setRight: openCreateModal },
  ] = useToggle(false);
  const [isOpenDeleteModal, { toggle: toggleDeleteModal }] = useToggle(false);
  const [isOpenRestoreModal, { toggle: toggleRestoreModal }] = useToggle(false);
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

  // Built from literals and stable references only (no helper call), same
  // reasoning as `ProjectAdminDataPage.combinedFilter`.
  const combinedFilter: VFolderFilter = {
    AND: [
      statusFilter,
      ...(usageModeFilter ? [usageModeFilter] : []),
      ...(queryParams.filter ? [queryParams.filter] : []),
    ],
  };

  const refetchOnInvitationChange = useEffectEvent(() => {
    updateFetchKey();
  });
  useEffect(() => {
    refetchOnInvitationChange();
  }, [invitations.length]);

  useCreateActionArrival(openCreateModal);

  // Reproduces V1's `scope_id: project:<id>` (my folders + the current
  // project's folders); `VFolderFilter` carries no project argument.
  const vfolderScope = {
    user: [{ value: currentUser.uuid }],
    ...(projectContext ? { project: [{ value: projectContext.id }] } : {}),
  };

  const queryVariables = {
    scope: vfolderScope,
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

  const { scopedVFoldersV2, ...folderCounts } =
    useLazyLoadQuery<VFolderNodeListPageQuery>(
      graphql`
        query VFolderNodeListPageQuery(
          $scope: VFolderScope!
          $offset: Int
          $limit: Int
          $filter: VFolderFilter
          $orderBy: [VFolderOrderBy!]
          $filterForActiveCount: VFolderFilter
          $filterForDeletedCount: VFolderFilter
        ) {
          scopedVFoldersV2(
            scope: $scope
            offset: $offset
            limit: $limit
            filter: $filter
            orderBy: $orderBy
          ) @since(version: "26.9.0rc1") {
            edges @required(action: THROW) {
              node @required(action: THROW) {
                id @required(action: THROW)
                vfolderStatus: status
                metadata {
                  name
                }
                ...VFolderNodesV2Fragment
                ...DeleteVFolderModalV2Fragment
                ...DeleteForeverVFolderModalV2Fragment
                ...RestoreVFolderModalV2Fragment
              }
            }
            count
          }
          active: scopedVFoldersV2(
            scope: $scope
            filter: $filterForActiveCount
          ) @since(version: "26.9.0rc1") {
            count
          }
          deleted: scopedVFoldersV2(
            scope: $scope
            filter: $filterForDeletedCount
          ) @since(version: "26.9.0rc1") {
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
          items={(
            [
              ['active', t('data.Active')],
              ['deleted', t('data.folders.TrashBin')],
            ] as const
          ).map(([key, label]) => ({
            key,
            label,
            endContent: (
              <BAITabCountBadge
                count={folderCounts[key]?.count}
                selected={queryParams.statusCategory === key}
              />
            ),
          }))}
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
                  { label: t('data.All'), value: 'all' },
                  { label: t('data.General'), value: 'general' },
                  baiClient?._config?.fasttrackEndpoint && {
                    label: t('data.Pipeline'),
                    value: 'data',
                  },
                  { label: t('data.AutoMount'), value: 'automount' },
                  baiClient._config.enableModelFolders && {
                    label: t('data.Models'),
                    value: 'model',
                  },
                ])}
              />
              <BAIGraphQLPropertyFilter<VFolderFilter>
                data-testid="vfolder-filter"
                // TODO(needs-backend): V2 `VFolderFilter` has no ownership_type,
                // permission or quota_scope_id filter (FR-4142).
                filterProperties={[
                  {
                    key: 'name',
                    propertyLabel: t('data.folders.Name'),
                    type: 'string',
                  },
                  {
                    key: 'status',
                    propertyLabel: t('data.folders.Status'),
                    type: 'enum',
                    strictSelection: true,
                    defaultOperator: 'equals',
                    options: _.map([...VFOLDER_STATUSES_V2], (status) => ({
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
                    <BAIEntityLabelBulkEditButton
                      entityType="vfolder"
                      targets={selectedFolderList.map((folder) => ({
                        entityId: toLocalId(folder.id),
                        name: folder.metadata?.name ?? undefined,
                      }))}
                      onLabelsChanged={() => updateFetchKey()}
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
          {/* FR-4009: a query suspending inside the table (useCurrentUserProjectRoles
              refetches after a folder mutation) must not blank the whole page. */}
          <Suspense fallback={<BAISkeleton rows={4} />}>
            <VFolderNodesV2
              order={queryParams.order}
              loading={deferredQueryVariables !== queryVariables}
              disableProjectFolderActions
              project={projectContext}
              vfoldersFrgmt={filterOutNullAndUndefined(
                _.map(scopedVFoldersV2?.edges, 'node'),
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
                      _.map(scopedVFoldersV2?.edges, 'node'),
                    ),
                    setSelectedFolderList,
                  );
                },
                selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
              }}
              pagination={{
                pageSize: tablePaginationOption.pageSize,
                current: tablePaginationOption.current,
                total: scopedVFoldersV2?.count ?? 0,
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
              onLabelsChanged={() => updateFetchKey()}
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
          </Suspense>
        </VStack>
      </BAICard>
      <FolderCreateModalV2
        open={isOpenCreateModal}
        project={projectContext}
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
    </VStack>
  );
};

export default VFolderNodeListPage;
