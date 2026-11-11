/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { diagnosticText } from '../../../diagnostics/diagnosticText';
import { useWebUINavigate } from '../../../hooks';
import type { DiagnosticResult } from '../../../types/diagnostics';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAISkeleton, bannerLiveRole } from 'backend.ai-ui';
import { CheckCircle, ChevronRight } from 'lucide-react';
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
  const navigate = useWebUINavigate();

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
      {issues.map((result) => {
        const text = diagnosticText(result, t);
        return (
          <Banner
            key={result.id}
            data-testid={`diagnostic-${result.id}`}
            status={severityToBannerStatus[result.severity]}
            role={bannerLiveRole(severityToBannerStatus[result.severity])}
            title={text.title}
            endContent={
              result.settingKey || result.linksSystemSettings ? (
                <Button
                  variant="secondary"
                  size="sm"
                  label={t('webui.menu.SystemSettings')}
                  endContent={<ChevronRight size="1em" />}
                  onClick={() => navigate('/admin/system-settings')}
                />
              ) : undefined
            }
            description={
              <BAIFlex align="start" direction="column" gap="xxs">
                <span>{text.description}</span>
                {result.interpolationValues?.errorMessage && (
                  // The `<pre>` keeps the parse error's line breaks.
                  <Text as="p" display="block">
                    <pre>{result.interpolationValues.errorMessage}</pre>
                  </Text>
                )}
                {text.remediation && (
                  <span style={{ fontStyle: 'italic' }}>
                    {text.remediation}
                  </span>
                )}
              </BAIFlex>
            }
          />
        );
      })}
      {passed.map((result) => {
        const text = diagnosticText(result, t);
        return (
          <BAIFlex key={result.id} gap="xs" align="center">
            <CheckCircle
              size={token('--font-size-sm')}
              style={{ color: token('--color-success'), flexShrink: 0 }}
            />
            <Text color="secondary">
              {text.title}
              {' - '}
              {text.description}
            </Text>
          </BAIFlex>
        );
      })}
    </BAIFlex>
  );
};

export default DiagnosticResultList;
