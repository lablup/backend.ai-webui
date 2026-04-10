// ─────────────────────────────────────────────────────────────────────────────
// EndpointDetailPageQuery mock factory functions for post-deploy alerts
// ─────────────────────────────────────────────────────────────────────────────
import { MOCK_ENDPOINT_UUID } from './endpoint-detail-mock';

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

export const MOCK_MODEL_CARD_WITH_PRESETS_ID = btoa('ModelCardV2:uuid-001');
export const MOCK_MODEL_CARD_NO_PRESETS_ID = btoa('ModelCardV2:uuid-002');
export const MOCK_MODEL_CARD_SINGLE_PRESET_ID = btoa('ModelCardV2:uuid-003');

const MOCK_VFOLDER_ID = btoa('VFolder:vfolder-uuid-001');

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
  metadata: { name: 'mock-model-store-folder' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Individual model card definitions
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_MODEL_CARD_WITH_MULTI_PRESETS = {
  __typename: 'ModelCardV2',
  id: MOCK_MODEL_CARD_WITH_PRESETS_ID,
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
          name: 'gpu-small',
          rank: 1,
          runtimeVariantId: RUNTIME_VARIANT_VLLM_LOCAL_ID,
        },
      },
      {
        node: {
          id: btoa('Preset:preset-uuid-012'),
          name: 'gpu-small',
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
            name: 'vllm',
          },
        },
        {
          node: {
            __typename: 'RuntimeVariant',
            id: btoa('RuntimeVariant:runtime-variant-uuid-012'),
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

const MOCK_ENDPOINT_GLOBAL_ID = btoa(`Endpoint:${MOCK_ENDPOINT_UUID}`);

const BASE_ENDPOINT_FOR_DETAIL = {
  __typename: 'Endpoint',
  id: MOCK_ENDPOINT_GLOBAL_ID,
  name: 'mock-endpoint',
  status: 'PENDING',
  endpoint_id: MOCK_ENDPOINT_UUID,
  project: 'mock-project-id-001',
  image_object: null,
  desired_session_count: null,
  url: 'https://mock-endpoint.backend.ai/api',
  open_to_public: false,
  errors: [],
  retries: 0,
  runtime_variant: null,
  model: null,
  model_mount_destination: null,
  model_definition_path: null,
  extra_mounts: [],
  environ: '{}',
  resource_group: 'default',
  resource_slots: '{"cpu": 2, "mem": 2147483648}',
  resource_opts: '{}',
  cluster_mode: 'SINGLE_NODE',
  cluster_size: 1,
  routings: [],
  created_user_email: 'admin@lablup.com',
  session_owner_email: 'admin@lablup.com',
};

const EMPTY_TOKEN_LIST = {
  __typename: 'EndpointTokenList',
  total_count: 0,
  items: [],
};

/**
 * Mock for EndpointDetailPageQuery — "Preparing your service" state.
 * replicas=1, deploymentScopedSchedulingHistories.count=0 → hasReachedReady=false.
 * Triggers the "Preparing your service" info alert.
 */
export function endpointDetailPreparingMockResponse() {
  return (_vars: Record<string, any>) => ({
    endpoint: {
      ...BASE_ENDPOINT_FOR_DETAIL,
      status: 'PENDING',
      replicas: 1,
    },
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes: { edges: [], count: 0 },
    healthyRoutes: { count: 0 },
    deploymentScopedSchedulingHistories: { count: 0 },
  });
}

/**
 * Mock for EndpointDetailPageQuery — replicas=0 state.
 * replicas=0 → "Preparing your service" alert is suppressed.
 */
export function endpointDetailZeroReplicasMockResponse() {
  return (_vars: Record<string, any>) => ({
    endpoint: {
      ...BASE_ENDPOINT_FOR_DETAIL,
      status: 'PENDING',
      replicas: 0,
    },
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes: { edges: [], count: 0 },
    healthyRoutes: { count: 0 },
    deploymentScopedSchedulingHistories: { count: 0 },
  });
}

/**
 * Mock for EndpointDetailPageQuery — TERMINATED state with replicas=0.
 * Ensures the "Preparing your service" alert is not shown for destroyed endpoints.
 */
export function endpointDetailTerminatedMockResponse() {
  return (_vars: Record<string, any>) => ({
    endpoint: {
      ...BASE_ENDPOINT_FOR_DETAIL,
      status: 'TERMINATED',
      replicas: 0,
    },
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes: { edges: [], count: 0 },
    healthyRoutes: { count: 0 },
    deploymentScopedSchedulingHistories: { count: 0 },
  });
}

/**
 * Mock for EndpointDetailPageQuery — "Service Ready" state.
 * healthyRoutes.count=1 (hasAnyHealthyRoute=true).
 * Triggers the "Service Ready" success alert.
 */
export function endpointDetailServiceReadyMockResponse() {
  return (_vars: Record<string, any>) => ({
    endpoint: {
      ...BASE_ENDPOINT_FOR_DETAIL,
      status: 'HEALTHY',
      replicas: 1,
    },
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes: { edges: [], count: 0 },
    healthyRoutes: { count: 1 },
    deploymentScopedSchedulingHistories: { count: 1 },
  });
}

/**
 * Mock for EndpointDetailPageQuery — healthy routes exist but no scheduling history.
 * healthyRoutes.count=1, deploymentScopedSchedulingHistories.count=0.
 * "Service Ready" alert should still be shown (hasAnyHealthyRoute is sufficient).
 */
export function endpointDetailHealthyButNoSchedulingHistoryMockResponse() {
  return (_vars: Record<string, any>) => ({
    endpoint: {
      ...BASE_ENDPOINT_FOR_DETAIL,
      status: 'HEALTHY',
      replicas: 1,
    },
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes: { edges: [], count: 0 },
    healthyRoutes: { count: 1 },
    deploymentScopedSchedulingHistories: { count: 0 },
  });
}

/**
 * Mock for EndpointDetailPageQuery — no healthy routes.
 * healthyRoutes.count=0. "Service Ready" alert should NOT be shown.
 */
export function endpointDetailReadyButNoHealthyRoutesMockResponse() {
  return (_vars: Record<string, any>) => ({
    endpoint: {
      ...BASE_ENDPOINT_FOR_DETAIL,
      status: 'HEALTHY',
      replicas: 1,
    },
    endpoint_token_list: EMPTY_TOKEN_LIST,
    endpoint_auto_scaling_rules: null,
    routes: { edges: [], count: 0 },
    healthyRoutes: { count: 0 },
    deploymentScopedSchedulingHistories: { count: 1 },
  });
}
