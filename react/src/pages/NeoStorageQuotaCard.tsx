import BAILayoutCard from '../components/BAILayoutCard';
import Flex from '../components/Flex';
import StorageSelect from '../components/StorageSelect';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Divider, Progress, Typography, theme } from 'antd';
import { CardProps } from 'antd/lib';

interface NeoStorageQuotaCardItemProps {
  type: 'project' | 'user';
  name: string;
  current: string | number;
  total: string | number;
}

const NeoStorageQuotaCardItem: React.FC<NeoStorageQuotaCardItemProps> = ({
  type,
  name,
  current,
  total,
}) => {
  const { token } = theme.useToken();

  return (
    <Flex direction="column" style={{ flex: 1 }} gap={token.marginXS}>
      <Flex align="end" justify="between" style={{ width: '100%' }}>
        <Flex direction="column" align="start">
          <Typography.Text style={{ color: token.colorTextSecondary }}>
            {type}
          </Typography.Text>
          <Typography.Text style={{ fontSize: 16, fontWeight: 500 }}>
            {name}
          </Typography.Text>
        </Flex>
        <Typography.Text style={{ fontSize: 20, color: token.colorPrimary }}>
          50%
        </Typography.Text>
      </Flex>
      <Progress
        strokeLinecap="butt"
        percent={50}
        size={['100%', 16]}
        strokeColor={token.colorPrimary}
        percentPosition={{ align: 'end', type: 'inner' }}
      />
    </Flex>
  );
};

interface NeoStorageQuotaCardProps extends CardProps {}

const NeoStorageQuotaCard: React.FC<NeoStorageQuotaCardProps> = ({
  ...cardProps
}) => {
  const { token } = theme.useToken();

  return (
    <BAILayoutCard
      title={
        <Flex justify="between">
          <Flex direction="row" align="center" justify="start" gap={'xs'}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {'Allocated Resources'}
            </Typography.Title>
            <Button type="text" icon={<QuestionCircleOutlined />} />
          </Flex>
          <StorageSelect
            autoSelectType="usage"
            showUsageStatus
            showSearch
            allowClear
          />
        </Flex>
      }
      {...cardProps}
    >
      <Flex align="start" style={{ width: 550, height: 88 }}>
        <NeoStorageQuotaCardItem
          type="project"
          name="default"
          total={'100GB'}
          current={'50GB'}
        />
        <Divider type="vertical" style={{ margin: token.marginLG }} />
        <NeoStorageQuotaCardItem
          type="user"
          name="default"
          total={'100GB'}
          current={'50GB'}
        />
      </Flex>
    </BAILayoutCard>
  );
};

export default NeoStorageQuotaCard;
