/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useDashboardResourceGroups } from './DashboardResourceGroups';
import PanelRangeSelect from './PanelRangeSelect';
import { cardResourceGroup } from './dashboardScope';
import type { PanelSettingOverride } from './panelSettingOverrides';
import {
  DEFAULT_RANGE,
  hasSetting,
  maxRangeDaysOf,
  rangeLabel,
} from './panelSettings';
import type { PanelDefinition, PanelSettings } from './types';
import { useDashboardFilterContext } from './useDashboardFilters';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { BAIFlex, BAIScopedResourceGroupSelect } from 'backend.ai-ui';
import { RotateCcw } from 'lucide-react';
import React, { Suspense, createContext, use } from 'react';
import { useTranslation } from 'react-i18next';

export interface PanelHeaderSettings {
  definition: Pick<PanelDefinition, 'settings' | 'kind' | 'maxRangeDays'>;
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
  // The page's allowed groups, never the header's (ADR 0027).
  const allowed = useDashboardResourceGroups();
  if (!settings || !filters) return null;
  const { definition, saved, effective, overridden, onChange, onReset } =
    settings;
  const isPreset = definition.kind === 'preset';
  // A pick the page's project can no longer use reads the default, so it shows as unset.
  const validPick = (pick: ReadonlyArray<string> | undefined) =>
    isPreset || !allowed
      ? (pick?.[0] ?? null)
      : pick?.[0] && cardResourceGroup(pick, allowed) === pick[0]
        ? pick[0]
        : null;
  const resourceGroup = validPick(effective?.resourceGroups);
  const savedRange = saved?.range;
  const defaultResourceGroupLabel = isPreset
    ? t('dashboard.settings.AllResourceGroups')
    : (allowed?.defaultResourceGroup ?? undefined);
  const savedLabel = [
    hasSetting(definition, 'resourceGroup')
      ? (validPick(saved?.resourceGroups) ?? defaultResourceGroupLabel)
      : null,
    hasSetting(definition, 'range') ? rangeLabel(savedRange, t) : null,
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
          {/* To the right, so it never covers the select's own "Clear" tooltip above. */}
          <Tooltip
            content={t('general.ResourceGroup')}
            placement="end"
            hasHoverIndication={false}
          >
            <BAIScopedResourceGroupSelect
              size="sm"
              variant={overridden.resourceGroup ? 'secondary' : 'ghost'}
              label={t('general.ResourceGroup')}
              isLabelHidden
              scope={allowed?.scope ?? { project: [] }}
              filter={allowed?.filter}
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
        <PanelRangeSelect
          size="sm"
          isCompactLabel
          aria-label={t('dashboard.settings.TimeRange')}
          maxDays={maxRangeDaysOf(definition)}
          value={effective?.range ?? DEFAULT_RANGE}
          onChange={(range) => onChange({ range })}
        />
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
