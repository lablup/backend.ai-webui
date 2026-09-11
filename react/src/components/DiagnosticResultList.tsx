/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DiagnosticResult } from '../types/diagnostics';
import { Banner } from '@astryxdesign/core/Banner';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { BAISkeleton, BAIFlex } from 'backend.ai-ui';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DiagnosticResultListProps {
  results: DiagnosticResult[];
  loading?: boolean;
  hidePassed?: boolean;
}

const severityToBannerStatus = {
  critical: 'error' as const,
  warning: 'warning' as const,
  info: 'info' as const,
  passed: 'success' as const,
};

const DiagnosticResultList: React.FC<DiagnosticResultListProps> = ({
  results,
  loading = false,
  hidePassed = false,
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = useTheme();

  if (loading) {
    return <BAISkeleton rows={2} />;
  }

  // Separate issues from passed checks for visual grouping
  const issues = results.filter((r) => r.severity !== 'passed');
  const passed = hidePassed
    ? []
    : results.filter((r) => r.severity === 'passed');

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {issues.map((result) => (
        // antd `Alert` -> Astryx `Banner` (MAPPING §4): `type` -> `status`,
        // `showIcon` dropped (Banner always shows the status icon).
        <Banner
          key={result.id}
          status={severityToBannerStatus[result.severity]}
          title={t(result.titleKey, result.interpolationValues)}
          description={
            <BAIFlex align="start" direction="column" gap="xxs">
              <span>
                {t(result.descriptionKey, result.interpolationValues)}
              </span>
              {result.interpolationValues?.errorMessage && (
                // antd `Typography.Paragraph` (deep-imported from
                // `antd/lib/typography/Paragraph`) -> `Text as="p"
                // display="block"`; the `<pre>` it wrapped is what actually
                // formats the error, so nothing else is needed.
                <Text as="p" display="block">
                  <pre>{result.interpolationValues.errorMessage}</pre>
                </Text>
              )}
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
            size={token('--font-size-sm')}
            style={{ color: token('--color-success'), flexShrink: 0 }}
          />
          <Text color="secondary">
            {t(result.titleKey, result.interpolationValues)}
            {' — '}
            {t(result.descriptionKey, result.interpolationValues)}
          </Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default DiagnosticResultList;
