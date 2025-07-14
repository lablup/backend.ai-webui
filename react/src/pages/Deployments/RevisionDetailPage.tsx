import ResourceNumber from '../../components/ResourceNumber';
import { useWebUINavigate } from '../../hooks';
import {
  EditOutlined,
  ReloadOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  Card,
  Descriptions,
  Typography,
  Button,
  Table,
  Tag,
  Switch,
  Alert,
  Statistic,
  Row,
  Col,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface AutoscalingRule {
  id: string;
  metricSource: string;
  metricName: string;
  comparator: string;
  threshold: number;
  stepSize: number;
  cooldownSeconds: number;
  minReplicas: number;
  maxReplicas: number;
  lastTriggeredAt?: string;
  createdAt: string;
}

interface TriggerRecord {
  id: string;
  timestamp: string;
  metricName: string;
  metricValue: number;
  threshold: number;
  action: 'scale_up' | 'scale_down';
  fromReplicas: number;
  toReplicas: number;
  reason: string;
}

interface RevisionDetail {
  id: string;
  revisionNumber: number;
  deploymentId: string;
  deploymentName: string;
  imageName: string;
  containerImage: string;
  description?: string;
  modelPath: string;
  modelMountPath: string;
  resources: {
    cpu: number;
    memory: string;
    gpu: number;
    gpuType: string;
  };
  replicaCount: number;
  currentReplicas: number;
  status: 'Active' | 'Deploying' | 'Hibernated' | 'Failed';
  hibernated: boolean;
  trafficRatio: number;
  envVars: Record<string, string>;
  startupCommand?: string;
  autoscalingRules: AutoscalingRule[];
  triggerHistory: TriggerRecord[];
  createdAt: string;
  updatedAt: string;
}

const RevisionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { deploymentId, revisionId } = useParams<{
    deploymentId: string;
    revisionId: string;
  }>();
  const webuiNavigate = useWebUINavigate();
  const [hibernated, setHibernated] = useState(false);

  // Mock data - replace with actual API call
  const mockRevision: RevisionDetail = {
    id: revisionId || 'rev-1',
    revisionNumber: 2,
    deploymentId: deploymentId || 'deploy-1',
    deploymentName: 'llama-3-deployment',
    imageName: 'llama-3-8b:v2.1',
    containerImage: 'registry.hub.docker.com/vllm/vllm-openai:v0.4.2',
    description:
      'Updated model with improved performance optimizations and enhanced monitoring',
    modelPath: '/workspace/models/llama-3-8b',
    modelMountPath: '/models',
    resources: {
      cpu: 16,
      memory: '32g',
      gpu: 4,
      gpuType: 'nvidia.com/gpu',
    },
    replicaCount: 3,
    currentReplicas: 2,
    status: 'Active',
    hibernated: false,
    trafficRatio: 30,
    envVars: {
      MODEL_NAME: 'llama-3-8b',
      MAX_SEQ_LEN: '4096',
      TENSOR_PARALLEL_SIZE: '4',
    },
    startupCommand:
      'python -m vllm.entrypoints.openai.api_server --model /models --tensor-parallel-size 4',
    autoscalingRules: [
      {
        id: 'rule-1',
        metricSource: 'INFERENCE',
        metricName: 'avg_prompt_throughput_toks_per_s',
        comparator: 'LESS_THAN',
        threshold: 50,
        stepSize: -1,
        cooldownSeconds: 300,
        minReplicas: 1,
        maxReplicas: 5,
        lastTriggeredAt: '2024-01-16T10:30:00Z',
        createdAt: '2024-01-15T14:20:00Z',
      },
      {
        id: 'rule-2',
        metricSource: 'KERNEL',
        metricName: 'cpu_utilization',
        comparator: 'GREATER_THAN',
        threshold: 80,
        stepSize: 1,
        cooldownSeconds: 180,
        minReplicas: 1,
        maxReplicas: 5,
        createdAt: '2024-01-15T14:25:00Z',
      },
    ],
    triggerHistory: [
      {
        id: 'trigger-1',
        timestamp: '2024-01-16T10:30:00Z',
        metricName: 'avg_prompt_throughput_toks_per_s',
        metricValue: 45,
        threshold: 50,
        action: 'scale_down',
        fromReplicas: 3,
        toReplicas: 2,
        reason: 'Low throughput detected',
      },
      {
        id: 'trigger-2',
        timestamp: '2024-01-16T08:15:00Z',
        metricName: 'cpu_utilization',
        metricValue: 85,
        threshold: 80,
        action: 'scale_up',
        fromReplicas: 2,
        toReplicas: 3,
        reason: 'High CPU utilization',
      },
    ],
    createdAt: '2024-01-16T14:20:00Z',
    updatedAt: '2024-01-16T16:30:00Z',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Deploying':
        return 'processing';
      case 'Hibernated':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getComparatorSymbol = (comparator: string) => {
    const symbols: Record<string, string> = {
      GREATER_THAN: '>',
      LESS_THAN: '<',
      GREATER_EQUAL: '>=',
      LESS_EQUAL: '<=',
    };
    return symbols[comparator] || comparator;
  };

  const getActionColor = (action: string) => {
    return action === 'scale_up' ? 'green' : 'orange';
  };

  const handleHibernationToggle = (checked: boolean) => {
    setHibernated(checked);
    // Implement hibernation API call
    console.log('Toggle hibernation:', checked);
  };

  const autoscalingRuleColumns: ColumnType<AutoscalingRule>[] = [
    {
      title: t('revision.MetricSource'),
      dataIndex: 'metricSource',
      key: 'metricSource',
    },
    {
      title: t('revision.Condition'),
      key: 'condition',
      render: (_, rule) => (
        <BAIFlex gap="xs" align="center">
          <Tag>{rule.metricName}</Tag>
          <span>{getComparatorSymbol(rule.comparator)}</span>
          <span>
            {rule.threshold}
            {rule.metricSource === 'KERNEL' ? '%' : ''}
          </span>
        </BAIFlex>
      ),
    },
    {
      title: t('revision.StepSize'),
      dataIndex: 'stepSize',
      key: 'stepSize',
      render: (stepSize) => (
        <Tag color={stepSize > 0 ? 'green' : 'orange'}>
          {stepSize > 0 ? `+${stepSize}` : stepSize}
        </Tag>
      ),
    },
    {
      title: t('revision.Replicas'),
      key: 'replicas',
      render: (_, rule) => (
        <span>
          {rule.minReplicas} - {rule.maxReplicas}
        </span>
      ),
    },
    {
      title: t('revision.CooldownSeconds'),
      dataIndex: 'cooldownSeconds',
      key: 'cooldownSeconds',
      render: (seconds) => `${seconds}s`,
    },
    {
      title: t('revision.LastTriggered'),
      dataIndex: 'lastTriggeredAt',
      key: 'lastTriggeredAt',
      render: (date) => (date ? dayjs(date).format('ll LTS') : '-'),
    },
  ];

  const triggerHistoryColumns: ColumnType<TriggerRecord>[] = [
    {
      title: t('revision.Timestamp'),
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (date) => dayjs(date).format('ll LTS'),
    },
    {
      title: t('revision.Metric'),
      key: 'metric',
      render: (_, record) => (
        <BAIFlex gap="xs" align="center">
          <Tag>{record.metricName}</Tag>
          <span>
            {record.metricValue} / {record.threshold}
          </span>
        </BAIFlex>
      ),
    },
    {
      title: t('revision.Action'),
      dataIndex: 'action',
      key: 'action',
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {action === 'scale_up'
            ? t('revision.ScaleUp')
            : t('revision.ScaleDown')}
        </Tag>
      ),
    },
    {
      title: t('revision.Replicas'),
      key: 'replicas',
      render: (_, record) => (
        <span>
          {record.fromReplicas} → {record.toReplicas}
        </span>
      ),
    },
    {
      title: t('revision.Reason'),
      dataIndex: 'reason',
      key: 'reason',
    },
  ];

  const descriptionsItems = [
    {
      label: t('revision.RevisionNumber'),
      children: `Rev #${mockRevision.revisionNumber}`,
    },
    {
      label: t('revision.DeploymentName'),
      children: (
        <Typography.Link
          onClick={() => webuiNavigate(`/deployment/${deploymentId}`)}
        >
          {mockRevision.deploymentName}
        </Typography.Link>
      ),
    },
    {
      label: t('revision.Status'),
      children: (
        <Tag color={getStatusColor(mockRevision.status)}>
          {mockRevision.status}
        </Tag>
      ),
    },
    {
      label: t('revision.ImageName'),
      children: (
        <Typography.Text code>{mockRevision.imageName}</Typography.Text>
      ),
    },
    {
      label: t('deployment.Description'),
      children: mockRevision.description || '-',
    },
    {
      label: t('revision.ContainerImage'),
      children: (
        <Typography.Text code>{mockRevision.containerImage}</Typography.Text>
      ),
    },
    {
      label: t('revision.ModelPath'),
      children: mockRevision.modelPath,
    },
    {
      label: t('revision.ModelMountPath'),
      children: mockRevision.modelMountPath,
    },
    {
      label: t('revision.Resources'),
      children: (
        <BAIFlex gap="xs">
          <ResourceNumber
            type="cpu"
            value={mockRevision.resources.cpu.toString()}
          />
          <ResourceNumber type="mem" value={mockRevision.resources.memory} />
          <ResourceNumber
            type="cuda.device"
            value={mockRevision.resources.gpu.toString()}
          />
        </BAIFlex>
      ),
    },
    {
      label: t('revision.StartupCommand'),
      children: mockRevision.startupCommand ? (
        <Typography.Text code style={{ fontSize: '12px' }}>
          {mockRevision.startupCommand}
        </Typography.Text>
      ) : (
        '-'
      ),
    },
    {
      label: t('revision.CreatedAt'),
      children: dayjs(mockRevision.createdAt).format('ll LTS'),
    },
    {
      label: t('revision.UpdatedAt'),
      children: dayjs(mockRevision.updatedAt).format('ll LTS'),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex justify="between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {mockRevision.deploymentName} - Rev #{mockRevision.revisionNumber}
        </Typography.Title>
        <BAIFlex gap="xs">
          <Button icon={<ReloadOutlined />}>{t('button.Refresh')}</Button>
        </BAIFlex>
      </BAIFlex>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('revision.TrafficRatio')}
              value={mockRevision.trafficRatio}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('revision.CurrentReplicas')}
              value={mockRevision.currentReplicas}
              suffix={`/ ${mockRevision.replicaCount}`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <BAIFlex justify="between" align="center">
              <Typography.Text strong>
                {t('revision.Hibernation')}
              </Typography.Text>
              <Switch
                checked={hibernated}
                onChange={handleHibernationToggle}
                checkedChildren={t('revision.Hibernated')}
                unCheckedChildren={t('revision.Active')}
              />
            </BAIFlex>
          </Card>
        </Col>
      </Row>

      <Card
        title={t('revision.RevisionMetadata')}
        extra={
          <Button type="primary" icon={<EditOutlined />}>
            {t('button.Edit')}
          </Button>
        }
      >
        <Descriptions
          bordered
          column={{ xxl: 2, xl: 2, lg: 1, md: 1, sm: 1, xs: 1 }}
          items={descriptionsItems}
        />
      </Card>

      <Card title={t('revision.EnvironmentVariables')}>
        <Table
          rowKey="key"
          columns={[
            {
              title: t('revision.Variable'),
              dataIndex: 'key',
              key: 'key',
            },
            {
              title: t('revision.Value'),
              dataIndex: 'value',
              key: 'value',
              render: (value) => (
                <Typography.Text code>{value}</Typography.Text>
              ),
            },
          ]}
          dataSource={Object.entries(mockRevision.envVars).map(
            ([key, value]) => ({
              key,
              value,
            }),
          )}
          pagination={false}
          size="small"
        />
      </Card>

      <Card title={t('revision.AutoscalingRules')}>
        {mockRevision.autoscalingRules.length > 0 ? (
          <Table
            rowKey="id"
            columns={autoscalingRuleColumns}
            dataSource={mockRevision.autoscalingRules}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Alert
            message={t('revision.NoAutoscalingRules')}
            type="info"
            showIcon
          />
        )}
      </Card>

      <Card
        title={t('revision.TriggerHistory')}
        extra={
          <Button icon={<HistoryOutlined />} size="small">
            {t('revision.ViewAllHistory')}
          </Button>
        }
      >
        {mockRevision.triggerHistory.length > 0 ? (
          <Table
            rowKey="id"
            columns={triggerHistoryColumns}
            dataSource={mockRevision.triggerHistory}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Alert
            message={t('revision.NoTriggerHistory')}
            type="info"
            showIcon
          />
        )}
      </Card>
    </BAIFlex>
  );
};

export default RevisionDetailPage;
