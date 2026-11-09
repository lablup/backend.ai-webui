/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_TIME_RANGE,
  MAX_WINDOW_DAYS,
  fixedWindowOf,
  isStorableWindow,
} from './timeRange';
import {
  chartUsesPeriod,
  type PanelDefinition,
  type PanelSettingKind,
  type PanelSettings,
  type PersistedPanelV2,
} from './types';
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

/** The longest custom range the card accepts, in days. */
export const maxRangeDaysOf = (
  definition: Pick<PanelDefinition, 'maxRangeDays'> | undefined,
) => definition?.maxRangeDays ?? MAX_WINDOW_DAYS;

/** A range a card setting may hold: a preset, or a fixed window at most `maxDays` long. */
export const isStoredRange = (
  value: unknown,
  maxDays: number = MAX_WINDOW_DAYS,
): value is string => isRangePreset(value) || isStorableWindow(value, maxDays);

/** A fixed window in the locale's date and time: `Oct 29, 2026 9:39 AM - Oct 30, 2026 9:39 AM`. */
export const formatWindowLabel = (range: string): string | undefined => {
  const window = fixedWindowOf(range);
  if (!window) return undefined;
  const format = (iso: string) => dayjs(iso).format('lll');
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

/** The definition a board panel's settings follow: a chart that counts within a period also takes a range. */
export const panelDefinitionOf = <TDefinition extends PanelDefinition>(
  definition: TDefinition,
  panel: Pick<PersistedPanelV2, 'viz' | 'chart'>,
): TDefinition =>
  definition.kind === 'preset' &&
  panel.viz === 'chart' &&
  chartUsesPeriod(panel.chart)
    ? withRangeSetting(definition)
    : definition;

/** `definition` that also takes a range: what this client may write on any preset panel. */
export const withRangeSetting = <TDefinition extends PanelDefinition>(
  definition: TDefinition,
): TDefinition =>
  hasSetting(definition, 'range')
    ? definition
    : { ...definition, settings: [...(definition.settings ?? []), 'range'] };

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
  definition: Pick<
    PanelDefinition,
    'settings' | 'columnSettings' | 'maxRangeDays'
  >,
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
  if (
    hasSetting(definition, 'range') &&
    isStoredRange(range, maxRangeDaysOf(definition))
  ) {
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
