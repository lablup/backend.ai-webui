import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { ScalingGroupOpts } from './ResourceGroupList';
import { ResourceGroupInfoModalFragment$key } from './__generated__/ResourceGroupInfoModalFragment.graphql';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Descriptions, Tag, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface ResourceGroupInfoModalProps extends BAIModalProps {
  resourceGroupFrgmt?: ResourceGroupInfoModalFragment$key | null;
  onRequestClose?: () => void;
}

const ResourceGroupInfoModal: React.FC<ResourceGroupInfoModalProps> = ({
  resourceGroupFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupInfoModalFragment on ScalingGroup {
        name @required(action: NONE)
        description
        is_active
        is_public
        driver
        driver_opts
        scheduler
        scheduler_opts
        wsproxy_addr
      }
    `,
    resourceGroupFrgmt,
  );
  const driverOpts = JSON.parse(resourceGroup?.driver_opts || '{}');
  const schedulerOpts: Partial<ScalingGroupOpts> = JSON.parse(
    resourceGroup?.scheduler_opts || '{}',
  );

  return (
    <BAIModal
      title={t('resourceGroup.ResourceGroupDetail')}
      onCancel={onRequestClose}
      footer={null}
      centered
      {...modalProps}
    >
      <Descriptions
        column={1}
        size="small"
        title={t('resourceGroup.Information')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item label={t('resourceGroup.Name')}>
          {resourceGroup?.name}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.Description')}>
          {resourceGroup?.description || '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.Active')}>
          {resourceGroup?.is_active ? (
            <CheckOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <CloseOutlined style={{ color: token.colorTextSecondary }} />
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.Public')}>
          {resourceGroup?.is_public ? (
            <CheckOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <CloseOutlined style={{ color: token.colorTextSecondary }} />
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.Driver')}>
          {resourceGroup?.driver}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.Scheduler')}>
          {_.toUpper(resourceGroup?.scheduler ?? '')}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.WsproxyAddress')}>
          {resourceGroup?.wsproxy_addr || '-'}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions
        column={1}
        size="small"
        title={t('resourceGroup.SchedulerOptions')}
        labelStyle={{ width: '50%' }}
      >
        <Descriptions.Item label={t('resourceGroup.AllowedSessionTypes')}>
          {_.map(schedulerOpts?.allowed_session_types, (value) => {
            return <Tag key={value}>{_.startCase(value)}</Tag>;
          })}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.PendingTimeout')}>
          {schedulerOpts?.pending_timeout
            ? `${schedulerOpts.pending_timeout} ${t('resourceGroup.TimeoutSeconds')}`
            : '-'}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.RetriesToSkipDesc')}>
          {schedulerOpts?.config?.num_retries_to_skip
            ? `${schedulerOpts.config.num_retries_to_skip} ${t('resourceGroup.RetriesToSkip')}`
            : '-'}
        </Descriptions.Item>
      </Descriptions>
      {/* Currently, the driver options feature is unimplemented. After the feature is implemented, 
      it should be changed to show each type instead of the map type. */}
      {!_.isEmpty(driverOpts) ? (
        <Descriptions
          column={1}
          size="small"
          title={t('resourceGroup.DriverOptions')}
          labelStyle={{ width: '50%' }}
        >
          {_.map(driverOpts, (value, key) => {
            return (
              <Descriptions.Item key={key} label={_.startCase(key)}>
                {_.isArray(value) ? (
                  <Flex direction="column">
                    {_.map(value, (item) => {
                      return <Tag key={item}>{item}</Tag>;
                    })}
                  </Flex>
                ) : (
                  value
                )}
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      ) : null}
    </BAIModal>
  );
};

export default ResourceGroupInfoModal;
