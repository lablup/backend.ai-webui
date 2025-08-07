import { ResourceGroupInfoModalFragment$key } from '../__generated__/ResourceGroupInfoModalFragment.graphql';
import BAIModal, { BAIModalProps } from './BAIModal';
import { ScalingGroupOpts } from './ResourceGroupList';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Descriptions, Tag, Typography, theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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
  const driverOpts = useMemo(
    () => JSON.parse(resourceGroup?.driver_opts || '{}'),
    [resourceGroup?.driver_opts],
  );
  const schedulerOpts: Partial<ScalingGroupOpts> = useMemo(
    () => JSON.parse(resourceGroup?.scheduler_opts || '{}'),
    [resourceGroup?.scheduler_opts],
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
          <BAIFlex
            wrap="wrap"
            direction="row"
            gap={'xs'}
            style={{
              width: '100%',
            }}
          >
            {_.map(schedulerOpts?.allowed_session_types, (value) => {
              return (
                <Tag
                  key={value}
                  style={{
                    margin: 0,
                  }}
                >
                  {_.startCase(value)}
                </Tag>
              );
            })}
          </BAIFlex>
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.PendingTimeout')}>
          {!_.isNil(schedulerOpts?.pending_timeout) ? (
            <BAIFlex gap={'xxs'} align="end">
              <Typography.Text>
                {`${schedulerOpts.pending_timeout}
                ${t('resourceGroup.TimeoutSeconds')}`}
              </Typography.Text>
              {!schedulerOpts?.pending_timeout ? (
                <Typography.Text
                  style={{
                    color: token.colorTextSecondary,
                    fontSize: token.fontSizeSM,
                  }}
                >
                  {`(${t('general.Disabled')})`}
                </Typography.Text>
              ) : null}
            </BAIFlex>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('resourceGroup.RetriesToSkipDesc')}>
          {schedulerOpts?.config?.num_retries_to_skip
            ? `${schedulerOpts.config.num_retries_to_skip} ${t('resourceGroup.RetriesToSkip')}`
            : '-'}
        </Descriptions.Item>
      </Descriptions>
      {/* FIXME: Currently, the driver options feature is unimplemented. After the feature is implemented, 
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
                  <BAIFlex direction="column">
                    {_.map(value, (item) => {
                      return <Tag key={item}>{item}</Tag>;
                    })}
                  </BAIFlex>
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
