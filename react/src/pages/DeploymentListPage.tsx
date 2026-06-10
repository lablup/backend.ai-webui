/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentListPageDeleteMutation } from '../__generated__/DeploymentListPageDeleteMutation.graphql';
import {
  DeploymentFilter,
  DeploymentListPageQuery,
  DeploymentOrderBy,
  DeploymentStatus,
} from '../__generated__/DeploymentListPageQuery.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import BAIRadioGroup from '../components/BAIRadioGroup';
import DeploymentRevisionDetailDrawer from '../components/DeploymentRevisionDetailDrawer';
import DeploymentSettingModal from '../components/DeploymentSettingModal';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { DeleteFilled, EditOutlined } from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Skeleton, Typography } from 'antd';
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

const DeploymentListPageContent: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webuiNavigate = useWebUINavigate();
  const [isCreating, { setLeft: closeCreate, setRight: openCreate }] =
    useToggle(false);

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
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

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
    'table_column_overrides.DeploymentListPage',
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const currentProject = useCurrentProjectValue();

  const sort = parseDeploymentOrder(queryParams.order);
  const orderBy: DeploymentOrderBy[] | undefined = sort
    ? [
        {
          field: sort.field as DeploymentOrderBy['field'],
          direction: sort.direction as DeploymentOrderBy['direction'],
        },
      ]
    : undefined;
  const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
  const statusCategoryFilter: DeploymentFilter =
    queryParams.statusCategory === 'finished'
      ? { status: { in: finishedStatuses } }
      : { status: { notIn: finishedStatuses } };
  const projectFilter: DeploymentFilter = currentProject.id
    ? { projectId: { equals: currentProject.id } }
    : {};
  const queryVariables = {
    filter: {
      ...((queryParams.filter ?? {}) as DeploymentFilter),
      ...statusCategoryFilter,
      ...projectFilter,
    },
    orderBy,
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { myDeployments } = useLazyLoadQuery<DeploymentListPageQuery>(
    graphql`
      query DeploymentListPageQuery(
        $filter: DeploymentFilter
        $orderBy: [DeploymentOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        myDeployments(
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
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
      fetchKey: deferredFetchKey,
    },
  );

  const deploymentNodes = filterOutNullAndUndefined(
    _.map(myDeployments?.edges, 'node'),
  );
  const total = myDeployments?.count ?? 0;
  const editingDeployment =
    editingDeploymentId == null
      ? null
      : (deploymentNodes.find((n) => n.id === editingDeploymentId) ?? null);
  const deletingDeployment =
    deletingDeploymentId == null
      ? null
      : (deploymentNodes.find((n) => n.id === deletingDeploymentId) ?? null);

  const isPending =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  const [commitDeleteMutation, isInFlightDeleteMutation] =
    useMutation<DeploymentListPageDeleteMutation>(graphql`
      mutation DeploymentListPageDeleteMutation(
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
          <BAIFlex gap="xs" align="center">
            <BAIFetchKeyButton
              autoUpdateDelay={15_000}
              value={fetchKey}
              onChange={updateFetchKey}
              loading={isPending}
            />
            <Button type="primary" onClick={openCreate}>
              {t('deployment.CreateDeployment')}
            </Button>
          </BAIFlex>
        </BAIFlex>
        <BAIModelDeploymentNodes
          deploymentsFrgmt={deploymentNodes}
          loading={isPending}
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
          // Mirror the column set the legacy `DeploymentList` (mode="user")
          // exposed: drop admin-only keys (owner / projectId / domainName) and
          // newly-introduced keys (replicas / currentRevisionId /
          // preferredDomainName / strategyType), and restore the original
          // default-visible set.
          customizeColumns={(base) => {
            const allowedKeys = [
              'name',
              'currentRevisionNumber',
              'status',
              'replicaSummary',
              'model',
              'createdAt',
              'id',
              'endpointUrl',
              'tags',
              'updatedAt',
              'openToPublic',
              'resourceGroup',
            ];
            const defaultVisibleKeys = new Set([
              'name',
              'currentRevisionNumber',
              'status',
              'replicaSummary',
              'model',
              'createdAt',
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
                            webuiNavigate(
                              `/deployments/${toLocalId(record.id)}`,
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
                          webuiNavigate({
                            pathname: '/deployments',
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
                // `name` is required + fixed:left in the base column; leave
                // its visibility flags untouched. For every other key,
                // restore the main visibility default explicitly.
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
        open={isCreating || !!editingDeployment}
        deploymentFrgmt={editingDeployment ?? null}
        onRequestClose={(success) => {
          closeCreate();
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

const DeploymentListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAICard
        variant="borderless"
        title={t('webui.menu.Deployments')}
        styles={{ body: { paddingTop: 0 } }}
      >
        <Suspense fallback={<Skeleton active />}>
          <DeploymentListPageContent />
        </Suspense>
      </BAICard>
    </BAIFlex>
  );
};

export default DeploymentListPage;
