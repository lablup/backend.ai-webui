/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The launcher's `?step=&formValues=` format (P-03, P-04, P-33). The page keeps
// the 500 ms debounce and the nuqs calls; the format lives here.
import {
  sanitizeSensitiveEnv,
  type EnvVarFormListValue,
} from '../../../components/EnvVarFormList';
import { normalizeLegacyMountFields } from '../../../helper/vfolderMounts';
import type { SessionLauncherFormValue } from '../../../pages/SessionLauncherPage';
import * as _ from 'lodash-es';

export type LauncherUrlFormValues = DeepPartial<SessionLauncherFormValue>;

/** P-03: lodash deep paths, never written to `?formValues=`. */
export const URL_OMITTED_PATHS = [
  'environments.image',
  'environments.customizedTag',
  'envvars',
];

/**
 * P-03/P-04: the object nuqs serializes into `?formValues=`. `values` is the
 * registered-fields snapshot (`form.getFieldsValue()`, H22).
 * [bug-compat] P-04: `/PIN/` blanks `SPINNER` too.
 */
export const toUrlFormValues = (
  values: Record<string, unknown>,
): LauncherUrlFormValues =>
  _.assign(_.omit(values, URL_OMITTED_PATHS), {
    envvars: sanitizeSensitiveEnv(values.envvars as EnvVarFormListValue[]),
  }) as LauncherUrlFormValues;

/** The `?formValues=` value, before URL encoding, as nuqs's `parseAsJson` writes it. */
export const encodeLauncherFormValues = (values: Record<string, unknown>) =>
  JSON.stringify(toUrlFormValues(values));

/**
 * P-33: the `parseAsJson` validator. Legacy `mount_ids` fields become
 * `vfolderMounts`; a non-object throws, which nuqs reads as "no value".
 */
export const parseUrlFormValues = (value: unknown): LauncherUrlFormValues =>
  normalizeLegacyMountFields(value as LauncherUrlFormValues);

/**
 * What the page's nuqs parsers read from `search`: `step` as `parseAsInteger`
 * (default 0), `formValues` as `parseAsJson(parseUrlFormValues)`; `null`
 * means absent or unparsable, where the page falls back to its defaults.
 */
export const decodeLauncherFormValues = (
  search: string,
): { step: number; formValues: LauncherUrlFormValues | null } => {
  const params = new URLSearchParams(search);
  const rawStep = params.get('step');
  const step = rawStep === null ? NaN : parseInt(rawStep);
  const rawFormValues = params.get('formValues');
  let formValues: LauncherUrlFormValues | null = null;
  if (rawFormValues !== null) {
    try {
      formValues = parseUrlFormValues(JSON.parse(rawFormValues));
    } catch {
      formValues = null;
    }
  }
  return { step: Number.isNaN(step) ? 0 : step, formValues };
};
