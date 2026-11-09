/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  findWebUISettingDefinition,
  webuiSettingGroupLabelKey,
  webuiSettingLabelKey,
} from '../helper/webuiSettings';
import type { DiagnosticResult } from '../types/diagnostics';
import type { TFunction } from 'i18next';

/** A result's interpolation values, with `{{setting}}` / `{{group}}` as System Settings shows them. */
export const diagnosticValues = (
  result: DiagnosticResult,
  t: TFunction,
): Record<string, string> => {
  const definition = result.settingKey
    ? findWebUISettingDefinition(result.settingKey)
    : undefined;
  return definition
    ? {
        ...result.interpolationValues,
        setting: t(webuiSettingLabelKey(definition.key)),
        group: t(webuiSettingGroupLabelKey(definition.group)),
      }
    : (result.interpolationValues ?? {});
};

/** The translated title, description and remediation of a result. */
export const diagnosticText = (result: DiagnosticResult, t: TFunction) => {
  const values = diagnosticValues(result, t);
  return {
    title: t(result.titleKey, values),
    description: t(result.descriptionKey, values),
    remediation: result.remediationKey ? t(result.remediationKey, values) : '',
  };
};
