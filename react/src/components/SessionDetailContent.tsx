import { SessionDetailContentLegacyQuery } from '../__generated__/SessionDetailContentLegacyQuery.graphql';
import { SessionDetailContentQuery } from '../__generated__/SessionDetailContentQuery.graphql';
import SessionKernelTags from '../components/ImageTags';
import { filterNonNullItems, toGlobalId } from '../helper';
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
import Flex from './Flex';
import FolderLink from './FolderLink';
import IdleCheckDescriptionModal from './IdleCheckDescriptionModal';
import ImageMetaIcon from './ImageMetaIcon';
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
// import { graphql } from 'react-relay';
import { BAISessionTypeTag } from 'backend.ai-ui';
import _ from 'lodash';
import { Suspense, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const SessionDetailContent: React.FC<{
  id: string;
  fetchKey?: string;
}> = ({ id, fetchKey }) => {
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
  const { session_for_project_id } =
    useLazyLoadQuery<SessionDetailContentLegacyQuery>(
      graphql`
        query SessionDetailContentLegacyQuery($uuid: UUID!) {
          session_for_project_id: compute_session(id: $uuid) {
            group_id
          }
        }
      `,
      {
        uuid: id,
      },
      {
        fetchPolicy: 'store-or-network',
      },
    );
  const { session, legacy_session, vfolder_invited_list } =
    useLazyLoadQuery<SessionDetailContentQuery>(
      //  In compute_session_node, there are missing fields. We need to use `compute_session` to get the missing fields.
      graphql`
        query SessionDetailContentQuery(
          $id: GlobalIDField!
          $uuid: UUID!
          $project_id: UUID!
        ) {
          session: compute_session_node(id: $id, project_id: $project_id) {
            id
            row_id
            name
            project_id
            user_id
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
            # fix: This fragment is not used in this component, but it is required by the SessionActionButtonsFragment.
            # It might be a bug in relay
            ...SessionUsageMonitorFragment
            ...ContainerCommitModalFragment
            ...SessionIdleChecksNodeFragment
            ...SessionStatusDetailModalFragment
            ...AppLauncherModalFragment
          }
          legacy_session: compute_session(id: $uuid) {
            image
            mounts
            user_email
            architecture
            idle_checks @since(version: "24.09.0")
            ...SessionIdleChecksFragment
            # fix: This fragment is not used in this component, but it is required by the SessionActionButtonsFragment.
            # It might be a bug in relay
            ...SessionActionButtonsLegacyFragment
            ...AppLauncherModalLegacyFragment
          }
          vfolder_invited_list(limit: 100, offset: 0) {
            items {
              id
            }
          }
        }
      `,
      {
        id: toGlobalId('ComputeSessionNode', id),
        uuid: id,
        project_id: session_for_project_id?.group_id || currentProject.id,
      },
      {
        fetchPolicy:
          fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
        fetchKey: fetchKey,
      },
    );

  const imageFullName =
    legacy_session?.image &&
    legacy_session?.architecture &&
    legacy_session.image + '@' + legacy_session.architecture;

  const idleChecks: IdleChecks = JSON.parse(
    session?.idle_checks || legacy_session?.idle_checks || '{}',
  );
  const imminentExpirationTime = _.min(
    _.values(idleChecks)
      .map((check) => check.remaining)
      .filter(Boolean),
  );

  const invitedFolderIds = useMemo(
    () => _.map(vfolder_invited_list?.items, 'id'),
    [vfolder_invited_list],
  );

  /**
   * Checks if a folder ID or array of folder IDs contains any invited folders
   * @param vfolderId - Either a single folder ID or an array of folder IDs to check
   * @returns True if any of the provided folder IDs are in the invited folders list
   */
  function isFolderInvited(vfolderId: string | Array<string>) {
    return _.isArray(vfolderId)
      ? _.some(vfolderId, (id) => _.includes(invitedFolderIds, id))
      : _.includes(invitedFolderIds, vfolderId);
  }

  return session ? (
    <Flex direction="column" gap={'lg'} align="stretch">
      {session_for_project_id?.group_id !== currentProject.id && (
        <Alert message={t('session.NotInProject')} type="warning" showIcon />
      )}
      {currentUser.email !== legacy_session?.user_email && (
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
      <Flex direction="column" gap={'sm'} align="stretch">
        <Flex
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
              color: ['TERMINATED', 'CANCELLED'].includes(session.status || '')
                ? token.colorTextTertiary
                : undefined,
            }}
            editable={
              !['TERMINATED', 'CANCELLED'].includes(session.status || '')
            }
          />
          <Button.Group size="large">
            <SessionActionButtons
              sessionFrgmt={session}
              legacySessionFrgmt={legacy_session}
            />
          </Button.Group>
        </Flex>

        <Descriptions bordered column={md ? 2 : 1}>
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
              <Typography.Text copyable>
                {legacy_session?.user_email}
              </Typography.Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label={t('session.Status')}>
            <Flex>
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
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.SessionType')}>
            <BAISessionTypeTag sessionFrgmt={session} />
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.Environments')}>
            {imageFullName ? (
              <Flex gap={['xs', 0]} wrap="wrap">
                <ImageMetaIcon
                  image={imageFullName}
                  style={{ marginRight: token.marginXS }}
                />
                <SessionKernelTags image={imageFullName} />
              </Flex>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.MountedFolders')}>
            <Flex gap="xs" wrap="wrap">
              {session.vfolder_nodes
                ? session.vfolder_nodes.edges.map((vfolder, idx) => {
                    return (
                      vfolder?.node && (
                        <FolderLink
                          key={`mounted-vfolder-${idx}`}
                          showIcon
                          vfolderNodeFragment={vfolder.node}
                          type={
                            currentUser.email !== legacy_session?.user_email &&
                            !isFolderInvited(
                              (session.vfolder_mounts || []).filter(
                                (id) => typeof id === 'string',
                              ),
                            )
                              ? 'disabled'
                              : 'hover'
                          }
                        />
                      )
                    );
                  })
                : baiClient.supports('vfolder-mounts')
                  ? _.map(
                      // compute_session_node query's vfolder_mounts is not include name.
                      // To provide vfolder name in compute_session_node, schema must be changed.
                      // legacy_session.mounts (name) and session.vfolder_mounts (id) give vfolder information in same order.
                      _.zip(legacy_session?.mounts, session?.vfolder_mounts),
                      (mountInfo) => {
                        const [name, id] = mountInfo;
                        return (
                          <FolderLink
                            key={id}
                            folderId={id ?? ''}
                            folderName={name ?? ''}
                            showIcon
                            type={
                              currentUser.email !==
                                legacy_session?.user_email &&
                              !isFolderInvited(id as string)
                                ? 'disabled'
                                : 'hover'
                            }
                          />
                        );
                      },
                    )
                  : legacy_session?.mounts?.join(', ')}
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.ResourceAllocation')}>
            <Flex gap={'sm'} wrap="wrap">
              <Tooltip title={t('session.ResourceGroup')}>
                <Tag>{session.scaling_group}</Tag>
              </Tooltip>
              <ResourceNumbersOfSession
                resource={JSON.parse(session.requested_slots || '{}')}
              />
            </Flex>
          </Descriptions.Item>
          <Descriptions.Item label={t('session.Agent')}>
            {_.uniq(session.agent_ids).join(', ') || '-'}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.Reservation')} span={md ? 2 : 1}>
            <Flex gap={'xs'} wrap={'wrap'}>
              <SessionReservation sessionFrgmt={session} />
            </Flex>
          </Descriptions.Item>
          {baiClient.supports('idle-checks-gql') &&
          session.status === 'RUNNING' &&
          imminentExpirationTime ? (
            <Descriptions.Item
              label={
                <Flex gap="xxs">
                  {t('session.IdleChecks')}
                  <Tooltip title={t('button.ClickForMoreDetails')}>
                    <QuestionCircleOutlined
                      style={{ cursor: 'pointer' }}
                      onClick={() => setOpenIdleCheckDescriptionModal(true)}
                    />
                  </Tooltip>
                </Flex>
              }
              span={md ? 2 : 1}
            >
              <SessionIdleChecks
                sessionNodeFrgmt={session}
                sessionFrgmt={legacy_session}
                direction={md ? 'row' : 'column'}
              />
            </Descriptions.Item>
          ) : null}
          <Descriptions.Item
            label={
              <Flex direction="column" align="start" gap={token.marginSM}>
                <Typography.Text style={{ color: token.colorTextSecondary }}>
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
              </Flex>
            }
            span={md ? 2 : 1}
          >
            <SessionUsageMonitor
              sessionFrgmt={session}
              displayTarget={usageMonitorDisplayTarget}
            />
          </Descriptions.Item>
        </Descriptions>
      </Flex>
      <Suspense fallback={<Skeleton active />}>
        <Flex direction="column" gap={'sm'} align="stretch">
          <Typography.Title level={4} style={{ margin: 0 }}>
            {t('kernel.Kernels')}
          </Typography.Title>
          <ConnectedKernelList
            kernelsFrgmt={filterNonNullItems(
              session.kernel_nodes?.edges.map((e) => e?.node),
            )}
            sessionFrgmtForLogModal={session}
          />
        </Flex>
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
    </Flex>
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
