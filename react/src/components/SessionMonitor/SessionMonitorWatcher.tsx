/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  applyAttentionTitleBadge,
  pickDueAlerts,
  readAlertedRecords,
  SESSION_MONITOR_POLL_INTERVAL_MS,
  summarizeSessions,
  writeAlertedRecords,
  type SessionMonitorEntry,
} from '../../helper/sessionMonitor';
import { useSetBAINotification } from '../../hooks/useBAINotification';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  sessionMonitorFetchKeyAtom,
  sessionMonitorSummaryAtom,
  useSessionMonitorData,
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
 * Polls the user's sessions for the header button, the tab-title badge and
 * the idle-termination alerts. Renders nothing; mounted once in MainLayout.
 */
const SessionMonitorWatcher: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const [fetchKey, setFetchKey] = useAtom(sessionMonitorFetchKeyAtom);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const { entries, total, fetchedAt } = useSessionMonitorData(deferredFetchKey);
  const setSummary = useSetAtom(sessionMonitorSummaryAtom);
  const [idleAlertsSetting] = useBAISettingUserState(
    'session_monitor_idle_alerts',
  );
  const idleAlertsEnabled = idleAlertsSetting ?? true;
  const { upsertNotification } = useSetBAINotification();
  const buildProjectPath = useProjectPath();

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

  const summary = summarizeSessions(entries, total, fetchedAt);
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
      if (!entry.nearest) return;
      upsertNotification({
        key: `session-monitor-idle-${entry.id}-${thresholdSec}`,
        type: 'warning',
        title: t('sessionMonitor.idleAlert.Title', {
          name: entry.name ?? toLocalId(entry.id),
          minutes: Math.ceil(thresholdSec / 60),
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
