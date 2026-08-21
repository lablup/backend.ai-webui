/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { theme } from '../../theme-shim';
import { UsageReportScope } from './types';
import { BAIBoardItemTitle, BAIButton, BAIFlex, BAIText } from 'backend.ai-ui';
import { FileChartColumn } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface UsageReportDashboardItemProps {
  scope: UsageReportScope;
}

const UsageReportDashboardItem: React.FC<UsageReportDashboardItemProps> = ({
  scope,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const webuiNavigate = useWebUINavigate();

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
      }}
    >
      <BAIBoardItemTitle title={t('usageReport.UsageReport')} />
      <BAIFlex direction="column" align="start" gap="sm">
        <BAIText type="secondary">
          {t('usageReport.DashboardItemDescription')}
        </BAIText>
        <BAIButton
          icon={<FileChartColumn size="1em" />}
          onClick={() =>
            webuiNavigate({
              pathname: '/report/usage',
              search: new URLSearchParams({ scope }).toString(),
            })
          }
        >
          {t('usageReport.OpenReport')}
        </BAIButton>
      </BAIFlex>
    </BAIFlex>
  );
};

export default UsageReportDashboardItem;
