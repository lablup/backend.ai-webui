/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useKeypairResourceUsage } from '../../hooks/useKeypairResourceUsage';
import { sessionMonitorFetchKeyAtom } from '../../hooks/useSessionMonitor';
import SessionMonitorThinBar from './SessionMonitorThinBar';
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
      gap={2}
      style={{
        padding: `${token('--spacing-1-5')} ${token('--spacing-3')}`,
        borderTop: `1px solid ${token('--color-border')}`,
      }}
    >
      <Text type="supporting">{t('sessionMonitor.MyResourceUsage')}</Text>
      {rows.map((row) => (
        <BAIFlex key={row.key} direction="row" align="center" gap="sm">
          <Text type="supporting" weight="medium" textWrap="nowrap">
            <span style={{ display: 'inline-block', width: 56 }}>
              {row.name}
            </span>
          </Text>
          <div style={{ flex: 1 }}>
            <SessionMonitorThinBar
              label={row.name}
              percent={row.limit ? (row.using / row.limit) * 100 : 0}
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
