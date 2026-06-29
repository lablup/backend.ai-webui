/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ScopedAuditLogQuery as ScopedAuditLogQueryType } from '../__generated__/ScopedAuditLogQuery.graphql';
import { SessionDetailContentFragment$key } from '../__generated__/SessionDetailContentFragment.graphql';
import { SessionDetailContentQuery } from '../__generated__/SessionDetailContentQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import BAIErrorBoundary from './BAIErrorBoundary';
import CodeHighlighterModal from './CodeHighlighterModal';
import ConnectedKernelList from './ComputeSessionNodeItems/ConnectedKernelList';
import EditableSessionName from './ComputeSessionNodeItems/EditableSessionName';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionIdleChecks, {
  IdleChecks,
} from './ComputeSessionNodeItems/SessionIdleChecks';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionStatusDetailModal from './ComputeSessionNodeItems/SessionStatusDetailModal';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import IdleCheckDescriptionModal from './IdleCheckDescriptionModal';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import { UNSAFELazySessionImageTag } from './ImageTags';
import MountedVFolderLinks from './MountedVFolderLinks';
import ScopedAuditLog, { ScopedAuditLogQuery } from './ScopedAuditLog';
import { getUnifiedSlotNameFromTag } from './SessionFormItems/ResourceAllocationFormItems';
import SessionSchedulingHistoryModal from './SessionSchedulingHistoryModal';
import SessionUsageMonitor from './SessionUsageMonitor';
import {
  HistoryOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  Alert,
  Button,
  Descriptions,
  Grid,
  Select,
  Skeleton,
  Tabs,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import Title from 'antd/es/typography/Title';
import {
  filterOutNullAndUndefined,
  BAISessionTypeTag,
  toGlobalId,
  UNSAFELazyUserEmailView,
  useMemoizedJSONParse,
  BAIFlex,
  BAILink,
  BAISessionAgentIds,
  BAISessionClusterMode,
  INITIAL_FETCH_KEY,
  BAIButton,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useQueryLoader,
} from 'react-relay';
import { useLocation } from 'react-router-dom';

/**
 * RBAC entity types that belong to a single session's audit-log scope. The
 * session row itself (`SESSION`) plus its app-service events, so the scoped
 * audit log surfaces session-app events alongside the session's own events
 * instead of silently dropping them (FR-3145).
 *
 * TODO(needs-backend): the `SESSION_APP_SERVICE` entry is scoped with the
 * parent session's UUID. Confirm the backend keys session-app audit rows by the
 * parent session id; if it keys by the app-service's own id, hierarchical scope
 * matching is required server-side for these events to appear.
 */
const SESSION_AUDIT_LOG_ENTITY_TYPES = [
  'SESSION',
  'SESSION_APP_SERVICE',
] as const;

// When a session is tagged as using a unified-memory accelerator slot, its
// quantity is auto-allocated and not meaningfully stored in `requested_slots`.
// Surface that slot as the accelerator type so `ResourceNumbersOfSession`
// renders it as the device description, and drop it from the numeric slot map
// to avoid showing it twice.
const buildResourceWithUnifiedSlot = (
  requestedSlots?: string | null,
  tag?: string | null,
) => {
  const slots = JSON.parse(requestedSlots || '{}');
  const unifiedSlotName = getUnifiedSlotNameFromTag(tag);
  return unifiedSlotName
    ? { ..._.omit(slots, unifiedSlotName), acceleratorType: unifiedSlotName }
    : slots;
};

const SessionDetailContent: React.FC<{
  id: string;
  sessionFrgmt?: SessionDetailContentFragment$key | null;
  fetchKey?: string;
}> = ({ id, fetchKey, sessionFrgmt }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { md } = Grid.useBreakpoint();
  const location = useLocation();

  const currentProject = useCurrentProjectValue();
  if (!currentProject.id) {
    throw new Error('Project ID is required for SessionDetailContent');
  }
  const [currentUser] = useCurrentUserInfo();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const supportsSessionSchedulingHistory = baiClient.supports(
    'session-scheduling-history',
  );

  const [openIdleCheckDescriptionModal, setOpenIdleCheckDescriptionModal] =
    useState<boolean>(false);
  const [openStatusDetailModal, setOpenStatusDetailModal] =
    useState<boolean>(false);
  const [usageMonitorDisplayTarget, setUsageMonitorDisplayTarget] = useState<
    'max' | 'avg' | 'current'
  >('current');
  const [openCodeHighlighterModal, { toggle: toggleOpenCodeHighlighterModal }] =
    useToggle(false);
  const [
    openSessionSchedulingHistoryModal,
    { toggle: toggleOpenSessionSchedulingHistoryModal },
  ] = useToggle(false);
  const [auditLogQueryRef, loadAuditLogQuery] =
    useQueryLoader<ScopedAuditLogQueryType>(ScopedAuditLogQuery);

  const { baiPaginationOption, setTablePaginationOption } =
    useBAIPaginationOptionState({ current: 1, pageSize: 10 });
  const reloadAuditLogQuery: React.ComponentProps<
    typeof ScopedAuditLog
  >['onReload'] = (variables, options) => {
    const limit = variables.limit ?? 10;
    setTablePaginationOption({
      pageSize: limit,
      current: variables.offset ? Math.floor(variables.offset / limit) + 1 : 1,
    });
    loadAuditLogQuery(variables, options);
  };

  // TODO: Remove useLazyLoadQuery and use useRefetchableFragment instead of useFragment to fetch session data when deprecatedProjectId is removed.
  const { internalLoadedSession } = useLazyLoadQuery<SessionDetailContentQuery>(
    graphql`
      query SessionDetailContentQuery($id: GlobalIDField!) {
        internalLoadedSession: compute_session_node(id: $id) {
          ...SessionDetailContentFragment
        }
      }
    `,
    {
      id: toGlobalId('ComputeSessionNode', id),
    },
    {
      fetchPolicy:
        // Only use network when sessionFrgmt is not provided on initial fetch
        fetchKey === INITIAL_FETCH_KEY
          ? sessionFrgmt
            ? 'store-only'
            : 'store-and-network' // initial fetch
          : 'network-only',
      fetchKey: fetchKey,
    },
  );

  const session = useFragment(
    graphql`
      fragment SessionDetailContentFragment on ComputeSessionNode {
        id
        row_id
        name
        project_id
        user_id
        owner @since(version: "25.13.0") {
          email
        }
        resource_opts
        status
        status_data
        vfolder_mounts
        vfolder_nodes @since(version: "25.4.0") {
          edges {
            node {
              ...FolderLink_vfolderNode
            }
          }
          count
        }
        created_at @required(action: NONE)
        terminated_at
        scaling_group
        agent_ids
        requested_slots
        tag
        idle_checks @since(version: "24.12.0")
        type
        startup_command

        kernel_nodes {
          edges {
            node {
              image {
                ...ImageNodeSimpleTagFragment
              }
              ...ConnectedKernelListFragment
            }
          }
        }

        dependees {
          edges {
            node {
              id
              row_id
              name
              status
            }
          }
          count
        }
        dependents {
          edges {
            node {
              id
              row_id
              name
              status
            }
          }
          count
        }

        ...SessionStatusTagFragment
        ...SessionActionButtonsFragment
        ...BAISessionTypeTagFragment
        ...EditableSessionNameFragment
        ...SessionReservationFragment
        ...ContainerLogModalFragment
        ...SessionUsageMonitorFragment
        ...ContainerCommitModalFragment
        ...SessionIdleChecksNodeFragment
        ...SessionStatusDetailModalFragment
        ...AppLauncherModalFragment
        ...MountedVFolderLinksFragment
        ...BAISessionAgentIdsFragment
        ...BAISessionClusterModeFragment
      }
    `,
    (internalLoadedSession as SessionDetailContentFragment$key) || sessionFrgmt,
  );

  // The feature to display imminent expiration time as a separate Alert is supported from version 24.12.
  const imminentExpirationTime = _.min(
    _.values(
      useMemoizedJSONParse<IdleChecks>(session?.idle_checks, {
        fallbackValue: {},
      }),
    )
      .map((check) => check.remaining)
      .filter(Boolean),
  );

  const resolvedProjectIdOfSession = session?.project_id;

  return session ? (
    <BAIFlex direction="column" gap={'lg'} align="stretch">
      {resolvedProjectIdOfSession !== currentProject.id && (
        <Alert title={t('session.NotInProject')} type="warning" showIcon />
      )}
      {currentUser.uuid !== session?.user_id && (
        <Alert
          title={t('session.AnotherUserSession')}
          type="warning"
          showIcon
        />
      )}
      {imminentExpirationTime && imminentExpirationTime < 3600 && (
        <Alert
          title={t('session.IdleCheckExpirationWarning')}
          type="warning"
          showIcon
        />
      )}
      <BAIFlex direction="column" gap={'sm'} align="stretch">
        <BAIFlex
          direction="row"
          justify="between"
          align="start"
          style={{
            alignSelf: 'stretch',
          }}
          gap={'sm'}
        >
          <EditableSessionName
            sessionFrgmt={session}
            component={Title}
            level={3}
            style={{
              margin: 0,
              lineHeight: '1.6em',
              color: ['TERMINATED', 'CANCELLED'].includes(session.status || '')
                ? token.colorTextTertiary
                : undefined,
            }}
            editable={
              !['TERMINATED', 'CANCELLED'].includes(session.status || '')
            }
          />
          <SessionActionButtons size={'large'} compact sessionFrgmt={session} />
        </BAIFlex>

        <Descriptions
          bordered
          column={md ? 2 : 1}
          labelStyle={{
            wordBreak: 'keep-all',
          }}
        >
          <Descriptions.Item label={t('session.SessionId')} span={md ? 2 : 1}>
            <Typography.Text
              ellipsis
              copyable
              style={{ fontFamily: 'monospace' }}
            >
              {session.row_id}
            </Typography.Text>
          </Descriptions.Item>
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <Descriptions.Item label={t('credential.UserID')} span={md ? 2 : 1}>
              {session.owner?.email ? (
                session.owner.email
              ) : session.user_id ? (
                <Suspense fallback={<Skeleton.Input size="small" active />}>
                  <UNSAFELazyUserEmailView uuid={session.user_id} />
                </Suspense>
              ) : (
                '-'
              )}
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('session.Status')}>
            <BAIFlex>
              <SessionStatusTag
                sessionFrgmt={session}
                showInfo={!supportsSessionSchedulingHistory}
              />
              {!supportsSessionSchedulingHistory &&
              session?.status_data &&
              session?.status_data !== '{}' ? (
                <Tooltip title={t('button.ClickForMoreDetails')}>
                  <Button
                    type="link"
                    icon={<InfoCircleOutlined />}
                    onClick={() => {
                      setOpenStatusDetailModal(true);
                    }}
                  />
                </Tooltip>
              ) : null}
              {supportsSessionSchedulingHistory && (
                <Tooltip title={t('session.SessionSchedulingHistory')}>
                  <BAIButton
                    type="link"
                    onClick={() => toggleOpenSessionSchedulingHistoryModal()}
                    icon={<HistoryOutlined />}
                  />
                </Tooltip>
              )}
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.SessionType')}>
            <BAISessionTypeTag sessionFrgmt={session} />
            {session.type === 'batch' && session.startup_command && (
              <Tooltip title={t('session.ViewStartupCommand')}>
                <BAIButton
                  type="link"
                  icon={<InfoCircleOutlined />}
                  onClick={() => toggleOpenCodeHighlighterModal()}
                />
              </Tooltip>
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.Environments')}>
            {session.kernel_nodes?.edges[0]?.node?.image ? (
              <ImageNodeSimpleTag
                imageFrgmt={session.kernel_nodes?.edges[0]?.node?.image || null}
              />
            ) : session.row_id ? (
              <Suspense fallback={<Skeleton.Input size="small" active />}>
                <UNSAFELazySessionImageTag sessionId={session.row_id} />
              </Suspense>
            ) : null}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.MountedFolders')}>
            <BAIFlex gap="xs" wrap="wrap">
              <MountedVFolderLinks sessionFrgmt={session} />
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.ResourceAllocation')}>
            <BAIFlex gap={'sm'} wrap="wrap">
              <Tooltip title={t('session.ResourceGroup')}>
                <Tag>{session.scaling_group}</Tag>
              </Tooltip>
              <ResourceNumbersOfSession
                resource={buildResourceWithUnifiedSlot(
                  session.requested_slots,
                  session.tag,
                )}
              />
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.Agent')}>
            <BAISessionAgentIds sessionFrgmt={session} />
          </Descriptions.Item>
          <Descriptions.Item label={t('session.Reservation')}>
            <BAIFlex gap={'xs'} wrap={'wrap'}>
              <SessionReservation sessionFrgmt={session} />
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.ClusterMode')}>
            <BAISessionClusterMode sessionFrgmt={session} showSize />
          </Descriptions.Item>
          {baiClient.supports('idle-checks-gql') &&
          session.status === 'RUNNING' &&
          imminentExpirationTime ? (
            <Descriptions.Item
              label={
                <BAIFlex gap="xxs">
                  {t('session.IdleChecks')}
                  <Tooltip title={t('button.ClickForMoreDetails')}>
                    <QuestionCircleOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={() => setOpenIdleCheckDescriptionModal(true)}
                    />
                  </Tooltip>
                </BAIFlex>
              }
              span={md ? 2 : 1}
            >
              <Suspense fallback={<Skeleton.Input active size="small" />}>
                <SessionIdleChecks
                  sessionNodeFrgmt={session}
                  direction={md ? 'row' : 'column'}
                  fetchKeyForLegacyLoadQuery={fetchKey}
                />
              </Suspense>
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item
            label={
              <BAIFlex direction="column" align="start" gap={token.marginSM}>
                <Typography.Text
                  style={{
                    color: token.colorTextSecondary,
                    wordBreak: 'keep-all',
                  }}
                >
                  {t('session.ResourceUsage')}
                </Typography.Text>
                <Select
                  size="small"
                  popupMatchSelectWidth={false}
                  style={{ width: '100%', display: 'none' }}
                  variant="filled"
                  defaultValue={'current'}
                  options={[
                    {
                      label: t('session.CurrentUsage'),
                      value: 'current',
                    },
                    {
                      label: t('session.MaxUsage'),
                      value: 'max',
                    },
                    {
                      label: t('session.AverageUsage'),
                      value: 'avg',
                    },
                  ]}
                  onChange={(value: 'current' | 'max' | 'avg') => {
                    setUsageMonitorDisplayTarget(value);
                  }}
                />
              </BAIFlex>
            }
            span={md ? 2 : 1}
          >
            <SessionUsageMonitor
              sessionFrgmt={session}
              displayTarget={usageMonitorDisplayTarget}
            />
          </Descriptions.Item>
          {(session.dependees?.count ?? 0) > 0 && (
            <Descriptions.Item label={t('session.DependsOn')} span={2}>
              <BAIFlex gap="xs" wrap="wrap">
                {session.dependees?.edges
                  ?.map((edge) => edge?.node)
                  .filter(Boolean)
                  .map((node) => {
                    const searchParams = new URLSearchParams(location.search);
                    if (node?.row_id) {
                      searchParams.set('sessionDetail', node.row_id);
                    }
                    return (
                      <BAILink
                        key={node?.row_id}
                        type="hover"
                        to={{
                          pathname: location.pathname,
                          search: searchParams.toString(),
                        }}
                      >
                        {node?.name}
                      </BAILink>
                    );
                  })}
              </BAIFlex>
            </Descriptions.Item>
          )}
          {(session.dependents?.count ?? 0) > 0 && (
            <Descriptions.Item label={t('session.DependedByOthers')} span={2}>
              <BAIFlex gap="xs" wrap="wrap">
                {session.dependents?.edges
                  ?.map((edge) => edge?.node)
                  .filter(Boolean)
                  .map((node) => {
                    const searchParams = new URLSearchParams(location.search);
                    if (node?.row_id) {
                      searchParams.set('sessionDetail', node.row_id);
                    }
                    return (
                      <BAILink
                        key={node?.row_id}
                        type="hover"
                        to={{
                          pathname: location.pathname,
                          search: searchParams.toString(),
                        }}
                      >
                        {node?.name}
                      </BAILink>
                    );
                  })}
              </BAIFlex>
            </Descriptions.Item>
          )}
        </Descriptions>
      </BAIFlex>
      <Tabs
        defaultActiveKey="kernels"
        onChange={(key) => {
          if (key === 'auditLog' && session.row_id && !auditLogQueryRef) {
            const entityId = session.row_id;
            loadAuditLogQuery(
              {
                scope: {
                  entity: SESSION_AUDIT_LOG_ENTITY_TYPES.map((entityType) => ({
                    entityType,
                    entityId,
                  })),
                },
                orderBy: [{ field: 'CREATED_AT', direction: 'DESC' }],
                limit: baiPaginationOption.limit,
                offset: baiPaginationOption.offset,
              },
              { fetchPolicy: 'store-and-network' },
            );
          }
        }}
        items={[
          {
            key: 'kernels',
            label: t('kernel.Kernels'),
            children: (
              <Suspense fallback={<Skeleton active />}>
                <ConnectedKernelList
                  kernelsFrgmt={filterOutNullAndUndefined(
                    session.kernel_nodes?.edges.map((e) => e?.node),
                  )}
                  sessionFrgmtForLogModal={session}
                />
              </Suspense>
            ),
          },
          ...(session.row_id
            ? [
                {
                  key: 'auditLog',
                  label: t('auditLog.AuditLog'),
                  children: (
                    <BAIErrorBoundary>
                      {auditLogQueryRef ? (
                        <Suspense fallback={<Skeleton active />}>
                          <ScopedAuditLog
                            queryRef={auditLogQueryRef}
                            onReload={reloadAuditLogQuery}
                            scopeEntityTypes={SESSION_AUDIT_LOG_ENTITY_TYPES}
                            tableSettings={{}}
                          />
                        </Suspense>
                      ) : (
                        <Skeleton active />
                      )}
                    </BAIErrorBoundary>
                  ),
                },
              ]
            : []),
        ]}
      />
      <IdleCheckDescriptionModal
        open={openIdleCheckDescriptionModal}
        onCancel={() => setOpenIdleCheckDescriptionModal(false)}
      />
      <CodeHighlighterModal
        open={openCodeHighlighterModal}
        language="shell"
        content={session.startup_command || ''}
        title={t('session.StartupCommand')}
        footer={
          <Button
            type="primary"
            onClick={() => {
              toggleOpenCodeHighlighterModal();
            }}
          >
            {t('button.Close')}
          </Button>
        }
        onCancel={toggleOpenCodeHighlighterModal}
      />
      <SessionSchedulingHistoryModal
        sessionId={id}
        open={openSessionSchedulingHistoryModal}
        onCancel={toggleOpenSessionSchedulingHistoryModal}
      />
      <SessionStatusDetailModal
        sessionFrgmt={session}
        open={openStatusDetailModal}
        onCancel={() => setOpenStatusDetailModal(false)}
      />
    </BAIFlex>
  ) : (
    <Alert
      showIcon
      title={t('session.SessionNotFound')}
      type="error"
      description={id}
    ></Alert>
  );
};

export default SessionDetailContent;
