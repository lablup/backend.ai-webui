/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLauncherFormValue } from '../pages/SessionLauncherPage/SessionLauncherPage';
import { normalizeLegacyMountFields } from './vfolderMounts';
import { generateRandomString } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export type LauncherStepKey =
  'sessionType' | 'environment' | 'storage' | 'network' | 'review';

/** The session launcher's steps in order; an inference session has no storage step. */
export const launcherStepKeysOf = (
  sessionType: string | undefined,
): Array<LauncherStepKey> => [
  'sessionType',
  'environment',
  ...(sessionType === 'inference' ? [] : (['storage'] as const)),
  'network',
  'review',
];

/** The launcher's last step, "Confirm and Launch", as its `step` index. */
export const reviewStepOf = (sessionType: string | undefined) =>
  launcherStepKeysOf(sessionType).length - 1;

/**
 * A Recent History pick as launcher values: the optional and nested fields
 * reset, legacy mount fields normalized, and a fresh name so it does not clash.
 */
export const launcherValueFromHistory = (
  formValue: SessionLauncherFormValue,
): SessionLauncherFormValue => {
  const value = _.merge(
    {
      sessionName: '',
      ports: [],
      vfolderMounts: [],
      bootstrap_script: '',
      num_of_sessions: 1,
      environments: { manual: '' },
      batch: { enabled: false, command: undefined, scheduleDate: undefined },
      reuseIfExists: false,
      agent: ['auto'],
    } as unknown as SessionLauncherFormValue,
    normalizeLegacyMountFields(formValue),
  );
  if (!_.isEmpty(value.sessionName)) {
    value.sessionName = `${value.sessionName}-${generateRandomString(4)}`;
  }
  return value;
};
