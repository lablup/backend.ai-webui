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
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportDocumentProps {
  data: UsageReportData;
  periodLabel: string;
  scopeLabel: string;
  /** Reports the assembled data upward (page-level CSV export). */
  onData?: (data: UsageReportData) => void;
}

const UsageReportDocument: React.FC<UsageReportDocumentProps> = ({
  data,
  periodLabel,
  scopeLabel,
  onData,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { coverage } = data;

  const emitData = useEffectEvent(() => onData?.(data));
  useEffect(() => {
    emitData();
  }, [data]);

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
        sessionsSemantics={data.sessionsSemantics}
        utilizationEmptyDescription={
          coverage.utilizationUnsupported
            ? data.scope === 'admin'
              ? t('usageReport.ClusterUtilizationNeedsBackend')
              : t('usageReport.UtilizationRequiresManagerVersion')
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
