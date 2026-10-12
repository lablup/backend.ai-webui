/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  rankSessions,
  SESSION_MONITOR_VISIBLE_LIMIT,
} from '../../helper/sessionMonitor';
import { useIsProjectAgnosticPage } from '../../hooks/useIsProjectAgnosticPage';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  sessionMonitorFetchKeyAtom,
  useSessionMonitorData,
} from '../../hooks/useSessionMonitor';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import { useUserSettingsModal } from '../UserSettingsModalOpener';
import WebUILink from '../WebUILink';
import SessionMonitorItem from './SessionMonitorItem';
import SessionMonitorResourceUsage from './SessionMonitorResourceUsage';
import { Link } from '@lablup/ui-common/Link';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import React, { Suspense, useDeferredValue, useTransition } from 'react';
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
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const { open: openUserSettings } = useUserSettingsModal();
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
  const showDeadlineColumn = visible.some((e) => e.deadline !== null);

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
              showDeadlineColumn={showDeadlineColumn}
              onNavigate={onNavigate}
            />
          ) : null;
        })
      )}
      {!isProjectAgnosticPage && (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={null}>
            <SessionMonitorResourceUsage />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      )}
      <BAIFlex
        direction="row"
        align="center"
        justify="between"
        gap="sm"
        style={{
          padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
          borderTop: `1px solid ${token('--color-border')}`,
        }}
      >
        <BAIFlex direction="row" align="center" gap="sm">
          <WebUILink
            data-testid="session-monitor-open-list"
            to={buildProjectPath('session', { scope: 'project' })}
            onClick={onNavigate}
          >
            <Text type="label" color="accent">
              {t('sessionMonitor.OpenSessionList')}
            </Text>
          </WebUILink>
          {hiddenCount > 0 && (
            <Text type="supporting">
              {t('sessionMonitor.MoreSessions', { count: hiddenCount })}
            </Text>
          )}
        </BAIFlex>
        <Link
          data-testid="session-monitor-settings"
          onClick={() => {
            onNavigate?.();
            openUserSettings('general');
          }}
        >
          {t('sessionMonitor.NotificationSettings')}
        </Link>
      </BAIFlex>
    </BAIFlex>
  );
};

export default SessionMonitorPopoverContent;
