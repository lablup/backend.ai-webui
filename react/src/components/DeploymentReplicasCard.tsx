/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DeploymentReplicasCardListQuery,
  ReplicaOrderBy,
} from '../__generated__/DeploymentReplicasCardListQuery.graphql';
import { DeploymentReplicasCard_deployment$key } from '../__generated__/DeploymentReplicasCard_deployment.graphql';
import type { DeploymentRevisionDetail_revision$key } from '../__generated__/DeploymentRevisionDetail_revision.graphql';
import { RouteSchedulingHistoryModalQuery } from '../__generated__/RouteSchedulingHistoryModalQuery.graphql';
import { convertToOrderBy } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import BAIErrorBoundary from './BAIErrorBoundary';
import BAIRadioGroup from './BAIRadioGroup';
import DeploymentRevisionDetailDrawer from './DeploymentRevisionDetailDrawer';
import ReplicaStatusTag, { ReplicaStatus } from './ReplicaStatusTag';
import RouteSchedulingHistoryModal, {
  RouteSchedulingHistoryQuery,
} from './RouteSchedulingHistoryModal';
import SessionDetailDrawer from './SessionDetailDrawer';
import { HistoryOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Skeleton, Tooltip, Typography, theme } from 'antd';
import {
  BAIButton,
  BAICard,
  BAIColumnType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAIQuestionIconWithTooltip,
  BAITable,
  BAITag,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  filterOutEmpty,
  safeDecodeUuid,
  toLocalId,
  type GraphQLFilter,
  useConnectedBAIClient,
  BAILink,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useQueryLoader,
} from 'react-relay';

type ReplicaStatusCategory = 'running' | 'terminated';

const TERMINATED_STATUSES = ['TERMINATED', 'FAILED_TO_START'] as const;

const buildStatusFilter = (category: ReplicaStatusCategory) =>
  category === 'terminated'
    ? { status: { in: [...TERMINATED_STATUSES] } }
    : { status: { notIn: [...TERMINATED_STATUSES] } };

const mergeWithStatusFilter = (
  userFilter: Record<string, unknown> | null,
  category: ReplicaStatusCategory,
) => ({ ...userFilter, ...buildStatusFilter(category) });

const availableReplicaSorterKeys = ['createdAt', 'id'] as const;
const availableReplicaSorterValues = [
  ...availableReplicaSorterKeys,
  ...availableReplicaSorterKeys.map((key) => `-${key}` as const),
] as const;
const isEnableSorter = (key: string) =>
  _.includes(availableReplicaSorterKeys, key);

/**
 * Narrow the GraphQL-derived `healthStatus` / `status` enum value to the
 * union accepted by `ReplicaStatusTag`. The schema enums are strict subsets,
 * so this is a no-op cast with an `unknown` fallback when the backend later
 * adds a value the tag does not yet render (e.g. `WARMING_UP` for `status`).
 */
const toReplicaTagStatus = (value?: string | null): ReplicaStatus =>
  (value as ReplicaStatus) ?? 'NOT_CHECKED';

interface DeploymentReplicasCardProps {
  deploymentFrgmt: DeploymentReplicasCard_deployment$key;
  deploymentId: string;
  // External fetch key (e.g. bumped by the page when a new revision is added
  // and replicas are spawned) — combined with the local manual-refresh key so
  // either event re-issues the list query.
  replicaFetchKey?: string;
}

/**
 * DeploymentReplicasCard — top-level Replicas card on the Deployment detail
 * page. Owns the `BAICard` (title + tooltip) and the error/loading boundaries
 * so the card header stays visible while the replicas list (loaded by the
 * inner `DeploymentReplicasCardContent`) suspends.
 */
const DeploymentReplicasCard: React.FC<DeploymentReplicasCardProps> = ({
  deploymentFrgmt,
  deploymentId,
  replicaFetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAICard
      title={
        <BAIFlex gap="xs" align="center">
          {t('deployment.tab.Replicas')}
          <Tooltip title={t('deployment.tab.description.Replicas')}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextDescription }}
            />
          </Tooltip>
        </BAIFlex>
      }
      styles={{ body: { paddingTop: 0 } }}
    >
      <BAIErrorBoundary>
        <Suspense fallback={<Skeleton active />}>
          <DeploymentReplicasCardContent
            deploymentFrgmt={deploymentFrgmt}
            deploymentId={deploymentId}
            replicaFetchKey={replicaFetchKey}
          />
        </Suspense>
      </BAIErrorBoundary>
    </BAICard>
  );
};

const DeploymentReplicasCardContent: React.FC<DeploymentReplicasCardProps> = ({
  deploymentFrgmt,
  deploymentId,
  replicaFetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    // Keep the original setting key (component renamed Tab→Card) so users don't
    // lose saved column customizations.
    'table_column_overrides.DeploymentReplicasTab',
  );

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(10),
      order: parseAsStringLiteral(availableReplicaSorterValues),
      rFilter: parseAsString,
      rStatusCategory: parseAsStringLiteral<ReplicaStatusCategory>([
        'running',
        'terminated',
      ]).withDefault('running'),
    },
    {
      history: 'replace',
      urlKeys: {
        current: 'rCurrent',
        pageSize: 'rPageSize',
        order: 'rOrder',
        rFilter: 'rFilter',
        rStatusCategory: 'rStatusCategory',
      },
    },
  );

  useFragment(
    graphql`
      fragment DeploymentReplicasCard_deployment on ModelDeployment {
        id
      }
    `,
    deploymentFrgmt,
  );

  const parseReplicaFilter = (filter: string | null) => {
    if (!filter) return null;
    try {
      const parsed = JSON.parse(filter);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed
        : null;
    } catch {
      return null;
    }
  };

  const stringifyReplicaFilter = (
    filter: GraphQLFilter | undefined,
  ): string => {
    if (!filter || Object.keys(filter).length === 0) return '';
    return JSON.stringify(filter);
  };

  const [queryVars, setQueryVars] = useState(() => ({
    filter: mergeWithStatusFilter(
      queryParams.rFilter ? parseReplicaFilter(queryParams.rFilter) : null,
      queryParams.rStatusCategory,
    ),
    orderBy: convertToOrderBy<ReplicaOrderBy>(
      queryParams.order || '-createdAt',
    ),
    limit: queryParams.pageSize,
    offset:
      queryParams.current > 1
        ? (queryParams.current - 1) * queryParams.pageSize
        : 0,
  }));

  const [fetchKey, setFetchKey] = useState(0);
  // First load (no manual refresh and no page-driven replica refetch yet) can
  // serve cached data immediately and refresh in the background; explicit
  // refresh / add-revision goes network-only for fresh data. Mirrors
  // DeploymentRevisionHistoryTab.
  const isInitialFetch =
    fetchKey === 0 &&
    (replicaFetchKey === undefined || replicaFetchKey === INITIAL_FETCH_KEY);
  const baiClient = useConnectedBAIClient();
  const supportsRouteSchedulingHistory = baiClient.supports(
    'route-scheduling-history',
  );
  const [isRouteHistoryOpen, setIsRouteHistoryOpen] = useState(false);
  const [routeHistoryQueryRef, loadRouteHistoryQuery] =
    useQueryLoader<RouteSchedulingHistoryModalQuery>(
      RouteSchedulingHistoryQuery,
    );
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [drawerRevisionFrgmt, setDrawerRevisionFrgmt] =
    useState<DeploymentRevisionDetail_revision$key | null>(null);

  const { deployment: listData } =
    useLazyLoadQuery<DeploymentReplicasCardListQuery>(
      graphql`
        query DeploymentReplicasCardListQuery(
          $deploymentId: ID!
          $filter: ReplicaFilter
          $orderBy: [ReplicaOrderBy!]
          $limit: Int
          $offset: Int
        ) {
          deployment(id: $deploymentId) {
            replicas(
              filter: $filter
              orderBy: $orderBy
              limit: $limit
              offset: $offset
            ) {
              count
              edges {
                node {
                  id
                  sessionId
                  revisionId
                  status
                  trafficStatus
                  healthStatus
                  createdAt
                  revision {
                    id
                    revisionNumber
                    ...DeploymentRevisionDetail_revision
                  }
                  sessionV2 @since(version: "26.4.3") {
                    id
                    metadata {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `,
      { deploymentId, ...queryVars },
      {
        fetchKey: `${fetchKey}-${replicaFetchKey ?? ''}`,
        fetchPolicy: isInitialFetch ? 'store-and-network' : 'network-only',
      },
    );

  const replicas =
    listData?.replicas?.edges
      ?.map((edge) => edge?.node)
      ?.filter((n): n is NonNullable<typeof n> => Boolean(n)) ?? [];

  type ReplicaNode = (typeof replicas)[number];

  const doRefetch = (overrides?: {
    filter?: ReturnType<typeof parseReplicaFilter>;
    orderBy?: ReturnType<typeof convertToOrderBy<ReplicaOrderBy>>;
    limit?: number;
    offset?: number;
  }) => {
    startTransition(() => {
      setQueryVars((prev) => ({ ...prev, ...overrides }));
    });
  };

  const trafficStatusOptions = [
    { label: t('replicaStatus.Active'), value: 'ACTIVE' },
    { label: t('replicaStatus.Inactive'), value: 'INACTIVE' },
  ];

  const filterProperties = [
    {
      key: 'trafficStatus',
      propertyLabel: t('deployment.TrafficStatus'),
      type: 'enum' as const,
      options: trafficStatusOptions,
      strictSelection: true,
    },
  ];

  const filterValue: GraphQLFilter | undefined = queryParams.rFilter
    ? (parseReplicaFilter(queryParams.rFilter) ?? undefined)
    : undefined;

  const columns: BAIColumnType<ReplicaNode>[] = filterOutEmpty([
    {
      key: 'id',
      title: t('deployment.ReplicaId'),
      dataIndex: 'id',
      fixed: 'left',
      sorter: isEnableSorter('id'),
      render: (value: string) => <BAIId globalId={value} copyable />,
    },
    {
      // Lifecycle status (PROVISIONING → RUNNING → TERMINATING …) shown
      // separately from the health (`healthStatus`) and traffic
      // (`trafficStatus`) columns below. The three columns answer different
      // questions: this one is "where is the replica in its lifecycle?",
      // HealthStatus is "is it currently healthy?", TrafficStatus is "is it
      // taking traffic right now?".
      key: 'status',
      title: (
        <BAIFlex gap="xxs" align="center">
          {t('deployment.ReplicaLifecycle')}
          <BAIQuestionIconWithTooltip
            title={t('deployment.ReplicaLifecycleStatusTooltip')}
          />
        </BAIFlex>
      ),
      dataIndex: 'status',
      render: (value: string | null | undefined, record: ReplicaNode) => (
        <BAIFlex align="center" gap="xs">
          <ReplicaStatusTag status={toReplicaTagStatus(value)} />
          {supportsRouteSchedulingHistory && (
            <Tooltip title={t('route.RouteSchedulingHistory')}>
              <BAIButton
                type="link"
                icon={<HistoryOutlined />}
                size="small"
                style={{ padding: 0 }}
                action={async () => {
                  const id = safeDecodeUuid(record.id) ?? record.id;
                  // Render-as-you-fetch: start the request in the open event.
                  loadRouteHistoryQuery(
                    {
                      scope: { routeId: id },
                      orderBy: [{ field: 'UPDATED_AT', direction: 'DESC' }],
                      limit: 10,
                      offset: 0,
                    },
                    {
                      fetchPolicy: 'store-and-network',
                    },
                  );
                  setIsRouteHistoryOpen(true);
                }}
              />
            </Tooltip>
          )}
        </BAIFlex>
      ),
    },
    {
      key: 'healthStatus',
      title: (
        <BAIFlex gap="xxs" align="center">
          {t('deployment.HealthStatus')}
          <BAIQuestionIconWithTooltip
            title={t('deployment.HealthStatusTooltip')}
          />
        </BAIFlex>
      ),
      dataIndex: 'healthStatus',
      render: (value: string | null | undefined, record: ReplicaNode) => (
        // TODO(needs-backend): FR-2787 — expose failure reason / error message
        // from the replica once the backend adds a `failureReason` field to
        // `ModelReplica` so unhealthy replicas surface actionable error info.
        //
        // A terminated replica reports healthStatus NOT_CHECKED, whose
        // "awaiting the first health check" tooltip is misleading once the
        // replica is gone — suppress the tooltip in that case (keep the tag).
        <ReplicaStatusTag
          status={toReplicaTagStatus(value)}
          showTooltip={toReplicaTagStatus(record.status) !== 'TERMINATED'}
        />
      ),
    },
    {
      key: 'trafficStatus',
      title: (
        <BAIFlex gap="xxs" align="center">
          {t('deployment.TrafficStatus')}
          <BAIQuestionIconWithTooltip
            title={t('deployment.TrafficStatusTooltip')}
          />
        </BAIFlex>
      ),
      dataIndex: 'trafficStatus',
      render: (value: string | null | undefined) => (
        <BAITag color={value === 'ACTIVE' ? 'success' : 'default'}>
          {value === 'ACTIVE'
            ? t('replicaStatus.Active')
            : t('replicaStatus.Inactive')}
        </BAITag>
      ),
    },
    {
      // Session column resolves through `sessionV2` so we get the real compute
      // session — `ModelReplica.sessionId` returns the replica's own route_id
      // (BA-5838) and is unusable as a session ref.
      key: 'session',
      title: t('general.Session'),
      onCell: () => ({ style: { maxWidth: 240 } }),
      render: (_: unknown, record: ReplicaNode) => {
        const session = record.sessionV2;
        if (!session?.id) {
          return <Typography.Text type="secondary">—</Typography.Text>;
        }
        const name = session.metadata?.name;
        if (!name) {
          return <BAIId globalId={session.id} />;
        }
        return (
          <>
            <BAILink
              ellipsis
              onClick={() => setSelectedSessionId(toLocalId(session.id))}
              style={{ maxWidth: 160 }}
            >
              {name}
            </BAILink>
            &nbsp;
            <Typography.Text type="secondary">
              (<BAIId globalId={session.id} type="secondary" />)
            </Typography.Text>
          </>
        );
      },
    },
    {
      key: 'revision',
      title: (
        <BAIFlex gap="xxs" align="center">
          {t('deployment.RevisionNumberWithID')}
          <BAIQuestionIconWithTooltip
            title={t('deployment.RevisionNumberTooltip')}
          />
        </BAIFlex>
      ),
      render: (_: unknown, record: ReplicaNode) => {
        const revision = record.revision;
        if (!revision?.id) {
          return <Typography.Text type="secondary">—</Typography.Text>;
        }
        return (
          <>
            <Typography.Link
              onClick={() =>
                setDrawerRevisionFrgmt(
                  revision as DeploymentRevisionDetail_revision$key,
                )
              }
            >
              {revision.revisionNumber != null
                ? `#${revision.revisionNumber}`
                : '-'}
            </Typography.Link>
            &nbsp;
            <Typography.Text type="secondary">
              (<BAIId globalId={revision.id} type="secondary" />)
            </Typography.Text>
          </>
        );
      },
    },
    {
      key: 'createdAt',
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: isEnableSorter('createdAt'),
      render: (value: string | null | undefined) =>
        value ? dayjs(value).format('lll') : '-',
    },
  ]);

  return (
    <>
      <BAIFlex
        justify="between"
        align="center"
        gap="xs"
        style={{ marginBottom: 12 }}
      >
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIRadioGroup
            value={queryParams.rStatusCategory}
            onChange={(e) => {
              const category = e.target.value as ReplicaStatusCategory;
              const userFilter = queryParams.rFilter
                ? parseReplicaFilter(queryParams.rFilter)
                : null;
              setQueryParams({ rStatusCategory: category, current: 1 });
              doRefetch({
                filter: mergeWithStatusFilter(userFilter, category),
                offset: 0,
              });
            }}
            options={[
              { label: t('deployment.Running'), value: 'running' },
              { label: t('deployment.status.Terminated'), value: 'terminated' },
            ]}
          />
          <BAIGraphQLPropertyFilter
            filterProperties={filterProperties}
            value={filterValue}
            onChange={(next) => {
              const str = stringifyReplicaFilter(next);
              setQueryParams({ rFilter: str || null, current: 1 });
              doRefetch({
                filter: mergeWithStatusFilter(
                  next ?? null,
                  queryParams.rStatusCategory,
                ),
                offset: 0,
              });
            }}
          />
        </BAIFlex>
        <BAIFetchKeyButton
          loading={isPending}
          value=""
          onChange={() => {
            startTransition(() => setFetchKey((k) => k + 1));
          }}
        />
      </BAIFlex>
      <BAITable<ReplicaNode>
        rowKey={(record) => record.id}
        dataSource={replicas}
        columns={columns}
        loading={isPending}
        size="small"
        scroll={{ x: 'max-content' }}
        tableSettings={{
          columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        order={queryParams.order}
        onChangeOrder={(newOrder) => {
          setQueryParams({
            order:
              (newOrder as (typeof availableReplicaSorterValues)[number]) ??
              null,
          });
          doRefetch({
            orderBy: convertToOrderBy<ReplicaOrderBy>(newOrder || '-createdAt'),
          });
        }}
        pagination={{
          pageSize: queryParams.pageSize,
          current: queryParams.current,
          total: listData?.replicas?.count ?? 0,
          onChange: (current, pageSize) => {
            setQueryParams({ current, pageSize });
            const newOffset = current > 1 ? (current - 1) * pageSize : 0;
            doRefetch({ limit: pageSize, offset: newOffset });
          },
        }}
      />
      <BAIUnmountAfterClose>
        <SessionDetailDrawer
          open={!!selectedSessionId}
          sessionId={selectedSessionId ?? undefined}
          onClose={() => setSelectedSessionId(null)}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <DeploymentRevisionDetailDrawer
          open={!!drawerRevisionFrgmt}
          revisionFrgmt={drawerRevisionFrgmt}
          onClose={() => setDrawerRevisionFrgmt(null)}
        />
      </BAIUnmountAfterClose>
      {routeHistoryQueryRef != null && (
        <BAIUnmountAfterClose>
          <RouteSchedulingHistoryModal
            open={isRouteHistoryOpen}
            queryRef={routeHistoryQueryRef}
            onReload={loadRouteHistoryQuery}
            onCancel={() => setIsRouteHistoryOpen(false)}
          />
        </BAIUnmountAfterClose>
      )}
    </>
  );
};

export default DeploymentReplicasCard;
