/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import {
  getResourceAvailability,
  getShmemMaxLimit,
  isMatchingMaxPerContainer,
  toPerContainerCap,
} from './useResourceLimitAndRemaining';

describe('getConfigName', () => {
  test('should match unknown devices', () => {
    expect(
      isMatchingMaxPerContainer('maxCUDADevicesPerContainer', 'cuda.device'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer('maxCUDASharesPerContainer', 'cuda.shares'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer('maxROCMDevicesPerContainer', 'rocm.device'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer('maxTPUDevicesPerContainer', 'tpu.device'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer('maxIPUDevicesPerContainer', 'ipu.device'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer('maxATOMDevicesPerContainer', 'atom.device'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer(
        'maxATOMPLUSDevicesPerContainer',
        'atom-plus.device',
      ),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer(
        'maxGaudi2DevicesPerContainer',
        'gaudi2.device',
      ),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer(
        'maxWarboyDevicesPerContainer',
        'warboy.device',
      ),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer('maxRNGDDevicesPerContainer', 'rngd.device'),
    ).toBe(true);
    expect(
      isMatchingMaxPerContainer(
        'maxHyperaccelLPUDevicesPerContainer',
        'hyperaccel-lpu.device',
      ),
    ).toBe(true);
  });
});

describe('getShmemMaxLimit', () => {
  test('is maxShmPerContainer in GiB', () => {
    expect(getShmemMaxLimit(2)).toBe('2g');
    expect(getShmemMaxLimit(0.5)).toBe('0.5g');
  });

  test('a missing, zero or non-numeric value sets no cap', () => {
    expect(getShmemMaxLimit(undefined)).toBeUndefined();
    expect(getShmemMaxLimit(0)).toBeUndefined();
    expect(getShmemMaxLimit(-1)).toBeUndefined();
    expect(getShmemMaxLimit('4')).toBeUndefined();
  });
});

describe('toPerContainerCap', () => {
  test('a number is the cap, 0 included', () => {
    expect(toPerContainerCap(64)).toBe(64);
    expect(toPerContainerCap(0.5)).toBe(0.5);
    expect(toPerContainerCap(0)).toBe(0);
  });

  test('an unset or non-numeric value sets no cap', () => {
    expect(toPerContainerCap(undefined)).toBeUndefined();
    expect(toPerContainerCap('8')).toBeUndefined();
    expect(toPerContainerCap(NaN)).toBeUndefined();
  });
});

describe('getResourceAvailability', () => {
  const info = {} as Parameters<typeof getResourceAvailability>[0];

  test('a failed preset check is loadFailed', () => {
    expect(getResourceAvailability(null, 8, 32)).toBe('loadFailed');
  });

  test('a resource group without CPU or memory is empty', () => {
    expect(getResourceAvailability(info, 0, 32)).toBe('empty');
    expect(getResourceAvailability(info, 8, 0)).toBe('empty');
  });

  test('a resource group with capacity, or an unknown one, is available', () => {
    expect(getResourceAvailability(info, 8, 32)).toBe('available');
    expect(getResourceAvailability(info, undefined, undefined)).toBe(
      'available',
    );
  });
});
