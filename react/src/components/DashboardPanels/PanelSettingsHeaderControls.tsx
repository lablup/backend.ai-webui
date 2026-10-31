/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useResourceGroupsForCurrentProject } from '../../hooks/useCurrentProject';
import { resourceGroupScopeOf } from './dashboardScope';
import type { PanelSettingOverride } from './panelSettingOverrides';
import {
  DEFAULT_RANGE,
  RANGE_LABEL_KEYS,
  RANGE_PRESETS,
  hasSetting,
  isRangePreset,
} from './panelSettings';
import type { PanelDefinition, PanelSettings } from './types';
import { useDashboardFilterContext } from './useDashboardFilters';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIFlex,
  BAIScopedResourceGroupSelect,
  BAISelector,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { RotateCcw } from 'lucide-react';
import React, { Suspense, createContext, use } from 'react';
import { useTranslation } from 'react-i18next';

export interface PanelHeaderSettings {
  definition: Pick<PanelDefinition, 'settings' | 'kind'>;
  saved: PanelSettings | undefined;
  /** What the card reads now: the header's pick, else the saved setting. */
  effective: PanelSettings | undefined;
  overridden: { resourceGroup: boolean; range: boolean };
  onChange: (change: PanelSettingOverride) => void;
  onReset: () => void;
}

/** Set per card by the board; the shared card header renders it as compact controls. */
export const PanelHeaderSettingsContext =
  createContext<PanelHeaderSettings | null>(null);

/**
 * A card's resource group and time range in its header. A pick here is
 * temporary; the edit-mode card settings keep the saved default.
 */
const PanelSettingsHeaderControls: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const settings = use(PanelHeaderSettingsContext);
  const filters = useDashboardFilterContext();
  const { sftpResourceGroups } = useResourceGroupsForCurrentProject();
  const excludedResourceGroups = _.compact(sftpResourceGroups);
  if (!settings || !filters) return null;
  const { definition, saved, effective, overridden, onChange, onReset } =
    settings;
  const resourceGroup = effective?.resourceGroups?.[0] ?? null;
  const savedRange = saved?.range;
  const defaultResourceGroupLabel =
    definition.kind === 'preset'
      ? t('dashboard.settings.AllResourceGroups')
      : (filters.currentResourceGroup ??
        t('dashboard.settings.CurrentResourceGroup'));
  const savedLabel = [
    hasSetting(definition, 'resourceGroup')
      ? (saved?.resourceGroups?.[0] ?? defaultResourceGroupLabel)
      : null,
    hasSetting(definition, 'range')
      ? t(
          RANGE_LABEL_KEYS[
            isRangePreset(savedRange) ? savedRange : DEFAULT_RANGE
          ],
        )
      : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const resetLabel = t('dashboard.settings.BackToSavedSetting', {
    value: savedLabel,
  });

  return (
    <BAIFlex align="center" gap="xxs" data-testid="panel-header-settings">
      {hasSetting(definition, 'resourceGroup') ? (
        <Suspense fallback={null}>
          <Tooltip
            content={t('general.ResourceGroup')}
            hasHoverIndication={false}
          >
            <BAIScopedResourceGroupSelect
              size="sm"
              variant={overridden.resourceGroup ? 'secondary' : 'ghost'}
              label={t('general.ResourceGroup')}
              isLabelHidden
              scope={resourceGroupScopeOf(filters.scope)}
              filter={
                _.isEmpty(excludedResourceGroups)
                  ? undefined
                  : { name: { notIn: excludedResourceGroups } }
              }
              value={resourceGroup}
              placeholder={defaultResourceGroupLabel}
              allowClear={!!resourceGroup}
              onChange={(value) =>
                onChange({
                  resourceGroups: typeof value === 'string' ? [value] : [],
                })
              }
            />
          </Tooltip>
        </Suspense>
      ) : null}
      {hasSetting(definition, 'range') ? (
        <Tooltip
          content={t('dashboard.settings.TimeRange')}
          hasHoverIndication={false}
        >
          <BAISelector
            size="sm"
            variant={overridden.range ? 'secondary' : 'ghost'}
            aria-label={t('dashboard.settings.TimeRange')}
            options={RANGE_PRESETS.map((preset) => ({
              value: preset,
              label: t(RANGE_LABEL_KEYS[preset]),
            }))}
            value={effective?.range ?? DEFAULT_RANGE}
            onChange={(value) => {
              if (value) onChange({ range: value });
            }}
          />
        </Tooltip>
      ) : null}
      {overridden.resourceGroup || overridden.range ? (
        <IconButton
          variant="ghost"
          size="sm"
          label={resetLabel}
          tooltip={resetLabel}
          icon={<RotateCcw size="1em" />}
          onClick={onReset}
        />
      ) : null}
    </BAIFlex>
  );
};

export default PanelSettingsHeaderControls;
