import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, ConfigProvider, Empty, theme, Typography } from 'antd';
import {
  BAITable,
  filterOutNullAndUndefined,
  filterOutEmpty,
  BAIColumnType,
  BAIFlex,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import {
  AutoScalingRuleListFragment$key,
  AutoScalingRuleListFragment$data,
} from 'src/__generated__/AutoScalingRuleListFragment.graphql';
import { formatDuration } from 'src/helper';

export type AutoScalingRuleInList = NonNullable<
  AutoScalingRuleListFragment$data[number]
>;

interface AutoScalingRuleListProps {
  autoScalingRulesFrgmt?: AutoScalingRuleListFragment$key;
  onRequestSettingAutoScalingRule: (record?: AutoScalingRuleInList) => void;
  onRequestDelete: (record: AutoScalingRuleInList) => void;
}

const AutoScalingRuleList: React.FC<AutoScalingRuleListProps> = ({
  autoScalingRulesFrgmt,
  onRequestSettingAutoScalingRule,
  onRequestDelete,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const autoScalingRules = useFragment(
    graphql`
      fragment AutoScalingRuleListFragment on AutoScalingRule
      @relay(plural: true) {
        id @required(action: THROW)
        metricSource
        metricName
        minThreshold
        maxThreshold
        stepSize
        timeWindow
        minReplicas
        maxReplicas
        createdAt
        lastTriggeredAt
      }
    `,
    autoScalingRulesFrgmt,
  );

  const filteredAutoScalingRules = filterOutNullAndUndefined(autoScalingRules);

  const columns = filterOutEmpty<BAIColumnType<AutoScalingRuleInList>>([
    {
      key: 'metricSource',
      dataIndex: 'metricSource',
      title: t('deployment.MetricSource'),
      fixed: 'left',
      render: (metricSource) => (
        <Typography.Text>
          {metricSource === 'KERNEL' ? 'Kernel' : 'Inference Framework'}
        </Typography.Text>
      ),
    },
    {
      key: 'metricName',
      dataIndex: 'metricName',
      title: t('deployment.MetricName'),
      render: (metricName) => <Typography.Text>{metricName}</Typography.Text>,
    },
    {
      key: 'controls',
      title: t('general.Control'),
      render: (_, record) => (
        <BAIFlex align="stretch">
          <Button
            type="link"
            style={{ color: token.colorInfo }}
            icon={<SettingOutlined />}
            onClick={() => onRequestSettingAutoScalingRule?.(record)}
          />
          <Button
            type="link"
            style={{ color: token.colorError }}
            icon={<DeleteOutlined />}
            onClick={() => onRequestDelete?.(record)}
          />
        </BAIFlex>
      ),
    },
    {
      key: 'minThreshold',
      dataIndex: 'minThreshold',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.MinThreshold')}
          <QuestionIconWithTooltip title={t('deployment.MinThresholdDesc')} />
        </BAIFlex>
      ),
      render: (minThreshold) => (
        <Typography.Text>{minThreshold || '-'}</Typography.Text>
      ),
    },
    {
      key: 'maxThreshold',
      dataIndex: 'maxThreshold',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.MaxThreshold')}
          <QuestionIconWithTooltip title={t('deployment.MaxThresholdDesc')} />
        </BAIFlex>
      ),
      render: (maxThreshold) => (
        <Typography.Text>{maxThreshold || '-'}</Typography.Text>
      ),
    },
    {
      key: 'stepSize',
      dataIndex: 'stepSize',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.StepSize')}
          <QuestionIconWithTooltip title={t('deployment.StepSizeDesc')} />
        </BAIFlex>
      ),
      render: (stepSize) => <Typography.Text>{stepSize}</Typography.Text>,
    },
    {
      key: 'timeWindow',
      dataIndex: 'timeWindow',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.TimeWindow')}
          <QuestionIconWithTooltip title={t('deployment.TimeWindowDesc')} />
        </BAIFlex>
      ),
      render: (timeWindow) => (
        <Typography.Text>
          {formatDuration(dayjs.duration(Number(timeWindow), 'seconds'), t)}
        </Typography.Text>
      ),
    },
    {
      key: 'minReplicas',
      dataIndex: 'minReplicas',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.MinReplicas')}
          <QuestionIconWithTooltip title={t('deployment.MinReplicasDesc')} />
        </BAIFlex>
      ),
      render: (minReplicas) => (
        <Typography.Text>{minReplicas || '-'}</Typography.Text>
      ),
    },
    {
      key: 'maxReplicas',
      dataIndex: 'maxReplicas',
      title: (
        <BAIFlex gap={'xxs'}>
          {t('deployment.MaxReplicas')}
          <QuestionIconWithTooltip title={t('deployment.MaxReplicasDesc')} />
        </BAIFlex>
      ),
      render: (maxReplicas) => (
        <Typography.Text>{maxReplicas || '-'}</Typography.Text>
      ),
    },
    {
      key: 'lastTriggeredAt',
      dataIndex: 'lastTriggeredAt',
      title: t('deployment.LastTriggeredAt'),
      render: (lastTriggeredAt) => (
        <Typography.Text>
          {lastTriggeredAt ? dayjs(lastTriggeredAt).format('LLL') : '-'}
        </Typography.Text>
      ),
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: t('deployment.CreatedAt'),
      render: (createdAt) => (
        <Typography.Text>{dayjs(createdAt).format('LLL')}</Typography.Text>
      ),
    },
  ]);

  return (
    <ConfigProvider
      renderEmpty={() => (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button
            type="primary"
            onClick={() => onRequestSettingAutoScalingRule()}
          >
            {t('deployment.SetAutoScalingRule')}
          </Button>
        </Empty>
      )}
    >
      <BAITable
        resizable
        columns={columns}
        dataSource={filteredAutoScalingRules}
        rowKey="id"
        size="small"
      />
    </ConfigProvider>
  );
};

export default AutoScalingRuleList;
