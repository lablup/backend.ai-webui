/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { compose } from './compose';
import { defineSlice } from './slice';
import { CPU, KIND, modeSlice, sizeSlice } from './testing/syntheticModel';
import { LauncherModelError, type Rule } from './types';
import { describe, expect, it } from 'vitest';

const crossRule = (overrides: Partial<Rule>): Rule => ({
  id: 'X-99',
  reads: [],
  writes: [],
  run: () => [],
  ...overrides,
});

describe('compose', () => {
  it('merges fields, intents and inputs; required wins over optional', () => {
    const model = compose([
      sizeSlice,
      modeSlice,
      defineSlice({
        name: 'extra',
        fields: [['extra', 'flag']],
        inputs: { hint: 'required' },
        intents: {},
        rules: [],
      }),
    ]);
    expect(model.fields).toEqual([
      ['size', 'cpu'],
      ['size', 'mem'],
      ['size', 'shmem'],
      ['mode', 'kind'],
      ['extra', 'flag'],
    ]);
    expect(Object.keys(model.intents)).toEqual([
      'cpuEdited',
      'memEdited',
      'kindSelected',
    ]);
    expect(model.inputs).toEqual({ limits: 'required', hint: 'required' });
  });

  it('throws when two slices own the same field', () => {
    const clash = defineSlice({
      name: 'clash',
      fields: [['size', 'cpu']],
      inputs: {},
      intents: {},
      rules: [],
    });
    expect(() => compose([sizeSlice, clash])).toThrow(/size\.cpu/);
  });

  it('throws when two slices define the same intent', () => {
    const clash = defineSlice({
      name: 'clash',
      fields: [['clash', 'x']],
      inputs: {},
      intents: { cpuEdited: () => [] },
      rules: [],
    });
    expect(() => compose([sizeSlice, clash])).toThrow(/cpuEdited/);
  });

  it('accepts a cross rule that spans two slices', () => {
    expect(() =>
      compose([sizeSlice, modeSlice], {
        crossRules: [crossRule({ reads: [KIND], writes: [CPU] })],
      }),
    ).not.toThrow();
  });

  it('throws when a cross rule reads or writes outside the model', () => {
    expect(() =>
      compose([sizeSlice], { crossRules: [crossRule({ reads: [KIND] })] }),
    ).toThrow(LauncherModelError);
    expect(() =>
      compose([sizeSlice], {
        crossRules: [crossRule({ writes: [['nowhere', 'x']] })],
      }),
    ).toThrow(/nowhere\.x/);
  });

  it('throws when a rule needs an input no slice declares', () => {
    expect(() =>
      compose([sizeSlice], {
        crossRules: [crossRule({ needs: ['images'] })],
      }),
    ).toThrow(/images/);
  });

  it('throws on an intent named like a built-in event', () => {
    const reserved = defineSlice({
      name: 'reserved',
      fields: [['reserved', 'x']],
      inputs: {},
      intents: { restored: () => [] },
      rules: [],
    });
    expect(() => compose([reserved])).toThrow(/reserved/);
  });

  it('throws on duplicate rule ids', () => {
    expect(() =>
      compose([sizeSlice], { crossRules: [crossRule({ id: 'S-01' })] }),
    ).toThrow(/S-01/);
  });
});

describe('defineSlice', () => {
  it('rejects a rule that touches another slice’s field', () => {
    expect(() =>
      defineSlice({
        name: 'bad',
        fields: [['bad', 'a']],
        inputs: {},
        intents: {},
        rules: [crossRule({ id: 'B-01', writes: [CPU] })],
      }),
    ).toThrow(/does not own/);
  });
});
