/**
 * Mock responses for ModelStore GraphQL operations.
 *
 * Provides model card data variants:
 *   - Multi-preset model card (2 presets, 2 runtime variants)
 *   - No-preset model card (0 available presets)
 *   - Single-preset model card (1 preset, for auto-deploy scenario)
 *
 * Also provides:
 *   - ModelCardDeployModalQuery mock (runtime variants + scaling groups)
 *   - ModelCardDeployModalQuery single-RG variant (for auto-deploy)
 *   - ModelCardDeployModalMutation mock
 */

// ─────────────────────────────────────────────────────────────────────────────
// Model card IDs
// ─────────────────────────────────────────────────────────────────────────────

// Proper UUIDs: the card's `entityId` goes into `?modelCard=`, and the page
// only hands a valid UUID to ModelCardDrawer's lazy query.
const MOCK_MODEL_CARD_WITH_PRESETS_UUID =
  '00000000-0000-0000-0000-000000000001';
const MOCK_MODEL_CARD_NO_PRESETS_UUID = '00000000-0000-0000-0000-000000000002';
const MOCK_MODEL_CARD_SINGLE_PRESET_UUID =
  '00000000-0000-0000-0000-000000000003';
export const MOCK_MODEL_CARD_WITH_PRESETS_ID = btoa(
  `ModelCardV2:${MOCK_MODEL_CARD_WITH_PRESETS_UUID}`,
);
export const MOCK_MODEL_CARD_NO_PRESETS_ID = btoa(
  `ModelCardV2:${MOCK_MODEL_CARD_NO_PRESETS_UUID}`,
);
export const MOCK_MODEL_CARD_SINGLE_PRESET_ID = btoa(
  `ModelCardV2:${MOCK_MODEL_CARD_SINGLE_PRESET_UUID}`,
);

const MOCK_VFOLDER_UUID = '00000000-0000-0000-0000-000000000010';
const MOCK_VFOLDER_ID = btoa(`VFolder:${MOCK_VFOLDER_UUID}`);

export const MOCK_DEPLOYMENT_ID = 'deploy-uuid-001';

// ─────────────────────────────────────────────────────────────────────────────
// Runtime variant local IDs (used as runtimeVariantId in presets)
// ─────────────────────────────────────────────────────────────────────────────

const RUNTIME_VARIANT_VLLM_LOCAL_ID = 'runtime-variant-uuid-011';
const RUNTIME_VARIANT_TGI_LOCAL_ID = 'runtime-variant-uuid-012';

// ─────────────────────────────────────────────────────────────────────────────
// Shared metadata for all mock model cards
// ─────────────────────────────────────────────────────────────────────────────

const BASE_METADATA = {
  title: 'Mock LLM Model',
  author: 'MockOrg',
  description: 'A mock large language model for testing.',
  task: 'text-generation',
  category: 'nlp',
  architecture: 'transformer',
  framework: ['pytorch', 'transformers'],
  label: ['llm', 'mock'],
  license: 'Apache-2.0',
  modelVersion: '1.0',
};

const BASE_MIN_RESOURCE = [
  { resourceType: 'cpu', quantity: '4' },
  { resourceType: 'mem', quantity: '8589934592' },
  { resourceType: 'cuda.device', quantity: '1' },
];

const BASE_VFOLDER = {
  id: MOCK_VFOLDER_ID,
  entityId: MOCK_VFOLDER_UUID,
  metadata: { name: 'mock-model-store-folder' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual model card definitions
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_MODEL_CARD_WITH_MULTI_PRESETS = {
  __typename: 'ModelCardV2',
  id: MOCK_MODEL_CARD_WITH_PRESETS_ID,
  entityId: MOCK_MODEL_CARD_WITH_PRESETS_UUID,
  name: 'mock-llm-model',
  metadata: BASE_METADATA,
  minResource: BASE_MIN_RESOURCE,
  readme: '# Mock LLM Model\n\nA mock model for E2E testing.',
  createdAt: '2026-01-01T00:00:00+00:00',
  updatedAt: null,
  vfolder: BASE_VFOLDER,
  availablePresets: {
    count: 2,
    edges: [
      {
        node: {
          id: btoa('Preset:preset-uuid-011'),
          entityId: 'preset-uuid-011',
          name: 'gpu-small',
          rank: 1,
          runtimeVariantId: RUNTIME_VARIANT_VLLM_LOCAL_ID,
        },
      },
      {
        node: {
          id: btoa('Preset:preset-uuid-012'),
          entityId: 'preset-uuid-012',
          name: 'gpu-medium',
          rank: 1,
          runtimeVariantId: RUNTIME_VARIANT_TGI_LOCAL_ID,
        },
      },
    ],
  },
};

export const MOCK_MODEL_CARD_NO_PRESETS = {
  ...MOCK_MODEL_CARD_WITH_MULTI_PRESETS,
  id: MOCK_MODEL_CARD_NO_PRESETS_ID,
  entityId: MOCK_MODEL_CARD_NO_PRESETS_UUID,
  name: 'mock-no-preset-model',
  metadata: {
    ...BASE_METADATA,
    title: 'Mock No-Preset Model',
  },
  availablePresets: {
    count: 0,
    edges: [],
  },
};

export const MOCK_MODEL_CARD_SINGLE_PRESET = {
  ...MOCK_MODEL_CARD_WITH_MULTI_PRESETS,
  id: MOCK_MODEL_CARD_SINGLE_PRESET_ID,
  entityId: MOCK_MODEL_CARD_SINGLE_PRESET_UUID,
  name: 'mock-single-preset-model',
  metadata: {
    ...BASE_METADATA,
    title: 'Mock Single-Preset Model',
  },
  availablePresets: {
    count: 1,
    edges: [
      {
        node: {
          id: btoa('Preset:preset-uuid-021'),
          entityId: 'preset-uuid-021',
          name: 'gpu-small',
          rank: 1,
          runtimeVariantId: RUNTIME_VARIANT_VLLM_LOCAL_ID,
        },
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ModelStoreListPageV2Query mock factory functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a model card list with a single model card that has multiple presets
 * (2 presets across 2 runtime variants). Used for Groups A and C scenarios.
 */
export function modelStoreListWithMultiPresetsMock() {
  return () => ({
    projectModelCardsV2: {
      count: 1,
      edges: [{ node: MOCK_MODEL_CARD_WITH_MULTI_PRESETS }],
    },
  });
}

/**
 * Returns a model card list with a single model card that has no presets.
 * Used for Group B (no presets) scenarios.
 */
export function modelStoreListWithNoPresetsMock() {
  return () => ({
    projectModelCardsV2: {
      count: 1,
      edges: [{ node: MOCK_MODEL_CARD_NO_PRESETS }],
    },
  });
}

/**
 * Returns a model card list with a single model card that has exactly one preset.
 * Used for Group D (auto-deploy) scenarios.
 */
export function modelStoreListWithSinglePresetMock() {
  return () => ({
    projectModelCardsV2: {
      count: 1,
      edges: [{ node: MOCK_MODEL_CARD_SINGLE_PRESET }],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelCardDeployModalQuery mock factory functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns 2 runtime variants (vllm, huggingface-tgi) and 2 scaling groups.
 * Used for Group C (multi-preset, multi-resource-group) scenarios.
 */
export function modelCardDeployModalQueryMock() {
  return () => ({
    runtimeVariants: {
      edges: [
        {
          node: {
            __typename: 'RuntimeVariant',
            id: btoa('RuntimeVariant:runtime-variant-uuid-011'),
            entityId: 'runtime-variant-uuid-011',
            name: 'vllm',
          },
        },
        {
          node: {
            __typename: 'RuntimeVariant',
            id: btoa('RuntimeVariant:runtime-variant-uuid-012'),
            entityId: 'runtime-variant-uuid-012',
            name: 'huggingface-tgi',
          },
        },
      ],
    },
    scaling_groups: [{ name: 'default' }, { name: 'gpu-cluster' }],
  });
}

/**
 * Returns 1 runtime variant and 1 scaling group.
 * Used for Group D (auto-deploy) scenarios.
 */
export function modelCardDeployModalQuerySingleRGMock() {
  return () => ({
    runtimeVariants: {
      edges: [
        {
          node: {
            __typename: 'RuntimeVariant',
            id: btoa('RuntimeVariant:runtime-variant-uuid-011'),
            entityId: 'runtime-variant-uuid-011',
            name: 'vllm',
          },
        },
      ],
    },
    scaling_groups: [{ name: 'default' }],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelCardDeployModalMutation mock factory function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a successful deployment response.
 * Used for deploy mutation scenarios (C.9 and D.1).
 */
export function modelCardDeployModalMutationMock() {
  return () => ({
    deployModelCardV2: {
      deploymentId: MOCK_DEPLOYMENT_ID,
      deploymentName: 'mock-llm-model-deploy-001',
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ModelCardDrawerQuery mock factory functions
//
// The ModelCardDrawer component fetches card details (including the
// ModelCardDeployModalFragment preset list) via a dedicated
// ModelCardDrawerQuery that is separate from the list-page query. Without
// mocking this query, the drawer opens with empty data (null modelCard) and
// the Deploy button remains disabled.
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal preset node satisfying DeploymentPresetDetailModalFragment */
function buildPresetNode(
  presetLocalId: string,
  presetName: string,
  runtimeVariantLocalId: string,
  runtimeVariantName: string,
) {
  return {
    __typename: 'DeploymentRevisionPreset',
    id: btoa(`DeploymentRevisionPreset:${presetLocalId}`),
    entityId: presetLocalId,
    name: presetName,
    runtimeVariantId: runtimeVariantLocalId,
    description: null,
    runtimeVariant: {
      __typename: 'RuntimeVariant',
      id: btoa(`RuntimeVariant:${runtimeVariantLocalId}`),
      entityId: runtimeVariantLocalId,
      name: runtimeVariantName,
    },
    cluster: { clusterMode: 'SINGLE_NODE', clusterSize: 1 },
    execution: {
      imageId: null,
      startupCommand: null,
      bootstrapScript: null,
      environ: [],
    },
    resource: { resourceOpts: [] },
    resourceSlots: [],
    deploymentDefaults: {
      openToPublic: false,
      replicaCount: 1,
      revisionHistoryLimit: 5,
      deploymentStrategy: 'ROLLING',
    },
    presetValues: [],
  };
}

/**
 * Returns a ModelCardDrawerQuery mock for the multi-preset model card.
 * Used for Groups A and C (drawer open, deploy modal).
 */
export function modelCardDrawerQueryWithMultiPresetsMock() {
  return (_vars: Record<string, any>) => ({
    modelCardV2: {
      __typename: 'ModelCardV2',
      id: MOCK_MODEL_CARD_WITH_PRESETS_ID,
      entityId: MOCK_MODEL_CARD_WITH_PRESETS_UUID,
      name: 'mock-llm-model',
      metadata: BASE_METADATA,
      minResource: BASE_MIN_RESOURCE,
      readme: '# Mock LLM Model\n\nA mock model for E2E testing.',
      createdAt: '2026-01-01T00:00:00+00:00',
      updatedAt: null,
      vfolder: {
        ...BASE_VFOLDER,
        // VFolderNodeIdenticonV2Fragment only needs id
      },
      availablePresets: {
        edges: [
          {
            node: buildPresetNode(
              'preset-uuid-011',
              'gpu-small',
              RUNTIME_VARIANT_VLLM_LOCAL_ID,
              'vllm',
            ),
          },
          {
            node: buildPresetNode(
              'preset-uuid-012',
              'gpu-medium',
              RUNTIME_VARIANT_TGI_LOCAL_ID,
              'huggingface-tgi',
            ),
          },
        ],
      },
    },
  });
}

/**
 * Returns a ModelCardDrawerQuery mock for the no-preset model card.
 * Used for Group B (no presets scenario).
 */
export function modelCardDrawerQueryWithNoPresetsMock() {
  return (_vars: Record<string, any>) => ({
    modelCardV2: {
      __typename: 'ModelCardV2',
      id: MOCK_MODEL_CARD_NO_PRESETS_ID,
      entityId: MOCK_MODEL_CARD_NO_PRESETS_UUID,
      name: 'mock-no-preset-model',
      metadata: {
        ...BASE_METADATA,
        title: 'Mock No-Preset Model',
      },
      minResource: BASE_MIN_RESOURCE,
      readme: null,
      createdAt: '2026-01-01T00:00:00+00:00',
      updatedAt: null,
      vfolder: BASE_VFOLDER,
      availablePresets: {
        edges: [],
      },
    },
  });
}

/**
 * Returns a ModelCardDrawerQuery mock for the single-preset model card.
 * Used for Group D (auto-deploy scenario).
 */
export function modelCardDrawerQueryWithSinglePresetMock() {
  return (_vars: Record<string, any>) => ({
    modelCardV2: {
      __typename: 'ModelCardV2',
      id: MOCK_MODEL_CARD_SINGLE_PRESET_ID,
      entityId: MOCK_MODEL_CARD_SINGLE_PRESET_UUID,
      name: 'mock-single-preset-model',
      metadata: {
        ...BASE_METADATA,
        title: 'Mock Single-Preset Model',
      },
      minResource: BASE_MIN_RESOURCE,
      readme: null,
      createdAt: '2026-01-01T00:00:00+00:00',
      updatedAt: null,
      vfolder: BASE_VFOLDER,
      availablePresets: {
        edges: [
          {
            node: buildPresetNode(
              'preset-uuid-021',
              'gpu-small',
              RUNTIME_VARIANT_VLLM_LOCAL_ID,
              'vllm',
            ),
          },
        ],
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// BAIAvailablePresetSelect query mocks (the Deploy modal's Preset dropdown)
// ─────────────────────────────────────────────────────────────────────────────

/** The multi-preset card's presets, as the dropdown's own queries return them. */
const SELECTABLE_PRESETS = [
  buildPresetNode(
    'preset-uuid-011',
    'gpu-small',
    RUNTIME_VARIANT_VLLM_LOCAL_ID,
    'vllm',
  ),
  buildPresetNode(
    'preset-uuid-012',
    'gpu-medium',
    RUNTIME_VARIANT_TGI_LOCAL_ID,
    'huggingface-tgi',
  ),
].map((preset, index) => ({ ...preset, rank: index + 1 }));

/**
 * Mocks for the dropdown's option list (`BAIAvailablePresetSelectPaginatedQuery`)
 * and its selected-label lookup (`BAIAvailablePresetSelectValueQuery`).
 */
export function availablePresetSelectMocks() {
  return {
    BAIAvailablePresetSelectPaginatedQuery: () => ({
      deploymentRevisionPresets: {
        count: SELECTABLE_PRESETS.length,
        edges: SELECTABLE_PRESETS.map((node) => ({ node })),
      },
    }),
    BAIAvailablePresetSelectValueQuery: (vars: Record<string, any>) => {
      const ids: string[] = vars.ids ?? [];
      return {
        deploymentRevisionPresets: {
          edges: SELECTABLE_PRESETS.filter((preset) =>
            ids.includes(preset.entityId),
          ).map((node) => ({ node })),
        },
      };
    },
  };
}
