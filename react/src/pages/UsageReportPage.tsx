/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../components/UsageReport/UsageReport.css';
import UsageReportDocument from '../components/UsageReport/UsageReportDocument';
import UserUsageReportView from '../components/UsageReport/UserUsageReportView';
import { getMockUsageReportData } from '../components/UsageReport/mockUsageReportData';
import {
  formatPeriodLabel,
  isLastCompletePeriod,
  resolvePeriod,
  shiftPeriodStart,
} from '../components/UsageReport/period';
import {
  UsageReportPeriodType,
  UsageReportScope,
} from '../components/UsageReport/types';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
import { IconButton } from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { BAIButton, BAIFlex, BAISkeleton, BAIText } from 'backend.ai-ui';
import {
  ChevronLeft,
  ChevronRight,
  FileDown,
  FileSpreadsheet,
  ImageIcon,
} from 'lucide-react';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

const UsageReportPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const [searchParams, setSearchParams] = useSearchParams();

  // TODO: default scope by role + RouteAccessGuard (spec §3); param-only in W1.
  const scope: UsageReportScope =
    searchParams.get('scope') === 'admin' ? 'admin' : 'user';
  const periodType: UsageReportPeriodType =
    searchParams.get('period') === 'monthly' ? 'monthly' : 'weekly';
  const period = resolvePeriod(periodType, searchParams.get('periodStart'));
  const periodLabel = formatPeriodLabel(period);

  const scopeLabel =
    scope === 'admin'
      ? t('usageReport.WholeCluster')
      : userInfo.email || t('usageReport.MyUsage');

  const updateParams = (updates: Record<string, string | null>) => {
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
        {/* Enabled in W4 (PDF) / W5 (PNG, CSV). */}
        <BAIFlex align="center" gap="xs">
          <BAIButton disabled icon={<FileDown size="1em" />}>
            {t('usageReport.ExportPDF')}
          </BAIButton>
          <BAIButton disabled icon={<ImageIcon size="1em" />}>
            {t('usageReport.ExportPNG')}
          </BAIButton>
          <BAIButton disabled icon={<FileSpreadsheet size="1em" />}>
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
          />
        </Suspense>
      ) : (
        // Admin scope keeps the W1 mock until W3 wires real data.
        <UsageReportDocument
          data={getMockUsageReportData(scope, period)}
          periodLabel={periodLabel}
          scopeLabel={scopeLabel}
        />
      )}
    </BAIFlex>
  );
};

export default UsageReportPage;
