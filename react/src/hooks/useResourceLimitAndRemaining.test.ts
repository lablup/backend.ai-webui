/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import {
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
  test('a positive number is the cap', () => {
    expect(toPerContainerCap(64)).toBe(64);
    expect(toPerContainerCap(0.5)).toBe(0.5);
  });

  test('a missing, zero or non-numeric value sets no cap', () => {
    expect(toPerContainerCap(undefined)).toBeUndefined();
    expect(toPerContainerCap(0)).toBeUndefined();
    expect(toPerContainerCap(-1)).toBeUndefined();
    expect(toPerContainerCap('8')).toBeUndefined();
  });
});
