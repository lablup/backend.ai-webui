/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { assertRequiredInputs, compose } from './compose';
import { getIn, pathKey } from './path';
import { defineSlice } from './slice';
import {
  CPU,
  KIND,
  loading,
  MEM,
  ready,
  syntheticModel,
  WRITE,
} from './testing/syntheticModel';
import {
  isSameFieldValue,
  LauncherInvariantError,
  settleLimit,
  transition,
} from './transition';
import {
  LauncherModelError,
  type LauncherInputs,
  type LauncherState,
  type Patch,
  type ProvenanceMap,
} from './types';
import { describe, expect, it } from 'vitest';

const base: LauncherState = {
  values: {
    size: { cpu: 2, mem: '4g', shmem: '64m' },
    mode: { kind: 'small' },
  },
  provenance: {},
};
const withValues = (values: LauncherState['values']): LauncherState => ({
  ...base,
  values,
});
const inputs: LauncherInputs = { limits: ready({ maxCpu: 8 }) };
const settle = { type: 'dataArrived', keys: [] } as const;

const ONE = ['one', 'value'];
const singleRuleModel = (patch: Patch) =>
  compose([
    defineSlice({
      name: 'one',
      fields: [ONE],
      inputs: {},
      intents: {},
      rules: [{ id: 'P-01', reads: [], writes: [ONE], run: () => [patch] }],
    }),
  ]);
const runOnce = (patch: Patch, current: unknown, provenance?: ProvenanceMap) =>
  transition(
    singleRuleModel(patch),
    { values: { one: { value: current } }, provenance: provenance ?? {} },
    settle,
    {},
  );
const oneValue = (result: ReturnType<typeof runOnce>) =>
  getIn(result.state.values, ONE);

describe('transition', () => {
  it('applies an intent with user provenance, then settles the rules', () => {
    const { state, patches } = transition(
      syntheticModel,
      base,
      { type: 'memEdited', payload: '8g' },
      inputs,
    );
    expect(state.values).toEqual({
      size: { cpu: 2, mem: '8g', shmem: '1g' },
      mode: { kind: 'small' },
    });
    expect(state.provenance).toEqual({
      'size.mem': 'user',
      'size.shmem': 'rule:S-02',
    });
    expect(
      patches.map((p) => [pathKey(p.path), p.value, p.provenance]),
    ).toEqual([
      ['size.mem', '8g', 'user'],
      ['size.shmem', '1g', 'rule:S-02'],
    ]);
  });

  it('records user provenance for an intent the form already holds', () => {
    const { state, patches } = transition(
      syntheticModel,
      base,
      { type: 'cpuEdited', payload: 2 },
      inputs,
    );
    expect(patches).toEqual([]);
    expect(state.provenance['size.cpu']).toBe('user');
  });

  it('drops no-op patches', () => {
    const { patches } = transition(syntheticModel, base, settle, inputs);
    expect(patches).toEqual([]);
  });

  it('writes a same-size mem/shmem string that differs, since the string picks the unit', () => {
    const { state, patches } = transition(
      syntheticModel,
      withValues({
        ...base.values,
        size: { cpu: 2, mem: '4g', shmem: '65536k' },
      }),
      settle,
      inputs,
    );
    expect(getIn(state.values, ['size', 'shmem'])).toBe('64m');
    expect(patches.map((p) => [pathKey(p.path), p.value])).toEqual([
      ['size.shmem', '64m'],
    ]);
  });

  it('compares field values strictly, never by size', () => {
    expect(isSameFieldValue(MEM, '4g', '4096m')).toBe(false);
    expect(isSameFieldValue(MEM, '4g', '4g')).toBe(true);
  });

  it('carries the write and reason through, and lists a path written twice twice', () => {
    const { patches } = transition(
      syntheticModel,
      base,
      { type: 'cpuEdited', payload: 12 },
      inputs,
    );
    expect(patches).toEqual([
      {
        path: CPU,
        value: 12,
        policy: 'force',
        reason: '',
        write: WRITE,
        provenance: 'user',
      },
      {
        path: CPU,
        value: 8,
        policy: 'force',
        reason: 'test.CpuCapped',
        write: { method: 'setFieldValue', validateAfter: [CPU] },
        provenance: 'rule:S-01',
      },
    ]);
  });

  it('runs cross rules after the slice rules', () => {
    const { state, patches } = transition(
      syntheticModel,
      withValues({ ...base.values, size: { cpu: 1, mem: '4g', shmem: '64m' } }),
      { type: 'kindSelected', payload: 'big' },
      inputs,
    );
    expect(getIn(state.values, CPU)).toBe(4);
    expect(patches.map((p) => p.provenance)).toEqual(['user', 'rule:X-01']);
  });

  it('throws on an unknown intent', () => {
    expect(() =>
      transition(syntheticModel, base, { type: 'nope' }, inputs),
    ).toThrow(LauncherModelError);
  });

  it('throws on a rule write outside its declared writes', () => {
    const model = compose([
      defineSlice({
        name: 'w',
        fields: [
          ['w', 'a'],
          ['w', 'b'],
        ],
        inputs: {},
        intents: {},
        rules: [
          {
            id: 'W-01',
            reads: [],
            writes: [['w', 'a']],
            run: () => [
              {
                path: ['w', 'b'],
                value: 1,
                policy: 'force',
                reason: '',
                write: WRITE,
              },
            ],
          },
        ],
      }),
    ]);
    expect(() =>
      transition(model, { values: {}, provenance: {} }, settle, {}),
    ).toThrow(/outside its writes/);
  });
});

describe('restored', () => {
  it('replaces every model field, absent ones with undefined, all marked restored', () => {
    const { state, patches } = transition(
      syntheticModel,
      { ...base, provenance: { 'size.cpu': 'user', 'mode.kind': 'user' } },
      {
        type: 'restored',
        from: 'template',
        values: { size: { cpu: 3, mem: '8g' }, other: { field: 'x' } },
      },
      inputs,
    );
    expect(state.values).toEqual({
      size: { cpu: 3, mem: '8g', shmem: '1g' },
      mode: { kind: undefined },
    });
    expect(state.provenance).toEqual({
      'size.cpu': 'restored',
      'size.mem': 'restored',
      'size.shmem': 'rule:S-02',
      'mode.kind': 'restored',
    });
    expect(patches.map((p) => [pathKey(p.path), p.provenance])).toEqual([
      ['size.cpu', 'restored'],
      ['size.mem', 'restored'],
      ['size.shmem', 'restored'],
      ['mode.kind', 'restored'],
      ['size.shmem', 'rule:S-02'],
    ]);
  });
});

describe('write policies', () => {
  const patchOf = (policy: Patch['policy'], value: unknown): Patch => ({
    path: ONE,
    value,
    policy,
    reason: '',
    write: WRITE,
  });

  it('force always writes', () => {
    const result = runOnce(patchOf('force', 1), 5, { 'one.value': 'user' });
    expect(oneValue(result)).toBe(1);
    expect(result.state.provenance['one.value']).toBe('rule:P-01');
  });

  it('unless-user-set skips a user value and overwrites any other', () => {
    const patch = patchOf('unless-user-set', 1);
    expect(oneValue(runOnce(patch, 5, { 'one.value': 'user' }))).toBe(5);
    expect(oneValue(runOnce(patch, 5, { 'one.value': 'restored' }))).toBe(1);
  });

  it('raise-only writes a larger number only', () => {
    expect(oneValue(runOnce(patchOf('raise-only', 4), 2))).toBe(4);
    expect(runOnce(patchOf('raise-only', 4), 6).patches).toEqual([]);
    expect(oneValue(runOnce(patchOf('raise-only', 4), undefined))).toBe(4);
  });

  it('raise-only compares mem/shmem strings by size', () => {
    const model = compose([
      defineSlice({
        name: 'm',
        fields: [MEM],
        inputs: {},
        intents: {},
        rules: [
          {
            id: 'R-01',
            reads: [],
            writes: [MEM],
            run: () => [
              {
                path: MEM,
                value: '2g',
                policy: 'raise-only',
                reason: '',
                write: WRITE,
              },
            ],
          },
        ],
      }),
    ]);
    const memAfter = (mem: string) =>
      getIn(
        transition(
          model,
          { values: { size: { mem } }, provenance: {} },
          settle,
          {},
        ).state.values,
        MEM,
      );
    expect(memAfter('1024m')).toBe('2g');
    expect(memAfter('4096m')).toBe('4096m');
  });
});

describe('settle limit', () => {
  const N = ['loop', 'n'];
  const counter = (cap: number) =>
    compose([
      defineSlice({
        name: 'loop',
        fields: [N],
        inputs: {},
        intents: {},
        rules: [
          {
            id: 'L-01',
            reads: [N],
            writes: [N],
            run: ({ values }) => [
              {
                path: N,
                value: Math.min(Number(getIn(values, N)) + 1, cap),
                policy: 'force',
                reason: '',
                write: WRITE,
              },
            ],
          },
        ],
      }),
    ]);
  const start = { values: { loop: { n: 0 } }, provenance: {} };

  it(`throws after ${settleLimit} passes that apply patches, carrying the last state`, () => {
    let error: unknown;
    try {
      transition(counter(Infinity), start, settle, {});
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(LauncherInvariantError);
    const invariant = error as LauncherInvariantError;
    expect(getIn(invariant.state.values, N)).toBe(settleLimit);
    expect(invariant.patches).toHaveLength(settleLimit);
  });

  it('converges when the last allowed pass applies nothing', () => {
    const { state } = transition(counter(settleLimit - 1), start, settle, {});
    expect(getIn(state.values, N)).toBe(settleLimit - 1);
  });

  it('throws when a cross rule and a slice rule fight over a field', () => {
    // X-01 raises cpu to 4, S-01 caps it at 3, every pass.
    expect(() =>
      transition(
        syntheticModel,
        base,
        { type: 'kindSelected', payload: 'big' },
        { limits: ready({ maxCpu: 3 }) },
      ),
    ).toThrow(LauncherInvariantError);
  });
});

describe('input gating', () => {
  const overCap = withValues({
    ...base.values,
    size: { cpu: 99, mem: '4g', shmem: '64m' },
  });

  it('skips a rule whose needed input is loading', () => {
    const { patches } = transition(syntheticModel, overCap, settle, {
      limits: loading,
    });
    expect(patches).toEqual([]);
  });

  it('skips a rule whose needed input is absent, required or not', () => {
    expect(transition(syntheticModel, overCap, settle, {}).patches).toEqual([]);
    const { state } = transition(syntheticModel, base, settle, inputs);
    expect(getIn(state.values, KIND)).toBe('small');
  });

  it('skips a rule whose optional input is loading', () => {
    const { state } = transition(syntheticModel, base, settle, {
      ...inputs,
      hint: loading,
    });
    expect(getIn(state.values, KIND)).toBe('small');
  });

  it('runs the rule with the unwrapped value once the input is ready', () => {
    const { state } = transition(syntheticModel, base, settle, {
      ...inputs,
      hint: ready('medium'),
    });
    expect(getIn(state.values, KIND)).toBe('medium');
    expect(state.provenance['mode.kind']).toBe('rule:M-01');
  });

  it('assertRequiredInputs throws when the host lacks a required input', () => {
    expect(() => assertRequiredInputs(syntheticModel, {})).toThrow(
      LauncherModelError,
    );
    expect(() =>
      assertRequiredInputs(syntheticModel, { limits: loading }),
    ).not.toThrow();
  });
});

describe('validate-only patches, passes and reducer inputs', () => {
  const VALIDATE: Patch = {
    path: ['one'],
    value: undefined,
    policy: 'force',
    reason: '',
    write: {
      method: 'none',
      validateAfter: [['one']],
      validateOptions: { recursive: true },
    },
  };

  it('keeps a validate-only patch without writing or holding the loop open', () => {
    const result = runOnce(VALIDATE, 'kept');
    expect(oneValue(result)).toBe('kept');
    expect(result.state.provenance).toEqual({});
    // Emitted every pass, yet the transition settles after the first.
    expect(result.patches).toEqual([{ ...VALIDATE, provenance: 'rule:P-01' }]);
  });

  it('hands rules the 0-based pass number', () => {
    const seen: number[] = [];
    const model = compose([
      defineSlice({
        name: 'one',
        fields: [ONE],
        inputs: {},
        intents: {},
        rules: [
          {
            id: 'P-01',
            reads: [],
            writes: [ONE],
            run: ({ pass }) => {
              seen.push(pass);
              return pass === 0
                ? [
                    {
                      path: ONE,
                      value: 'x',
                      policy: 'force',
                      reason: '',
                      write: WRITE,
                    },
                  ]
                : [];
            },
          },
        ],
      }),
    ]);
    transition(model, { values: {}, provenance: {} }, settle, {});
    expect(seen).toEqual([0, 1]);
  });

  it('hands intent reducers the ready inputs', () => {
    const model = compose([
      defineSlice({
        name: 'one',
        fields: [ONE],
        inputs: { source: 'required' },
        intents: {
          copied: (_values, _payload: undefined, readyInputs) => [
            {
              path: ONE,
              value: readyInputs.source,
              policy: 'force',
              reason: '',
              write: WRITE,
            },
          ],
        },
        rules: [],
      }),
    ]);
    const { state } = transition(
      model,
      { values: {}, provenance: {} },
      { type: 'copied' },
      { source: ready('from-input') },
    );
    expect(getIn(state.values, ONE)).toBe('from-input');
  });
});
