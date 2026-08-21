/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCustomThemeConfig } from '../../hooks/useCustomThemeConfig';
import { UsageReportData } from './types';
import { Heading } from '@astryxdesign/core/Heading';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

const KpiTile: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  'use memo';
  return (
    <div className="usage-report-kpi">
      <div className="usage-report-kpi-label">{label}</div>
      <div className="usage-report-kpi-value">{value}</div>
    </div>
  );
};

const formatCount = (value: number | null) =>
  value == null ? '—' : value.toLocaleString();
const formatPercent = (value: number | null) =>
  value == null ? '—' : `${value}%`;

interface UsageReportHeaderProps {
  data: UsageReportData;
  periodLabel: string;
  scopeLabel: string;
}

const UsageReportHeader: React.FC<UsageReportHeaderProps> = ({
  data,
  periodLabel,
  scopeLabel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { themeConfig } = useCustomThemeConfig();
  const { mode } = useTheme();
  const lightLogoSrc =
    themeConfig?.logo?.src || '/manifest/backend.ai-webui-white.svg';
  const logoSrc =
    mode === 'dark' ? themeConfig?.logo?.srcDark || lightLogoSrc : lightLogoSrc;
  const logoStyle = {
    width: themeConfig?.logo?.size?.width || 159,
    height: themeConfig?.logo?.size?.height || 24,
  };
  const logoAlt = themeConfig?.logo?.alt || 'Backend.AI Logo';

  return (
    <BAIFlex
      className="usage-report-header"
      justify="between"
      align="start"
      wrap="wrap"
      gap="md"
    >
      <BAIFlex direction="column" align="start" gap="xxs">
        <img
          className="usage-report-logo-screen"
          alt={logoAlt}
          src={logoSrc}
          style={logoStyle}
        />
        {/* Print is forced light, so it always uses the light logo. */}
        <img
          className="usage-report-logo-print"
          alt={logoAlt}
          src={lightLogoSrc}
          style={logoStyle}
        />
        <Heading level={3}>
          {data.period.periodType === 'weekly'
            ? t('usageReport.WeeklyReportTitle')
            : t('usageReport.MonthlyReportTitle')}
        </Heading>
        <BAIText type="secondary">
          {periodLabel} · {scopeLabel}
        </BAIText>
      </BAIFlex>
      <div className="usage-report-kpis">
        <KpiTile
          label={t('usageReport.GPUHours')}
          value={formatCount(data.totals.gpuHours)}
        />
        <KpiTile
          label={t('usageReport.CPUHours')}
          value={formatCount(data.totals.cpuHours)}
        />
        <KpiTile
          label={t('usageReport.Sessions')}
          value={formatCount(data.totals.sessions)}
        />
        <KpiTile
          label={t('usageReport.AvgGPUUtilization')}
          value={formatPercent(data.utilizationAvgs.gpuPercent)}
        />
        <KpiTile
          label={t('usageReport.AvgCPUUtilization')}
          value={formatPercent(data.utilizationAvgs.cpuPercent)}
        />
      </div>
    </BAIFlex>
  );
};

export default UsageReportHeader;
