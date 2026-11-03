/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_TIME_RANGE,
  fixedWindowOf,
  isStorableWindow,
} from './timeRange';
import type { PanelDefinition, PanelSettingKind, PanelSettings } from './types';
import type { BAITableColumnOverrideRecord } from 'backend.ai-ui';
import dayjs from 'dayjs';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';

/** The ranges a card's range setting offers, shortest first. */
export const RANGE_PRESETS = ['now-1h', 'now-24h', 'now-7d'] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number];

export const DEFAULT_RANGE: RangePreset = DEFAULT_TIME_RANGE;

export const RANGE_LABEL_KEYS: Record<RangePreset, string> = {
  'now-1h': 'dashboard.settings.Last1Hour',
  'now-24h': 'dashboard.settings.Last24Hours',
  'now-7d': 'dashboard.settings.Last7Days',
};

export const isRangePreset = (value: unknown): value is RangePreset =>
  _.includes(RANGE_PRESETS, value);

/** A range a card setting may hold: a preset, or a fixed window. */
export const isStoredRange = (value: unknown): value is string =>
  isRangePreset(value) || isStorableWindow(value);

/** A fixed window, compact: `Oct 29 09:39 - Oct 30 09:39`. */
export const formatWindowLabel = (range: string): string | undefined => {
  const window = fixedWindowOf(range);
  if (!window) return undefined;
  const format = (iso: string) => dayjs(iso).format('MMM D HH:mm');
  return `${format(window.after)} - ${format(window.before)}`;
};

/** A range setting's label: the preset's name, the window's dates, else the default's name. */
export const rangeLabel = (range: string | undefined, t: TFunction): string =>
  isRangePreset(range)
    ? t(RANGE_LABEL_KEYS[range])
    : ((range && formatWindowLabel(range)) ??
      t(RANGE_LABEL_KEYS[DEFAULT_RANGE]));

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
  if (hasSetting(definition, 'range') && isStoredRange(range)) {
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
    settings?.range && isStoredRange(settings.range)
      ? rangeLabel(settings.range, t)
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
