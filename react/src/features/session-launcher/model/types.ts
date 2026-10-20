/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { NamePath } from '../../../form-engine';

export type { NamePath };

export type Loadable<T> = { status: 'loading' } | { status: 'ready'; value: T };

/** An `optional` input the host does not have is absent, not `undefined`. */
export type LauncherInputs = Readonly<Record<string, Loadable<unknown>>>;

/** The `value` of every ready input; what a rule's `run` receives. */
export type ReadyInputs = Readonly<Record<string, unknown>>;

export type InputMode = 'required' | 'optional';

export type Provenance = 'user' | 'restored' | `rule:${string}`;

/** The model's fields, form-shaped (`{ resource: { cpu } }`). */
export type LauncherValues = Readonly<Record<string, unknown>>;

/** Keyed by `pathKey(path)`. */
export type ProvenanceMap = Readonly<Record<string, Provenance>>;

export interface LauncherState {
  values: LauncherValues;
  provenance: ProvenanceMap;
}

export type WritePolicy = 'force' | 'unless-user-set' | 'raise-only';

export interface PatchWrite {
  method: 'setFieldsValue' | 'setFieldValue';
  validateAfter?: NamePath[];
}

export interface Patch {
  path: NamePath;
  value: unknown;
  policy: WritePolicy;
  /** An i18n key; stored, not rendered yet. */
  reason: string;
  write: PatchWrite;
}

/** A patch `transition` applied, tagged with who wrote it. */
export interface AppliedPatch extends Patch {
  provenance: Provenance;
}

export type IntentEvent = { type: string; payload?: unknown };
export type DataArrivedEvent = { type: 'dataArrived'; keys: string[] };
export type RestoredEvent = {
  type: 'restored';
  from: 'url' | 'template' | 'reset';
  values: LauncherValues;
};
export type LauncherEvent = IntentEvent | DataArrivedEvent | RestoredEvent;

export interface RuleContext<I extends ReadyInputs = ReadyInputs> {
  values: LauncherValues;
  provenance: ProvenanceMap;
  event: LauncherEvent;
  inputs: I;
}

export interface Rule<I extends ReadyInputs = ReadyInputs> {
  id: string;
  reads: ReadonlyArray<NamePath>;
  writes: ReadonlyArray<NamePath>;
  /** Input keys; the rule is skipped while any is loading or absent. */
  needs?: ReadonlyArray<string>;
  run(context: RuleContext<I>): Patch[];
}

export type IntentReducer<P = unknown> = (
  values: LauncherValues,
  payload: P,
) => Patch[];

export interface SliceDefinition {
  name: string;
  fields: ReadonlyArray<NamePath>;
  intents: Readonly<Record<string, IntentReducer<never>>>;
  rules: ReadonlyArray<Rule>;
  inputs: Readonly<Record<string, InputMode>>;
}

export interface ComposedModel {
  slices: ReadonlyArray<SliceDefinition>;
  fields: ReadonlyArray<NamePath>;
  inputs: Readonly<Record<string, InputMode>>;
  intents: Readonly<Record<string, IntentReducer<never>>>;
  rules: ReadonlyArray<Rule>;
}

export const RESERVED_EVENT_TYPES: ReadonlyArray<string> = [
  'dataArrived',
  'restored',
];

export class LauncherModelError extends Error {
  name = 'LauncherModelError';
}
