/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useKeypairResourceUsage } from '../../hooks/useKeypairResourceUsage';
import { sessionMonitorFetchKeyAtom } from '../../hooks/useSessionMonitor';
import { ProgressBar } from '@lablup/ui-common/ProgressBar';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex } from 'backend.ai-ui';
import { useAtomValue } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** The popover's "my usage against my limit" bars, one per resource slot. */
const SessionMonitorResourceUsage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const fetchKey = useAtomValue(sessionMonitorFetchKeyAtom);
  const rows = useKeypairResourceUsage(fetchKey);
  if (rows.length === 0) return null;

  return (
    <BAIFlex
      data-testid="session-monitor-resource-usage"
      direction="column"
      align="stretch"
      gap="xxs"
      style={{
        padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
        borderTop: `1px solid ${token('--color-border')}`,
      }}
    >
      <Text type="supporting">{t('sessionMonitor.MyResourceUsage')}</Text>
      {rows.map((row) => (
        <BAIFlex key={row.key} direction="row" align="center" gap="sm">
          <Text
            type="label"
            textWrap="nowrap"
            maxLines={1}
            hasTruncateTooltip={false}
          >
            <span style={{ display: 'inline-block', width: 64 }}>
              {row.name}
            </span>
          </Text>
          <div style={{ flex: 1 }}>
            <ProgressBar
              label={row.name}
              isLabelHidden
              value={row.limit ? Math.min(row.limit, row.using) : 0}
              max={row.limit ?? 1}
              variant="accent"
            />
          </div>
          <Text type="supporting" textWrap="nowrap">
            <span
              style={{
                display: 'inline-block',
                minWidth: 96,
                textAlign: 'end',
              }}
            >
              {row.limit !== null
                ? `${row.using} / ${row.limit} ${row.unit}`.trim()
                : `${row.using} ${row.unit}`.trim()}
            </span>
          </Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default SessionMonitorResourceUsage;
