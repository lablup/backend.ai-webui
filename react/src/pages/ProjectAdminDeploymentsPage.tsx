/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import type { ProjectAdminDeploymentsPageDeleteMutation } from '../__generated__/ProjectAdminDeploymentsPageDeleteMutation.graphql';
import type {
  DeploymentFilter,
  DeploymentOrderField,
  DeploymentStatus,
  OrderDirection,
  ProjectAdminDeploymentsPageQuery,
} from '../__generated__/ProjectAdminDeploymentsPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import DeploymentRevisionDetailDrawer from '../components/DeploymentRevisionDetailDrawer';
import DeploymentSettingModal from '../components/DeploymentSettingModal';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import { App, Skeleton, Typography } from 'antd';
import {
  BAICard,
  BAIDeleteConfirmModal,
  BAIDeploymentTagChips,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLFilterProperty,
  BAIGraphQLPropertyFilter,
  BAIModelDeploymentNodes,
  BAINameActionCell,
  BAIUnmountAfterClose,
  DeploymentOrderValue,
  GraphQLFilter,
  INITIAL_FETCH_KEY,
  availableDeploymentSorterValues,
  filterOutNullAndUndefined,
  isDeploymentInStoppedCategory,
  parseDeploymentOrder,
  toLocalId,
  useBAILogger,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type DeploymentStatusCategory = 'running' | 'finished';

interface ProjectAdminDeploymentsContentProps {
  projectId: string;
}

const ProjectAdminDeploymentsContent: React.FC<
  ProjectAdminDeploymentsContentProps
> = ({ projectId }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webUINavigate = useWebUINavigate();

  const [editingDeploymentId, setEditingDeploymentId] = useState<string | null>(
    null,
  );
  const [deletingDeploymentId, setDeletingDeploymentId] = useState<
    string | null
  >(null);
  const [drawerRevisionFrgmt, setDrawerRevisionFrgmt] =
    useState<DeploymentRevisionDetail_revision$key | null>(null);

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
      filter: parseAsJson<GraphQLFilter>((value) =>
        typeof value === 'object' && value !== null && !Array.isArray(value)
          ? (value as GraphQLFilter)
          : ({} as GraphQLFilter),
      ),
      order: parseAsStringLiteral(availableDeploymentSorterValues),
      statusCategory: parseAsStringLiteral<DeploymentStatusCategory>([
        'running',
        'finished',
      ]).withDefault('running'),
    },
    { history: 'replace' },
  );

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.ProjectAdminDeploymentsPage',
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
  const statusCategoryFilter: DeploymentFilter =
    queryParams.statusCategory === 'finished'
      ? { status: { in: finishedStatuses } }
      : { status: { notIn: finishedStatuses } };

  const sort = parseDeploymentOrder(queryParams.order);
  const queryVariables = {
    projectId,
    filter: {
      ...((queryParams.filter ?? {}) as DeploymentFilter),
      ...statusCategoryFilter,
    },
    orderBy: sort
      ? [
          {
            field: sort.field as DeploymentOrderField,
            direction: sort.direction as OrderDirection,
          },
        ]
      : undefined,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<ProjectAdminDeploymentsPageQuery>(
    graphql`
      query ProjectAdminDeploymentsPageQuery(
        $projectId: UUID!
        $filter: DeploymentFilter
        $orderBy: [DeploymentOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        projectDeployments(
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
              ...BAIModelDeploymentNodesFragment
              ...DeploymentSettingModal_deployment
              metadata {
                name
                status
              }
              currentRevision @since(version: "26.4.3") {
                id
                revisionNumber
                ...DeploymentRevisionDetail_revision
              }
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

  const deploymentNodes = filterOutNullAndUndefined(
    _.map(data.projectDeployments?.edges, 'node'),
  );
  const total = data.projectDeployments?.count ?? 0;
  const editingDeployment =
    editingDeploymentId == null
      ? null
      : (deploymentNodes.find((n) => n.id === editingDeploymentId) ?? null);
  const deletingDeployment =
    deletingDeploymentId == null
      ? null
      : (deploymentNodes.find((n) => n.id === deletingDeploymentId) ?? null);

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<ProjectAdminDeploymentsPageDeleteMutation>(graphql`
      mutation ProjectAdminDeploymentsPageDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  const filterProperties: Array<BAIGraphQLFilterProperty> = [
    {
      key: 'name',
      propertyLabel: t('deployment.filter.Name'),
      type: 'string',
    },
    {
      key: 'tags',
      propertyLabel: t('deployment.filter.Tags'),
      type: 'string',
    },
    {
      key: 'endpointUrl',
      propertyLabel: t('deployment.filter.EndpointUrl'),
      type: 'string',
    },
    {
      key: 'openToPublic',
      propertyLabel: t('deployment.filter.OpenToPublic'),
      type: 'boolean',
    },
  ];

  return (
    <>
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex justify="between" wrap="wrap" gap="sm">
          <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
            <BAIRadioGroup
              optionType="button"
              value={queryParams.statusCategory}
              onChange={(e) => {
                setQueryParams({ statusCategory: e.target.value });
                setTablePaginationOption({ current: 1 });
              }}
              options={[
                { label: t('deployment.Running'), value: 'running' },
                {
                  label: t('deployment.status.Terminated'),
                  value: 'finished',
                },
              ]}
            />
            <BAIGraphQLPropertyFilter
              filterProperties={filterProperties}
              value={queryParams.filter ?? undefined}
              onChange={(value) => {
                setQueryParams({ filter: value ?? null });
                setTablePaginationOption({ current: 1 });
              }}
            />
          </BAIFlex>
          <BAIFetchKeyButton
            loading={isLoading}
            value={fetchKey}
            onChange={(next) => updateFetchKey(next)}
            autoUpdateDelay={15_000}
          />
        </BAIFlex>
        <BAIModelDeploymentNodes
          deploymentsFrgmt={deploymentNodes}
          loading={isLoading}
          order={queryParams.order}
          onChangeOrder={(order) => {
            setQueryParams({ order: (order as DeploymentOrderValue) ?? null });
          }}
          pagination={{
            current: tablePaginationOption.current,
            pageSize: tablePaginationOption.pageSize,
            total,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
          tableSettings={{
            columnOverrides,
            onColumnOverridesChange: setColumnOverrides,
          }}
          // Match the column set the legacy `DeploymentList` (mode="admin")
          // exposed — the project-admin page surfaces the same per-deployment
          // attributes (owner, domain, project) as the system-admin page.
          customizeColumns={(base) => {
            const allowedKeys = [
              'name',
              'currentRevisionNumber',
              'status',
              'replicaSummary',
              'model',
              'createdAt',
              'owner',
              'id',
              'endpointUrl',
              'tags',
              'updatedAt',
              'openToPublic',
              'resourceGroup',
              'domainName',
              'projectId',
            ];
            const defaultVisibleKeys = new Set([
              'name',
              'currentRevisionNumber',
              'status',
              'replicaSummary',
              'model',
              'createdAt',
              'owner',
            ]);
            return base
              .filter((col) => allowedKeys.includes(col.key as string))
              .map((col) => {
                let next = col;
                if (col.key === 'name') {
                  next = {
                    ...col,
                    render: (_value, record) => {
                      const destroying = isDeploymentInStoppedCategory(
                        record.metadata?.status,
                      );
                      return (
                        <BAINameActionCell
                          title={record.metadata?.name ?? '-'}
                          onTitleClick={() =>
                            webUINavigate(
                              `/project-admin-deployments/${toLocalId(record.id)}`,
                            )
                          }
                          copyable
                          showActions="always"
                          actions={[
                            {
                              key: 'edit',
                              title: t('deployment.EditDeployment'),
                              icon: <EditOutlined />,
                              disabled: destroying,
                              onClick: () => setEditingDeploymentId(record.id),
                            },
                            {
                              key: 'delete',
                              title: t('deployment.DeleteDeployment'),
                              icon: <DeleteFilled />,
                              type: 'danger',
                              disabled: destroying,
                              onClick: () => setDeletingDeploymentId(record.id),
                            },
                          ]}
                        />
                      );
                    },
                  };
                } else if (col.key === 'currentRevisionNumber') {
                  next = {
                    ...col,
                    render: (_value, record) => {
                      // Recover the wider node (with
                      // `...DeploymentRevisionDetail_revision` on
                      // `currentRevision`) from the page-typed query result.
                      const wider = deploymentNodes.find(
                        (n) => n.id === record.id,
                      );
                      const revision = wider?.currentRevision;
                      if (revision?.revisionNumber == null) {
                        return (
                          <Typography.Text type="secondary">-</Typography.Text>
                        );
                      }
                      return (
                        <Typography.Link
                          onClick={() => setDrawerRevisionFrgmt(revision)}
                        >{`#${revision.revisionNumber}`}</Typography.Link>
                      );
                    },
                  };
                } else if (col.key === 'tags') {
                  next = {
                    ...col,
                    render: (_value, record) => (
                      <BAIDeploymentTagChips
                        metadataFrgmt={record.metadata}
                        stopRowClick
                        onTagClick={(tag) => {
                          webUINavigate({
                            pathname: '/project-admin-deployments',
                            search: new URLSearchParams({
                              filter: JSON.stringify({
                                tags: { iContains: tag },
                              }),
                            }).toString(),
                          });
                        }}
                        fallback={
                          <Typography.Text type="secondary">-</Typography.Text>
                        }
                      />
                    ),
                  };
                }
                if (col.key === 'name') return next;
                return {
                  ...next,
                  defaultHidden: !defaultVisibleKeys.has(col.key as string),
                };
              });
          }}
        />
      </BAIFlex>
      <DeploymentSettingModal
        open={!!editingDeployment}
        deploymentFrgmt={editingDeployment ?? null}
        onRequestClose={(success) => {
          setEditingDeploymentId(null);
          if (success) updateFetchKey();
        }}
      />
      <BAIDeleteConfirmModal
        open={!!deletingDeployment}
        title={t('deployment.DeleteDeployment')}
        target={t('deployment.Deployment')}
        items={
          deletingDeployment
            ? [
                {
                  key: deletingDeployment.id,
                  label: deletingDeployment.metadata?.name ?? '',
                },
              ]
            : []
        }
        confirmText={deletingDeployment?.metadata?.name ?? ''}
        requireConfirmInput
        inputProps={{
          placeholder: deletingDeployment?.metadata?.name ?? '',
        }}
        okButtonProps={{ loading: isInFlightDeleteMutation }}
        onOk={() => {
          if (!deletingDeployment) return;
          commitDeleteMutation({
            variables: {
              input: {
                id: toLocalId(deletingDeployment.id) ?? deletingDeployment.id,
              },
            },
            onCompleted: (_response, errors) => {
              if (errors && errors.length > 0) {
                logger.error('Failed to delete deployment', errors);
                message.error(t('deployment.FailedToDeleteDeployment'));
                return;
              }
              message.success(t('deployment.DeploymentDeleted'));
              setDeletingDeploymentId(null);
              updateFetchKey();
            },
            onError: (error) => {
              logger.error('Failed to delete deployment', error);
              message.error(t('deployment.FailedToDeleteDeployment'));
            },
          });
        }}
        onCancel={() => setDeletingDeploymentId(null)}
      />
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          open={!!drawerRevisionFrgmt}
          revisionFrgmt={drawerRevisionFrgmt}
          onClose={() => setDrawerRevisionFrgmt(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

const ProjectAdminDeploymentsPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();

  return (
    <BAICard
      variant="borderless"
      title={t('webui.menu.ProjectDeployments')}
      styles={{
        header: { borderBottom: 'none' },
        body: { paddingTop: 0 },
      }}
    >
      <BAIErrorBoundary>
        <Suspense fallback={<Skeleton active />}>
          {currentProject.id ? (
            <ProjectAdminDeploymentsContent projectId={currentProject.id} />
          ) : (
            <Skeleton active />
          )}
        </Suspense>
      </BAIErrorBoundary>
    </BAICard>
  );
};

export default ProjectAdminDeploymentsPage;
