import { KeypairResourcePolicyInfoModalFragment$key } from '../__generated__/KeypairResourcePolicyInfoModalFragment.graphql';
import { filterEmptyItem } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import AllowedVfolderHostsWithPermission from './AllowedVfolderHostsWithPermission';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import ResourceNumber from './ResourceNumber';
import { Descriptions, theme, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { DescriptionsItemType } from 'antd/es/descriptions';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFragment, graphql } from 'react-relay';

const useStyles = createStyles(({ css }) => ({
  description: css`
    .ant-descriptions-row {
      border: none !important;
    }
    .ant-descriptions-view > table {
      width: fit-content !important;
    }
  `,
}));

interface InfoModalProps extends BAIModalProps {
  open: boolean;
  onRequestClose: () => void;
  resourcePolicyFrgmt: KeypairResourcePolicyInfoModalFragment$key | null;
}

const KeypairResourcePolicyInfoModal: React.FC<InfoModalProps> = ({
  open,
  onRequestClose,
  resourcePolicyFrgmt,
  ...modalProps
}) => {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const resourcePolicy = useFragment(
    graphql`
      fragment KeypairResourcePolicyInfoModalFragment on KeyPairResourcePolicy {
        name
        created_at
        default_for_unspecified
        total_resource_slots
        max_session_lifetime
        max_concurrent_sessions
        max_containers_per_session
        idle_timeout
        allowed_vfolder_hosts
        max_pending_session_count @since(version: "24.03.4")
        max_concurrent_sftp_sessions @since(version: "24.03.4")
        max_pending_session_resource_slots @since(version: "24.03.4")
        ...AllowedVfolderHostsWithPermissionFragment
      }
    `,
    resourcePolicyFrgmt,
  );

  const descriptionItems: DescriptionsItemType[] = filterEmptyItem([
    {
      label: t('resourcePolicy.Name'),
      children: (
        <Typography.Text copyable>{resourcePolicy?.name}</Typography.Text>
      ),
    },
    {
      label: t('resourcePolicy.DefaultForUnspecified'),
      children: resourcePolicy?.default_for_unspecified || '∞',
    },
    {
      label: t('resourcePolicy.CreatedAt'),
      children: dayjs(resourcePolicy?.created_at).format('lll') || '∞',
    },
    {
      label: t('resourcePolicy.ResourcePolicy'),
      children: resourcePolicy?.total_resource_slots ? (
        !_.isEmpty(JSON.parse(resourcePolicy?.total_resource_slots)) ? (
          <Descriptions className={styles.description} size="small" column={2}>
            <Descriptions.Item>
              <Flex direction="column" align="start" style={{ width: '100%' }}>
                {_.map(
                  JSON.parse(resourcePolicy?.total_resource_slots),
                  (v, type) => (
                    <ResourceNumber
                      key={type}
                      type={type}
                      value={_.toString(v)}
                    />
                  ),
                )}
              </Flex>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          '-'
        )
      ) : (
        '-'
      ),
    },
    {
      label: t('resourcePolicy.StorageNodes'),
      children:
        resourcePolicy &&
        !_.isEmpty(
          JSON.parse(resourcePolicy?.allowed_vfolder_hosts || '{}'),
        ) ? (
          <AllowedVfolderHostsWithPermission
            allowedVfolderHostsWithPermissionFrgmt={resourcePolicy}
          />
        ) : (
          '-'
        ),
    },
    {
      label: t('resourcePolicy.Concurrency'),
      children: resourcePolicy?.max_concurrent_sessions || '∞',
    },
    {
      label: t('resourcePolicy.ClusterSize'),
      children: resourcePolicy?.max_containers_per_session,
    },
    {
      label: t('resourcePolicy.IdleTimeout'),
      children: resourcePolicy?.idle_timeout || '∞',
    },
    {
      label: t('session.MaxSessionLifetime'),
      children: resourcePolicy?.max_session_lifetime || '∞',
    },
    baiClient?.supports('max-pending-session-count') && {
      label: t('resourcePolicy.MaxPendingSessionCount'),
      children:
        _.isNull(resourcePolicy?.max_pending_session_count) ||
        _.isUndefined(resourcePolicy?.max_pending_session_count)
          ? '∞'
          : resourcePolicy?.max_pending_session_count,
    },
    baiClient?.supports('max-concurrent-sftp-sessions') && {
      label: t('resourcePolicy.MaxConcurrentSFTPSessions'),
      children: resourcePolicy?.max_concurrent_sftp_sessions || '∞',
    },
    baiClient?.supports('max-pending-session-resource-slots') && {
      label: t('resourcePolicy.MaxPendingSessionResourceSlots'),
      children: resourcePolicy?.max_pending_session_resource_slots ? (
        !_.isEmpty(
          JSON.parse(resourcePolicy?.max_pending_session_resource_slots),
        ) ? (
          <Descriptions className={styles.description} size="small" column={2}>
            <Descriptions.Item>
              <Flex direction="column" align="start">
                {_.map(
                  JSON.parse(
                    resourcePolicy?.max_pending_session_resource_slots,
                  ),
                  (v, type) => (
                    <ResourceNumber
                      key={type}
                      type={type}
                      value={_.toString(v)}
                    />
                  ),
                )}
              </Flex>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          '-'
        )
      ) : (
        '-'
      ),
    },
  ]);

  return (
    <BAIModal
      open={open}
      onCancel={() => onRequestClose()}
      footer={null}
      title={`${t('resourcePolicy.ResourcePolicy')}: '${resourcePolicy?.name}'`}
      centered
      width={token.screenSM}
      {...modalProps}
    >
      <Descriptions bordered column={1} items={descriptionItems} />
    </BAIModal>
  );
};

export default KeypairResourcePolicyInfoModal;
