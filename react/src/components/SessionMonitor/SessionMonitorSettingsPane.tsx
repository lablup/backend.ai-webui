/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SESSION_MONITOR_CHIP_ITEMS,
  SESSION_MONITOR_ERROR_FILTER,
  SESSION_MONITOR_RUNNING_FILTER,
  SESSION_MONITOR_STARTING_FILTER,
  SESSION_MONITOR_ROW_OPTIONS,
  SESSION_MONITOR_VISIBLE_LIMIT,
  type SessionMonitorChipItem,
  type SessionMonitorSort,
} from '../../helper/sessionMonitor';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentProjectValue } from '../../hooks/useCurrentProject';
import { useIsProjectAgnosticPage } from '../../hooks/useIsProjectAgnosticPage';
import { SETTING_ARRIVAL_PARAM } from '../../hooks/useSettingArrival';
import { getSessionFilterProperties } from '../DashboardPanels/sessionFilterProperties';
import { Button } from '@lablup/ui-common/Button';
import { CheckboxInput } from '@lablup/ui-common/CheckboxInput';
import { Selector } from '@lablup/ui-common/Selector';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIFlex,
  BAILink,
  BAIPropertyFilter,
  type FilterProperty,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

/** The dashboard's session condition fields, plus the project. */
const getSessionMonitorFilterProperties = (
  t: TFunction,
): Array<FilterProperty> => [
  { key: 'group_name', propertyLabel: t('general.Project'), type: 'string' },
  ...getSessionFilterProperties(t),
];

const CHIP_ITEM_LABEL_KEYS: Record<SessionMonitorChipItem, string> = {
  starting: 'sessionMonitor.settings.ChipStarting',
  error: 'sessionMonitor.settings.ChipError',
  resources: 'sessionMonitor.settings.ChipResources',
  idle: 'sessionMonitor.settings.ChipIdle',
};

/** One-click conditions; each replaces the condition and stays editable. */
const STATUS_PRESETS = [
  {
    key: 'running',
    labelKey: 'sessionMonitor.settings.PresetRunning',
    condition: SESSION_MONITOR_RUNNING_FILTER,
  },
  {
    key: 'starting',
    labelKey: 'sessionMonitor.settings.PresetStarting',
    condition: SESSION_MONITOR_STARTING_FILTER,
  },
  {
    key: 'error',
    labelKey: 'sessionMonitor.settings.PresetError',
    condition: SESSION_MONITOR_ERROR_FILTER,
  },
] as const;

/** Reads the current project, so it is only mounted on project pages. */
const CurrentProjectPreset: React.FC<{
  onApply: (condition: string) => void;
}> = ({ onApply }) => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  if (!currentProject.name) return null;
  return (
    <Button
      size="sm"
      variant="secondary"
      label={t('sessionMonitor.settings.PresetCurrentProject')}
      onClick={() => onApply(`group_name == "${currentProject.name}"`)}
    />
  );
};

/** The popover's settings view: which sessions it watches and what shows. */
const SessionMonitorSettingsPane: React.FC<{
  /** Only a domain admin can see other users' sessions to watch. */
  isDomainAdmin: boolean;
  onNavigate?: () => void;
}> = ({ isDomainAdmin, onNavigate }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [sort, setSort] = useBAISettingUserState('session_monitor_sort');
  const [includeStarting, setIncludeStarting] = useBAISettingUserState(
    'session_monitor_include_starting',
  );
  const [rows, setRows] = useBAISettingUserState('session_monitor_rows');
  const [onlyMine, setOnlyMine] = useBAISettingUserState(
    'session_monitor_only_mine',
  );
  const [condition, setCondition] = useBAISettingUserState(
    'session_monitor_condition',
  );
  const [chipItems, setChipItems] = useBAISettingUserState(
    'session_monitor_chip_items',
  );
  const isProjectAgnosticPage = useIsProjectAgnosticPage();

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
      <Text type="label" weight="semibold">
        {t('sessionMonitor.settings.Condition')}
      </Text>
      {isDomainAdmin && (
        <CheckboxInput
          label={t('sessionMonitor.settings.OnlyMine')}
          value={onlyMine ?? true}
          onChange={(checked) => setOnlyMine(checked)}
        />
      )}
      <BAIFlex direction="row" align="center" gap="xs" wrap="wrap">
        {STATUS_PRESETS.map((preset) => (
          <Button
            key={preset.key}
            size="sm"
            variant="secondary"
            label={t(preset.labelKey)}
            onClick={() => setCondition(preset.condition)}
          />
        ))}
        {!isProjectAgnosticPage && (
          <CurrentProjectPreset onApply={setCondition} />
        )}
      </BAIFlex>
      <BAIPropertyFilter
        filterProperties={getSessionMonitorFilterProperties(t)}
        value={condition ?? ''}
        // Clearing the last token yields undefined, which the setting store
        // would persist as the string "undefined"; '' reads back as unset.
        onChange={(value) => setCondition(value ?? '')}
      />
      <Text type="label" weight="semibold">
        {t('sessionMonitor.settings.ShowInHeader')}
      </Text>
      {SESSION_MONITOR_CHIP_ITEMS.map((item) => (
        <CheckboxInput
          key={item}
          label={t(CHIP_ITEM_LABEL_KEYS[item])}
          value={chipItems?.includes(item) ?? false}
          onChange={(checked) =>
            setChipItems(
              SESSION_MONITOR_CHIP_ITEMS.filter((i) =>
                i === item ? checked : (chipItems?.includes(i) ?? false),
              ),
            )
          }
        />
      ))}
      <Text type="label" weight="semibold">
        {t('sessionMonitor.settings.List')}
      </Text>
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
      <CheckboxInput
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
