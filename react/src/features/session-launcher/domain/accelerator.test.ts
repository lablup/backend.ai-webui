/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  acceleratorTypeChange,
  getUnifiedSlotNameFromTag,
  isUnifiedAcceleratorSlot,
  resolveAcceleratorType,
  shouldClearUnifiedAccelerator,
  shouldResetAcceleratorToZero,
} from './accelerator';

describe('isUnifiedAcceleratorSlot', () => {
  it.each([
    ['cuda.unified', true],
    ['cuda.device', false],
    ['', false],
    [undefined, false],
    [null, false],
  ])('%s -> %s', (slot, expected) => {
    expect(isUnifiedAcceleratorSlot(slot)).toBe(expected);
  });
});

describe('getUnifiedSlotNameFromTag', () => {
  it.each([
    ['unified-slot:cuda.unified', 'cuda.unified'],
    ['foo, unified-slot:cuda.unified', 'cuda.unified'],
    ['unified-slot:cuda.device', undefined],
    ['other', undefined],
    [null, undefined],
  ])('%s -> %s', (tag, expected) => {
    expect(getUnifiedSlotNameFromTag(tag)).toBe(expected);
  });
});

describe('resolveAcceleratorType (R-04)', () => {
  it.each([
    {
      name: 'keeps a type the RG offers',
      current: 'rocm.device',
      slots: { 'cuda.device': 'count', 'rocm.device': 'count' },
      expected: 'rocm.device',
    },
    {
      name: 'falls back to the first RG slot',
      current: 'atom.device',
      slots: { 'cuda.device': 'count', 'rocm.device': 'count' },
      expected: 'cuda.device',
    },
    {
      name: 'picks the first RG slot when unset',
      current: undefined,
      slots: { 'cuda.shares': 'count' },
      expected: 'cuda.shares',
    },
    {
      name: 'keeps the current type when the RG has no accelerator',
      current: 'cuda.device',
      slots: {},
      expected: 'cuda.device',
    },
    {
      name: 'keeps the current type while RG slots are loading',
      current: 'cuda.device',
      slots: undefined,
      expected: 'cuda.device',
    },
  ])('$name', ({ current, slots, expected }) => {
    expect(
      resolveAcceleratorType({
        currentAcceleratorType: current,
        acceleratorSlotsInRG: slots,
      }),
    ).toBe(expected);
  });
});

describe('shouldClearUnifiedAccelerator (R-07)', () => {
  it.each([
    ['cuda.unified', 2, true],
    ['cuda.unified', 0, true],
    ['cuda.unified', undefined, false],
    ['cuda.device', 2, false],
    [undefined, 2, false],
  ])('%s / %s -> %s', (acceleratorType, accelerator, expected) => {
    expect(
      shouldClearUnifiedAccelerator({ acceleratorType, accelerator }),
    ).toBe(expected);
  });
});

describe('shouldResetAcceleratorToZero (R-02)', () => {
  it.each([
    { supported: [], type: 'cuda.device', value: 2, expected: true },
    { supported: [], type: 'cuda.device', value: 0, expected: false },
    { supported: [], type: 'cuda.unified', value: 2, expected: false },
    { supported: [], type: undefined, value: undefined, expected: true },
    {
      supported: ['cuda.device'],
      type: 'cuda.device',
      value: 2,
      expected: false,
    },
    { supported: undefined, type: 'cuda.device', value: 2, expected: false },
  ])(
    'supported=$supported type=$type value=$value -> $expected',
    ({ supported, type, value, expected }) => {
      expect(
        shouldResetAcceleratorToZero({
          supportedAcceleratorTypes: supported,
          acceleratorType: type,
          accelerator: value,
        }),
      ).toBe(expected);
    },
  );
});

describe('acceleratorTypeChange (R-19)', () => {
  const acceleratorLimits = {
    'cuda.device': { min: 1, max: 8 },
    'cuda.shares': { max: 8 },
  };
  it.each([
    {
      name: 'entering a unified slot clears the value',
      nextType: 'cuda.unified',
      current: 'cuda.device',
      expected: { kind: 'enter-unified' },
    },
    {
      name: 'leaving a unified slot resets to the new minimum',
      nextType: 'cuda.device',
      current: 'cuda.unified',
      expected: { kind: 'leave-unified', accelerator: 1 },
    },
    {
      name: 'leaving a unified slot without a minimum resets to 0',
      nextType: 'cuda.shares',
      current: 'cuda.unified',
      expected: { kind: 'leave-unified', accelerator: 0 },
    },
    {
      name: 'discrete to discrete keeps the value',
      nextType: 'cuda.shares',
      current: 'cuda.device',
      expected: { kind: 'none' },
    },
  ])('$name', ({ nextType, current, expected }) => {
    expect(
      acceleratorTypeChange({
        nextType,
        currentAcceleratorType: current,
        acceleratorLimits,
      }),
    ).toEqual(expected);
  });
});
