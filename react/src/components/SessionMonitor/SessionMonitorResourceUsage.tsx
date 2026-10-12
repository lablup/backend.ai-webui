/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useKeypairResourceUsage } from '../../hooks/useKeypairResourceUsage';
import { sessionMonitorFetchKeyAtom } from '../../hooks/useSessionMonitor';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAIProgressWithLabel } from 'backend.ai-ui';
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
        <BAIProgressWithLabel
          key={row.key}
          size="small"
          title={row.name}
          percent={row.limit ? Math.min(100, (row.using / row.limit) * 100) : 0}
          valueLabel={
            row.limit !== null
              ? `${row.using} / ${row.limit} ${row.unit}`.trim()
              : `${row.using} ${row.unit}`.trim()
          }
        />
      ))}
    </BAIFlex>
  );
};

export default SessionMonitorResourceUsage;
