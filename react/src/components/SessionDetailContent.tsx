import SessionKernelTags from '../components/ImageTags';
import { toGlobalId } from '../helper';
import { useCurrentUserRole } from '../hooks/backendai';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { ResourceNumbersOfSession } from '../pages/SessionLauncherPage';
import EditableSessionName from './ComputeSessionNodeItems/EditableSessionName';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import SessionTypeTag from './ComputeSessionNodeItems/SessionTypeTag';
import Flex from './Flex';
import ImageMetaIcon from './ImageMetaIcon';
import { SessionDetailContentQuery } from './__generated__/SessionDetailContentQuery.graphql';
import {
  Alert,
  Button,
  Descriptions,
  Grid,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import Title from 'antd/es/typography/Title';
import graphql from 'babel-plugin-relay/macro';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

const SessionDetailContent: React.FC<{
  id: string;
  fetchKey?: string;
}> = ({ id, fetchKey = 'initial' }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const currentProject = useCurrentProjectValue();
  const userRole = useCurrentUserRole();

  const { md } = Grid.useBreakpoint();
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
            kernel_nodes {
              edges {
                node {
                  id
                  image {
                    id
                    name
                    architecture
                    tag
                  }
                }
              }
            }
            vfolder_mounts
            created_at @required(action: NONE)
            terminated_at
            scaling_group
            agent_ids
            requested_slots

            ...SessionStatusTagFragment
            ...SessionActionButtonsFragment
            ...SessionTypeTagFragment
            ...EditableSessionNameFragment
            ...SessionReservationFragment
            # fix: This fragment is not used in this component, but it is required by the SessionActionButtonsFragment.
            # It might be a bug in relay
            ...ContainerLogModalFragment
          }
          legacy_session: compute_session(id: $uuid) {
            image
            mounts
            user_email
            architecture
          }
        }
      `,
      {
        id: toGlobalId('ComputeSessionNode', id),
        uuid: id,
        project_id: currentProject.id,
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
  return session ? (
    <Flex direction="column" gap={'sm'} align="stretch">
      <Flex
        direction="row"
        justify="between"
        align="start"
        style={{
          alignSelf: 'stretch',
        }}
      >
        <EditableSessionName
          sessionFrgmt={session}
          component={Title}
          level={3}
          style={{
            margin: 0,
            flex: 1,
          }}
          editable={false}
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
          <SessionStatusTag sessionFrgmt={session} />
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
          {legacy_session?.mounts?.join(', ')}
        </Descriptions.Item>
        <Descriptions.Item label={t('session.launcher.ResourceAllocation')}>
          <Flex gap={'sm'}>
            <Tooltip title={t('session.ResourceGroup')}>
              {session.scaling_group}
            </Tooltip>
            <ResourceNumbersOfSession
              resource={JSON.parse(session.requested_slots || '{}')}
            />
          </Flex>
        </Descriptions.Item>
        <Descriptions.Item label={t('session.Agent')}>
          {session.agent_ids || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('session.Reservation')}>
          <Flex gap={'xs'} wrap={'wrap'}>
            <SessionReservation sessionFrgmt={session} />
          </Flex>
        </Descriptions.Item>
      </Descriptions>
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