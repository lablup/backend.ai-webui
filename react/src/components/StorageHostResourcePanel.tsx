import { StorageHostResourcePanelFragment$key } from '../__generated__/StorageHostResourcePanelFragment.graphql';
import { convertToDecimalUnit, usageIndicatorColor } from '../helper/index';
import { Progress, Descriptions, Typography, Tag } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

const StorageHostResourcePanel: React.FC<{
  storageVolumeFrgmt: StorageHostResourcePanelFragment$key | null;
}> = ({ storageVolumeFrgmt: resourceFrgmt }) => {
  const { t } = useTranslation();

  const resource = useFragment(
    graphql`
      fragment StorageHostResourcePanelFragment on StorageVolume {
        id
        backend
        capabilities
        path
        usage
      }
    `,
    resourceFrgmt,
  );

  const parsedUsage = JSON.parse(resource?.usage || '{}');
  const usedBytes = parsedUsage?.used_bytes;
  const capacityBytes = parsedUsage?.capacity_bytes;
  const usageRatio = capacityBytes > 0 ? usedBytes / capacityBytes : 0;
  const storageUsage = {
    used_bytes: usedBytes,
    capacity_bytes: capacityBytes,
    percent: Number((usageRatio * 100).toFixed(1)),
  };

  return (
    <Descriptions size="small" bordered column={3}>
      <Descriptions.Item label={t('storageHost.Usage')} span={3}>
        {storageUsage?.percent < 100 ? (
          <Progress
            size={[200, 15]}
            percent={storageUsage?.percent}
            strokeColor={usageIndicatorColor(storageUsage?.percent)}
          ></Progress>
        ) : (
          <Progress
            size={[200, 15]}
            percent={storageUsage?.percent}
            status="exception"
          ></Progress>
        )}
        <Typography.Text type="secondary">
          {t('storageHost.Used')}:{' '}
        </Typography.Text>
        {convertToDecimalUnit(storageUsage?.used_bytes, 'auto')?.displayValue}
        <Typography.Text type="secondary">{' / '}</Typography.Text>
        <Typography.Text type="secondary">
          {t('storageHost.Total')}:{' '}
        </Typography.Text>
        {
          convertToDecimalUnit(storageUsage?.capacity_bytes, 'auto')
            ?.displayValue
        }
      </Descriptions.Item>
      <Descriptions.Item label={t('agent.Endpoint')}>
        {resource?.path}
      </Descriptions.Item>
      <Descriptions.Item label={t('agent.BackendType')}>
        {resource?.backend}
      </Descriptions.Item>
      <Descriptions.Item label={t('agent.Capabilities')}>
        <BAIFlex gap="xs" wrap="wrap">
          {_.map(resource?.capabilities, (cap) => (
            <Tag key={cap}>{cap}</Tag>
          ))}
        </BAIFlex>
      </Descriptions.Item>
    </Descriptions>
  );
};

export default StorageHostResourcePanel;
