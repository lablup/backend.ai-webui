/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  isStartingStatus,
  rankSessions,
  SESSION_MONITOR_VISIBLE_LIMIT,
} from '../../helper/sessionMonitor';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  sessionMonitorFetchKeyAtom,
  sessionMonitorScopeAtom,
  useSessionMonitorData,
  type SessionMonitorMode,
  type SessionMonitorScope,
} from '../../hooks/useSessionMonitor';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import SessionMonitorItem from './SessionMonitorItem';
import SessionMonitorResourceUsage from './SessionMonitorResourceUsage';
import SessionMonitorScopeTotals from './SessionMonitorScopeTotals';
import SessionMonitorSettingsPane from './SessionMonitorSettingsPane';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFetchKeyButton, BAIFlex, BAILink } from 'backend.ai-ui';
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
}

const SessionMonitorPopoverContent: React.FC<
  SessionMonitorPopoverContentProps
> = ({ onNavigate }) => {
  'use memo';
  const scope = useAtomValue(sessionMonitorScopeAtom);
  return scope ? (
    <ScopedSessionMonitorPopoverContent scope={scope} onNavigate={onNavigate} />
  ) : null;
};

export const sessionMonitorTitleKey = (mode: SessionMonitorMode) =>
  mode === 'domain'
    ? 'sessionMonitor.DomainSessions'
    : mode === 'project'
      ? 'sessionMonitor.ProjectSessions'
      : 'sessionMonitor.MySessions';

const ScopedSessionMonitorPopoverContent: React.FC<
  SessionMonitorPopoverContentProps & { scope: SessionMonitorScope }
> = ({ scope, onNavigate }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const buildProjectPath = useProjectPath();
  const [fetchKey, setFetchKey] = useAtom(sessionMonitorFetchKeyAtom);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<'list' | 'settings'>('list');
  const [sort] = useBAISettingUserState('session_monitor_sort');
  const [includeStarting] = useBAISettingUserState(
    'session_monitor_include_starting',
  );
  const [rows] = useBAISettingUserState('session_monitor_rows');
  const { entries, nodesById, total, counts, fetchedAt } =
    useSessionMonitorData(deferredFetchKey, scope, { withRows: true });

  const listed =
    (includeStarting ?? true)
      ? entries
      : entries.filter((e) => !isStartingStatus(e.status));
  const ranked = rankSessions(listed, sort ?? 'deadline');
  const visible = ranked.slice(0, rows ?? SESSION_MONITOR_VISIBLE_LIMIT);
  // `total` counts the scope; starting sessions filtered out locally are
  // subtracted so the footer agrees with what the list can show.
  const listedTotal = Math.max(0, total - (entries.length - listed.length));
  const hiddenCount = Math.max(0, listedTotal - visible.length);
  const { running, starting } = counts;
  // The list that matches the scope: admin, project-admin or the user's own.
  const listPath = buildProjectPath('session', {
    scope:
      scope.mode === 'domain'
        ? 'admin'
        : scope.mode === 'project'
          ? 'projectAdmin'
          : 'project',
  });

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
          {view === 'settings'
            ? t('sessionMonitor.MonitorSettings')
            : t(sessionMonitorTitleKey(scope.mode))}
        </Text>
        {view === 'list' && (
          <Text type="supporting">
            {t('sessionMonitor.RunningCount', { count: running })}
            {starting > 0 &&
              ` · ${t('sessionMonitor.StartingCount', { count: starting })}`}
          </Text>
        )}
        <span style={{ flex: 1 }} />
        {view === 'list' && (
          <BAIFetchKeyButton
            size="small"
            type="text"
            value={fetchKey}
            loading={isPending || fetchKey !== deferredFetchKey}
            showLastLoadTime
            lastLoadTime={new Date(fetchedAt)}
            onChange={(nextKey) => startTransition(() => setFetchKey(nextKey))}
          />
        )}
        <IconButton
          data-testid="session-monitor-settings-button"
          variant="ghost"
          size="sm"
          label={
            view === 'settings'
              ? t(sessionMonitorTitleKey(scope.mode))
              : t('sessionMonitor.MonitorSettings')
          }
          icon={
            view === 'settings' ? (
              <ArrowLeft size="1em" />
            ) : (
              <Settings size="1em" />
            )
          }
          onClick={() => setView(view === 'settings' ? 'list' : 'settings')}
        />
      </BAIFlex>
      {view === 'settings' ? (
        <SessionMonitorSettingsPane onNavigate={onNavigate} />
      ) : (
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
                  listPath={listPath}
                  onNavigate={onNavigate}
                />
              ) : null;
            })
          )}
          {scope.mode !== 'my' && (
            <ErrorBoundaryWithNullFallback>
              <Suspense fallback={null}>
                <SessionMonitorScopeTotals scope={scope} />
              </Suspense>
            </ErrorBoundaryWithNullFallback>
          )}
          {scope.mode === 'my' && (
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
            <BAILink
              data-testid="session-monitor-open-list"
              to={listPath}
              onClick={onNavigate}
              style={{ fontWeight: 600 }}
            >
              {t('sessionMonitor.OpenSessionList')} →
            </BAILink>
            {hiddenCount > 0 && (
              <Text type="supporting">
                {t('sessionMonitor.MoreSessions', {
                  count: hiddenCount,
                  total: listedTotal,
                })}
              </Text>
            )}
          </BAIFlex>
        </>
      )}
    </BAIFlex>
  );
};

export default SessionMonitorPopoverContent;
