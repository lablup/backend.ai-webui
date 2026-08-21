/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import UsageReportEmptySection from './UsageReportEmptySection';
import { UsageReportTopUser } from './types';
import { BAICard, BAIColumnsType, BAITable } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportTopUsersTableProps {
  topUsers: UsageReportTopUser[];
}

const UsageReportTopUsersTable: React.FC<UsageReportTopUsersTableProps> = ({
  topUsers,
}) => {
  'use memo';
  const { t } = useTranslation();
  const columns: BAIColumnsType<UsageReportTopUser> = [
    {
      key: 'rank',
      title: t('usageReport.Rank'),
      dataIndex: 'rank',
      width: 64,
    },
    {
      key: 'email',
      title: t('usageReport.User'),
      dataIndex: 'email',
    },
    {
      key: 'gpuHours',
      title: t('usageReport.GPUHours'),
      dataIndex: 'gpuHours',
      align: 'right',
    },
    {
      key: 'cpuHours',
      title: t('usageReport.CPUHours'),
      dataIndex: 'cpuHours',
      align: 'right',
    },
    {
      key: 'sessions',
      title: t('usageReport.Sessions'),
      dataIndex: 'sessions',
      align: 'right',
    },
  ];

  return (
    <BAICard
      className="usage-report-card usage-report-top-users"
      size="small"
      title={t('usageReport.TopUsersByGPUHours')}
    >
      {topUsers.length ? (
        <BAITable
          size="small"
          rowKey="email"
          columns={columns}
          dataSource={topUsers}
          pagination={false}
        />
      ) : (
        <UsageReportEmptySection height={120} />
      )}
    </BAICard>
  );
};

export default UsageReportTopUsersTable;
