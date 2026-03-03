/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../__test__/matchMedia.mock.js';
import { isMatchingMaxPerContainer } from './useResourceLimitAndRemaining';

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
