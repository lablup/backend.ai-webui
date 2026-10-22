/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The batch-mode and HPC cards' intents (ADR 0013), migrated as-is from the
// handlers in `SessionLauncherPage`; ids are the Dependency map v2 rows (#10454).
import {
  defineSlice,
  getIn,
  type LauncherValues,
  type NamePath,
  type Patch,
  type PatchWrite,
} from '../model';
import * as _ from 'lodash-es';

export const BATCH_ENABLED = ['batch', 'enabled'];
export const SCHEDULE_DATE = ['batch', 'scheduleDate'];
export const COMMAND = ['batch', 'command'];
export const TIMEOUT_ENABLED = ['batch', 'timeoutEnabled'];
export const TIMEOUT = ['batch', 'timeout'];
export const TIMEOUT_UNIT = ['batch', 'timeoutUnit'];
export const HPC_AUTO = ['hpcOptimization', 'autoEnabled'];
export const OMP_THREADS = ['hpcOptimization', 'OMP_NUM_THREADS'];
export const OPENBLAS_THREADS = ['hpcOptimization', 'OPENBLAS_NUM_THREADS'];

const SET_FIELDS: PatchWrite = { method: 'setFieldsValue' };
const SET_FIELD: PatchWrite = { method: 'setFieldValue' };

const reasonOf = (id: string) => `sessionLauncher.rule.${id}`;

const patchOf = (
  id: string,
  path: NamePath,
  value: unknown,
  write: PatchWrite,
): Patch => ({ path, value, policy: 'force', reason: reasonOf(id), write });

/** The handler validates after its write, and also when it wrote nothing. */
const validateOnly = (id: string, path: NamePath): Patch =>
  patchOf(id, path, undefined, { method: 'none', validateAfter: [path] });

export type ScheduleToggledPayload = {
  checked: boolean;
  /** now + 2 min, computed by the caller so the reducer stays pure. */
  defaultScheduleDate: string;
};

export const batchSlice = defineSlice({
  name: 'batch',
  fields: [
    BATCH_ENABLED,
    SCHEDULE_DATE,
    COMMAND,
    TIMEOUT_ENABLED,
    TIMEOUT,
    TIMEOUT_UNIT,
    HPC_AUTO,
    OMP_THREADS,
    OPENBLAS_THREADS,
  ],
  inputs: {},
  intents: {
    // P-08: enabling with no date proposes now + 2 min; disabling clears it.
    scheduleToggled: (
      values: LauncherValues,
      { checked, defaultScheduleDate }: ScheduleToggledPayload,
    ) => [
      ...(checked && _.isEmpty(getIn(values, SCHEDULE_DATE))
        ? [patchOf('P-08', SCHEDULE_DATE, defaultScheduleDate, SET_FIELD)]
        : checked === false
          ? [patchOf('P-08', SCHEDULE_DATE, undefined, SET_FIELD)]
          : []),
      validateOnly('P-08', SCHEDULE_DATE),
    ],
    // P-12: disabling the timeout clears it.
    timeoutToggled: (_values: LauncherValues, checked: boolean) => [
      ...(checked === false
        ? [patchOf('P-12', TIMEOUT, undefined, SET_FIELD)]
        : []),
      validateOnly('P-12', TIMEOUT),
    ],
    // P-17: one `setFieldsValue({ hpcOptimization })`, one patch per key.
    // [bug-compat] H23: the defaults reach the URL only through the switch's own edit.
    hpcAutoToggled: (_values: LauncherValues, checked: boolean) =>
      checked
        ? [
            patchOf('P-17', HPC_AUTO, true, SET_FIELDS),
            patchOf('P-17', OMP_THREADS, undefined, SET_FIELDS),
            patchOf('P-17', OPENBLAS_THREADS, undefined, SET_FIELDS),
          ]
        : [
            patchOf('P-17', HPC_AUTO, false, SET_FIELDS),
            patchOf('P-17', OMP_THREADS, '1', SET_FIELDS),
            patchOf('P-17', OPENBLAS_THREADS, '1', SET_FIELDS),
          ],
  },
  rules: [],
});
