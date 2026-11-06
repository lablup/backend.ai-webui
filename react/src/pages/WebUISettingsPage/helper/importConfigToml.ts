/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { FILE_ONLY_CONFIG_KEYS } from '../../../helper/loginConfig';
import { isValidPluginPath } from '../../../helper/pluginPath';
import {
  isValidWebUISettingValue,
  restrictToOptions,
  WEBUI_SETTING_DEFINITIONS,
  type WebUISettingDefinition,
} from '../../../helper/webuiSettings';
import * as _ from 'lodash-es';
import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

const RESOURCES_KEYS = new Set([
  'openPortToPublic',
  'allowPreferredPort',
  'allowNonAuthTCP',
  'maxFileUploadSize',
  'storageWarningThreshold',
]);

/** Keys the file named differently, or kept in another table (ADR 0026, section 1). */
const RENAMED_TOML_PATHS: Readonly<Record<string, ReadonlyArray<string>>> = {
  menuBlocklist: ['menu.blocklist'],
  menuInactivelist: ['menu.inactivelist'],
  fasttrackEndpoint: ['pipeline.frontendEndpoint'],
  pluginLogin: ['plugin.login'],
  pluginPage: ['plugin.page'],
  showNonInstalledImages: ['environments.showNonInstalledImages'],
  // The webserver template renders the ATOM+ key with a lowercase "l".
  maxATOMPLUSDevicesPerContainer: [
    'resources.maxATOMPLUSDevicesPerContainer',
    'resources.maxATOMPlUSDevicesPerContainer',
  ],
};

/** The `config.toml` paths that fed each setting before it moved to app config. */
export const tomlPathsOf = (
  definition: WebUISettingDefinition,
): ReadonlyArray<string> => {
  const { key } = definition;
  if (RENAMED_TOML_PATHS[key]) return RENAMED_TOML_PATHS[key];
  const section =
    key.endsWith('PerContainer') || RESOURCES_KEYS.has(key)
      ? 'resources'
      : 'general';
  return [`${section}.${key}`];
};

/** Why a key cannot be applied; keys `config.toml` still owns are not listed. */
export type SkipReason = 'unknown' | 'invalid' | 'duplicate';

export interface ImportedSetting {
  definition: WebUISettingDefinition;
  path: string;
  /** `undefined`: the file left it empty, which meant the code default. */
  value: unknown;
}

export interface SkippedKey {
  path: string;
  reason: SkipReason;
}

export type ConfigTomlImport =
  | { ok: true; imported: ImportedSetting[]; skipped: SkippedKey[] }
  | { ok: false; error: string };

export const isUnsetText = (value: string) => {
  const text = value.trim();
  return text === '' || text === '""' || /^\[[\s\S]*\]$/.test(text);
};

// The old parser read these two with parseFloat; every other number with parseInt.
const FLOAT_KEYS = new Set(['maxShmPerContainer', 'storageWarningThreshold']);

/**
 * Whether `value` can be applied to `definition`; `undefined` (the default)
 * always can. Plugin paths follow the same rule as the page's path input.
 */
export const isApplicableSettingValue = (
  definition: WebUISettingDefinition,
  value: unknown,
): boolean => {
  if (value === undefined) return true;
  if (!isValidWebUISettingValue(definition.type, value)) return false;
  if (definition.key === 'pluginLogin') {
    return value === '' || isValidPluginPath(value as string);
  }
  if (definition.key === 'pluginPage') {
    return (value as string[]).every(isValidPluginPath);
  }
  return true;
};

/**
 * One value read the way the old file parser read it: an empty string or a
 * `[placeholder]` is unset, numbers go through `parseInt` (`parseFloat` for
 * FLOAT_KEYS), a list is a comma
 * string or a TOML array. `undefined` = unset, `null` = the wrong type.
 */
const coerce = (
  definition: WebUISettingDefinition,
  raw: unknown,
): unknown | null | undefined => {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === 'string' && isUnsetText(raw)) return undefined;
  switch (definition.type) {
    case 'boolean':
      return typeof raw === 'boolean' ? raw : null;
    case 'number': {
      if (typeof raw !== 'number' && typeof raw !== 'string') return null;
      const value = FLOAT_KEYS.has(definition.key)
        ? parseFloat(String(raw))
        : parseInt(String(raw));
      return Number.isNaN(value) ? null : value;
    }
    case 'string':
      return typeof raw === 'string' ? raw.trim() : null;
    case 'stringList': {
      const list = typeof raw === 'string' ? raw.split(',') : raw;
      if (!Array.isArray(list) || !list.every((v) => typeof v === 'string')) {
        return null;
      }
      const cleaned = (list as string[]).map((v) => v.trim()).filter(Boolean);
      return cleaned.length === 0
        ? undefined
        : restrictToOptions(definition, cleaned);
    }
  }
};

/** Every leaf `table.key` of a parsed file (one level of tables, as config.toml has). */
const leafPaths = (doc: Record<string, unknown>): Array<[string, unknown]> =>
  _.flatMap(Object.entries(doc), ([section, value]) =>
    _.isPlainObject(value)
      ? Object.entries(value as Record<string, unknown>).map(
          ([key, leaf]): [string, unknown] => [`${section}.${key}`, leaf],
        )
      : [[section, value] as [string, unknown]],
  );

const isFileOnlyPath = (path: string) => {
  const [section, key] = path.split('.');
  return FILE_ONLY_CONFIG_KEYS[section]?.includes(key) ?? false;
};

/**
 * The System Settings values an existing `config.toml` carries, and the keys
 * it skips with the reason. A file that does not parse returns its error.
 */
export const importConfigToml = (text: string): ConfigTomlImport => {
  let doc: Record<string, unknown>;
  try {
    doc = parseToml(text) as Record<string, unknown>;
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  const definitionByPath = new Map<string, WebUISettingDefinition>();
  for (const definition of WEBUI_SETTING_DEFINITIONS) {
    for (const path of tomlPathsOf(definition)) {
      definitionByPath.set(path, definition);
    }
  }

  const leaves = leafPaths(doc);
  const present = new Set(leaves.map(([path]) => path));
  const imported: ImportedSetting[] = [];
  const skipped: SkippedKey[] = [];
  for (const [path, raw] of leaves) {
    const definition = definitionByPath.get(path);
    if (!definition) {
      if (!isFileOnlyPath(path)) skipped.push({ path, reason: 'unknown' });
      continue;
    }
    // Two spellings of one setting: only the earlier one in tomlPathsOf is
    // read, as the old parser's `a ?? b` did, even when its value is invalid.
    const paths = tomlPathsOf(definition);
    if (paths.slice(0, paths.indexOf(path)).some((p) => present.has(p))) {
      skipped.push({ path, reason: 'duplicate' });
      continue;
    }
    const value = coerce(definition, raw);
    if (value === null || !isApplicableSettingValue(definition, value)) {
      skipped.push({ path, reason: 'invalid' });
    } else {
      imported.push({ definition, path, value });
    }
  }
  return { ok: true, imported, skipped };
};

/**
 * A `config.toml` from the deployment's file-only keys (`fileConfig`) and, with
 * `includeSettings`, every setting at the path the import reads it from: the
 * full file copies a deployment's System Settings to another, the slim one is
 * the file a deployment keeps now (ADR 0026, section 3).
 */
export const exportConfigToml = ({
  valueOf,
  fileConfig,
  includeSettings,
}: {
  valueOf: (definition: WebUISettingDefinition) => unknown;
  fileConfig?: object | null;
  includeSettings: boolean;
}): string => {
  const doc: Record<string, Record<string, unknown>> = {};
  for (const [section, keys] of Object.entries(FILE_ONLY_CONFIG_KEYS)) {
    const table = (fileConfig as Record<string, unknown> | null)?.[section];
    if (!_.isPlainObject(table)) continue;
    for (const key of keys) {
      const value = (table as Record<string, unknown>)[key];
      if (value !== undefined) (doc[section] ??= {})[key] = value;
    }
  }
  if (includeSettings) {
    // The file goes to another site: its endpoint and domain are left to fill in.
    Object.assign((doc.general ??= {}), { apiEndpoint: '', apiDomainName: '' });
    for (const definition of WEBUI_SETTING_DEFINITIONS) {
      const value = valueOf(definition);
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        continue;
      }
      const [section, key] = tomlPathsOf(definition)[0].split('.');
      // The previous parser split lists from a comma string.
      (doc[section] ??= {})[key] = Array.isArray(value)
        ? value.join(',')
        : value;
    }
  }
  return stringifyToml(doc);
};
