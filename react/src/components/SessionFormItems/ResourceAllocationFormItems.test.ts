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
  AUTOMATIC_DEFAULT_SHMEM,
  getAllocatablePresetIds,
  getSelectedAgentsRemainingSlots,
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

describe('getAllocatablePresetIds', () => {
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
    const result = getAllocatablePresetIds(
      presets,
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    //  must compare the preset's resource slots with the resource limits even `check-preset` result has allocatable.
    expect(result).toEqual(['id-cuda_shares_prest_1']);
  });

  it('should return empty array when no presets match', () => {
    const noMatchPresets: Array<ResourcePreset> = [
      {
        id: 'id-preset4',
        name: 'preset4',
        allocatable: false,
        shared_memory: '1GB',
        resource_slots: { cpu: '10', mem: '16GB', 'not_existed.device': '5' },
      },
    ];
    const result = getAllocatablePresetIds(
      noMatchPresets,
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    expect(result).toEqual([]);
  });

  it('should handle empty presets array', () => {
    const result = getAllocatablePresetIds(
      [],
      resourceLimits_cpu4_mem8g_cudashares1,
      image_has_cuda_shares_min1_max1,
    );
    expect(result).toEqual([]);
  });

  it('should handle empty resourceLimits', () => {
    const result = getAllocatablePresetIds(
      presets,
      {
        cpu: {},
        mem: {},
        accelerators: {},
      },
      image_has_cuda_shares_min1_max1,
    );
    // Only presets that have cuda.shares minimum 1 should be returned.
    expect(result).toEqual([
      'id-cuda_shares_prest_10',
      'id-cuda_shares_prest_1',
    ]);
  });

  it('should handle empty image', () => {
    const result = getAllocatablePresetIds(
      presets,
      resourceLimits_cpu4_mem8g_cudashares1,
      undefined,
    );
    // Only compare with resource limits
    expect(result).toEqual(['id-cuda_shares_prest_1', 'id-cpu1_mem2g']);
  });

  it('should handle empty image and small mem limit', () => {
    const result = getAllocatablePresetIds(
      presets,
      {
        ...resourceLimits_cpu4_mem8g_cudashares1,
        mem: { max: '2GB' },
      },
      undefined,
    );
    // Only compare with resource limits
    expect(result).toEqual(['id-cpu1_mem2g']);
  });

  describe('with a selected agent', () => {
    const noResourceLimits: MergedResourceLimits = {
      cpu: {},
      mem: {},
      accelerators: {},
    };
    const GiB = 1024 ** 3;
    // The manager reports both preset `mem` and agent slots as byte strings.
    const agentPresets: Array<ResourcePreset> = [
      {
        id: 'cpu4_mem8g_cuda2',
        name: 'cpu4_mem8g_cuda2',
        resource_slots: {
          cpu: '4',
          mem: String(8 * GiB),
          'cuda.shares': '2',
        },
        shared_memory: String(GiB),
        allocatable: true,
      },
      {
        id: 'cpu2_mem4g_cuda1',
        name: 'cpu2_mem4g_cuda1',
        resource_slots: {
          cpu: '2',
          mem: String(4 * GiB),
          'cuda.shares': '1',
        },
        shared_memory: String(GiB),
        allocatable: true,
      },
      {
        id: 'cpu1_mem2g',
        name: 'cpu1_mem2g',
        resource_slots: { cpu: '1', mem: String(2 * GiB) },
        shared_memory: String(GiB),
        allocatable: true,
      },
    ];

    it('keeps only the presets that fit the remaining slots of the agent', () => {
      const result = getAllocatablePresetIds(
        agentPresets,
        noResourceLimits,
        undefined,
        [{ cpu: 2, mem: 4 * GiB, 'cuda.shares': 1 }],
      );
      expect(result).toEqual(['cpu2_mem4g_cuda1', 'cpu1_mem2g']);
    });

    it('excludes a preset asking for a slot the agent does not provide', () => {
      const result = getAllocatablePresetIds(
        agentPresets,
        noResourceLimits,
        undefined,
        [{ cpu: 8, mem: 64 * GiB }],
      );
      expect(result).toEqual(['cpu1_mem2g']);
    });

    it('keeps a preset whose accelerator request is zero on an agent without that slot', () => {
      // `check-presets` zero-fills every preset with all cluster-known slot
      // types, so on a heterogeneous cluster a CPU preset still carries
      // `cuda.shares: "0"` while a CPU-only agent reports no `cuda.shares`.
      const result = getAllocatablePresetIds(
        [
          {
            id: 'cpu1_mem2g',
            name: 'cpu1_mem2g',
            resource_slots: {
              cpu: '1',
              mem: String(2 * GiB),
              'cuda.shares': '0',
            },
            shared_memory: String(GiB),
            allocatable: true,
          },
          {
            id: 'cpu1_mem2g_cuda1',
            name: 'cpu1_mem2g_cuda1',
            resource_slots: {
              cpu: '1',
              mem: String(2 * GiB),
              'cuda.shares': '1',
            },
            shared_memory: String(GiB),
            allocatable: true,
          },
        ],
        noResourceLimits,
        undefined,
        [{ cpu: 4, mem: 8 * GiB }],
      );
      expect(result).toEqual(['cpu1_mem2g']);
    });

    it('ignores shmem, which is carved out of the session memory', () => {
      const result = getAllocatablePresetIds(
        [
          {
            id: 'cpu1_mem2g_shmem1g',
            name: 'cpu1_mem2g_shmem1g',
            resource_slots: {
              cpu: '1',
              mem: String(2 * GiB),
              shmem: String(GiB),
            },
            shared_memory: String(GiB),
            allocatable: true,
          },
        ],
        noResourceLimits,
        undefined,
        [{ cpu: 1, mem: 2 * GiB }],
      );
      expect(result).toEqual(['cpu1_mem2g_shmem1g']);
    });

    it('excludes every preset when the agent has no room left', () => {
      const result = getAllocatablePresetIds(
        agentPresets,
        noResourceLimits,
        undefined,
        [{ cpu: 0, mem: 0, 'cuda.shares': 0 }],
      );
      expect(result).toEqual([]);
    });

    it('still applies the resource limits on top of the agent slots', () => {
      const result = getAllocatablePresetIds(
        agentPresets,
        { cpu: { max: 2 }, mem: {}, accelerators: {} },
        undefined,
        [{ cpu: 16, mem: 64 * GiB, 'cuda.shares': 16 }],
      );
      expect(result).toEqual(['cpu2_mem4g_cuda1', 'cpu1_mem2g']);
    });

    it('keeps a preset that fits on at least one of several selected agents', () => {
      // Selected agents are scheduling candidates: the 4-CPU preset fits only
      // the second agent, which is enough to keep it enabled.
      const result = getAllocatablePresetIds(
        agentPresets,
        noResourceLimits,
        undefined,
        [
          { cpu: 1, mem: 2 * GiB },
          { cpu: 4, mem: 8 * GiB, 'cuda.shares': 2 },
        ],
      );
      expect(result).toEqual([
        'cpu4_mem8g_cuda2',
        'cpu2_mem4g_cuda1',
        'cpu1_mem2g',
      ]);
    });

    it('excludes a preset that none of the selected agents can host', () => {
      // Capacity is not pooled: two 2-CPU agents cannot host a 4-CPU kernel.
      const result = getAllocatablePresetIds(
        agentPresets,
        noResourceLimits,
        undefined,
        [
          { cpu: 2, mem: 8 * GiB, 'cuda.shares': 2 },
          { cpu: 2, mem: 8 * GiB, 'cuda.shares': 2 },
        ],
      );
      expect(result).toEqual(['cpu2_mem4g_cuda1', 'cpu1_mem2g']);
    });

    it('returns the unfiltered list when no agent is pinned', () => {
      const result = getAllocatablePresetIds(
        agentPresets,
        noResourceLimits,
        undefined,
      );
      expect(result).toEqual([
        'cpu4_mem8g_cuda2',
        'cpu2_mem4g_cuda1',
        'cpu1_mem2g',
      ]);
    });
  });
});

describe('getSelectedAgentsRemainingSlots', () => {
  const remainingSlotsByAgentId = {
    'agent-a': { cpu: 4, mem: 8 },
    'agent-b': { cpu: 8, mem: 16 },
  };

  it('returns undefined for auto or an empty selection', () => {
    expect(
      getSelectedAgentsRemainingSlots({
        selectedAgents: 'auto',
        remainingSlotsByAgentId,
      }),
    ).toBeUndefined();
    expect(
      getSelectedAgentsRemainingSlots({
        selectedAgents: ['auto', 'agent-a'],
        remainingSlotsByAgentId,
      }),
    ).toBeUndefined();
    expect(
      getSelectedAgentsRemainingSlots({
        selectedAgents: [],
        remainingSlotsByAgentId,
      }),
    ).toBeUndefined();
  });

  it('returns one entry per selected agent for a multi-agent selection', () => {
    expect(
      getSelectedAgentsRemainingSlots({
        selectedAgents: ['agent-a', 'agent-b'],
        remainingSlotsByAgentId,
        clusterMode: 'multi-node',
        clusterSize: 2,
      }),
    ).toEqual([
      { cpu: 4, mem: 8 },
      { cpu: 8, mem: 16 },
    ]);
  });

  it('splits every candidate across the containers of a single-node cluster', () => {
    expect(
      getSelectedAgentsRemainingSlots({
        selectedAgents: ['agent-a', 'agent-b'],
        remainingSlotsByAgentId,
        clusterMode: 'single-node',
        clusterSize: 2,
      }),
    ).toEqual([
      { cpu: 2, mem: 4 },
      { cpu: 4, mem: 8 },
    ]);
  });

  it('skips filtering when any selected agent has no loaded capacity', () => {
    expect(
      getSelectedAgentsRemainingSlots({
        selectedAgents: ['agent-a', 'agent-unloaded'],
        remainingSlotsByAgentId,
      }),
    ).toBeUndefined();
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
