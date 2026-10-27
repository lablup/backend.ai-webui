/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SESSION_MONITOR_CHIP_ITEMS,
  SESSION_MONITOR_ROW_OPTIONS,
  SESSION_MONITOR_VISIBLE_LIMIT,
  type SessionMonitorChipItem,
  type SessionMonitorSort,
} from '../../helper/sessionMonitor';
import { useCurrentDomain } from '../../hooks';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentUserProjectRoles } from '../../hooks/useCurrentUserProjectRoles';
import { useSessionMonitorCondition } from '../../hooks/useSessionMonitor';
import { SETTING_ARRIVAL_PARAM } from '../../hooks/useSettingArrival';
import { getSessionFilterProperties } from '../DashboardPanels/sessionFilterProperties';
import { Text } from '@lablup/ui-common/Text';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIAlert,
  BAIFlex,
  BAILink,
  BAIPropertyFilter,
  BAIScopedUserSelect,
  BAISelect,
  type FilterProperty,
  BAICheckboxInput,
  BAISelector,
} from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';

/**
 * The dashboard's session condition fields, plus the project. `user_id` is the
 * session's owner: a superadmin picks any user, everyone else only "Me".
 */
const getSessionMonitorFilterProperties = (
  t: TFunction,
  userId: string,
  isSuperAdmin: boolean,
  domainId: string,
): Array<FilterProperty> => [
  { key: 'group_name', propertyLabel: t('general.Project'), type: 'string' },
  ...getSessionFilterProperties(t).map((property): FilterProperty => {
    if (property.key === 'user_email') {
      return {
        ...property,
        propertyLabel: t('sessionMonitor.settings.OwnerEmail'),
      };
    }
    if (property.key !== 'user_id') return property;
    const owner = {
      ...property,
      propertyLabel: t('session.Owner'),
      options: [{ label: t('sessionMonitor.settings.Me'), value: userId }],
    };
    return isSuperAdmin
      ? {
          ...owner,
          renderInput: ({ onAddCondition, value, isDisabled }) => (
            <Suspense fallback={<BAISelect disabled loading />}>
              <BAIScopedUserSelect
                scope={{ domain: [{ value: domainId }] }}
                label={t('session.Owner')}
                isLabelHidden
                valuePropName="id"
                value={value}
                isDisabled={isDisabled}
                onChange={(next, option) =>
                  onAddCondition(
                    next as string | undefined,
                    _.castArray(option ?? [])[0]?.label as string | undefined,
                  )
                }
              />
            </Suspense>
          ),
        }
      : { ...owner, strictSelection: true };
  }),
];

const CHIP_ITEM_LABEL_KEYS: Record<SessionMonitorChipItem, string> = {
  starting: 'sessionMonitor.settings.ChipStarting',
  error: 'sessionMonitor.settings.ChipError',
  resources: 'sessionMonitor.settings.ChipResources',
  idle: 'sessionMonitor.settings.ChipIdle',
};

/** The popover's settings view: which sessions it watches and what shows. */
const SessionMonitorSettingsPane: React.FC<{
  onNavigate?: () => void;
}> = ({ onNavigate }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const [sort, setSort] = useBAISettingUserState('session_monitor_sort');
  const [rows, setRows] = useBAISettingUserState('session_monitor_rows');
  const [, setCondition] = useBAISettingUserState('session_monitor_condition');
  const { condition, userId } = useSessionMonitorCondition();
  const { isSuperAdmin } = useCurrentUserProjectRoles();
  const { id: domainId } = useCurrentDomain();
  const [chipItems, setChipItems] = useBAISettingUserState(
    'session_monitor_chip_items',
  );

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
      <BAIPropertyFilter
        filterProperties={getSessionMonitorFilterProperties(
          t,
          userId,
          isSuperAdmin,
          domainId,
        )}
        placeholder={t('sessionMonitor.settings.FilterPlaceholder')}
        value={condition}
        // Clearing yields undefined, which the store would persist as the
        // string "undefined"; '' keeps "no condition" apart from "never set".
        onChange={(value) => setCondition(value ?? '')}
      />
      <Text type="label" weight="semibold">
        {t('sessionMonitor.settings.ShowInHeader')}
      </Text>
      {SESSION_MONITOR_CHIP_ITEMS.map((item) => (
        <BAICheckboxInput
          key={item}
          value={chipItems?.includes(item) ?? false}
          onChange={(checked) =>
            setChipItems(
              SESSION_MONITOR_CHIP_ITEMS.filter((i) =>
                i === item ? checked : (chipItems?.includes(i) ?? false),
              ),
            )
          }
        >
          {t(CHIP_ITEM_LABEL_KEYS[item])}
        </BAICheckboxInput>
      ))}
      <Text type="label" weight="semibold">
        {t('sessionMonitor.settings.List')}
      </Text>
      <BAIFlex direction="column" align="stretch" gap="xs">
        <Text>{t('sessionMonitor.settings.SortBy')}</Text>
        <BAISelector
          aria-label={t('sessionMonitor.settings.SortBy')}
          size="sm"
          options={sortOptions}
          value={sort ?? 'deadline'}
          onChange={(value) => setSort(value as SessionMonitorSort)}
        />
      </BAIFlex>
      <BAIFlex direction="column" align="stretch" gap="xs">
        <Text>{t('sessionMonitor.settings.RowsShown')}</Text>
        <BAISelector
          aria-label={t('sessionMonitor.settings.RowsShown')}
          size="sm"
          options={SESSION_MONITOR_ROW_OPTIONS.map((n) => String(n))}
          value={String(rows ?? SESSION_MONITOR_VISIBLE_LIMIT)}
          onChange={(value) => setRows(Number(value))}
        />
      </BAIFlex>
      <BAIAlert
        type="info"
        showIcon
        description={
          <Trans
            i18nKey="sessionMonitor.settings.TurnOffHint"
            components={{
              a: (
                <BAILink
                  to={{
                    search: `?settings=general&${SETTING_ARRIVAL_PARAM}=userSettings.SessionMonitor`,
                  }}
                  onClick={onNavigate}
                />
              ),
            }}
          />
        }
      />
    </BAIFlex>
  );
};

export default SessionMonitorSettingsPane;
