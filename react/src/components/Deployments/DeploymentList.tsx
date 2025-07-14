import ResourceNumber from '../ResourceNumber';
import WebUILink from '../WebUILink';
import { Typography, TablePaginationConfig, Tooltip } from 'antd';
import { ColumnType } from 'antd/lib/table';
import {
  BAIFlex,
  BAITable,
  BAITableProps,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { ExternalLinkIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Deployment {
  id: string;
  name: string;
  endpoint_url: string;
  total_gpu: number;
  total_cpu: number;
  total_mem?: string; // Optional, if memory is included
  active_replicas: number;
  active_revisions: number;
  tokens_last_hour: number;
  created_at: string;
}

interface DeploymentListProps
  extends Omit<BAITableProps<Deployment>, 'dataSource' | 'columns'> {
  deployments: Deployment[];
  loading?: boolean;
  pagination: TablePaginationConfig;
}

const DeploymentList: React.FC<DeploymentListProps> = ({
  deployments,
  loading,
  pagination,
  ...tableProps
}) => {
  const { t } = useTranslation();

  const columns: ColumnType<Deployment>[] = [
    {
      title: t('deployment.DeploymentName'),
      key: 'name',
      dataIndex: 'name',
      fixed: 'left',
      render: (name, row) => (
        <WebUILink to={`/deployment/${row.id}`}>{name}</WebUILink>
      ),
      sorter: true,
    },
    {
      title: t('deployment.EndpointURL'),
      dataIndex: 'endpoint_url',
      key: 'endpoint_url',
      render: (url) => (
        <BAIFlex gap={'xxs'}>
          <Typography.Text copyable>{url}</Typography.Text>
          <a href={url} title="" target="_blank" rel="noopener noreferrer">
            <Tooltip title={t('common.OpenInNewTab')}>
              <ExternalLinkIcon />
            </Tooltip>
          </a>
        </BAIFlex>
      ),
    },
    {
      title: t('deployment.TotalResources'),
      key: 'total_resources',
      render: (_, row) => (
        <BAIFlex direction="row" gap="xs">
          <ResourceNumber type="cpu" value={row.total_cpu.toString()} />
          <ResourceNumber type="mem" value={'12g'} />
          <ResourceNumber type="cuda.device" value={row.total_gpu.toString()} />
        </BAIFlex>
      ),
    },
    {
      title: t('deployment.ActiveReplicas'),
      dataIndex: 'active_replicas',
      key: 'active_replicas',
      render: (count) => count,
      sorter: (a, b) => a.active_replicas - b.active_replicas,
    },
    {
      title: t('deployment.ActiveRevisions'),
      dataIndex: 'active_revisions',
      key: 'active_revisions',
      render: (count) => count,
      sorter: (a, b) => a.active_revisions - b.active_revisions,
    },
    {
      title: t('deployment.TokensLastHour'),
      dataIndex: 'tokens_last_hour',
      key: 'tokens_last_hour',
      render: (count) => (
        <Typography.Text>{count.toLocaleString()}</Typography.Text>
      ),
      sorter: (a, b) => a.tokens_last_hour - b.tokens_last_hour,
    },
    {
      title: t('deployment.CreatedAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (created_at) => {
        return dayjs(created_at).format('ll LT');
      },
      sorter: (a, b) => {
        const date1 = dayjs(a.created_at);
        const date2 = dayjs(b.created_at);
        return date1.diff(date2);
      },
    },
  ];

  return (
    <BAITable
      size="small"
      loading={loading}
      scroll={{ x: 'max-content' }}
      rowKey="id"
      dataSource={filterOutNullAndUndefined(deployments)}
      columns={columns}
      pagination={pagination}
      {...tableProps}
    />
  );
};

export default DeploymentList;
