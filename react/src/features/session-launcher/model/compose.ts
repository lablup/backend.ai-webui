/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { pathKey } from './path';
import { pathsOutside } from './slice';
import {
  LauncherModelError,
  RESERVED_EVENT_TYPES,
  type ComposedModel,
  type InputMode,
  type NamePath,
  type Rule,
  type SliceDefinition,
} from './types';
import * as _ from 'lodash-es';

/**
 * Joins slices into one model: rules run in slice order, then `crossRules`.
 * Call it at module scope; it throws `LauncherModelError` on a broken contract.
 */
export const compose = (
  slices: ReadonlyArray<SliceDefinition>,
  { crossRules = [] }: { crossRules?: ReadonlyArray<Rule> } = {},
): ComposedModel => {
  const fail = (message: string) => {
    throw new LauncherModelError(`compose: ${message}`);
  };

  const owner: Record<string, string> = {};
  const fields: NamePath[] = [];
  for (const slice of slices) {
    for (const field of slice.fields) {
      const key = pathKey(field);
      if (owner[key]) {
        fail(`field '${key}' is owned by both ${owner[key]} and ${slice.name}`);
      }
      owner[key] = slice.name;
      fields.push(field);
    }
  }

  const intents: ComposedModel['intents'] = {};
  for (const slice of slices) {
    for (const name of Object.keys(slice.intents)) {
      if (RESERVED_EVENT_TYPES.includes(name)) {
        fail(`intent name '${name}' in ${slice.name} is reserved`);
      }
      if (_.has(intents, name)) {
        fail(`intent '${name}' is defined by more than one slice`);
      }
    }
    Object.assign(intents, slice.intents);
  }

  // An input declared required by any slice is required for the model.
  const inputs: Record<string, InputMode> = {};
  for (const slice of slices) {
    for (const [key, mode] of Object.entries(slice.inputs)) {
      inputs[key] = inputs[key] === 'required' ? 'required' : mode;
    }
  }

  for (const rule of crossRules) {
    const foreign = pathsOutside([...rule.reads, ...rule.writes], fields);
    if (foreign.length > 0) {
      fail(
        `cross rule ${rule.id} touches fields outside the model: ${foreign}`,
      );
    }
  }

  const rules = [...slices.flatMap((slice) => slice.rules), ...crossRules];
  const ids = rules.map((rule) => rule.id);
  const duplicateIds = _.uniq(ids.filter((id, i) => ids.indexOf(id) !== i));
  if (duplicateIds.length > 0) {
    fail(`duplicate rule ids ${duplicateIds.join(', ')}`);
  }
  for (const rule of rules) {
    const undeclared = _.difference(rule.needs ?? [], Object.keys(inputs));
    if (undeclared.length > 0) {
      fail(`rule ${rule.id} needs undeclared inputs: ${undeclared}`);
    }
  }

  return { slices, fields, inputs, intents, rules };
};

/** Throws when the host lacks an input some slice declared `required`. */
export const assertRequiredInputs = (
  model: ComposedModel,
  inputs: Readonly<Record<string, unknown>>,
) => {
  const missing = Object.keys(model.inputs).filter(
    (key) => model.inputs[key] === 'required' && !(key in inputs),
  );
  if (missing.length > 0) {
    throw new LauncherModelError(`required inputs not provided: ${missing}`);
  }
};
