/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../types/diagnostics';
import { Alert, Skeleton, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DiagnosticResultListProps {
  results: DiagnosticResult[];
  loading?: boolean;
}

const severityToAlertType = {
  critical: 'error' as const,
  warning: 'warning' as const,
  info: 'info' as const,
  passed: 'success' as const,
};

const DiagnosticResultList: React.FC<DiagnosticResultListProps> = ({
  results,
  loading = false,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  if (loading) {
    return <Skeleton active paragraph={{ rows: 2 }} />;
  }

  // Separate issues from passed checks for visual grouping
  const issues = results.filter((r) => r.severity !== 'passed');
  const passed = results.filter((r) => r.severity === 'passed');

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {issues.map((result) => (
        <Alert
          key={result.id}
          type={severityToAlertType[result.severity]}
          showIcon
          title={t(result.titleKey, result.interpolationValues)}
          description={
            <BAIFlex direction="column" gap={token.paddingXXS}>
              <span>
                {t(result.descriptionKey, result.interpolationValues)}
              </span>
              {result.remediationKey && (
                <span style={{ fontStyle: 'italic' }}>
                  {t(result.remediationKey, result.interpolationValues)}
                </span>
              )}
            </BAIFlex>
          }
        />
      ))}
      {passed.map((result) => (
        <BAIFlex key={result.id} gap="xs" align="center">
          <CheckCircle
            size={token.fontSizeSM}
            style={{ color: token.colorSuccess, flexShrink: 0 }}
          />
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {t(result.titleKey, result.interpolationValues)}
            {' — '}
            {t(result.descriptionKey, result.interpolationValues)}
          </Typography.Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default DiagnosticResultList;
