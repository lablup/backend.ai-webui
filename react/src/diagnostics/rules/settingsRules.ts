/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { LoginConfigState } from '../../helper/loginConfig';
import { FILE_ONLY_CONFIG_KEYS } from '../../helper/loginConfig';
import { isValidPluginPath } from '../../helper/pluginPath';
import {
  WEBUI_SETTING_DEFINITIONS,
  findWebUISettingDefinition,
  readWebUISettingFromState,
  restrictToOptions,
} from '../../helper/webuiSettings';
import type { DiagnosticResult } from '../../types/diagnostics';
import { isPlaceholder, isValidUrl } from './configRules';
import * as _ from 'lodash-es';

// Rules over the effective System Settings values (ADR 0028). A setting that
// still holds its code default was never set: Apply saves only what differs.

const settingValue = (state: LoginConfigState, key: string): unknown => {
  const definition = findWebUISettingDefinition(key);
  return definition ? readWebUISettingFromState(state, definition) : undefined;
};

/** The keys among `keys` set to a non-empty value other than the code default. */
export const changedSettingKeys = (
  state: LoginConfigState,
  defaults: LoginConfigState,
  keys: ReadonlyArray<string>,
): string[] =>
  keys.filter((key) => {
    const value = settingValue(state, key);
    return (
      value !== undefined &&
      value !== null &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0) &&
      !_.isEqual(value, settingValue(defaults, key))
    );
  });

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '' && !isPlaceholder(value);

// ---------------------------------------------------------------------------
// Numeric ranges
// ---------------------------------------------------------------------------

/** The `min` / `max` of every number setting in the definition table. */
export const SETTING_RANGES: Readonly<
  Record<string, { min: number; max: number }>
> = Object.fromEntries(
  WEBUI_SETTING_DEFINITIONS.filter(
    (d) => d.min !== undefined && d.max !== undefined,
  ).map((d) => [d.key, { min: d.min!, max: d.max! }]),
);

export function checkSettingRanges(
  state: LoginConfigState,
): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];
  for (const [key, { min, max }] of Object.entries(SETTING_RANGES)) {
    const raw = settingValue(state, key);
    if (raw === undefined || raw === null) continue;
    const value = Number(raw);
    if (Number.isNaN(value) || (value >= min && value <= max)) continue;
    results.push({
      id: `settings-out-of-range-${key}`,
      severity: 'warning',
      category: 'config',
      titleKey: 'diagnostics.ResourceLimitOutOfRange',
      descriptionKey: 'diagnostics.ResourceLimitOutOfRangeDesc',
      remediationKey: 'diagnostics.ResourceLimitOutOfRangeFix',
      settingKey: key,
      interpolationValues: {
        value: String(value),
        min: String(min),
        max: String(max),
      },
    });
  }
  return results;
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export const SETTING_URL_KEYS = [
  'appDownloadUrl',
  'cliDownloadUrl',
  'fasttrackEndpoint',
] as const;

export function checkSettingUrls(state: LoginConfigState): DiagnosticResult[] {
  return SETTING_URL_KEYS.flatMap((key): DiagnosticResult[] => {
    const value = settingValue(state, key);
    if (!nonEmptyString(value) || isValidUrl(value)) return [];
    return [
      {
        id: `settings-invalid-url-${key}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidSettingUrl',
        descriptionKey: 'diagnostics.InvalidSettingUrlDesc',
        remediationKey: 'diagnostics.InvalidSettingUrlFix',
        settingKey: key,
        interpolationValues: { value },
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Image references ("registry/namespace:tag@arch")
// ---------------------------------------------------------------------------

const IMAGE_REFERENCE_PATTERN =
  /^[a-zA-Z0-9._-]+(?::[0-9]+)?(\/[a-zA-Z0-9._-]+)+(:[a-zA-Z0-9._-]+)?(@[a-zA-Z0-9._-]+)?$/;

export const SETTING_IMAGE_KEYS = [
  'systemSSHImage',
  'defaultFileBrowserImage',
  'defaultSessionEnvironment',
  'defaultImportEnvironment',
] as const;

export function checkSettingImageReferences(
  state: LoginConfigState,
): DiagnosticResult[] {
  return SETTING_IMAGE_KEYS.flatMap((key): DiagnosticResult[] => {
    const value = settingValue(state, key);
    if (!nonEmptyString(value) || IMAGE_REFERENCE_PATTERN.test(value)) {
      return [];
    }
    return [
      {
        id: `settings-invalid-image-ref-${key}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidImageReference',
        descriptionKey: 'diagnostics.InvalidImageReferenceDesc',
        remediationKey: 'diagnostics.InvalidImageReferenceFix',
        settingKey: key,
        interpolationValues: { value },
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Menu key lists (Hide menus / Disable menus)
// ---------------------------------------------------------------------------

export const SETTING_MENU_KEY_LISTS = [
  'menuBlocklist',
  'menuInactivelist',
] as const;

/** One result per list: invalid entries, or a pass when the list is set. */
export function checkSettingMenuKeys(
  state: LoginConfigState,
  validMenuKeys: ReadonlyArray<string>,
): DiagnosticResult[] {
  return SETTING_MENU_KEY_LISTS.flatMap((key): DiagnosticResult[] => {
    const value = settingValue(state, key);
    // `useWebUIMenuItems` drops `system-settings` from both lists, so it hides nothing.
    const entries = Array.isArray(value)
      ? _.without(value as string[], 'system-settings')
      : [];
    if (entries.length === 0) return [];
    const invalid = entries.filter((entry) => !validMenuKeys.includes(entry));
    if (invalid.length === 0) {
      return [
        {
          id: `settings-menu-keys-valid-${key}`,
          severity: 'passed',
          category: 'config',
          titleKey: 'diagnostics.BlocklistValid',
          descriptionKey: 'diagnostics.BlocklistValidDesc',
          settingKey: key,
          interpolationValues: { count: String(entries.length) },
        },
      ];
    }
    return [
      {
        id: `settings-invalid-menu-keys-${key}`,
        severity: 'warning',
        category: 'config',
        titleKey: 'diagnostics.InvalidBlocklistEntries',
        descriptionKey: 'diagnostics.InvalidBlocklistEntriesDesc',
        remediationKey: 'diagnostics.InvalidBlocklistEntriesFix',
        settingKey: key,
        interpolationValues: {
          entries: invalid.join(', '),
          count: String(invalid.length),
        },
      },
    ];
  });
}

// ---------------------------------------------------------------------------
// Plugins (the effective `pluginPages` / `loginPlugin`)
// ---------------------------------------------------------------------------

/**
 * Flags plugin entries the loader would refuse (`isValidPluginPath`, the rule
 * `resolvePluginScriptUrl` applies): page entries and the login plugin alike.
 */
export function checkPluginConfiguration(
  pluginPages: ReadonlyArray<string>,
  loginPlugin: string,
): DiagnosticResult[] {
  const entries = [...pluginPages, loginPlugin]
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '' && !isPlaceholder(entry));
  const invalidNames = entries.filter((entry) => !isValidPluginPath(entry));
  if (invalidNames.length === 0) return [];
  return [
    {
      id: 'settings-invalid-plugin-names',
      severity: 'warning',
      category: 'config',
      titleKey: 'diagnostics.InvalidPluginNames',
      descriptionKey: 'diagnostics.InvalidPluginNamesDesc',
      remediationKey: 'diagnostics.InvalidPluginNamesFix',
      settingKey: 'pluginPage',
      interpolationValues: {
        plugins: invalidNames.join(', '),
        count: String(invalidNames.length),
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// config.toml keys the WebUI no longer reads
// ---------------------------------------------------------------------------

/** `config.toml` names that differ from the setting key (ADR 0028, "Key names"). */
const RENAMED_CONFIG_TOML_KEYS: Readonly<Record<string, string>> = {
  'menu.blocklist': 'menuBlocklist',
  'menu.inactivelist': 'menuInactivelist',
  'pipeline.frontendEndpoint': 'fasttrackEndpoint',
  'plugin.login': 'pluginLogin',
  'plugin.page': 'pluginPage',
};

const SETTING_KEYS = new Set(WEBUI_SETTING_DEFINITIONS.map((d) => d.key));

export interface IgnoredConfigTomlKey {
  /** `section.key` as written in the file. */
  path: string;
  settingKey: string;
  /** Whether the file's value is what the WebUI runs with anyway. */
  inEffect: boolean;
}

/** A file value in the setting's own shape; `undefined` when it cannot be read as one. */
const fileValueAsSetting = (key: string, raw: unknown): unknown => {
  const definition = findWebUISettingDefinition(key);
  if (!definition) return undefined;
  switch (definition.type) {
    case 'boolean':
      if (typeof raw === 'boolean') return raw;
      if (typeof raw !== 'string') return raw;
      return { true: true, false: false }[raw.trim().toLowerCase()] ?? raw;
    case 'number':
      if (typeof raw === 'number') return raw;
      // Junk stays as written, so it never matches a number.
      return typeof raw === 'string' && /^\s*-?\d+(\.\d+)?\s*$/.test(raw)
        ? Number(raw)
        : raw;
    case 'string':
      return typeof raw === 'string' ? raw : String(raw);
    case 'stringList': {
      const list = Array.isArray(raw)
        ? raw
        : typeof raw === 'string'
          ? raw.split(',')
          : [];
      return restrictToOptions(
        definition,
        list.map((v) => String(v).trim()).filter(Boolean),
      );
    }
  }
};

/**
 * Keys of the deployed `config.toml` (or `webserver.conf`) that a System
 * Settings key replaced; the WebUI ignores them since #10664.
 */
export function findIgnoredConfigTomlKeys(
  rawConfig: Record<string, unknown>,
  state: LoginConfigState,
): IgnoredConfigTomlKey[] {
  const found: IgnoredConfigTomlKey[] = [];
  for (const [section, sectionValue] of Object.entries(rawConfig)) {
    if (!_.isPlainObject(sectionValue)) continue;
    const fileOnly = FILE_ONLY_CONFIG_KEYS[section] ?? [];
    for (const [key, raw] of Object.entries(
      sectionValue as Record<string, unknown>,
    )) {
      const path = `${section}.${key}`;
      const settingKey =
        RENAMED_CONFIG_TOML_KEYS[path] ??
        (SETTING_KEYS.has(key) && !fileOnly.includes(key) ? key : undefined);
      if (!settingKey) continue;
      // An empty or placeholder value sets nothing, so there is nothing to report.
      if (
        raw === undefined ||
        raw === null ||
        (typeof raw === 'string' && raw.trim() === '') ||
        isPlaceholder(raw)
      ) {
        continue;
      }
      const inEffect = _.isEqual(
        fileValueAsSetting(settingKey, raw),
        settingValue(state, settingKey),
      );
      found.push({ path, settingKey, inEffect });
    }
  }
  return found;
}

/**
 * Two info rows: the keys whose file value is not what runs, and the rest.
 */
export function checkIgnoredConfigTomlKeys(
  rawConfig: Record<string, unknown> | null | undefined,
  state: LoginConfigState,
): DiagnosticResult[] {
  if (!rawConfig) return [];
  const [inEffect, overridden] = _.partition(
    findIgnoredConfigTomlKeys(rawConfig, state),
    (k) => k.inEffect,
  );
  const results: DiagnosticResult[] = [];
  if (overridden.length > 0) {
    results.push({
      id: 'config-ignored-keys-not-applied',
      // Info, not warning: config.toml no longer carries these keys, so they
      // must not raise the sidebar badge (useAutoDiagnostics).
      severity: 'info',
      category: 'config',
      titleKey: 'diagnostics.IgnoredConfigKeysNotApplied',
      descriptionKey: 'diagnostics.IgnoredConfigKeysNotAppliedDesc',
      remediationKey: 'diagnostics.IgnoredConfigKeysNotAppliedFix',
      linksSystemSettings: true,
      interpolationValues: {
        keys: overridden.map((k) => k.path).join(', '),
        count: String(overridden.length),
      },
    });
  }
  if (inEffect.length > 0) {
    results.push({
      id: 'config-ignored-keys',
      severity: 'info',
      category: 'config',
      titleKey: 'diagnostics.IgnoredConfigKeys',
      descriptionKey: 'diagnostics.IgnoredConfigKeysDesc',
      remediationKey: 'diagnostics.IgnoredConfigKeysFix',
      linksSystemSettings: true,
      interpolationValues: {
        keys: inEffect.map((k) => k.path).join(', '),
        count: String(inEffect.length),
      },
    });
  }
  return results;
}
