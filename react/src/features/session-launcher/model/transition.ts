/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { compareNumberWithUnits } from '../../../helper';
import { getIn, includesPath, pathKey, setIn, toPath } from './path';
import { ruleProvenance } from './provenance';
import {
  LauncherModelError,
  type AppliedPatch,
  type ComposedModel,
  type DataArrivedEvent,
  type LauncherEvent,
  type LauncherInputs,
  type LauncherState,
  type NamePath,
  type Patch,
  type Provenance,
  type ReadyInputs,
  type RestoredEvent,
  type Rule,
} from './types';
import * as _ from 'lodash-es';

/** Passes `transition` runs over the rule list before giving up. */
export const settleLimit = 4;

/** The rules did not settle within `settleLimit` passes; carries the last state. */
export class LauncherInvariantError extends Error {
  name = 'LauncherInvariantError';
  constructor(
    message: string,
    readonly state: LauncherState,
    readonly patches: AppliedPatch[],
  ) {
    super(message);
  }
}

const SIZE_KEYS = ['mem', 'shmem'];

const isSizePath = (path: NamePath) =>
  SIZE_KEYS.includes(String(_.last(toPath(path))));

/**
 * Strict: `'4g'` over `'4096m'` is a change, since the stored string picks the
 * unit the input displays. Size order matters only to `raise-only`.
 */
export const isSameFieldValue = (
  _path: NamePath,
  a: unknown,
  b: unknown,
): boolean => _.isEqual(a, b);

const isGreater = (path: NamePath, next: unknown, current: unknown) => {
  if (_.isNil(current)) return true;
  if (_.isNumber(next) && _.isNumber(current)) return next > current;
  if (isSizePath(path) && _.isString(next) && _.isString(current)) {
    return compareNumberWithUnits(next, current) > 0;
  }
  return false;
};

const isRestored = (event: LauncherEvent): event is RestoredEvent =>
  event.type === 'restored';
const isDataArrived = (event: LauncherEvent): event is DataArrivedEvent =>
  event.type === 'dataArrived';

const isRuleRunnable = (rule: Rule, inputs: LauncherInputs) =>
  (rule.needs ?? []).every((key) => inputs[key]?.status === 'ready');

const readyInputsOf = (inputs: LauncherInputs): ReadyInputs => {
  const ready: Record<string, unknown> = {};
  for (const [key, loadable] of Object.entries(inputs)) {
    if (loadable.status === 'ready') ready[key] = loadable.value;
  }
  return ready;
};

/**
 * Applies `event`, then runs every rule in order until a pass applies no
 * patch. Returns the next state and every applied patch, in order.
 */
export const transition = (
  model: ComposedModel,
  state: LauncherState,
  event: LauncherEvent,
  inputs: LauncherInputs,
): { state: LauncherState; patches: AppliedPatch[] } => {
  let values = state.values;
  const provenance: Record<string, Provenance> = { ...state.provenance };
  const applied: AppliedPatch[] = [];

  const write = (patch: Patch, source: Provenance) => {
    values = setIn(values, patch.path, patch.value);
    provenance[pathKey(patch.path)] = source;
    applied.push({ ...patch, provenance: source });
  };

  const apply = (
    patches: Patch[],
    source: Provenance,
    allowed: ReadonlyArray<NamePath>,
  ) => {
    let count = 0;
    for (const patch of patches) {
      // A validate-only patch never changes a value, so it never keeps the loop going.
      if (patch.write.method === 'none') {
        applied.push({ ...patch, provenance: source });
        continue;
      }
      if (!includesPath(allowed, patch.path)) {
        throw new LauncherModelError(
          `${source} wrote '${pathKey(patch.path)}' outside its writes`,
        );
      }
      const key = pathKey(patch.path);
      const current = getIn(values, patch.path);
      if (patch.policy === 'unless-user-set' && provenance[key] === 'user') {
        continue;
      }
      if (
        patch.policy === 'raise-only' &&
        !isGreater(patch.path, patch.value, current)
      ) {
        continue;
      }
      if (isSameFieldValue(patch.path, patch.value, current)) {
        // The form already holds what the user typed; the act still claims it.
        if (source === 'user') provenance[key] = source;
        continue;
      }
      write(patch, source);
      count += 1;
    }
    return count;
  };

  if (isRestored(event)) {
    for (const path of model.fields) {
      const next = getIn(event.values, path);
      if (!isSameFieldValue(path, next, getIn(values, path))) {
        write(
          {
            path,
            value: next,
            policy: 'force',
            reason: '',
            write: { method: 'setFieldsValue' },
          },
          'restored',
        );
      }
      provenance[pathKey(path)] = 'restored';
    }
  }

  const readyInputs = readyInputsOf(inputs);
  if (!isRestored(event) && !isDataArrived(event)) {
    const reducer = model.intents[event.type];
    if (!reducer) {
      throw new LauncherModelError(`unknown intent '${event.type}'`);
    }
    apply(
      reducer(values, event.payload as never, readyInputs),
      'user',
      model.fields,
    );
  }

  for (let pass = 0; pass < settleLimit; pass++) {
    let count = 0;
    for (const rule of model.rules) {
      if (!isRuleRunnable(rule, inputs)) continue;
      const patches = rule.run({
        values,
        provenance,
        event,
        inputs: readyInputs,
        pass,
      });
      count += apply(patches, ruleProvenance(rule.id), rule.writes);
    }
    if (count === 0) {
      return { state: { values, provenance }, patches: applied };
    }
  }
  throw new LauncherInvariantError(
    `rules did not settle within ${settleLimit} passes`,
    { values, provenance },
    applied,
  );
};
