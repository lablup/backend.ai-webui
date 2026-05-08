/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectAdminDeploymentsPageDeleteMutation } from '../__generated__/ProjectAdminDeploymentsPageDeleteMutation.graphql';
import type {
  DeploymentOrderBy,
  ProjectAdminDeploymentsPageQuery,
} from '../__generated__/ProjectAdminDeploymentsPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import BAIRadioGroup from '../components/BAIRadioGroup';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { DeleteFilled } from '@ant-design/icons';
import { App, Skeleton } from 'antd';
import {
  availableDeploymentSorterValues,
  BAICard,
  BAIDeleteConfirmModal,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModelDeploymentNodes,
  GraphQLFilter,
  INITIAL_FETCH_KEY,
  ModelDeploymentNodeInList,
  toLocalId,
  useErrorMessageResolver,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

const ALLOWED_FILTER_KEYS = ['name', 'tags', 'endpointUrl'] as const;
type AllowedFilter = Partial<
  Pick<GraphQLFilter, (typeof ALLOWED_FILTER_KEYS)[number]>
>;

const parseFilter = parseAsJson<AllowedFilter>((raw) => {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return {};
  }
  const filtered: AllowedFilter = {};
  for (const key of ALLOWED_FILTER_KEYS) {
    if (key in raw) {
      filtered[key] = (raw as Record<string, unknown>)[key];
    }
  }
  return filtered;
});

const statusFilterValues = ['ACTIVE', 'INACTIVE'] as const;

const INACTIVE_DEPLOYMENT_STATUSES = ['STOPPED'] as const;

interface ProjectAdminDeploymentsContentProps {
  projectId: string;
}

const ProjectAdminDeploymentsContent: React.FC<
  ProjectAdminDeploymentsContentProps
> = ({ projectId }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [deploymentToDelete, setDeploymentToDelete] =
    useState<ModelDeploymentNodeInList | null>(null);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [commitDeleteDeployment] =
    useMutation<ProjectAdminDeploymentsPageDeleteMutation>(graphql`
      mutation ProjectAdminDeploymentsPageDeleteMutation(
        $input: DeleteDeploymentInput!
      ) {
        deleteModelDeployment(input: $input) {
          id
        }
      }
    `);

  const [queryParams, setQueryParams] = useQueryStates(
    {
      status: parseAsStringLiteral(statusFilterValues).withDefault('ACTIVE'),
      order: parseAsStringLiteral(availableDeploymentSorterValues),
      filter: parseFilter,
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useFetchKey();

  const statusFilter =
    queryParams.status === 'ACTIVE'
      ? { notIn: [...INACTIVE_DEPLOYMENT_STATUSES] }
      : { in: [...INACTIVE_DEPLOYMENT_STATUSES] };

  const queryVariables = {
    projectId,
    filter: {
      ...(queryParams.filter ?? {}),
      status: statusFilter,
    },
    orderBy: convertToOrderBy<Required<DeploymentOrderBy>>(queryParams.order),
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

  const deploymentNodes =
    data.projectDeployments?.edges?.map((edge) => edge?.node) ?? [];
  const total = data.projectDeployments?.count ?? 0;

  const isLoading =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            optionType="button"
            value={queryParams.status}
            onChange={(e) => {
              setQueryParams({ status: e.target.value });
              setTablePaginationOption({ current: 1 });
            }}
            options={[
              { label: t('modelService.Active'), value: 'ACTIVE' },
              { label: t('modelService.Destroyed'), value: 'INACTIVE' },
            ]}
          />
          <BAIGraphQLPropertyFilter
            filterProperties={[
              {
                key: 'name',
                propertyLabel: t('modelService.Name'),
                type: 'string',
              },
              {
                key: 'tags',
                propertyLabel: t('modelService.Tags'),
                type: 'string',
              },
              {
                key: 'endpointUrl',
                propertyLabel: t('modelService.EndpointURL'),
                type: 'string',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({
                filter: (value as AllowedFilter | undefined) ?? null,
              });
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
          setQueryParams({ order });
        }}
        nameColumnActionProps={(_value, record) => {
          const status = record.metadata?.status;
          const isDeleteDisabled =
            !!status &&
            status !== '%future added value' &&
            (INACTIVE_DEPLOYMENT_STATUSES as readonly string[]).includes(
              status,
            );
          return {
            title: record.metadata?.name ?? '-',
            actions: [
              {
                key: 'delete',
                title: t('button.Delete'),
                icon: <DeleteFilled />,
                type: 'danger',
                disabled: isDeleteDisabled,
                onClick: () => {
                  setDeploymentToDelete(record);
                },
              },
            ],
          };
        }}
        pagination={{
          current: tablePaginationOption.current,
          pageSize: tablePaginationOption.pageSize,
          total,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
      />
      <BAIDeleteConfirmModal
        open={!!deploymentToDelete}
        requireConfirmInput
        items={
          deploymentToDelete
            ? [
                {
                  key: deploymentToDelete.id,
                  label:
                    deploymentToDelete.metadata?.name ??
                    toLocalId(deploymentToDelete.id),
                },
              ]
            : []
        }
        onOk={() => {
          if (!deploymentToDelete) return;
          const target = deploymentToDelete;
          const deploymentName = target.metadata?.name ?? toLocalId(target.id);
          return new Promise<void>((resolve) => {
            commitDeleteDeployment({
              variables: { input: { id: toLocalId(target.id) } },
              onCompleted: (_response, errors) => {
                if (errors && errors.length > 0) {
                  errors.forEach((error) => {
                    message.error(
                      getErrorMessage(
                        error,
                        t('modelService.FailedToTerminateService'),
                      ),
                    );
                  });
                } else {
                  message.success(
                    t('modelService.ServiceTerminated', {
                      name: deploymentName,
                    }),
                  );
                  updateFetchKey();
                }
                setDeploymentToDelete(null);
                resolve();
              },
              onError: (error) => {
                message.error(
                  getErrorMessage(
                    error,
                    t('modelService.FailedToTerminateService'),
                  ),
                );
                setDeploymentToDelete(null);
                resolve();
              },
            });
          });
        }}
        onCancel={() => setDeploymentToDelete(null)}
      />
    </BAIFlex>
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
