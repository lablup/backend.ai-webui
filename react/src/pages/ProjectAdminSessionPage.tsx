/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectAdminSessionPageQuery,
  ProjectAdminSessionPageQuery$data,
  SessionV2OrderBy,
  SessionV2Status,
} from '../__generated__/ProjectAdminSessionPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import TerminateSessionModalForProjectAdmin from '../components/TerminateSessionModalForProjectAdmin';
import { convertToOrderBy, handleRowSelectionChange } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Button, Skeleton, Tooltip, theme } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAINameActionCell,
  BAISelectionLabel,
  BAISessionNodesV2,
  GraphQLFilter,
  INITIAL_FETCH_KEY,
  availableSessionV2SorterValues,
  filterOutEmpty,
  filterOutNullAndUndefined,
  useFetchKey,
} from 'backend.ai-ui';
import { PowerOffIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const statusCategoryValues = ['running', 'finished'] as const;

const RUNNING_STATUSES: ReadonlyArray<SessionV2Status> = [
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PREPARED',
  'CREATING',
  'RUNNING',
  'DEPRIORITIZING',
  'TERMINATING',
];

const FINISHED_STATUSES: ReadonlyArray<SessionV2Status> = [
  'TERMINATED',
  'CANCELLED',
];

// The query-level session node. It carries the masked fragment refs for both
// the table (`BAISessionNodesV2Fragment`) and the terminate modal
// (`TerminateSessionModalForProjectAdminFragment`), so row selection / the
// terminate target list pass these nodes straight to the modal.
type ProjectSessionNode = NonNullableNodeOnEdges<
  ProjectAdminSessionPageQuery$data['projectSessionsV2']
>;

interface ProjectAdminSessionContentProps {
  projectId: string;
}

const ProjectAdminSessionContent: React.FC<ProjectAdminSessionContentProps> = ({
  projectId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [selectedSessionList, setSelectedSessionList] = useState<
    Array<ProjectSessionNode>
  >([]);
  const [terminateTargets, setTerminateTargets] = useState<
    Array<ProjectSessionNode>
  >([]);
  const [isTerminateOpen, setIsTerminateOpen] = useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      statusCategory:
        parseAsStringLiteral(statusCategoryValues).withDefault('running'),
      order: parseAsStringLiteral(availableSessionV2SorterValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ProjectAdminSessionPage',
  );

  const statusFilter =
    queryParams.statusCategory === 'running'
      ? { in: RUNNING_STATUSES as readonly SessionV2Status[] }
      : { in: FINISHED_STATUSES as readonly SessionV2Status[] };

  const queryVariables = {
    projectId,
    filter: {
      ...(queryParams.filter ?? {}),
      status: statusFilter,
    },
    orderBy: convertToOrderBy<Required<SessionV2OrderBy>>(
      queryParams.order,
    ) ?? [
      { field: 'CREATED_AT', direction: 'DESC' } as Required<SessionV2OrderBy>,
    ],
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<ProjectAdminSessionPageQuery>(
    graphql`
      query ProjectAdminSessionPageQuery(
        $projectId: UUID!
        $filter: SessionV2Filter
        $orderBy: [SessionV2OrderBy!]
        $limit: Int
        $offset: Int
      ) {
        projectSessionsV2(
          scope: { projectId: $projectId }
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              metadata {
                name
              }
              ...BAISessionNodesV2Fragment
              ...TerminateSessionModalForProjectAdminFragment
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const sessionNodes = filterOutNullAndUndefined(
    data.projectSessionsV2?.edges?.map((edge) => edge?.node),
  );
  const total = data.projectSessionsV2?.count ?? 0;

  const openTerminateModal = (targets: Array<ProjectSessionNode>) => {
    setTerminateTargets(targets);
    setIsTerminateOpen(true);
  };

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            optionType="button"
            value={queryParams.statusCategory}
            onChange={(e) => {
              setQueryParams({ statusCategory: e.target.value });
              setTablePaginationOption({ current: 1 });
            }}
            options={[
              { label: t('session.Running'), value: 'running' },
              { label: t('session.Finished'), value: 'finished' },
            ]}
          />
          <BAIGraphQLPropertyFilter
            filterProperties={[
              {
                key: 'id',
                propertyLabel: 'ID',
                type: 'uuid',
              },
              {
                key: 'name',
                propertyLabel: t('session.SessionName'),
                type: 'string',
              },
              {
                key: 'userUuid',
                propertyLabel: t('session.OwnerUUID'),
                type: 'uuid',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          {selectedSessionList.length > 0 && (
            <>
              <BAISelectionLabel
                count={selectedSessionList.length}
                onClearSelection={() => setSelectedSessionList([])}
              />
              <Tooltip
                title={t('session.TerminateSession')}
                placement="topLeft"
              >
                <Button
                  icon={<PowerOffIcon color={token.colorError} />}
                  onClick={() => openTerminateModal(selectedSessionList)}
                />
              </Tooltip>
            </>
          )}
          <BAIFetchKeyButton
            loading={isLoading}
            value={fetchKey}
            onChange={(next) => updateFetchKey(next)}
            autoUpdateDelay={15_000}
          />
        </BAIFlex>
      </BAIFlex>
      <BAISessionNodesV2
        sessionsFrgmt={sessionNodes}
        loading={isLoading}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({ order });
        }}
        rowSelection={{
          type: 'checkbox',
          preserveSelectedRowKeys: true,
          getCheckboxProps(record) {
            const status = record.lifecycle?.status;
            return {
              disabled:
                !!status &&
                ['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(status),
            };
          },
          onChange: (selectedRowKeys) => {
            handleRowSelectionChange(
              selectedRowKeys,
              sessionNodes,
              setSelectedSessionList,
            );
          },
          selectedRowKeys: selectedSessionList.map((session) => session.id),
        }}
        customizeColumns={(cols) =>
          cols.map((col) => {
            if (col.key !== 'name') return col;
            return {
              ...col,
              render: (_value, session) => {
                const status = session.lifecycle?.status;
                const isTerminated =
                  !!status &&
                  ['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(status);
                // Recover the query-level node (which carries the terminate
                // modal's fragment ref) from the masked table row by id.
                const targetNode = sessionNodes.find(
                  (node) => node.id === session.id,
                );
                // TODO(FR-2944): wire the session-name click to the detail
                // drawer once a v2 detail flow exists. The v1
                // SessionDetailDrawer uses the v1 `compute_session_node` query,
                // which has access-permission issues for project-scoped
                // sessions, so name-click navigation is omitted for now and
                // only the terminate action is provided.
                return (
                  <BAINameActionCell
                    title={session.metadata?.name ?? '-'}
                    showActions="always"
                    actions={filterOutEmpty([
                      {
                        key: 'terminate',
                        title: t('session.TerminateSession'),
                        icon: <PowerOffIcon />,
                        type: 'danger' as const,
                        disabled: isTerminated || !targetNode,
                        onClick: () =>
                          targetNode && openTerminateModal([targetNode]),
                      },
                    ])}
                  />
                );
              },
            };
          })
        }
        pagination={{
          current: tablePaginationOption.current,
          pageSize: tablePaginationOption.pageSize,
          total,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
        tableSettings={{
          columnOverrides: columnOverrides,
          // Match the default-visible columns of the admin session list
          // (AdminComputeSessionListPage).
          defaultColumnOverrides: {
            environment: { hidden: false },
            resourceGroup: { hidden: false },
            sessionType: { hidden: false },
            clusterMode: { hidden: false },
            createdAt: { hidden: false },
          },
          onColumnOverridesChange: setColumnOverrides,
        }}
      />
      <TerminateSessionModalForProjectAdmin
        open={isTerminateOpen}
        sessionsFrgmt={terminateTargets}
        onRequestClose={(success) => {
          setIsTerminateOpen(false);
          if (success) {
            setSelectedSessionList([]);
            updateFetchKey();
          }
        }}
      />
    </BAIFlex>
  );
};

const ProjectAdminSessionPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();

  return (
    <>
      <BAICard
        variant="borderless"
        title={t('webui.menu.ProjectSessions')}
        styles={{
          header: { borderBottom: 'none' },
          body: { paddingTop: 0 },
        }}
      >
        <BAIErrorBoundary>
          <Suspense fallback={<Skeleton active />}>
            {currentProject.id ? (
              <ProjectAdminSessionContent projectId={currentProject.id} />
            ) : (
              <Skeleton active />
            )}
          </Suspense>
        </BAIErrorBoundary>
      </BAICard>
      {/*
        TODO(FR-2944): mount the session detail drawer opener once a v2 detail
        flow is available. The v1 SessionDetailAndContainerLogOpenerLegacy /
        SessionDetailDrawer use the v1 `compute_session_node` query, which has
        access-permission issues for project-scoped sessions.
      */}
    </>
  );
};

export default ProjectAdminSessionPage;
