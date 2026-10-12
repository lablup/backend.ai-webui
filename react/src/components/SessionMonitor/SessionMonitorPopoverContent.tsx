/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  rankSessions,
  SESSION_MONITOR_VISIBLE_LIMIT,
} from '../../helper/sessionMonitor';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  sessionMonitorFetchKeyAtom,
  useSessionMonitorData,
} from '../../hooks/useSessionMonitor';
import WebUILink from '../WebUILink';
import SessionMonitorItem from './SessionMonitorItem';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import React, { useDeferredValue, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface SessionMonitorPopoverContentProps {
  onNavigate?: () => void;
}

const SessionMonitorPopoverContent: React.FC<
  SessionMonitorPopoverContentProps
> = ({ onNavigate }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const buildProjectPath = useProjectPath();
  const [fetchKey, setFetchKey] = useAtom(sessionMonitorFetchKeyAtom);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [isPending, startTransition] = useTransition();
  const { entries, nodesById, total, fetchedAt } =
    useSessionMonitorData(deferredFetchKey);

  const ranked = rankSessions(entries);
  const visible = ranked.slice(0, SESSION_MONITOR_VISIBLE_LIMIT);
  const hiddenCount = Math.max(0, total - visible.length);
  const running = entries.filter((e) => e.status === 'RUNNING').length;
  const starting = entries.length - running;

  return (
    <BAIFlex
      data-testid="session-monitor-popover"
      direction="column"
      align="stretch"
      style={{ width: 460 }}
    >
      <BAIFlex
        direction="row"
        align="center"
        gap="xs"
        style={{
          padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
        }}
      >
        <Text type="label" weight="semibold">
          {t('sessionMonitor.MySessions')}
        </Text>
        <Text type="supporting">
          {t('sessionMonitor.RunningCount', { count: running })}
          {starting > 0 &&
            ` · ${t('sessionMonitor.StartingCount', { count: starting })}`}
        </Text>
        <span style={{ flex: 1 }} />
        <BAIFetchKeyButton
          size="small"
          type="text"
          value={fetchKey}
          loading={isPending || fetchKey !== deferredFetchKey}
          showLastLoadTime
          lastLoadTime={new Date(fetchedAt)}
          onChange={(nextKey) => startTransition(() => setFetchKey(nextKey))}
        />
      </BAIFlex>
      {visible.length === 0 ? (
        <BAIFlex
          justify="center"
          style={{
            padding: `${token('--spacing-4')} ${token('--spacing-3')}`,
            borderTop: `1px solid ${token('--color-border')}`,
          }}
        >
          <Text type="supporting">{t('sessionMonitor.NoActiveSessions')}</Text>
        </BAIFlex>
      ) : (
        visible.map((entry) => {
          const node = nodesById.get(entry.id);
          return node ? (
            <SessionMonitorItem
              key={entry.id}
              sessionFrgmt={node}
              entry={entry}
              onNavigate={onNavigate}
            />
          ) : null;
        })
      )}
      <BAIFlex
        direction="row"
        align="center"
        justify="between"
        style={{
          padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
          borderTop: `1px solid ${token('--color-border')}`,
        }}
      >
        <Text type="supporting">
          {hiddenCount > 0
            ? t('sessionMonitor.MoreSessions', { count: hiddenCount })
            : ''}
        </Text>
        <WebUILink
          data-testid="session-monitor-open-list"
          to={buildProjectPath('session', { scope: 'project' })}
          onClick={onNavigate}
        >
          {t('sessionMonitor.OpenSessionList')}
        </WebUILink>
      </BAIFlex>
    </BAIFlex>
  );
};

export default SessionMonitorPopoverContent;
