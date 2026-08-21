/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import UsageReportChartsGrid from './UsageReportChartsGrid';
import UsageReportFootnote from './UsageReportFootnote';
import UsageReportHeader from './UsageReportHeader';
import UsageReportTopUsersTable from './UsageReportTopUsersTable';
import { UsageReportData } from './types';
import { BAIAlert } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportDocumentProps {
  data: UsageReportData;
  periodLabel: string;
  scopeLabel: string;
}

const UsageReportDocument: React.FC<UsageReportDocumentProps> = ({
  data,
  periodLabel,
  scopeLabel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { coverage } = data;

  return (
    <div className="usage-report">
      <UsageReportHeader
        data={data}
        periodLabel={periodLabel}
        scopeLabel={scopeLabel}
      />
      {coverage.utilizationTruncated && (
        <BAIAlert
          className="usage-report-truncation"
          type="warning"
          showIcon
          title={t('usageReport.UtilizationDataPartial')}
          description={t('usageReport.UtilizationDataPartialDescription', {
            days: coverage.retentionDays ?? '—',
          })}
        />
      )}
      {coverage.allocationTruncated && (
        <BAIAlert
          className="usage-report-truncation"
          type="warning"
          showIcon
          title={t('usageReport.AllocationDataPartial')}
          description={t('usageReport.AllocationDataPartialDescription')}
        />
      )}
      <UsageReportChartsGrid
        dailySeries={data.dailySeries}
        utilizationEmptyDescription={
          coverage.utilizationUnsupported
            ? t('usageReport.UtilizationRequiresManagerVersion')
            : undefined
        }
      />
      {data.scope === 'admin' && (
        <UsageReportTopUsersTable topUsers={data.topUsers ?? []} />
      )}
      <UsageReportFootnote data={data} />
    </div>
  );
};

export default UsageReportDocument;
