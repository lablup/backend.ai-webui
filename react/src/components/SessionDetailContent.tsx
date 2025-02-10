import SessionKernelTags from '../components/ImageTags';
import { toGlobalId } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import ConnectedKernelList from './ComputeSessionNodeItems/ConnectedKernelList';
import EditableSessionName from './ComputeSessionNodeItems/EditableSessionName';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionIdleChecks, {
  IdleChecks,
} from './ComputeSessionNodeItems/SessionIdleChecks';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import SessionTypeTag from './ComputeSessionNodeItems/SessionTypeTag';
import Flex from './Flex';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import IdleCheckDescriptionModal from './IdleCheckDescriptionModal';
import ImageMetaIcon from './ImageMetaIcon';
import SessionUsageMonitor from './SessionUsageMonitor';
import { SessionDetailContentLegacyQuery } from './__generated__/SessionDetailContentLegacyQuery.graphql';
import { SessionDetailContentQuery } from './__generated__/SessionDetailContentQuery.graphql';
import { FolderOutlined } from '@ant-design/icons';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Descriptions,
  Grid,
  Skeleton,
  Tag,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import Title from 'antd/es/typography/Title';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const SessionDetailContent: React.FC<{
  id: string;
  fetchKey?: string;
}> = ({ id, fetchKey }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { md } = Grid.useBreakpoint();
  const { open } = useFolderExplorerOpener();
  const currentProject = useCurrentProjectValue();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const [openIdleCheckDescriptionModal, setOpenIdleCheckDescriptionModal] =
    useState<boolean>(false);

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
        fetchPolicy: 'network-only',
      },
    );
  const { session, legacy_session } =
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
            vfolder_mounts
            created_at @required(action: NONE)
            terminated_at
            scaling_group
            agent_ids
            requested_slots
            idle_checks @since(version: "24.12.0")

            ...SessionStatusTagFragment
            ...SessionActionButtonsFragment
            ...SessionTypeTagFragment
            ...EditableSessionNameFragment
            ...SessionReservationFragment
            # fix: This fragment is not used in this component, but it is required by the SessionActionButtonsFragment.
            # It might be a bug in relay
            ...ContainerLogModalFragment
            ...SessionUsageMonitorFragment
            ...ContainerCommitModalFragment
            ...SessionIdleChecksNodeFragment
          }
          legacy_session: compute_session(id: $uuid) {
            image
            mounts
            user_email
            architecture
            idle_checks @since(version: "24.09.0")
            ...SessionIdleChecksFragment
          }
        }
      `,
      {
        id: toGlobalId('ComputeSessionNode', id),
        uuid: id,
        project_id: session_for_project_id?.group_id || currentProject.id,
      },
      {
        fetchPolicy: 'network-only',
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
  const showKernelList = baiClient._config.showKernelList;

  return session ? (
    <Flex direction="column" gap={'lg'} align="stretch">
      {session_for_project_id?.group_id !== currentProject.id && (
        <Alert message={t('session.NotInProject')} type="warning" showIcon />
      )}
      {imminentExpirationTime && imminentExpirationTime < 3600 && (
        <Alert
          message={t('session.IdleCheckExpirationWarning')}
          type="warning"
          showIcon
        />
      )}
      <Flex direction="column" gap={'sm'}>
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
            <SessionActionButtons sessionFrgmt={session} />
          </Button.Group>
        </Flex>

        <Descriptions bordered column={md ? 2 : 1}>
          <Descriptions.Item label={t('session.SessionId')} span={md ? 2 : 1}>
            <Typography.Text copyable style={{ fontFamily: 'monospace' }}>
              {session.row_id}
            </Typography.Text>
          </Descriptions.Item>
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <Descriptions.Item label={t('credential.UserID')} span={md ? 2 : 1}>
              {legacy_session?.user_email}
            </Descriptions.Item>
          )}
          <Descriptions.Item
            label={t('session.Status')}
            contentStyle={{ display: 'flex', gap: token.marginSM }}
          >
            <SessionStatusTag sessionFrgmt={session} showInfo />
            {/* <Button type="text" icon={<TriangleAlertIcon />} /> */}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.SessionType')}>
            <SessionTypeTag sessionFrgmt={session} />
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.Environments')}>
            {imageFullName ? (
              <Flex gap={'sm'}>
                <ImageMetaIcon image={imageFullName} />
                <Flex>
                  <SessionKernelTags image={imageFullName} />
                </Flex>
              </Flex>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label={t('session.launcher.MountedFolders')}>
            {baiClient.supports('vfolder-mounts')
              ? _.map(
                  _.zip(legacy_session?.mounts, session?.vfolder_mounts),
                  (mountInfo) => {
                    const [name, id] = mountInfo;
                    return (
                      <Button
                        key={id}
                        type="link"
                        size="small"
                        icon={<FolderOutlined />}
                        onClick={() => {
                          open(id ?? '');
                        }}
                      >
                        {name}
                      </Button>
                    );
                  },
                )
              : legacy_session?.mounts?.join(', ')}
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
            {session.agent_ids || '-'}
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
                    <InfoCircleOutlined
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
          <Descriptions.Item label={'Resource Usage'} span={md ? 2 : 1}>
            <SessionUsageMonitor sessionFrgmt={session} />
          </Descriptions.Item>
        </Descriptions>
      </Flex>
      {showKernelList ? (
        <Suspense fallback={<Skeleton />}>
          <Flex direction="column" gap={'sm'} align="stretch">
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t('kernel.Kernels')}
            </Typography.Title>
            <ConnectedKernelList id={id} fetchKey={fetchKey} />
          </Flex>
        </Suspense>
      ) : null}
      <IdleCheckDescriptionModal
        open={openIdleCheckDescriptionModal}
        onCancel={() => setOpenIdleCheckDescriptionModal(false)}
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
