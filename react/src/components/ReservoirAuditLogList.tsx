/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Tag, Typography } from 'antd';
import { BAIPropertyFilter, BAIFlex, BAITable, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface ReservoirAuditLogListProps {
  auditLogs: any[];
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
}) => {
  const { t } = useTranslation();

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
              propertyLabel: t('reservoirPage.Artifact'),
              type: 'string',
            },
            {
              key: 'operation',
              propertyLabel: t('auditLog.Operation'),
              type: 'string',
              strictSelection: true,
              defaultOperator: '==',
              options: [
                { label: t('reservoirPage.Pull'), value: 'pull' },
                { label: t('reservoirPage.Install'), value: 'install' },
                { label: t('reservoirPage.Uninstall'), value: 'uninstall' },
                { label: t('reservoirPage.Update'), value: 'update' },
                { label: t('reservoirPage.Verify'), value: 'verify' },
                { label: t('reservoirPage.Delete'), value: 'delete' },
              ],
            },
            {
              key: 'modifier',
              propertyLabel: t('reservoirPage.Modifier'),
              type: 'string',
            },
            {
              key: 'status',
              propertyLabel: t('reservoirPage.Status'),
              type: 'string',
              strictSelection: true,
              defaultOperator: '==',
              options: [
                { label: t('reservoirPage.Success'), value: 'success' },
                { label: t('reservoirPage.Failed'), value: 'failed' },
                { label: t('reservoirPage.InProgress'), value: 'in_progress' },
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
            title: t('reservoirPage.Artifact'),
            dataIndex: 'artifactName',
            key: 'artifactName',
            render: (artifactName: string) => (
              <Typography.Text strong>{artifactName}</Typography.Text>
            ),
            sorter: true,
          },
          {
            title: t('reservoirPage.Version'),
            dataIndex: 'artifactVersion',
            key: 'artifactVersion',
            render: (version: string) =>
              version ? <BAIText monospace>{version}</BAIText> : '-',
          },
          {
            title: t('auditLog.Operation'),
            dataIndex: 'operation',
            key: 'operation',
            render: (operation: string) => <Tag>{operation.toUpperCase()}</Tag>,
            sorter: true,
          },
          {
            title: t('reservoirPage.Modifier'),
            dataIndex: 'modifier',
            key: 'modifier',
            render: (modifier: string) => (
              <Typography.Text>{modifier}</Typography.Text>
            ),
            sorter: true,
          },
          {
            title: t('reservoirPage.Timestamp'),
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
                <Typography.Text strong>
                  {t('reservoirPage.Status')}:
                </Typography.Text>
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
                  <Typography.Text strong>
                    {t('reservoirPage.Details')}:
                  </Typography.Text>
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
