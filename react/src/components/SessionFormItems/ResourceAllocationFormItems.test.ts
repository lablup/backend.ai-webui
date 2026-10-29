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
import { getUnavailableSlotNames } from '../ResourcePresetSelect';
import {
  AUTOMATIC_DEFAULT_SHMEM,
  getPresetUnavailableReason,
  getAutomaticShmem,
  getUnifiedSlotNameFromTag,
  isUnifiedAcceleratorSlot,
  pickChangedResourceValues,
} from './ResourceAllocationFormItems';

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

describe('getUnifiedSlotNameFromTag', () => {
  it('extracts the slot name from a single unified-slot marker', () => {
    expect(getUnifiedSlotNameFromTag('unified-slot:cuda.unified')).toBe(
      'cuda.unified',
    );
    expect(getUnifiedSlotNameFromTag('unified-slot:rocm.unified')).toBe(
      'rocm.unified',
    );
  });

  it('finds the marker among comma- or whitespace-separated tags', () => {
    expect(getUnifiedSlotNameFromTag('foo,unified-slot:cuda.unified')).toBe(
      'cuda.unified',
    );
    expect(getUnifiedSlotNameFromTag('foo unified-slot:rocm.unified bar')).toBe(
      'rocm.unified',
    );
    expect(
      getUnifiedSlotNameFromTag('foo, unified-slot:cuda.unified , bar'),
    ).toBe('cuda.unified');
  });

  it('returns undefined when no unified-slot marker is present', () => {
    expect(getUnifiedSlotNameFromTag('foo,bar')).toBeUndefined();
    expect(getUnifiedSlotNameFromTag('some-other-tag')).toBeUndefined();
  });

  it('returns undefined when the marked slot is not a unified slot', () => {
    expect(
      getUnifiedSlotNameFromTag('unified-slot:cuda.shares'),
    ).toBeUndefined();
    expect(
      getUnifiedSlotNameFromTag('unified-slot:cuda.device'),
    ).toBeUndefined();
  });

  it('returns undefined for an empty slot value or nullish input', () => {
    expect(getUnifiedSlotNameFromTag('unified-slot:')).toBeUndefined();
    expect(getUnifiedSlotNameFromTag('')).toBeUndefined();
    expect(getUnifiedSlotNameFromTag(undefined)).toBeUndefined();
    expect(getUnifiedSlotNameFromTag(null)).toBeUndefined();
  });
});

describe('getPresetUnavailableReason', () => {
  const presets: Array<ResourcePreset> = [
    {
      id: 'id-cuda_shares_prest_10',
      name: 'id-cuda_shares_prest_10',
      resource_slots: { cpu: '2', mem: '4GB', 'cuda.shares': '10' },
      shared_memory: '1GB',
      allocatable: true,
    },
    {
      id: 'id-cuda_shares_prest_1',
      name: 'id-cuda_shares_prest_1',
      resource_slots: { cpu: '4', mem: '8GB', 'cuda.shares': '1' },
      shared_memory: '1GB',
      allocatable: false,
    },
    {
      id: 'id-cpu1_mem2g',
      name: 'id-cpu1_mem2g',
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

  const reasonsOf = (
    list: Array<ResourcePreset>,
    limits: MergedResourceLimits,
    image: Image,
    slotsInResourceGroup?: string[],
  ) =>
    list.map((preset) =>
      getPresetUnavailableReason(preset, limits, image, slotsInResourceGroup),
    );

  it('checks the image, then the limits, and never what is free right now', () => {
    expect(
      reasonsOf(
        presets,
        resourceLimits_cpu4_mem8g_cudashares1,
        image_has_cuda_shares_min1_max1,
      ),
    ).toEqual([
      { type: 'exceedsLimit', slots: ['cuda.shares'] },
      // Fits the image and the limits; launches as pending when nothing is free.
      undefined,
      { type: 'imageAccelerator' },
    ]);
  });

  it('names a slot the resource group does not offer before anything else', () => {
    const preset: ResourcePreset = {
      id: 'id-preset4',
      name: 'preset4',
      allocatable: false,
      shared_memory: '1GB',
      resource_slots: { cpu: '10', mem: '16GB', 'not_existed.device': '5' },
    };
    expect(
      reasonsOf(
        [preset],
        resourceLimits_cpu4_mem8g_cudashares1,
        image_has_cuda_shares_min1_max1,
        ['cpu', 'mem', 'cuda.shares'],
      ),
    ).toEqual([
      { type: 'slotNotInResourceGroup', slots: ['not_existed.device'] },
    ]);
    // While the group's slots are loading, the next check answers.
    expect(
      reasonsOf(
        [preset],
        resourceLimits_cpu4_mem8g_cudashares1,
        image_has_cuda_shares_min1_max1,
      ),
    ).toEqual([{ type: 'imageAccelerator' }]);
  });

  it('ignores a zero-quantity slot the resource group does not offer', () => {
    const preset: ResourcePreset = {
      id: 'id-zero',
      name: 'zero',
      allocatable: true,
      shared_memory: null,
      resource_slots: { cpu: '1', mem: '2GB', 'rocm.device': '0' },
    };
    expect(
      reasonsOf([preset], resourceLimits_cpu4_mem8g_cudashares1, undefined, [
        'cpu',
        'mem',
      ]),
    ).toEqual([undefined]);
  });

  it('treats a slot with no limit as unlimited', () => {
    expect(
      reasonsOf(
        presets,
        { cpu: {}, mem: {}, accelerators: {} },
        image_has_cuda_shares_min1_max1,
      ),
    ).toEqual([undefined, undefined, { type: 'imageAccelerator' }]);
  });

  it('skips the image check without an image', () => {
    expect(
      reasonsOf(presets, resourceLimits_cpu4_mem8g_cudashares1, undefined),
    ).toEqual([
      { type: 'exceedsLimit', slots: ['cuda.shares'] },
      undefined,
      undefined,
    ]);
  });

  it('lists every slot over its limit', () => {
    expect(
      reasonsOf(
        presets,
        { ...resourceLimits_cpu4_mem8g_cudashares1, mem: { max: '2GB' } },
        undefined,
      ),
    ).toEqual([
      { type: 'exceedsLimit', slots: ['mem', 'cuda.shares'] },
      { type: 'exceedsLimit', slots: ['mem'] },
      undefined,
    ]);
  });
});

describe('getUnavailableSlotNames', () => {
  it('lists non-zero slots missing from the available ones, ignoring shmem', () => {
    expect(
      getUnavailableSlotNames(
        {
          cpu: '1',
          mem: '2g',
          shmem: '1g',
          'cuda.shares': '0.5',
          'cuda.device': 0,
        },
        ['cpu', 'mem'],
      ),
    ).toEqual(['cuda.shares']);
  });
});

describe('getAutomaticShmem', () => {
  it('picks 1g once memory reaches 4g and the image minimum + 1g', () => {
    expect(getAutomaticShmem('4g', '1g')).toBe('1g');
    expect(getAutomaticShmem('8g', '2g')).toBe('1g');
  });

  it('falls back to the default below 4g or below the image minimum + 1g', () => {
    expect(getAutomaticShmem('2g', '1g')).toBe(AUTOMATIC_DEFAULT_SHMEM);
    expect(getAutomaticShmem('4g', '4g')).toBe(AUTOMATIC_DEFAULT_SHMEM);
  });
});

describe('pickChangedResourceValues', () => {
  it('returns nothing when every value already matches', () => {
    expect(
      pickChangedResourceValues(
        { cpu: 2, mem: '4g', accelerator: 0, acceleratorType: 'cuda.device' },
        { cpu: 2, mem: '4g', accelerator: 0, acceleratorType: 'cuda.device' },
      ),
    ).toEqual({});
  });

  it('treats equal memory sizes in different units as unchanged', () => {
    expect(
      pickChangedResourceValues(
        { mem: '1g', shmem: '1024m' },
        { mem: '1024m', shmem: '1g' },
      ),
    ).toEqual({});
  });

  it('keeps only the entries that differ', () => {
    expect(
      pickChangedResourceValues(
        { cpu: 4, mem: '4g', accelerator: 1 },
        { cpu: 2, mem: '4g', accelerator: 1 },
      ),
    ).toEqual({ cpu: 4 });
  });

  it('keeps every entry when there is no current value', () => {
    expect(pickChangedResourceValues({ cpu: 1, mem: '2g' }, undefined)).toEqual(
      { cpu: 1, mem: '2g' },
    );
  });
});
