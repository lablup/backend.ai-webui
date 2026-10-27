/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  rankSessions,
  SESSION_MONITOR_VISIBLE_LIMIT,
} from '../../helper/sessionMonitor';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useIsProjectAgnosticPage } from '../../hooks/useIsProjectAgnosticPage';
import {
  sessionMonitorFetchKeyAtom,
  sessionMonitorScopeAtom,
  useSessionMonitorData,
  type SessionMonitorScope,
} from '../../hooks/useSessionMonitor';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import SessionMonitorItem from './SessionMonitorItem';
import SessionMonitorResourceUsage from './SessionMonitorResourceUsage';
import SessionMonitorSettingsPane from './SessionMonitorSettingsPane';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFetchKeyButton, BAIFlex } from 'backend.ai-ui';
import { useAtom, useAtomValue } from 'jotai';
import { ArrowLeft, Settings } from 'lucide-react';
import React, {
  Suspense,
  useDeferredValue,
  useState,
  useTransition,
} from 'react';
import { useTranslation } from 'react-i18next';

interface SessionMonitorPopoverContentProps {
  onNavigate?: () => void;
  onOpenSessionDetail?: (sessionId: string) => void;
}

const SessionMonitorPopoverContent: React.FC<
  SessionMonitorPopoverContentProps
> = ({ onNavigate, onOpenSessionDetail }) => {
  'use memo';
  // Deferred so editing the condition keeps the open view instead of
  // suspending the popover back to a skeleton.
  const scope = useDeferredValue(useAtomValue(sessionMonitorScopeAtom));
  // The settings view runs no list query, so a condition change there only
  // waits for the chip's count, not for the rows' live stats.
  const [view, setView] = useState<'list' | 'settings'>('list');
  if (!scope) return null;
  return view === 'settings' ? (
    <SessionMonitorSettingsView
      onNavigate={onNavigate}
      onBack={() => setView('list')}
    />
  ) : (
    <ScopedSessionMonitorPopoverContent
      scope={scope}
      onNavigate={onNavigate}
      onOpenSessionDetail={onOpenSessionDetail}
      onOpenSettings={() => setView('settings')}
    />
  );
};

const SessionMonitorSettingsView: React.FC<{
  onNavigate?: () => void;
  onBack: () => void;
}> = ({ onNavigate, onBack }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  return (
    <BAIFlex
      data-testid="session-monitor-popover"
      direction="column"
      align="stretch"
      style={{ width: 560 }}
    >
      <BAIFlex
        direction="row"
        align="center"
        justify="between"
        gap="xs"
        style={{
          padding: `${token('--spacing-1-5')} ${token('--spacing-3')}`,
        }}
      >
        <Text type="label" weight="semibold">
          {t('sessionMonitor.MonitorSettings')}
        </Text>
        <IconButton
          data-testid="session-monitor-settings-button"
          variant="ghost"
          size="sm"
          label={t('sessionMonitor.Title')}
          icon={<ArrowLeft size="1em" />}
          onClick={onBack}
        />
      </BAIFlex>
      <SessionMonitorSettingsPane onNavigate={onNavigate} />
    </BAIFlex>
  );
};

const ScopedSessionMonitorPopoverContent: React.FC<
  SessionMonitorPopoverContentProps & {
    scope: SessionMonitorScope;
    onOpenSettings: () => void;
  }
> = ({ scope, onOpenSessionDetail, onOpenSettings }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [fetchKey, setFetchKey] = useAtom(sessionMonitorFetchKeyAtom);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [isPending, startTransition] = useTransition();
  const [sort] = useBAISettingUserState('session_monitor_sort');
  const [rows] = useBAISettingUserState('session_monitor_rows');
  const isProjectAgnosticPage = useIsProjectAgnosticPage();
  const { entries, nodesById, total, counts, fetchedAt } =
    useSessionMonitorData(deferredFetchKey, scope, {
      withRows: true,
      withBreakdown: true,
    });

  const ranked = rankSessions(entries, sort ?? 'deadline');
  const visible = ranked.slice(0, rows ?? SESSION_MONITOR_VISIBLE_LIMIT);
  const hiddenCount = Math.max(0, total - visible.length);
  const { running, starting } = counts;

  return (
    <BAIFlex
      data-testid="session-monitor-popover"
      direction="column"
      align="stretch"
      style={{ width: 560 }}
    >
      <BAIFlex
        direction="row"
        align="center"
        gap="xs"
        style={{
          padding: `${token('--spacing-1-5')} ${token('--spacing-3')}`,
        }}
      >
        <Text type="label" weight="semibold">
          {t('sessionMonitor.Title')}
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
        <IconButton
          data-testid="session-monitor-settings-button"
          variant="ghost"
          size="sm"
          label={t('sessionMonitor.MonitorSettings')}
          icon={<Settings size="1em" />}
          onClick={onOpenSettings}
        />
      </BAIFlex>
      <>
        {visible.length === 0 ? (
          <BAIFlex
            justify="center"
            style={{
              padding: `${token('--spacing-4')} ${token('--spacing-3')}`,
              borderTop: `1px solid ${token('--color-border')}`,
            }}
          >
            <Text type="supporting">
              {t('sessionMonitor.NoActiveSessions')}
            </Text>
          </BAIFlex>
        ) : (
          visible.map((entry) => {
            const row = nodesById.get(entry.id)?.row;
            return row ? (
              <SessionMonitorItem
                key={entry.id}
                sessionFrgmt={row}
                entry={entry}
                onOpenDetail={onOpenSessionDetail}
              />
            ) : null;
          })
        )}
        {/* The keypair limit is the viewer's; it reads the current project. */}
        {scope.onlyMine && !isProjectAgnosticPage && (
          <ErrorBoundaryWithNullFallback>
            <Suspense fallback={null}>
              <SessionMonitorResourceUsage />
            </Suspense>
          </ErrorBoundaryWithNullFallback>
        )}
        {hiddenCount > 0 && (
          <BAIFlex
            direction="row"
            align="center"
            justify="end"
            style={{
              padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
              borderTop: `1px solid ${token('--color-border')}`,
            }}
          >
            <Text type="supporting">
              {t('sessionMonitor.MoreSessions', {
                count: hiddenCount,
                total,
              })}
            </Text>
          </BAIFlex>
        )}
      </>
    </BAIFlex>
  );
};

export default SessionMonitorPopoverContent;
