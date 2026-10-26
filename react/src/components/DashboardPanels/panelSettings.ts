/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { PanelDefinition, PanelSettingKind, PanelSettings } from './types';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';

/** The ranges a card's range setting offers, shortest first. */
export const RANGE_PRESETS = ['now-1h', 'now-24h', 'now-7d'] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export const DEFAULT_RANGE: RangePreset = 'now-24h';

export const RANGE_LABEL_KEYS: Record<RangePreset, string> = {
  'now-1h': 'dashboard.settings.Last1Hour',
  'now-24h': 'dashboard.settings.Last24Hours',
  'now-7d': 'dashboard.settings.Last7Days',
};

export const isRangePreset = (value: unknown): value is RangePreset =>
  _.includes(RANGE_PRESETS, value);

export const hasSetting = (
  definition: Pick<PanelDefinition, 'settings'> | undefined,
  kind: PanelSettingKind,
) => !!definition?.settings?.includes(kind);

/**
 * The stored settings the definition still declares, malformed values
 * dropped; undefined when nothing is left.
 */
export const sanitizePanelSettings = (
  value: unknown,
  definition: Pick<PanelDefinition, 'settings'>,
): PanelSettings | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const { resourceGroups, range } = value as Record<string, unknown>;
  const settings: PanelSettings = {};
  if (
    hasSetting(definition, 'resourceGroup') &&
    Array.isArray(resourceGroups) &&
    resourceGroups.length > 0 &&
    resourceGroups.every((name) => typeof name === 'string' && name)
  ) {
    settings.resourceGroups = _.uniq(resourceGroups as Array<string>);
  }
  if (hasSetting(definition, 'range') && isRangePreset(range)) {
    settings.range = range;
  }
  return _.isEmpty(settings) ? undefined : settings;
};

/** A one-line summary of a card's settings for the edit sider; undefined when all are default. */
export const describePanelSettings = (
  settings: PanelSettings | undefined,
  t: TFunction,
): string | undefined => {
  const parts = _.compact([
    settings?.resourceGroups?.join(', '),
    settings?.range && isRangePreset(settings.range)
      ? t(RANGE_LABEL_KEYS[settings.range])
      : undefined,
  ]);
  return parts.length ? parts.join(' · ') : undefined;
};
