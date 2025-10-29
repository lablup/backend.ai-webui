import { PlusOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { Card, Descriptions, Typography, Button, Table, Tag } from 'antd';
import { ColumnType } from 'antd/lib/table';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useWebUINavigate } from 'src/hooks';

const DeploymentDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { deploymentId } = useParams<{ deploymentId: string }>();
  const webuiNavigate = useWebUINavigate();

  // Get deployment data from mock data
  // const deployment = mockDeployments.find((d) => d.id === deploymentId);
  const deployment: any = undefined;

  if (!deployment) {
    return <div>Deployment not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const revisionColumns: ColumnType<any>[] = [
    {
      title: t('deployment.RevisionNumber'),
      dataIndex: 'name',
      key: 'name',
      render: (name, row) => (
        <Typography.Link
          onClick={() =>
            webuiNavigate(`/deployment/${deploymentId}/revision/${row.id}`)
          }
        >
          {name}
        </Typography.Link>
      ),
    },
    {
      title: t('deployment.ImageName'),
      dataIndex: ['image', 'id'],
      key: 'image',
      render: (imageId) => <Typography.Text code>{imageId}</Typography.Text>,
    },
    {
      title: t('deployment.RuntimeVariant'),
      dataIndex: ['modelRuntimeConfig', 'runtimeVariant'],
      key: 'runtimeVariant',
      render: (variant) => <Tag color="blue">{variant}</Tag>,
    },
    {
      title: t('deployment.MountDestination'),
      dataIndex: ['modelMountConfig', 'mountDestination'],
      key: 'mountDestination',
    },
    {
      title: t('deployment.CreatedAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('ll LT'),
    },
  ];

  const descriptionsItems = [
    {
      label: t('deployment.DeploymentName'),
      children: (
        <Typography.Text copyable>{deployment.metadata.name}</Typography.Text>
      ),
    },
    {
      label: t('deployment.Domain'),
      children: deployment.networkAccess.preferredDomainName,
    },
    {
      label: t('deployment.URL'),
      children: (
        <Typography.Link
          copyable
          href={deployment.networkAccess.endpointUrl}
          target="_blank"
        >
          {deployment.networkAccess.endpointUrl}
        </Typography.Link>
      ),
    },
    {
      label: t('deployment.CreatorEmail'),
      children: deployment.createdUser.email,
    },
    {
      label: t('deployment.CreatedAt'),
      children: dayjs(deployment.metadata.createdAt).format('ll LT'),
    },
    {
      label: t('deployment.Status'),
      children: (
        <Tag color={getStatusColor(deployment.metadata.status)}>
          {deployment.metadata.status}
        </Tag>
      ),
    },
  ];

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex justify="between" align="center">
        <Typography.Title level={3} style={{ margin: 0 }}>
          {deployment.metadata.name}
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
        <Table
          rowKey="id"
          columns={revisionColumns}
          dataSource={_.map(
            deployment?.revisionHistory?.edges,
            (edge) => edge.node,
          )}
          pagination={false}
          scroll={{ x: 'max-content' }}
          bordered
        />
      </Card>
    </BAIFlex>
  );
};

export default DeploymentDetailPage;
