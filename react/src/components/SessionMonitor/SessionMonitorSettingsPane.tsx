/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../app-shim';
import {
  SESSION_MONITOR_ROW_OPTIONS,
  SESSION_MONITOR_VISIBLE_LIMIT,
  type SessionMonitorSort,
} from '../../helper/sessionMonitor';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { Selector } from '@lablup/ui-common/Selector';
import { Switch } from '@lablup/ui-common/Switch';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** The popover's settings view: what the list shows, and the desktop mirror. */
const SessionMonitorSettingsPane: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [sort, setSort] = useBAISettingUserState('session_monitor_sort');
  const [includeStarting, setIncludeStarting] = useBAISettingUserState(
    'session_monitor_include_starting',
  );
  const [rows, setRows] = useBAISettingUserState('session_monitor_rows');
  const [desktopNotification, setDesktopNotification] = useBAISettingUserState(
    'desktop_notification',
  );
  const { message } = App.useApp();

  // Same gate as User Settings › General: turning it on asks the browser.
  const toggleDesktopNotification = (value: boolean) => {
    setDesktopNotification(value);
    if (!value || Notification.permission === 'granted') return;
    if (!('Notification' in window)) {
      message.error(t('desktopNotification.NotSupported'));
      setDesktopNotification(false);
      return;
    }
    if (Notification.permission === 'denied') {
      message.error(t('desktopNotification.PermissionDenied'));
      setDesktopNotification(false);
      return;
    }
    Notification.requestPermission().then((permission) => {
      if (permission === 'denied') {
        message.error(t('desktopNotification.PermissionDenied'));
        setDesktopNotification(false);
      }
    });
  };

  const sortOptions: Array<{ value: SessionMonitorSort; label: string }> = [
    { value: 'deadline', label: t('sessionMonitor.settings.SortDeadline') },
    { value: 'newest', label: t('sessionMonitor.settings.SortNewest') },
    { value: 'name', label: t('sessionMonitor.settings.SortName') },
  ];

  return (
    <BAIFlex
      data-testid="session-monitor-settings"
      direction="column"
      align="stretch"
      gap="sm"
      style={{
        padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
        borderTop: `1px solid ${token('--color-border')}`,
      }}
    >
      <BAIFlex direction="row" align="center" justify="between" gap="sm">
        <Selector
          label={t('sessionMonitor.settings.SortBy')}
          size="sm"
          options={sortOptions}
          value={sort ?? 'deadline'}
          onChange={(value) => setSort(value as SessionMonitorSort)}
        />
      </BAIFlex>
      <BAIFlex direction="row" align="center" justify="between" gap="sm">
        <Selector
          label={t('sessionMonitor.settings.RowsShown')}
          size="sm"
          options={SESSION_MONITOR_ROW_OPTIONS.map((n) => String(n))}
          value={String(rows ?? SESSION_MONITOR_VISIBLE_LIMIT)}
          onChange={(value) => setRows(Number(value))}
        />
      </BAIFlex>
      <Switch
        label={t('sessionMonitor.settings.IncludeStarting')}
        value={includeStarting ?? true}
        onChange={(checked) => setIncludeStarting(checked)}
      />
      <Switch
        label={t('userSettings.DesktopNotification')}
        value={desktopNotification ?? false}
        onChange={(checked) => toggleDesktopNotification(checked)}
      />
    </BAIFlex>
  );
};

export default SessionMonitorSettingsPane;
