/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIFlex, BAIText } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportEmptySectionProps {
  height?: number;
}

// Keeps a section's slot when it has no data (spec §4: empty sections are
// never omitted so structure stays comparable across periods).
const UsageReportEmptySection: React.FC<UsageReportEmptySectionProps> = ({
  height = 170,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex align="center" justify="center" style={{ height }}>
      <BAIText type="secondary">{t('usageReport.NoDataForThisPeriod')}</BAIText>
    </BAIFlex>
  );
};

export default UsageReportEmptySection;
