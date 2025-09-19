import ResourceNumber from '../../components/ResourceNumber';
import { useWebUINavigate } from '../../hooks';
import { PlusOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  Card,
  Descriptions,
  Typography,
  Button,
  Table,
  Tag,
  InputNumber,
  Progress,
  Alert,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Revision {
  id: string;
  revision_number: number;
  image_name: string;
  mode: 'simple' | 'expert';
  description?: string;
  traffic_ratio: number;
  resource_usage: {
    cpu: number;
    gpu: number;
    memory: string;
  };
  replica_count: number;
  status: 'Active' | 'Deploying' | 'Hibernated' | 'Failed';
  created_at: string;
}

interface DeploymentDetail {
  id: string;
  name: string;
  domain: string;
  url: string;
  description?: string;
  creator_email: string;
  created_at: string;
  status: 'Active' | 'Hibernated' | 'Failed';
  revisions: Revision[];
}

const DeploymentDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const webuiNavigate = useWebUINavigate();
  const [editingTrafficRatio, setEditingTrafficRatio] = useState<string | null>(
    null,
  );
  const [tempTrafficRatios, setTempTrafficRatios] = useState<
    Record<string, number>
  >({});

  // Mock data - replace with actual API call
  const getMockDeployment = (id: string): DeploymentDetail => {
    const deployments = {
      '1': {
        id: '1',
        name: 'llama-3-deployment',
        domain: 'api.example.com',
        url: 'https://api.example.com/v1/llama-3',
        description:
          'Production deployment of LLaMA-3 8B model for general text generation tasks',
        creator_email: 'user@example.com',
        created_at: '2024-01-15T10:30:00Z',
        status: 'Active' as const,
        revisions: [
          {
            id: 'rev-1',
            revision_number: 1,
            image_name: 'llama-3-8b:latest',
            mode: 'simple' as const,
            description: 'Initial release with basic configuration',
            traffic_ratio: 70,
            resource_usage: { cpu: 16, gpu: 4, memory: '32g' },
            replica_count: 2,
            status: 'Active' as const,
            created_at: '2024-01-15T10:30:00Z',
          },
          {
            id: 'rev-2',
            revision_number: 2,
            image_name: 'llama-3-8b:v2.1',
            mode: 'simple' as const,
            description:
              'Updated model with improved performance optimizations',
            traffic_ratio: 30,
            resource_usage: { cpu: 16, gpu: 4, memory: '32g' },
            replica_count: 1,
            status: 'Active' as const,
            created_at: '2024-01-16T14:20:00Z',
          },
        ],
      },
      '2': {
        id: '2',
        name: 'gpt-4-expert-setup',
        domain: 'api.example.com',
        url: 'https://api.example.com/v1/gpt-4',
        description:
          'Expert configuration for GPT-4 model with advanced scaling and monitoring',
        creator_email: 'admin@example.com',
        created_at: '2024-01-14T15:45:00Z',
        status: 'Active' as const,
        revisions: [
          {
            id: 'rev-3',
            revision_number: 1,
            image_name: 'gpt-4-turbo:latest',
            mode: 'expert' as const,
            description: 'Base GPT-4 deployment with custom autoscaling rules',
            traffic_ratio: 50,
            resource_usage: { cpu: 32, gpu: 8, memory: '64g' },
            replica_count: 4,
            status: 'Active' as const,
            created_at: '2024-01-14T15:45:00Z',
          },
          {
            id: 'rev-4',
            revision_number: 2,
            image_name: 'gpt-4-turbo:v1.2',
            mode: 'expert' as const,
            description: 'Performance improvements with enhanced monitoring',
            traffic_ratio: 30,
            resource_usage: { cpu: 32, gpu: 8, memory: '64g' },
            replica_count: 2,
            status: 'Active' as const,
            created_at: '2024-01-16T09:30:00Z',
          },
          {
            id: 'rev-5',
            revision_number: 3,
            image_name: 'gpt-4-turbo:v1.3',
            mode: 'expert' as const,
            description: 'Latest model with experimental features',
            traffic_ratio: 20,
            resource_usage: { cpu: 32, gpu: 8, memory: '64g' },
            replica_count: 2,
            status: 'Deploying' as const,
            created_at: '2024-01-17T11:15:00Z',
          },
        ],
      },
    };

    return deployments[id as keyof typeof deployments] || deployments['1'];
  };

  const mockDeployment = getMockDeployment(deploymentId || '1');

  const getModeColor = (mode: string) => {
    return mode === 'simple' ? 'blue' : 'purple';
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

  const handleTrafficRatioEdit = (revisionId: string, currentRatio: number) => {
    setEditingTrafficRatio(revisionId);
    setTempTrafficRatios({ ...tempTrafficRatios, [revisionId]: currentRatio });
  };

  const handleTrafficRatioSave = () => {
    // Validate that total ratios sum to 100%
    const totalRatio = Object.values(tempTrafficRatios).reduce(
      (sum, ratio) => sum + ratio,
      0,
    );
    if (totalRatio !== 100) {
      // Show error message
      return;
    }

    // Save traffic ratios
    console.log('Saving traffic ratios:', tempTrafficRatios);
    setEditingTrafficRatio(null);
    setTempTrafficRatios({});
  };

  const handleTrafficRatioCancel = () => {
    setEditingTrafficRatio(null);
    setTempTrafficRatios({});
  };

  const revisionColumns: ColumnType<Revision>[] = [
    {
      title: t('deployment.RevisionNumber'),
      dataIndex: 'revision_number',
      key: 'revision_number',
      render: (num, row) => (
        <Typography.Link
          onClick={() =>
            webuiNavigate(`/deployment/${deploymentId}/revision/${row.id}`)
          }
        >
          Rev #{num}
        </Typography.Link>
      ),
    },
    {
      title: t('deployment.ImageName'),
      dataIndex: 'image_name',
      key: 'image_name',
      render: (name) => <Typography.Text code>{name}</Typography.Text>,
    },
    {
      title: t('deployment.Mode'),
      dataIndex: 'mode',
      key: 'mode',
      render: (mode) => (
        <Tag color={getModeColor(mode)}>
          {mode === 'simple'
            ? t('deployment.SimpleMode')
            : t('deployment.ExpertMode')}
        </Tag>
      ),
    },
    {
      title: t('deployment.Description'),
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <Typography.Text
          ellipsis={{ tooltip: description }}
          style={{ maxWidth: 200 }}
        >
          {description || '-'}
        </Typography.Text>
      ),
    },
    {
      title: t('deployment.TrafficRatio'),
      key: 'traffic_ratio',
      render: (_, row) => (
        <BAIFlex align="center" gap="xs">
          {editingTrafficRatio === row.id ? (
            <InputNumber
              min={0}
              max={100}
              value={tempTrafficRatios[row.id] || row.traffic_ratio}
              onChange={(value) =>
                setTempTrafficRatios({
                  ...tempTrafficRatios,
                  [row.id]: value || 0,
                })
              }
              addonAfter="%"
              size="small"
              style={{ width: 80 }}
            />
          ) : (
            <>
              <Progress
                percent={row.traffic_ratio}
                size="small"
                style={{ width: 60 }}
                format={() => `${row.traffic_ratio}%`}
              />
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() =>
                  handleTrafficRatioEdit(row.id, row.traffic_ratio)
                }
              />
            </>
          )}
        </BAIFlex>
      ),
    },
    {
      title: t('deployment.Resources'),
      key: 'resources',
      render: (_, row) => (
        <BAIFlex gap="xs">
          <ResourceNumber
            type="cpu"
            value={row.resource_usage.cpu.toString()}
          />
          <ResourceNumber
            type="cuda.device"
            value={row.resource_usage.gpu.toString()}
          />
          <ResourceNumber type="mem" value={row.resource_usage.memory} />
        </BAIFlex>
      ),
    },
    {
      title: t('deployment.Replicas'),
      dataIndex: 'replica_count',
      key: 'replica_count',
      render: (count) => count,
    },
    {
      title: t('deployment.Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: t('deployment.CreatedAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('ll LT'),
    },
  ];

  const descriptionsItems = [
    {
      label: t('deployment.DeploymentName'),
      children: (
        <Typography.Text copyable>{mockDeployment.name}</Typography.Text>
      ),
    },
    {
      label: t('deployment.Domain'),
      children: mockDeployment.domain,
    },
    {
      label: t('deployment.URL'),
      children: (
        <Typography.Link copyable href={mockDeployment.url} target="_blank">
          {mockDeployment.url}
        </Typography.Link>
      ),
    },
    {
      label: t('deployment.Description'),
      children: mockDeployment.description || '-',
    },
    {
      label: t('deployment.CreatorEmail'),
      children: mockDeployment.creator_email,
    },
    {
      label: t('deployment.CreatedAt'),
      children: dayjs(mockDeployment.created_at).format('ll LT'),
    },
    {
      label: t('deployment.Status'),
      children: (
        <Tag color={getStatusColor(mockDeployment.status)}>
          {mockDeployment.status}
        </Tag>
      ),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex justify="between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {mockDeployment.name}
        </Typography.Title>
        <BAIFlex gap="xs">
          <Button icon={<ReloadOutlined />} />
        </BAIFlex>
      </BAIFlex>

      <Card
        title={t('deployment.DeploymentInfo')}
        extra={
          <Button type="primary" icon={<EditOutlined />}>
            {t('button.Edit')}
          </Button>
        }
      >
        <Descriptions
          bordered
          column={{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
          items={descriptionsItems}
        />
      </Card>

      <Card
        title={t('deployment.Revisions')}
        extra={
          <BAIFlex gap="xs">
            {editingTrafficRatio && (
              <>
                <Button size="small" onClick={handleTrafficRatioCancel}>
                  {t('button.Cancel')}
                </Button>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleTrafficRatioSave}
                >
                  {t('button.Save')}
                </Button>
              </>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                webuiNavigate(`/deployment/${deploymentId}/revision/create`)
              }
            >
              {t('deployment.CreateRevision')}
            </Button>
          </BAIFlex>
        }
      >
        {editingTrafficRatio && (
          <Alert
            message={t('deployment.TrafficRatioEditWarning')}
            description={t('deployment.TrafficRatioEditDescription')}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          rowKey="id"
          columns={revisionColumns}
          dataSource={mockDeployment.revisions}
          pagination={false}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
