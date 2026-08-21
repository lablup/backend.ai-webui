/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UsageReportData } from './types';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportFootnoteProps {
  data: UsageReportData;
}

const UsageReportFootnote: React.FC<UsageReportFootnoteProps> = ({ data }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex
      className="usage-report-footnote"
      direction="column"
      align="start"
      gap="xxs"
    >
      <BAIText type="secondary" size="sm">
        {t('usageReport.Methodology')}{' '}
        {data.sessionsSemantics === 'launched'
          ? t('usageReport.MethodologySessionsLaunched')
          : t('usageReport.MethodologySessionsPeak')}
      </BAIText>
      <BAIText type="secondary" size="sm">
        {t('usageReport.GeneratedOn', {
          timestamp: dayjs(data.generatedAt).format('lll'),
          cluster: data.clusterName ?? '—',
        })}
      </BAIText>
    </BAIFlex>
  );
};

export default UsageReportFootnote;
