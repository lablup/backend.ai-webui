import {
  MergedResourceLimits,
  ResourcePreset,
} from '../hooks/useResourceLimitAndRemaining';
import { Image } from './ImageEnvironmentSelectFormItems';
import { getAllocatablePresetNames } from './ResourceAllocationFormItems';
import _ from 'lodash';

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
      name: 'preset3',
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
    name: 'image1',
    digest: 'digest1',
    architecture: 'arm64',
    humanized_name: 'Image 1',
    installed: true,
    labels: [],
    registry: 'registry1',
    tag: 'tag1',
    resource_limits: [{ key: 'cuda.shares', min: '1', max: '1' }],
  };

  it('should return presets when currentImage has accelerator limits(with allocatable property)', () => {
    const result = getAllocatablePresetNames(
      presets,
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    //  Without comparing the preset's resource slots with the resource limits.
    expect(result).toEqual(['cuda_shares_prest_10']);
  });

  it('should return presets when currentImage has accelerator limits(without allocatable property)', () => {
    const result = getAllocatablePresetNames(
      _.map(presets, (p) => _.omit(p, 'allocatable')),
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    // Must compare the preset's resource slots with the resource limits.
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
        accelerators: {},
      },
      image_has_cuda_shares_min1_max1,
    );
    // Only presets that have cuda.shares minimum 1 should be returned.
    expect(result).toEqual(['cuda_shares_prest_10']);
  });

  it('should handle empty image', () => {
    const result = getAllocatablePresetNames(
      presets,
      resourceLimits_cpu4_mem8g_cudashares1,
      undefined,
    );
    // all `preset.allocatable === true` presets should be returned
    expect(result).toEqual(['cuda_shares_prest_10', 'preset3']);
  });
});
