/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { PanelDefinition, PanelSettingKind, PanelSettings } from './types';
import type { BAITableColumnOverrideRecord } from 'backend.ai-ui';
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

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Column overrides with only well-typed `hidden` / `order` / `width`; undefined when none are left. */
export const sanitizeColumnOverrides = (
  value: unknown,
): BAITableColumnOverrideRecord | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }
  const entries = Object.entries(value as Record<string, unknown>).flatMap(
    ([key, override]) => {
      if (!override || typeof override !== 'object') return [];
      const { hidden, order, width } = override as Record<string, unknown>;
      const kept = {
        ...(typeof hidden === 'boolean' ? { hidden } : {}),
        ...(isFiniteNumber(order) ? { order } : {}),
        ...(isFiniteNumber(width) && width > 0 ? { width } : {}),
      };
      return _.isEmpty(kept) ? [] : [[key, kept] as const];
    },
  );
  return entries.length ? Object.fromEntries(entries) : undefined;
};

/** The settings keys this client writes for a card; any other stored key belongs to another client. */
export const ownedSettingKeys = (
  definition: Pick<PanelDefinition, 'settings' | 'columnSettings'>,
): Array<keyof PanelSettings> =>
  _.compact([
    hasSetting(definition, 'resourceGroup') && 'resourceGroups',
    hasSetting(definition, 'range') && 'range',
    definition.columnSettings && 'columnOverrides',
  ]);

/**
 * The stored settings the definition still declares, malformed values
 * dropped and a multi-group setting cut to its first group; undefined when
 * nothing is left.
 */
export const sanitizePanelSettings = (
  value: unknown,
  definition: Pick<PanelDefinition, 'settings' | 'columnSettings'>,
): PanelSettings | undefined => {
  if (!value || typeof value !== 'object') return undefined;
  const { resourceGroups, range, columnOverrides } = value as Record<
    string,
    unknown
  >;
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
  const columns = definition.columnSettings
    ? sanitizeColumnOverrides(columnOverrides)
    : undefined;
  if (columns) settings.columnOverrides = columns;
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

/** `patch` over `settings`; an undefined field is removed, and nothing left is undefined. */
export const mergeSettings = (
  settings: PanelSettings | undefined,
  patch: Partial<PanelSettings>,
): PanelSettings | undefined => {
  const merged = _.omitBy({ ...settings, ...patch }, _.isUndefined);
  return _.isEmpty(merged) ? undefined : (merged as PanelSettings);
};
