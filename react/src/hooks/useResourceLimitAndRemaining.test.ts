/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import {
  getShmemMaxLimit,
  isMatchingMaxPerContainer,
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
  test('is the smaller of maxShmPerContainer (GiB) and the memory maximum', () => {
    expect(getShmemMaxLimit(2, '16g')).toBe('2g');
    expect(getShmemMaxLimit(32, '16g')).toBe('16g');
    expect(getShmemMaxLimit(0.5, '1024m')).toBe('0.5g');
  });

  test('a missing, zero or non-numeric cap leaves only the memory maximum', () => {
    expect(getShmemMaxLimit(undefined, '16g')).toBe('16g');
    expect(getShmemMaxLimit(0, '16g')).toBe('16g');
    expect(getShmemMaxLimit('4', '16g')).toBe('16g');
    expect(getShmemMaxLimit(2, undefined)).toBe('2g');
    expect(getShmemMaxLimit(undefined, undefined)).toBeUndefined();
  });
});
