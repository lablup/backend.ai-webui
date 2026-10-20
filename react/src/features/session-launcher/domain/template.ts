/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// P-22: what picking a recent-history / template row writes into the launcher.
import { normalizeLegacyMountFields } from '../../../helper/vfolderMounts';
import {
  getIn,
  setIn,
  toPath,
  type LauncherValues,
  type NamePath,
} from '../model';
import * as _ from 'lodash-es';

/**
 * The fields a template restore resets before merging the stored values.
 * [bug-compat] H10: `resource`, `allocationPreset`, `cluster_*`,
 * `hpcOptimization`, `envvars` and `resourceGroup` are not reset, so a
 * template without them keeps the current ones.
 */
const templateResetValues = () => ({
  sessionName: '',
  ports: [],
  vfolderMounts: [],
  bootstrap_script: '',
  num_of_sessions: 1,
  environments: {
    manual: '',
  },
  batch: {
    enabled: false,
    command: undefined,
    scheduleDate: undefined,
  },
  reuseIfExists: false,
  agent: ['auto'],
});

/**
 * The reset object ∪ the stored values (`_.merge`, so arrays merge by index),
 * with a random suffix on a non-empty session name. `randomSuffix` is called
 * only for that name.
 */
export const buildTemplateFieldsValue = (
  formValue: object,
  randomSuffix: () => string,
): Record<string, unknown> => {
  const fieldsValue: Record<string, unknown> = _.merge(
    templateResetValues(),
    normalizeLegacyMountFields(formValue),
  );
  if (!_.isEmpty(fieldsValue.sessionName)) {
    fieldsValue.sessionName = fieldsValue.sessionName + '-' + randomSuffix();
  }
  return fieldsValue;
};

/**
 * P-22 split: today's one `setFieldsValue(values)` becomes this part, written
 * by the page, then `pickOwnedPaths` through the model.
 */
export const omitOwnedPaths = (
  values: Record<string, unknown>,
  owned: ReadonlyArray<NamePath>,
): Record<string, unknown> => {
  const rest = _.cloneDeep(values);
  for (const path of owned) _.unset(rest, toPath(path));
  return rest;
};

/**
 * The owned paths of `values`; a path `values` does not carry keeps its
 * `current` value, as the store's deep merge leaves it ([bug-compat] H10).
 */
export const pickOwnedPaths = (
  values: Record<string, unknown>,
  owned: ReadonlyArray<NamePath>,
  current: LauncherValues,
): LauncherValues =>
  owned.reduce<LauncherValues>((picked, path) => {
    const segments = toPath(path);
    return setIn(
      picked,
      path,
      _.has(values, segments) ? _.get(values, segments) : getIn(current, path),
    );
  }, {});
