/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { BAIFlex, BAIText } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportEmptySectionProps {
  height?: number;
  /** Extra line explaining why the section is empty (e.g. version gate). */
  description?: string;
}

// Keeps a section's slot when it has no data (spec §4: empty sections are
// never omitted so structure stays comparable across periods).
const UsageReportEmptySection: React.FC<UsageReportEmptySectionProps> = ({
  height = 170,
  description,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      gap="xxs"
      style={{ height }}
    >
      <BAIText type="secondary">{t('usageReport.NoDataForThisPeriod')}</BAIText>
      {description ? (
        <BAIText type="secondary" size="sm">
          {description}
        </BAIText>
      ) : null}
    </BAIFlex>
  );
};

export default UsageReportEmptySection;
