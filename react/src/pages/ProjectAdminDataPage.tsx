/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectAdminDataPageQuery,
  ProjectAdminDataPageQuery$data,
  VFolderFilter,
  VFolderOrderBy,
} from '../__generated__/ProjectAdminDataPageQuery.graphql';
import AutoUpdateFetchKeyButton from '../components/AutoUpdateFetchKeyButton';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
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
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ProjectContext, toProjectContext } from '../types/projectContext';
import { isDeletedCategory } from './VFolderNodeListPage';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { IconButton } from '@astryxdesign/core/IconButton';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIVFolderDeleteButtonV2,
  BAISkeleton,
  // Translating frontier (ticket 28): the GraphQL-object property filter is a
  // BUI antd composite shared with unmigrated pages; it keeps its contract
  // here until the PowerSearch generalization covers the object-filter DSL.
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
import { PlusIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type VFolderNodesType = NonNullableNodeOnEdges<
  ProjectAdminDataPageQuery$data['projectVfolders']
>;

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

const statusCategoryValues = ['active', 'deleted'] as const;
const modeValues = ['all', 'general', 'data', 'automount', 'model'] as const;

function getUsageModeFilter(mode: (typeof modeValues)[number]) {
  switch (mode) {
    case 'all':
      return undefined;
    case 'general':
      return {
        AND: [
          { name: { iNotStartsWith: '.' } },
          { usageMode: { equals: 'GENERAL' } },
        ],
      } as const;
    case 'data':
      return { usageMode: { equals: 'DATA' } } as const;
    case 'automount':
      return { name: { iStartsWith: '.' } } as const;
    case 'model':
      return { usageMode: { equals: 'MODEL' } } as const;
    default:
      return undefined;
  }
}

interface ProjectAdminDataContentProps {
  project: ProjectContext;
}

const ProjectAdminDataContent: React.FC<ProjectAdminDataContentProps> = ({
  project,
}) => {
  'use memo';

  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ProjectAdminDataPage',
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
      order: parseAsStringLiteral(availableVFolderSorterValues).withDefault(
        '-created_at',
      ),
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

  // eslint-disable-next-line react-hooks/refs
  queryMapRef.current[queryParams.statusCategory] = {
    queryParams,
    tablePaginationOption,
  };

  const usageModeFilter = getUsageModeFilter(queryParams.mode);

  const [fetchKey, updateFetchKey] = useFetchKey();

  const statusFilter =
    queryParams.statusCategory === 'deleted'
      ? STATUS_FILTER_DELETED
      : STATUS_FILTER_ACTIVE;

  const combinedFilter = {
    AND: filterOutEmpty([
      statusFilter,
      usageModeFilter,
      queryParams.filter ?? undefined,
    ]),
  };

  const queryVariables = {
    projectId: project.id,
    offset: baiPaginationOption.offset,
    limit: baiPaginationOption.first,
    filter: combinedFilter,
    orderBy: convertToOrderBy<VFolderOrderBy>(queryParams.order),
    filterForActiveCount: STATUS_FILTER_ACTIVE,
    filterForDeletedCount: STATUS_FILTER_DELETED,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { projectVfolders, ...folderCounts } =
    useLazyLoadQuery<ProjectAdminDataPageQuery>(
      graphql`
        query ProjectAdminDataPageQuery(
          $projectId: UUID!
          $offset: Int
          $limit: Int
          $filter: VFolderFilter
          $orderBy: [VFolderOrderBy!]
          $filterForActiveCount: VFolderFilter
          $filterForDeletedCount: VFolderFilter
        ) {
          projectVfolders(
            projectId: $projectId
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
                ...BAIVFolderDeleteButtonV2Fragment
              }
            }
            count
          }
          active: projectVfolders(
            projectId: $projectId
            filter: $filterForActiveCount
          ) {
            count
          }
          deleted: projectVfolders(
            projectId: $projectId
            filter: $filterForDeletedCount
          ) {
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
    <>
      <BAITabs
        activeKey={queryParams.statusCategory}
        onChange={(key: string) => {
          const storedQuery = queryMapRef.current[key] || {
            mode: 'all',
          };
          // Set to null first to reset to default values
          setQuery(null);
          setQuery(
            {
              ...storedQuery.queryParams,
              statusCategory: key as 'active' | 'deleted',
            },
            { history: 'replace' },
          );
          setTablePaginationOption(
            // pagination is a separate nuqs group that setQuery(null) does not
            // reset, so an unvisited tab must reset current AND pageSize to
            // defaults — otherwise it inherits the departing tab's pageSize.
            storedQuery.tablePaginationOption || { current: 1, pageSize: 10 },
          );
          setSelectedFolderList([]);
        }}
        items={(
          [
            ['active', t('data.Active')],
            ['deleted', t('data.folders.TrashBin')],
          ] as const
        ).map(([key, label]) => {
          const folderCount = folderCounts[key]?.count ?? 0;
          return {
            key,
            label,
            endContent:
              folderCount > 0 ? (
                // PILOT-DECISION: antd's Badge took an arbitrary `color`;
                // Astryx's Badge exposes only a closed `variant` set.
                <Badge
                  label={folderCount}
                  variant={
                    queryParams.statusCategory === key ? 'info' : 'neutral'
                  }
                />
              ) : undefined,
          };
        })}
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
              // TODO(needs-backend): V2 `VFolderFilter` does not expose
              // ownership_type or mount-permission filters; only
              // name/host/status/usageMode/cloneable/createdAt are supported.
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
                  <BAIVFolderDeleteButtonV2
                    vfolderFrgmt={selectedFolderList}
                    // P8: the accessible name is now on the control itself.
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
                      label={t('data.folders.Restore')}
                      icon={<RotateCcwIcon />}
                      onClick={() => {
                        toggleRestoreModal();
                      }}
                    />
                  </Tooltip>
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
                </>
              )}
            <AutoUpdateFetchKeyButton
              settingId="project-admin-data"
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
        <VFolderNodesV2
          order={queryParams.order}
          loading={deferredQueryVariables !== queryVariables}
          project={project}
          vfoldersFrgmt={filterOutNullAndUndefined(
            _.map(projectVfolders?.edges, 'node'),
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
                  _.map(projectVfolders?.edges, 'node'),
                ),
                setSelectedFolderList,
              );
            },
            selectedRowKeys: _.map(selectedFolderList, (i) => i.id),
          }}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: projectVfolders?.count ?? 0,
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
            onColumnOverridesChange: setColumnOverrides,
          }}
        />
      </VStack>
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
        project={project}
        folderType="project"
        alertMessage={t('data.folders.ProjectAdminDataPageAlert')}
        onRequestClose={(result) => {
          toggleCreateModal();
          if (result) {
            updateFetchKey();
          }
        }}
      />
    </>
  );
};

const ProjectAdminDataPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const project = toProjectContext(currentProject);

  return (
    <BAICard title={t('data.ProjectFolders')}>
      <BAIErrorBoundary>
        <Suspense fallback={<BAISkeleton rows={4} />}>
          {project ? (
            <ProjectAdminDataContent project={project} />
          ) : (
            <BAISkeleton rows={4} />
          )}
        </Suspense>
      </BAIErrorBoundary>
    </BAICard>
  );
};

export default ProjectAdminDataPage;
