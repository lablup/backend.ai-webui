/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import AdminUsageReportView from '../components/UsageReport/AdminUsageReportView';
import '../components/UsageReport/UsageReport.css';
import UserUsageReportView from '../components/UsageReport/UserUsageReportView';
import {
  formatPeriodLabel,
  isLastCompletePeriod,
  resolvePeriod,
  shiftPeriodStart,
} from '../components/UsageReport/period';
import {
  UsageReportData,
  UsageReportPeriodType,
  UsageReportScope,
} from '../components/UsageReport/types';
import { buildUsageReportCsv } from '../components/UsageReport/usageReportCsv';
import { downloadBlob, downloadCSV } from '../helper/csv-util';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  BAIButton,
  BAIFlex,
  BAISkeleton,
  BAIText,
  useBAILogger,
} from 'backend.ai-ui';
import { toBlob } from 'html-to-image';
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  ImageIcon,
} from 'lucide-react';
import React, { Suspense, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const UsageReportPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const userRole = useCurrentUserRole();
  const [searchParams, setSearchParams] = useSearchParams();

  // Admin scope needs superadmin + the 26.4.2 preset-result API (spec §5).
  const canUseAdminScope =
    userRole === 'superadmin' && baiClient.supports('prometheus-query-preset');
  const scope: UsageReportScope =
    canUseAdminScope && searchParams.get('scope') === 'admin'
      ? 'admin'
      : 'user';
  const periodType: UsageReportPeriodType =
    searchParams.get('period') === 'monthly' ? 'monthly' : 'weekly';
  const period = resolvePeriod(periodType, searchParams.get('periodStart'));
  const periodLabel = formatPeriodLabel(period);

  const scopeLabel =
    scope === 'admin'
      ? t('usageReport.WholeCluster')
      : userInfo.email || t('usageReport.MyUsage');

  const reportDataRef = useRef<UsageReportData | null>(null);
  const handleReportData = (data: UsageReportData) => {
    reportDataRef.current = data;
  };
  const exportFileName = `usage-report_${scope}_${periodType}_${period.startDate}`;

  const exportPNG = async () => {
    const reportElement = document.querySelector<HTMLElement>('.usage-report');
    if (!reportElement) {
      message.warning(t('usageReport.ReportNotReadyYet'));
      return;
    }
    try {
      // Pin the clone to its own content box: without explicit size + zeroed
      // margins, html-to-image keeps the on-screen clip and the centering
      // margin, clipping the render and shifting it sideways.
      const { scrollWidth, scrollHeight } = reportElement;
      const blob = await toBlob(reportElement, {
        pixelRatio: 2,
        width: scrollWidth,
        height: scrollHeight,
        style: {
          overflow: 'visible',
          maxWidth: 'none',
          margin: '0',
          width: `${scrollWidth}px`,
          height: `${scrollHeight}px`,
        },
        backgroundColor: getComputedStyle(document.body).backgroundColor,
      });
      if (!blob) {
        throw new Error('html-to-image returned no blob');
      }
      downloadBlob(blob, `${exportFileName}.png`);
    } catch (error) {
      logger.error('usage-report PNG export failed:', error);
      message.error(t('usageReport.ExportPNGFailed'));
    }
  };

  const exportCSV = () => {
    const data = reportDataRef.current;
    if (!data) {
      message.warning(t('usageReport.ReportNotReadyYet'));
      return;
    }
    downloadCSV(buildUsageReportCsv(data), `${exportFileName}.csv`);
  };

  const exportPDF = async () => {
    const bridge = globalThis.electronPrintAPI;
    if (globalThis.isElectron && bridge?.printToPDF) {
      const result = await bridge.printToPDF(`${exportFileName}.pdf`);
      if (result?.error) {
        logger.error('usage-report print-to-pdf failed:', result.error);
        message.error(t('usageReport.ExportPDFFailed'));
      } else if (!result?.canceled && result?.filePath) {
        message.success(
          t('usageReport.ExportPDFSaved', { path: result.filePath }),
        );
      }
    } else {
      window.print();
    }
  };

  const updateParams = (updates: Record<string, string | null>) => {
    // Drop the previous document's data so CSV never exports a stale period.
    reportDataRef.current = null;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value === null) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        });
        return next;
      },
      { replace: true },
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <BAIFlex
        className="usage-report-control-bar"
        justify="between"
        align="center"
        wrap="wrap"
        gap="sm"
      >
        <BAIFlex align="center" wrap="wrap" gap="sm">
          {canUseAdminScope && (
            <SegmentedControl
              label={t('usageReport.Scope')}
              value={scope}
              onChange={(value) => updateParams({ scope: value })}
            >
              <SegmentedControlItem
                value="user"
                label={t('usageReport.MyUsage')}
              />
              <SegmentedControlItem
                value="admin"
                label={t('usageReport.WholeCluster')}
              />
            </SegmentedControl>
          )}
          <SegmentedControl
            label={t('usageReport.PeriodType')}
            value={periodType}
            onChange={(value) =>
              updateParams({ period: value, periodStart: null })
            }
          >
            <SegmentedControlItem
              value="weekly"
              label={t('usageReport.Weekly')}
            />
            <SegmentedControlItem
              value="monthly"
              label={t('usageReport.Monthly')}
            />
          </SegmentedControl>
          <BAIFlex align="center" gap="xxs">
            <IconButton
              label={t('usageReport.PreviousPeriod')}
              icon={<ChevronLeft size="1em" />}
              variant="ghost"
              onClick={() =>
                updateParams({ periodStart: shiftPeriodStart(period, -1) })
              }
            />
            <BAIText strong>{periodLabel}</BAIText>
            <IconButton
              label={t('usageReport.NextPeriod')}
              icon={<ChevronRight size="1em" />}
              variant="ghost"
              isDisabled={isLastCompletePeriod(period)}
              onClick={() =>
                updateParams({ periodStart: shiftPeriodStart(period, 1) })
              }
            />
          </BAIFlex>
        </BAIFlex>
        <BAIFlex align="center" gap="xs">
          <BAIButton icon={<FileDown size="1em" />} action={exportPDF}>
            {t('usageReport.ExportPDF')}
          </BAIButton>
          <BAIButton icon={<ImageIcon size="1em" />} action={exportPNG}>
            {t('usageReport.ExportPNG')}
          </BAIButton>
          <BAIButton icon={<FileSpreadsheet size="1em" />} onClick={exportCSV}>
            {t('usageReport.ExportCSV')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      {scope === 'user' ? (
        <Suspense fallback={<BAISkeleton />}>
          <UserUsageReportView
            period={period}
            periodLabel={periodLabel}
            scopeLabel={scopeLabel}
            onData={handleReportData}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<BAISkeleton />}>
          <AdminUsageReportView
            period={period}
            periodLabel={periodLabel}
            scopeLabel={scopeLabel}
            onData={handleReportData}
          />
        </Suspense>
      )}
    </BAIFlex>
  );
};

export default UsageReportPage;
