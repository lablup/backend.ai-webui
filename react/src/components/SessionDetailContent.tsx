import { SessionDetailContentFragment$key } from '../__generated__/SessionDetailContentFragment.graphql';
import { SessionDetailContentLegacyQuery } from '../__generated__/SessionDetailContentLegacyQuery.graphql';
import { SessionDetailContentQuery } from '../__generated__/SessionDetailContentQuery.graphql';
import { INITIAL_FETCH_KEY, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
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
import SessionUsageMonitor from './SessionUsageMonitor';
import { InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Descriptions,
  Grid,
  Select,
  Skeleton,
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
  BAISessionAgentIds,
  BAISessionClusterMode,
} from 'backend.ai-ui';
// import { graphql } from 'react-relay';
import _ from 'lodash';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

const SessionDetailContent: React.FC<{
  id: string;
  sessionFrgmt?: SessionDetailContentFragment$key | null;
  fetchKey?: string;
  /**
   * @deprecated This property is unnecessary since sessionFrgmt contains the project id field.
   * Kept for backward compatibility with versions <= v24.12.0.
   */
  deprecatedProjectId?: string | null;
}> = ({ id, fetchKey, sessionFrgmt, deprecatedProjectId }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { md } = Grid.useBreakpoint();
  const currentProject = useCurrentProjectValue();
  const [currentUser] = useCurrentUserInfo();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();

  const [openIdleCheckDescriptionModal, setOpenIdleCheckDescriptionModal] =
    useState<boolean>(false);
  const [openStatusDetailModal, setOpenStatusDetailModal] =
    useState<boolean>(false);
  const [usageMonitorDisplayTarget, setUsageMonitorDisplayTarget] = useState<
    'max' | 'avg' | 'current'
  >('current');

  // TODO: remove and refactor this waterfall request after v24.12.0
  // get the project id of the session for <= v24.12.0.
  const { legacy_session } = useLazyLoadQuery<SessionDetailContentLegacyQuery>(
    graphql`
      query SessionDetailContentLegacyQuery($uuid: UUID!) {
        legacy_session: compute_session(id: $uuid) {
          group_id
        }
      }
    `,
    {
      uuid: id,
    },
    {
      fetchPolicy: deprecatedProjectId ? 'store-only' : 'store-or-network',
    },
  );

  // TODO: Remove useLazyLoadQuery and use useRefetchableFragment instead of useFragment to fetch session data when deprecatedProjectId is removed.
  const { internalLoadedSession } = useLazyLoadQuery<SessionDetailContentQuery>(
    graphql`
      query SessionDetailContentQuery($id: GlobalIDField!, $project_id: UUID!) {
        internalLoadedSession: compute_session_node(
          id: $id
          project_id: $project_id
        ) {
          ...SessionDetailContentFragment
        }
      }
    `,
    {
      id: toGlobalId('ComputeSessionNode', id),
      // uuid: id,
      project_id:
        legacy_session?.group_id || deprecatedProjectId || currentProject.id,
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
        idle_checks @since(version: "24.12.0")

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

  const resolvedProjectIdOfSession =
    session?.project_id || legacy_session?.group_id;

  return session ? (
    <BAIFlex direction="column" gap={'lg'} align="stretch">
      {resolvedProjectIdOfSession !== currentProject.id && (
        <Alert message={t('session.NotInProject')} type="warning" showIcon />
      )}
      {currentUser.uuid !== session?.user_id && (
        <Alert
          message={t('session.AnotherUserSession')}
          type="warning"
          showIcon
        />
      )}
      {imminentExpirationTime && imminentExpirationTime < 3600 && (
        <Alert
          message={t('session.IdleCheckExpirationWarning')}
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
              <SessionStatusTag sessionFrgmt={session} showInfo />
              {session?.status_data && session?.status_data !== '{}' ? (
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
            </BAIFlex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.SessionType')}>
            <BAISessionTypeTag sessionFrgmt={session} />
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
                resource={JSON.parse(session.requested_slots || '{}')}
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
        </Descriptions>
      </BAIFlex>
      <Suspense fallback={<Skeleton active />}>
        <BAIFlex direction="column" gap={'sm'} align="stretch">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('kernel.Kernels')}
          </Typography.Title>
          <ConnectedKernelList
            kernelsFrgmt={filterOutNullAndUndefined(
              session.kernel_nodes?.edges.map((e) => e?.node),
            )}
            sessionFrgmtForLogModal={session}
          />
        </BAIFlex>
      </Suspense>
      <IdleCheckDescriptionModal
        open={openIdleCheckDescriptionModal}
        onCancel={() => setOpenIdleCheckDescriptionModal(false)}
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
      message={t('session.SessionNotFound')}
      type="error"
      description={id}
    ></Alert>
  );
};

export default SessionDetailContent;
