/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DEFAULT_RANGE, hasSetting } from './panelSettings';
import type { PanelDefinition, PanelSettings } from './types';
import { atom } from 'jotai';
import * as _ from 'lodash-es';

/**
 * A value picked in a card's header. `resourceGroups` holds one group; `[]`
 * is the card's default group (the current one, or every group on a custom
 * panel).
 */
export interface PanelSettingOverride {
  resourceGroups?: Array<string>;
  range?: string;
}

// In memory only: an auto refresh keeps it; leaving or reloading the page returns to the saved settings.
export const panelSettingOverridesAtom = atom<
  Record<string, PanelSettingOverride>
>({});

/** Card ids repeat across boards, so an override belongs to one board's card. */
export const overrideKeyOf = (boardId: string, panelId: string) =>
  `${boardId}/${panelId}`;

type SettingsOwner = Pick<PanelDefinition, 'settings'>;

const rangeOf = (settings: PanelSettings | undefined) =>
  settings?.range ?? DEFAULT_RANGE;
const resourceGroupOf = (settings: PanelSettings | undefined) =>
  settings?.resourceGroups?.[0] ?? null;

/** What the card reads: the header's value, else the saved setting; undefined when both are default. */
export const effectivePanelSettings = (
  saved: PanelSettings | undefined,
  override: PanelSettingOverride | undefined,
  definition: SettingsOwner,
): PanelSettings | undefined => {
  const resourceGroups = hasSetting(definition, 'resourceGroup')
    ? (override?.resourceGroups ?? saved?.resourceGroups)?.slice(0, 1)
    : undefined;
  const range = hasSetting(definition, 'range')
    ? (override?.range ?? saved?.range)
    : undefined;
  const settings: PanelSettings = {
    ...(resourceGroups?.length ? { resourceGroups } : {}),
    ...(range && range !== DEFAULT_RANGE ? { range } : {}),
  };
  return _.isEmpty(settings) ? undefined : settings;
};

/** Which header values differ from the saved settings. */
export const overriddenSettings = (
  saved: PanelSettings | undefined,
  override: PanelSettingOverride | undefined,
  definition: SettingsOwner,
): { resourceGroup: boolean; range: boolean } => {
  const effective = effectivePanelSettings(saved, override, definition);
  return {
    resourceGroup:
      hasSetting(definition, 'resourceGroup') &&
      resourceGroupOf(effective) !== resourceGroupOf(saved),
    range:
      hasSetting(definition, 'range') && rangeOf(effective) !== rangeOf(saved),
  };
};

/**
 * Applies a header pick to a card's override; a value equal to the saved
 * setting drops that field, and an override with nothing left is removed.
 */
export const nextOverride = (
  current: PanelSettingOverride | undefined,
  change: PanelSettingOverride,
  saved: PanelSettings | undefined,
  definition: SettingsOwner,
): PanelSettingOverride | undefined => {
  const merged = { ...current, ...change };
  const differs = overriddenSettings(saved, merged, definition);
  const next: PanelSettingOverride = {
    ...(differs.resourceGroup ? { resourceGroups: merged.resourceGroups } : {}),
    ...(differs.range ? { range: merged.range } : {}),
  };
  return _.isEmpty(next) ? undefined : next;
};
