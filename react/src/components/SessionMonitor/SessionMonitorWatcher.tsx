/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { updateDocumentTitle } from '../../helper/documentTitle';
import {
  pickDueAlerts,
  readAlertedRecords,
  SESSION_MONITOR_POLL_INTERVAL_MS,
  summarizeSessions,
  writeAlertedRecords,
  type SessionMonitorEntry,
} from '../../helper/sessionMonitor';
import { useCurrentUserInfo } from '../../hooks/backendai';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  sessionMonitorFetchKeyAtom,
  sessionMonitorScopeAtom,
  sessionMonitorSummaryAtom,
  useSessionMonitorData,
  useSessionMonitorScope,
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
 * Polls the watched sessions for the header chip, the tab-title badge and the
 * idle-termination alerts. The same on every page; renders nothing.
 */
const SessionMonitorWatcher: React.FC = () => {
  'use memo';
  // Experimental: off until the user turns it on in User settings.
  const [enabled] = useBAISettingUserState('experimental_session_monitor');
  const setScope = useSetAtom(sessionMonitorScopeAtom);
  useEffect(() => {
    if (!enabled) setScope(null);
  }, [enabled, setScope]);
  return enabled ? <ResolvedSessionMonitorWatcher /> : null;
};

const ResolvedSessionMonitorWatcher: React.FC = () => {
  'use memo';
  // Deferred, not re-keyed: a new condition keeps the chip on the last
  // answer while its count loads.
  const scope = useDeferredValue(useSessionMonitorScope());
  return <ScopedSessionMonitorWatcher scope={scope} />;
};

const ScopedSessionMonitorWatcher: React.FC<{ scope: SessionMonitorScope }> = ({
  scope,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, setFetchKey] = useAtom(sessionMonitorFetchKeyAtom);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const [chipItems] = useBAISettingUserState('session_monitor_chip_items');
  const [currentUser] = useCurrentUserInfo();
  // The default chip is a count; only the opt-in segments fetch sessions.
  const showsIdle = chipItems?.includes('idle') ?? false;
  const showsResources = chipItems?.includes('resources') ?? false;
  const showsStarting = chipItems?.includes('starting') ?? false;
  const showsErrors = chipItems?.includes('error') ?? false;
  const { entries, total, counts, allocated, fetchedAt } =
    useSessionMonitorData(deferredFetchKey, scope, {
      withEntries: showsIdle,
      withSlots: showsResources,
      withStarting: showsStarting,
      withErrors: showsErrors,
    });
  const setSummary = useSetAtom(sessionMonitorSummaryAtom);
  const setScope = useSetAtom(sessionMonitorScopeAtom);
  const { upsertNotification } = useSetBAINotification();
  const buildProjectPath = useProjectPath();

  useEffect(() => {
    setScope(scope);
  }, [scope, setScope]);
  useEffect(() => () => setScope(null), [setScope]);

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

  const summary = summarizeSessions(entries, total, fetchedAt, allocated, {
    starting: showsStarting ? counts.starting : null,
    errors: showsErrors ? counts.errors : null,
  });
  useEffect(() => {
    setSummary(summary);
  }, [summary, setSummary]);

  useEffect(() => {
    updateDocumentTitle({ attentionCount: summary.attentionCount });
    return () => updateDocumentTitle({ attentionCount: 0 });
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
    // Only the viewer's own sessions: an admin watching others gets no alerts.
    if (showsIdle) {
      raiseDueAlerts(entries.filter((e) => e.userId === currentUser.uuid));
    }
  }, [entries, showsIdle, currentUser.uuid]);

  return null;
};

export default SessionMonitorWatcher;
