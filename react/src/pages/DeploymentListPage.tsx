/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentFilter,
  DeploymentListPageQuery,
  DeploymentOrderBy,
  DeploymentStatus,
} from '../__generated__/DeploymentListPageQuery.graphql';
import { DeploymentSettingModal_deployment$key } from '../__generated__/DeploymentSettingModal_deployment.graphql';
import DeploymentList, {
  availableDeploymentOrderValues,
  tableOrderToSort,
  type DeploymentOrderValue,
  type DeploymentStatusCategory,
} from '../components/DeploymentList';
import DeploymentSettingModal from '../components/DeploymentSettingModal';
import { useWebUINavigate } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useToggle } from 'ahooks';
import { Button, Skeleton } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const parseFilterForQuery = (
  filter: string | null,
): DeploymentFilter | undefined => {
  if (!filter) return undefined;
  try {
    const parsed = JSON.parse(filter);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as DeploymentFilter;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const DeploymentListPageContent: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const [isCreating, { setLeft: closeCreate, setRight: openCreate }] =
    useToggle(false);
  const [editingDeploymentFrgmt, setEditingDeploymentFrgmt] =
    useState<DeploymentSettingModal_deployment$key | null>(null);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({ current: 1, pageSize: 10 });

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsString,
      order: parseAsStringLiteral(availableDeploymentOrderValues),
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

  const sort = tableOrderToSort(queryParams.order);
  const orderBy: DeploymentOrderBy[] | undefined = sort
    ? [
        {
          field: sort.field as DeploymentOrderBy['field'],
          direction: sort.order as DeploymentOrderBy['direction'],
        },
      ]
    : undefined;
  const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];
  const statusCategoryFilter: DeploymentFilter =
    queryParams.statusCategory === 'finished'
      ? { status: { in: finishedStatuses } }
      : { status: { notIn: finishedStatuses } };
  const queryVariables = {
    filter: {
      ...parseFilterForQuery(queryParams.filter),
      ...statusCategoryFilter,
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
          ...DeploymentList_modelDeploymentConnection
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

  const isPending =
    deferredQueryVariables !== queryVariables || deferredFetchKey !== fetchKey;

  return (
    <>
      <DeploymentList
        deploymentsFrgmt={myDeployments}
        filter={queryParams.filter ?? undefined}
        setFilter={(value) => {
          setQueryParams({ filter: value || null });
          setTablePaginationOption({ current: 1 });
        }}
        order={queryParams.order ?? undefined}
        onChangeOrder={(order) => {
          setQueryParams({
            order: (order as DeploymentOrderValue) ?? null,
          });
        }}
        statusCategory={queryParams.statusCategory}
        onStatusCategoryChange={(value) => {
          setQueryParams({ statusCategory: value });
          setTablePaginationOption({ current: 1 });
        }}
        pagination={{
          ...tablePaginationOption,
          onChange: (current, pageSize) => {
            setTablePaginationOption({ current, pageSize });
          },
        }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        mode="user"
        loading={isPending}
        onRowClick={(deploymentId) => {
          webuiNavigate(`/deployments/${toLocalId(deploymentId)}`);
        }}
        onEditClick={(frgmt) => setEditingDeploymentFrgmt(frgmt)}
        onDeleteComplete={updateFetchKey}
        toolbarEnd={
          <BAIFlex gap="xs" align="center">
            <BAIFetchKeyButton
              value={fetchKey}
              onChange={updateFetchKey}
              loading={isPending}
            />
            <Button type="primary" onClick={openCreate}>
              {t('deployment.CreateDeployment')}
            </Button>
          </BAIFlex>
        }
      />
      <DeploymentSettingModal
        open={isCreating || !!editingDeploymentFrgmt}
        deploymentFrgmt={editingDeploymentFrgmt}
        onRequestClose={(success) => {
          closeCreate();
          setEditingDeploymentFrgmt(null);
          if (success) updateFetchKey();
        }}
      />
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
