/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import '../../../__test__/matchMedia.mock.js';
import {
  MergedResourceLimits,
  ResourcePreset,
} from '../../hooks/useResourceLimitAndRemaining';
import { Image } from '../ImageEnvironmentSelectFormItems';
import {
  displayUnitToInputSizeUnit,
  getAllocatablePresetNames,
  getUnifiedAcceleratorValueFromMem,
  isUnifiedAcceleratorSlot,
} from './ResourceAllocationFormItems';

describe('displayUnitToInputSizeUnit', () => {
  it('maps known binary display units to InputSizeUnit', () => {
    expect(displayUnitToInputSizeUnit('GiB')).toBe('g');
    expect(displayUnitToInputSizeUnit('MiB')).toBe('m');
    expect(displayUnitToInputSizeUnit('TiB')).toBe('t');
    expect(displayUnitToInputSizeUnit('KiB')).toBe('k');
    expect(displayUnitToInputSizeUnit('PiB')).toBe('p');
    expect(displayUnitToInputSizeUnit('EiB')).toBe('e');
  });

  it('falls back to "g" for unknown or empty values', () => {
    expect(displayUnitToInputSizeUnit('foo')).toBe('g');
    expect(displayUnitToInputSizeUnit('')).toBe('g');
    expect(displayUnitToInputSizeUnit(null)).toBe('g');
    expect(displayUnitToInputSizeUnit(undefined)).toBe('g');
  });
});

describe('getUnifiedAcceleratorValueFromMem', () => {
  const slotsGiB = { 'cuda.unified': { display_unit: 'GiB' } };
  const slotsMiB = { 'cuda.unified': { display_unit: 'MiB' } };
  const slotsNoMeta = { 'cuda.unified': {} };

  it('returns mem converted to the slot display unit (GiB)', () => {
    expect(
      getUnifiedAcceleratorValueFromMem('8g', 'cuda.unified', slotsGiB),
    ).toBe(8);
  });

  it('returns mem converted to the slot display unit (MiB)', () => {
    expect(
      getUnifiedAcceleratorValueFromMem('8g', 'cuda.unified', slotsMiB),
    ).toBe(8192);
  });

  it('falls back to GiB when slot metadata has no display_unit', () => {
    expect(
      getUnifiedAcceleratorValueFromMem('8g', 'cuda.unified', slotsNoMeta),
    ).toBe(8);
  });

  it('returns 0 for undefined or zero mem', () => {
    expect(
      getUnifiedAcceleratorValueFromMem(undefined, 'cuda.unified', slotsGiB),
    ).toBe(0);
    expect(getUnifiedAcceleratorValueFromMem(0, 'cuda.unified', slotsGiB)).toBe(
      0,
    );
  });
});

describe('isUnifiedAcceleratorSlot', () => {
  it('returns true for slot names ending with .unified', () => {
    expect(isUnifiedAcceleratorSlot('cuda.unified')).toBe(true);
    expect(isUnifiedAcceleratorSlot('rocm.unified')).toBe(true);
  });

  it('returns false for discrete accelerator slot names', () => {
    expect(isUnifiedAcceleratorSlot('cuda.shares')).toBe(false);
    expect(isUnifiedAcceleratorSlot('cuda.device')).toBe(false);
    expect(isUnifiedAcceleratorSlot('cuda.mem')).toBe(false);
    expect(isUnifiedAcceleratorSlot('rocm.device')).toBe(false);
  });

  it('returns false for nullish or empty input', () => {
    expect(isUnifiedAcceleratorSlot(undefined)).toBe(false);
    expect(isUnifiedAcceleratorSlot(null)).toBe(false);
    expect(isUnifiedAcceleratorSlot('')).toBe(false);
  });
});

describe('getAllocatablePresetNames', () => {
  const presets: Array<ResourcePreset> = [
    {
      name: 'cuda_shares_prest_10',
      resource_slots: { cpu: '2', mem: '4GB', 'cuda.shares': '10' },
      shared_memory: '1GB',
      allocatable: true,
    },
    {
      name: 'cuda_shares_prest_1',
      resource_slots: { cpu: '4', mem: '8GB', 'cuda.shares': '1' },
      shared_memory: '1GB',
      allocatable: false,
    },
    {
      name: 'cpu1_mem2g',
      resource_slots: { cpu: '1', mem: '2GB' },
      shared_memory: '1GB',
      allocatable: true,
    },
  ];

  const resourceLimits_cpu4_mem8g_cudashares1: MergedResourceLimits = {
    cpu: { max: 4 },
    mem: { max: '8GB' },
    accelerators: { 'cuda.shares': { max: 1 } },
  };

  const image_has_cuda_shares_min1_max1: Image = {
    id: 'id1',
    namespace: 'image1',
    name: undefined,
    digest: 'digest1',
    architecture: 'arm64',
    humanized_name: 'Image 1',
    installed: true,
    labels: [],
    registry: 'registry1',
    tag: 'tag1',
    resource_limits: [{ key: 'cuda.shares', min: '1', max: '1' }],
    base_image_name: undefined,
    tags: undefined,
    version: undefined,
    supported_accelerators: undefined,
  };

  it('should return presets when currentImage has accelerator limits', () => {
    const result = getAllocatablePresetNames(
      presets,
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    //  must compare the preset's resource slots with the resource limits even `check-preset` result has allocatable.
    expect(result).toEqual(['cuda_shares_prest_1']);
  });

  it('should return empty array when no presets match', () => {
    const noMatchPresets: Array<ResourcePreset> = [
      {
        name: 'preset4',
        allocatable: false,
        shared_memory: '1GB',
        resource_slots: { cpu: '10', mem: '16GB', 'not_existed.device': '5' },
      },
    ];
    const result = getAllocatablePresetNames(
      noMatchPresets,
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    expect(result).toEqual([]);
  });

  it('should handle empty presets array', () => {
    const result = getAllocatablePresetNames(
      [],
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    expect(result).toEqual([]);
  });

  it('should handle empty resourceLimits', () => {
    const result = getAllocatablePresetNames(
      presets,
      {
        cpu: {},
        mem: {},
        accelerators: {},
      },
      image_has_cuda_shares_min1_max1,
    );
    // Only presets that have cuda.shares minimum 1 should be returned.
    expect(result).toEqual(['cuda_shares_prest_10', 'cuda_shares_prest_1']);
  });

  it('should handle empty image', () => {
    const result = getAllocatablePresetNames(
      presets,
      resourceLimits_cpu4_mem8g_cudashares1,
      undefined,
    );
    // Only compare with resource limits
    expect(result).toEqual(['cuda_shares_prest_1', 'cpu1_mem2g']);
  });

  it('should handle empty image and small mem limit', () => {
    const result = getAllocatablePresetNames(
      presets,
      {
        ...resourceLimits_cpu4_mem8g_cudashares1,
        mem: { max: '2GB' },
      },
      undefined,
    );
    // Only compare with resource limits
    expect(result).toEqual(['cpu1_mem2g']);
  });
});
