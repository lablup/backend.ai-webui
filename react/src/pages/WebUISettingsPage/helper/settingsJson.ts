/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { isValidPluginPath } from '../../../helper/pluginPath';
import {
  isValidWebUISettingValue,
  restrictToOptions,
  WEBUI_SETTING_DEFINITIONS,
  type WebUISettingDefinition,
  type WebUISettingScope,
} from '../../../helper/webuiSettings';
import * as _ from 'lodash-es';

/** The settings as the two app config documents hold them (ADR 0028). */
export type SettingsJson = Record<WebUISettingScope, Record<string, unknown>>;

const SCOPES: ReadonlyArray<WebUISettingScope> = ['public', 'domain'];

/** Every setting under its scope, with the value `valueOf` gives (saved, else the default). */
export const toSettingsJson = (
  valueOf: (definition: WebUISettingDefinition) => unknown,
): SettingsJson => {
  const json: SettingsJson = { public: {}, domain: {} };
  for (const definition of WEBUI_SETTING_DEFINITIONS) {
    json[definition.scope][definition.key] = valueOf(definition);
  }
  return json;
};

/** Whether `value` can be set; plugin paths follow the page's path input. */
export const isApplicableSettingValue = (
  definition: WebUISettingDefinition,
  value: unknown,
): boolean => {
  if (!isValidWebUISettingValue(definition.type, value)) return false;
  if (definition.key === 'pluginLogin') {
    return value === '' || isValidPluginPath(value as string);
  }
  if (definition.key === 'pluginPage') {
    return (value as string[]).every(isValidPluginPath);
  }
  return true;
};

export interface SettingsJsonIssue {
  /** `scope.key`, or the scope alone when the whole entry is wrong. */
  path: string;
  reason: 'unknown' | 'invalid';
}

export type SettingsJsonParse =
  | {
      ok: true;
      values: Array<{ definition: WebUISettingDefinition; value: unknown }>;
    }
  | { ok: false; error: string }
  | { ok: false; issues: SettingsJsonIssue[] };

/**
 * The settings a JSON document of `toSettingsJson`'s shape sets. A key left
 * out keeps its value; anything that cannot be applied is reported instead.
 */
export const parseSettingsJson = (text: string): SettingsJsonParse => {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
  if (!_.isPlainObject(doc)) {
    return { ok: false, issues: [{ path: '(root)', reason: 'invalid' }] };
  }
  const values: Array<{ definition: WebUISettingDefinition; value: unknown }> =
    [];
  const issues: SettingsJsonIssue[] = [];
  for (const [scope, entries] of Object.entries(doc as object)) {
    if (!SCOPES.includes(scope as WebUISettingScope)) {
      issues.push({ path: scope, reason: 'unknown' });
      continue;
    }
    if (!_.isPlainObject(entries)) {
      issues.push({ path: scope, reason: 'invalid' });
      continue;
    }
    for (const [key, raw] of Object.entries(entries as object)) {
      const definition = WEBUI_SETTING_DEFINITIONS.find(
        (d) => d.key === key && d.scope === scope,
      );
      if (!definition) {
        issues.push({ path: `${scope}.${key}`, reason: 'unknown' });
        continue;
      }
      const value = restrictToOptions(definition, raw);
      if (!isApplicableSettingValue(definition, value)) {
        issues.push({ path: `${scope}.${key}`, reason: 'invalid' });
        continue;
      }
      values.push({ definition, value });
    }
  }
  return issues.length > 0 ? { ok: false, issues } : { ok: true, values };
};
