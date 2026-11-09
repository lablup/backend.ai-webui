/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  findWebUISettingDefinition,
  webuiSettingGroupLabelKey,
  webuiSettingLabelKey,
} from '../../../helper/webuiSettings';
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

  // `{{setting}}` / `{{group}}` are the row title and group on System Settings.
  const valuesOf = (result: DiagnosticResult) => {
    const definition = result.settingKey
      ? findWebUISettingDefinition(result.settingKey)
      : undefined;
    return definition
      ? {
          ...result.interpolationValues,
          setting: t(webuiSettingLabelKey(definition.key)),
          group: t(webuiSettingGroupLabelKey(definition.group)),
        }
      : result.interpolationValues;
  };

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
        const values = valuesOf(result);
        return (
          <Banner
            key={result.id}
            data-testid={`diagnostic-${result.id}`}
            status={severityToBannerStatus[result.severity]}
            role={bannerLiveRole(severityToBannerStatus[result.severity])}
            title={t(result.titleKey, values)}
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
                <span>{t(result.descriptionKey, values)}</span>
                {result.interpolationValues?.errorMessage && (
                  // The `<pre>` keeps the parse error's line breaks.
                  <Text as="p" display="block">
                    <pre>{result.interpolationValues.errorMessage}</pre>
                  </Text>
                )}
                {result.remediationKey && (
                  <span style={{ fontStyle: 'italic' }}>
                    {t(result.remediationKey, values)}
                  </span>
                )}
              </BAIFlex>
            }
          />
        );
      })}
      {passed.map((result) => (
        <BAIFlex key={result.id} gap="xs" align="center">
          <CheckCircle
            size={token('--font-size-sm')}
            style={{ color: token('--color-success'), flexShrink: 0 }}
          />
          <Text color="secondary">
            {t(result.titleKey, valuesOf(result))}
            {' — '}
            {t(result.descriptionKey, valuesOf(result))}
          </Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default DiagnosticResultList;
