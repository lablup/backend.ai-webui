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
 * dropped and a multi-group setting cut to its first group; undefined when
 * nothing is left.
 */
export const sanitizePanelSettings = (
  value: unknown,
  definition: Pick<PanelDefinition, 'settings'>,
): PanelSettings | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const { resourceGroups, range } = value as Record<string, unknown>;
  const settings: PanelSettings = {};
  const resourceGroup = Array.isArray(resourceGroups)
    ? resourceGroups[0]
    : undefined;
  if (
    hasSetting(definition, 'resourceGroup') &&
    typeof resourceGroup === 'string' &&
    resourceGroup
  ) {
    settings.resourceGroups = [resourceGroup];
  }
  if (hasSetting(definition, 'range') && isRangePreset(range)) {
    settings.range = range;
  }
  return _.isEmpty(settings) ? undefined : settings;
};

/** A card's non-default settings, one label each, for the edit sider caption. */
export const panelSettingsParts = (
  settings: PanelSettings | undefined,
  t: TFunction,
): string[] =>
  _.compact([
    settings?.resourceGroups?.[0],
    settings?.range && isRangePreset(settings.range)
      ? t(RANGE_LABEL_KEYS[settings.range])
      : undefined,
  ]);

/** A one-line summary of a card's settings; undefined when all are default. */
export const describePanelSettings = (
  settings: PanelSettings | undefined,
  t: TFunction,
): string | undefined => {
  const parts = panelSettingsParts(settings, t);
  return parts.length ? parts.join(' · ') : undefined;
};
