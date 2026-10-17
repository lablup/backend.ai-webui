/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SESSION_MONITOR_ROW_OPTIONS,
  SESSION_MONITOR_VISIBLE_LIMIT,
  type SessionMonitorSort,
} from '../../helper/sessionMonitor';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { SETTING_ARRIVAL_PARAM } from '../../hooks/useSettingArrival';
import { Selector } from '@lablup/ui-common/Selector';
import { Switch } from '@lablup/ui-common/Switch';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIFlex, BAILink } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** The popover's settings view: what the list shows. */
const SessionMonitorSettingsPane: React.FC<{ onNavigate?: () => void }> = ({
  onNavigate,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [sort, setSort] = useBAISettingUserState('session_monitor_sort');
  const [includeStarting, setIncludeStarting] = useBAISettingUserState(
    'session_monitor_include_starting',
  );
  const [rows, setRows] = useBAISettingUserState('session_monitor_rows');

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
      <BAILink
        to={{
          search: `?settings=general&${SETTING_ARRIVAL_PARAM}=userSettings.SessionMonitor`,
        }}
        onClick={onNavigate}
      >
        {t('sessionMonitor.settings.OpenUserSettings')}
      </BAILink>
    </BAIFlex>
  );
};

export default SessionMonitorSettingsPane;
