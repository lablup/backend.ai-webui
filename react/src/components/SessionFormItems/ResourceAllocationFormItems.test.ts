import '../../../__test__/matchMedia.mock.js';
import {
  MergedResourceLimits,
  ResourcePreset,
} from '../../hooks/useResourceLimitAndRemaining';
import { Image } from '../ImageEnvironmentSelectFormItems';
import { getAllocatablePresetNames } from './ResourceAllocationFormItems';

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
