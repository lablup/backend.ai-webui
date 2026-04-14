/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectAdminSessionsPageQuery,
  SessionV2OrderBy,
  SessionV2Status,
} from '../__generated__/ProjectAdminSessionsPageQuery.graphql';
import type { ProjectAdminSessionsPageTerminateMutation } from '../__generated__/ProjectAdminSessionsPageTerminateMutation.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import ProjectSessionV2Nodes, {
  availableProjectSessionV2SorterValues,
  ProjectSessionV2InList,
} from '../components/ProjectSessionV2Nodes';
import { convertToOrderBy } from '../helper';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { App, Skeleton } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  GraphQLFilter,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useLocation } from 'react-router-dom';

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

interface ProjectAdminSessionsContentProps {
  projectId: string;
}

const ProjectAdminSessionsContent: React.FC<
  ProjectAdminSessionsContentProps
> = ({ projectId }) => {
  'use memo';
  const { t } = useTranslation();
  const { message, modal } = App.useApp();
  const webUINavigate = useWebUINavigate();
  const location = useLocation();

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
      order: parseAsStringLiteral(availableProjectSessionV2SorterValues),
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

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

  const data = useLazyLoadQuery<ProjectAdminSessionsPageQuery>(
    graphql`
      query ProjectAdminSessionsPageQuery(
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
              ...ProjectSessionV2NodesFragment
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

  const sessionNodes =
    data.projectSessionsV2?.edges?.map((edge) => edge?.node) ?? [];
  const total = data.projectSessionsV2?.count ?? 0;

  const [commitTerminate, isTerminating] =
    useMutation<ProjectAdminSessionsPageTerminateMutation>(graphql`
      mutation ProjectAdminSessionsPageTerminateMutation(
        $scope: ProjectSessionV2Scope!
        $sessionIds: [ID!]!
        $forced: Boolean!
      ) {
        terminateProjectSessionsV2(
          scope: $scope
          sessionIds: $sessionIds
          forced: $forced
        ) {
          cancelled
          terminating
          forceTerminated
          skipped
        }
      }
    `);

  const handleTerminate = (session: ProjectSessionV2InList) => {
    modal.confirm({
      title: t('session.TerminateSession'),
      content: session.metadata?.name ?? '',
      okText: t('button.Confirm'),
      okButtonProps: { danger: true },
      onOk: () =>
        new Promise<void>((resolve) => {
          commitTerminate({
            variables: {
              scope: { projectId },
              sessionIds: [session.id],
              forced: false,
            },
            onCompleted: () => {
              message.success(t('session.SessionTerminated'));
              updateFetchKey();
              resolve();
            },
            onError: (error) => {
              message.error(error.message);
              resolve();
            },
          });
        }),
    });
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
                propertyLabel: t('session.launcher.OwnerEmail'),
                type: 'uuid',
              },
              {
                key: 'domainName',
                propertyLabel: t('credential.Domain'),
                type: 'string',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFetchKeyButton
          loading={isLoading || isTerminating}
          value={fetchKey}
          onChange={(next) => updateFetchKey(next)}
          autoUpdateDelay={15_000}
        />
      </BAIFlex>
      <ProjectSessionV2Nodes
        sessionsFrgmt={sessionNodes}
        loading={isLoading}
        order={queryParams.order}
        onChangeOrder={(order) => {
          setQueryParams({ order });
        }}
        onClickSessionName={(session) => {
          // SessionDetailDrawer currently consumes the v1 (ComputeSessionNode)
          // fragment. We still navigate via sessionDetail search param here for
          // parity; fully wiring the drawer to v2 sessions is out of scope
          // for FR-2576.
          const newSearchParams = new URLSearchParams(location.search);
          newSearchParams.set('sessionDetail', session.id);
          webUINavigate({
            pathname: location.pathname,
            hash: location.hash,
            search: newSearchParams.toString(),
          });
        }}
        onClickTerminate={handleTerminate}
        pagination={{
          current: tablePaginationOption.current,
          pageSize: tablePaginationOption.pageSize,
          total,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
      />
    </BAIFlex>
  );
};

const ProjectAdminSessionsPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();

  return (
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
            <ProjectAdminSessionsContent projectId={currentProject.id} />
          ) : (
            <Skeleton active />
          )}
        </Suspense>
      </BAIErrorBoundary>
    </BAICard>
  );
};

export default ProjectAdminSessionsPage;
