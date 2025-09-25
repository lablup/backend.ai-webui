import type { ReservoirAuditLog } from '../types/reservoir';
import BAIText from './BAIText';
import { Tag, Typography } from 'antd';
import { BAIFlex, BAIPropertyFilter, BAITable } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

// import { useTranslation } from 'react-i18next';

interface ReservoirAuditLogListProps {
  auditLogs: ReservoirAuditLog[];
  loading?: boolean;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  pagination?: {
    pageSize: number;
    current: number;
    total: number;
    showTotal?: (total: number) => React.ReactNode;
    onChange?: (current: number, pageSize: number) => void;
  };
  order?: string;
  onChangeOrder?: (order: string) => void;
}

const ReservoirAuditLogList: React.FC<ReservoirAuditLogListProps> = ({
  auditLogs,
  loading = false,
  filterValue,
  onFilterChange,
  pagination,
  order,
  onChangeOrder,
}) => {
  // const { t } = useTranslation();

  return (
    <BAIFlex direction="column" align="stretch" gap={'sm'}>
      <BAIFlex
        gap={'sm'}
        align="start"
        style={{
          flexShrink: 1,
        }}
        wrap="wrap"
      >
        <BAIPropertyFilter
          filterProperties={[
            {
              key: 'artifactName',
              propertyLabel: 'Artifact',
              type: 'string',
            },
            {
              key: 'operation',
              propertyLabel: 'Operation',
              type: 'string',
              strictSelection: true,
              defaultOperator: '==',
              options: [
                { label: 'Pull', value: 'pull' },
                { label: 'Install', value: 'install' },
                { label: 'Uninstall', value: 'uninstall' },
                { label: 'Update', value: 'update' },
                { label: 'Verify', value: 'verify' },
                { label: 'Delete', value: 'delete' },
              ],
            },
            {
              key: 'modifier',
              propertyLabel: 'Modifier',
              type: 'string',
            },
            {
              key: 'status',
              propertyLabel: 'Status',
              type: 'string',
              strictSelection: true,
              defaultOperator: '==',
              options: [
                { label: 'Success', value: 'success' },
                { label: 'Failed', value: 'failed' },
                { label: 'In Progress', value: 'in_progress' },
              ],
            },
          ]}
          value={filterValue}
          onChange={onFilterChange}
        />
      </BAIFlex>
      <BAITable
        size="small"
        dataSource={auditLogs}
        rowKey="id"
        loading={loading}
        columns={[
          {
            title: 'Artifact',
            dataIndex: 'artifactName',
            key: 'artifactName',
            render: (artifactName: string) => (
              <Typography.Text strong>{artifactName}</Typography.Text>
            ),
            sorter: true,
          },
          {
            title: 'Version',
            dataIndex: 'artifactVersion',
            key: 'artifactVersion',
            render: (version: string) =>
              version ? <BAIText monospace>{version}</BAIText> : '-',
          },
          {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (operation: string) => <Tag>{operation.toUpperCase()}</Tag>,
            sorter: true,
          },
          {
            title: 'Modifier',
            dataIndex: 'modifier',
            key: 'modifier',
            render: (modifier: string) => (
              <Typography.Text>{modifier}</Typography.Text>
            ),
            sorter: true,
          },
          {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: string) => (
              <Typography.Text type="secondary">
                {dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </Typography.Text>
            ),
            sorter: true,
          },
        ]}
        pagination={pagination}
        scroll={{ x: 'max-content' }}
        // order={order}
        expandable={{
          expandedRowRender: (record) => (
            <BAIFlex direction="column" gap="xs" style={{ padding: '8px 0' }}>
              <BAIFlex align="center" gap="xs">
                <Typography.Text strong>Status:</Typography.Text>
                <Tag
                  color={
                    record.status === 'success'
                      ? 'green'
                      : record.status === 'failed'
                        ? 'red'
                        : 'blue'
                  }
                  icon={
                    record.status === 'success' ? (
                      <CheckCircle size={12} />
                    ) : record.status === 'failed' ? (
                      <XCircle size={12} />
                    ) : (
                      <Activity size={12} />
                    )
                  }
                >
                  {record.status.toUpperCase()}
                </Tag>
              </BAIFlex>
              {record.details && (
                <BAIFlex align="start" gap="xs">
                  <Typography.Text strong>Details:</Typography.Text>
                  <Typography.Text type="secondary">
                    {record.details}
                  </Typography.Text>
                </BAIFlex>
              )}
            </BAIFlex>
          ),
          expandRowByClick: true,
        }}
      />
    </BAIFlex>
  );
};

export default ReservoirAuditLogList;
