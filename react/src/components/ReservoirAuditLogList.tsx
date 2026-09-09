/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Badge } from '@astryxdesign/core/Badge';
import {
  BAIPropertyFilter,
  BAIFlex,
  BAITable,
  BAIText,
  badgeVariantForTagColor,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { Activity, CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

// import { useTranslation } from 'react-i18next';

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
        scroll={{ x: 'max-content' }}
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
              <BAIText strong>{artifactName}</BAIText>
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
            render: (operation: string) => (
              <Badge
                variant={badgeVariantForTagColor(undefined)}
                label={operation.toUpperCase()}
              />
            ),
            sorter: true,
          },
          {
            title: 'Modifier',
            dataIndex: 'modifier',
            key: 'modifier',
            render: (modifier: string) => <BAIText>{modifier}</BAIText>,
            sorter: true,
          },
          {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            render: (timestamp: string) => (
              <BAIText type="secondary">
                {dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}
              </BAIText>
            ),
            sorter: true,
          },
        ]}
        pagination={pagination}
        // order={order}
        expandable={{
          expandedRowRender: (record) => (
            <BAIFlex direction="column" gap="xs" style={{ padding: '8px 0' }}>
              <BAIFlex align="center" gap="xs">
                <BAIText strong>Status:</BAIText>
                {/* antd `Tag color` → Astryx `Badge variant` via the
                    repo-global lookup (ticket 13); the leading glyph moves to
                    `icon`, Badge's icon slot. */}
                <Badge
                  variant={badgeVariantForTagColor(
                    record.status === 'success'
                      ? 'green'
                      : record.status === 'failed'
                        ? 'red'
                        : 'blue',
                  )}
                  icon={
                    record.status === 'success' ? (
                      <CheckCircle size={12} />
                    ) : record.status === 'failed' ? (
                      <XCircle size={12} />
                    ) : (
                      <Activity size={12} />
                    )
                  }
                  label={record.status.toUpperCase()}
                />
              </BAIFlex>
              {record.details && (
                <BAIFlex align="start" gap="xs">
                  <BAIText strong>Details:</BAIText>
                  <BAIText type="secondary">{record.details}</BAIText>
                </BAIFlex>
              )}
            </BAIFlex>
          ),
        }}
      />
    </BAIFlex>
  );
};

export default ReservoirAuditLogList;
