/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyAttentionTitleBadge,
  pickDueAlerts,
  readAlertedRecords,
  SESSION_MONITOR_NOT_FINISHED_FILTER,
  SESSION_MONITOR_POLL_INTERVAL_MS,
  summarizeSessions,
  writeAlertedRecords,
  type SessionMonitorEntry,
} from '../../helper/sessionMonitor';
import { useCurrentDomainValue } from '../../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../../hooks/backendai';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useProjectPath, useRouteScope } from '../../hooks/useRouteScope';
import {
  sessionMonitorFetchKeyAtom,
  sessionMonitorScopeAtom,
  sessionMonitorSummaryAtom,
  useSessionMonitorData,
  type SessionMonitorScope,
} from '../../hooks/useSessionMonitor';
import { toLocalId, useInterval } from 'backend.ai-ui';
import { useAtom, useSetAtom } from 'jotai';
import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useEffectEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

const idleAlertDescriptionKey = (
  key: NonNullable<SessionMonitorEntry['nearest']>['key'],
) =>
  key === 'utilization'
    ? 'sessionMonitor.idleAlert.Utilization'
    : key === 'network_timeout'
      ? 'sessionMonitor.idleAlert.NetworkTimeout'
      : 'sessionMonitor.idleAlert.SessionLifetime';

/**
 * Resolves the monitor's scope from the route and the viewer's role, then
 * polls it for the header chip, the tab-title badge and (own sessions only)
 * the idle-termination alerts. Renders nothing; mounted once in MainLayout.
 */
const SessionMonitorWatcher: React.FC = () => {
  'use memo';
  const routeScope = useRouteScope();
  const role = useCurrentUserRole();
  const domainName = useCurrentDomainValue();
  const setScope = useSetAtom(sessionMonitorScopeAtom);
  const [enabled] = useBAISettingUserState('session_monitor_enabled');

  // Admin routes are project-agnostic (ADR-0001): a domain admin (the
  // superadmin role counts as one) watches the domain; anyone else gets no
  // chip there.
  const isAdminRoute = routeScope === 'admin';
  const canWatchDomain = role === 'superadmin' || role === 'admin';
  const hidden = enabled === false || (isAdminRoute && !canWatchDomain);
  useEffect(() => {
    if (hidden) setScope(null);
  }, [hidden, setScope]);
  if (hidden) return null;

  return isAdminRoute ? (
    <ScopedSessionMonitorWatcher
      key={`domain:${domainName}`}
      scope={{
        mode: 'domain',
        scopeId: `domain:${domainName}`,
        filter: SESSION_MONITOR_NOT_FINISHED_FILTER,
      }}
    />
  ) : (
    <ProjectSessionMonitorWatcher
      mode={routeScope === 'projectAdmin' ? 'project' : 'my'}
    />
  );
};

const ProjectSessionMonitorWatcher: React.FC<{ mode: 'my' | 'project' }> = ({
  mode,
}) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const [currentUser] = useCurrentUserInfo();
  if (!currentProject.id) return null;
  const scope: SessionMonitorScope = {
    mode,
    scopeId: `project:${currentProject.id}`,
    filter:
      mode === 'my'
        ? `${SESSION_MONITOR_NOT_FINISHED_FILTER} & user_id == "${currentUser.uuid}"`
        : SESSION_MONITOR_NOT_FINISHED_FILTER,
  };
  return (
    <ScopedSessionMonitorWatcher
      key={`${scope.mode}:${scope.scopeId}`}
      scope={scope}
    />
  );
};

const ScopedSessionMonitorWatcher: React.FC<{ scope: SessionMonitorScope }> = ({
  scope,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, setFetchKey] = useAtom(sessionMonitorFetchKeyAtom);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const { entries, total, counts, fetchedAt } = useSessionMonitorData(
    deferredFetchKey,
    scope,
  );
  const setSummary = useSetAtom(sessionMonitorSummaryAtom);
  const setScope = useSetAtom(sessionMonitorScopeAtom);
  const idleAlertsEnabled = scope.mode === 'my';
  const { upsertNotification } = useSetBAINotification();
  const buildProjectPath = useProjectPath();

  useEffect(() => {
    setScope(scope);
    return () => setScope(null);
  }, [scope, setScope]);

  const refetch = () => {
    startTransition(() => setFetchKey(new Date().toISOString()));
  };

  // Keeps polling in a hidden tab: the alerts are for when the user is away.
  useInterval(refetch, SESSION_MONITOR_POLL_INTERVAL_MS, false);

  const onVisible = useEffectEvent(() => {
    if (!document.hidden) refetch();
  });
  useEffect(() => {
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const summary = summarizeSessions(entries, total, fetchedAt, counts);
  useEffect(() => {
    setSummary(summary);
  }, [summary, setSummary]);

  useEffect(() => {
    document.title = applyAttentionTitleBadge(
      document.title,
      summary.attentionCount,
    );
    return () => {
      document.title = applyAttentionTitleBadge(document.title, 0);
    };
  }, [summary.attentionCount]);

  const raiseDueAlerts = useEffectEvent((current: SessionMonitorEntry[]) => {
    const now = Date.now();
    const storage = typeof window === 'undefined' ? undefined : localStorage;
    const { due, alerted } = pickDueAlerts(
      current,
      readAlertedRecords(storage, now),
      now,
    );
    if (due.length === 0) return;
    writeAlertedRecords(storage, alerted);
    const sessionListPath = buildProjectPath('session', { scope: 'project' });
    due.forEach(({ entry, thresholdSec }) => {
      if (!entry.nearest || entry.deadline === null) return;
      upsertNotification({
        key: `session-monitor-idle-${entry.id}-${thresholdSec}`,
        type: 'warning',
        title: t('sessionMonitor.idleAlert.Title', {
          name: entry.name ?? toLocalId(entry.id),
          minutes: Math.max(
            1,
            Math.ceil(((entry.deadline ?? now) - now) / 60_000),
          ),
        }),
        description: t(idleAlertDescriptionKey(entry.nearest.key)),
        toText: t('sessionMonitor.OpenSession'),
        to: `${sessionListPath}?${new URLSearchParams({
          sessionDetail: toLocalId(entry.id),
        }).toString()}`,
        open: true,
        duration: 0,
      });
    });
  });
  useEffect(() => {
    if (idleAlertsEnabled) raiseDueAlerts(entries);
  }, [entries, idleAlertsEnabled]);

  return null;
};

export default SessionMonitorWatcher;
