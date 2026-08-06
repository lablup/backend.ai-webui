/**
 * Mock data + GraphQL handler factories for the Admin Deployment Preset
 * creation wizard's Service Configuration flow (FR-3474).
 *
 * Same hybrid convention as `add-revision-mock.ts`: a real login + real page
 * navigation exercise the actual wizard, while the modal-internal GraphQL
 * operations that would otherwise depend on live-backend state are
 * intercepted by operation name via `setupGraphQLMocks`:
 *
 *   - AdminDeploymentPresetSettingPageRuntimeVariantsQuery
 *       feeds the plain (non-virtualized) Runtime <Select> a single
 *       deterministic `custom` variant so the wizard's Service Configuration
 *       section is deterministically shown.
 *   - AdminDeploymentPresetSettingPageResourceSlotTypesQuery
 *       supplies cpu/mem resource slot type metadata for the Resources card.
 *   - BAIAdminImageSelectPaginatedQuery / BAIAdminImageSelectValueQuery
 *       feed the Image select a single deterministic image.
 *   - AdminDeploymentPresetSettingPageCreateMutation
 *       returns a canned success shape and lets a spec capture the outgoing
 *       `input` to assert the Service Configuration / Health Check /
 *       Pre-Start Actions payload shape.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Stable UUIDs
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_RUNTIME_VARIANT_UUID = '44444444-4444-4444-4444-444444444444';
export const MOCK_IMAGE_UUID = '55555555-5555-5555-5555-555555555555';
export const MOCK_CREATED_PRESET_UUID = '66666666-6666-6666-6666-666666666666';
export const MOCK_IMAGE_CANONICAL_NAME =
  'cr.backend.ai/testing/mock-fr3474:1.0@x86_64';

// ─────────────────────────────────────────────────────────────────────────────
// Runtime variant (plain <Select>, single non-paginated response)
// ─────────────────────────────────────────────────────────────────────────────

export function adminPresetRuntimeVariantsMock() {
  return () => ({
    runtimeVariants: {
      edges: [
        {
          node: {
            __typename: 'RuntimeVariant',
            id: btoa(`RuntimeVariant:${MOCK_RUNTIME_VARIANT_UUID}`),
            name: 'custom',
            readsVfolderConfigFiles: true,
          },
        },
      ],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resource slot types (cpu / mem only — the two the form always renders)
// ─────────────────────────────────────────────────────────────────────────────

export function adminPresetResourceSlotTypesMock() {
  return () => ({
    resourceSlotTypes: {
      edges: [
        {
          node: {
            __typename: 'ResourceSlotType',
            id: 'cpu',
            slotName: 'cpu',
            slotType: 'count',
            displayName: 'CPU',
            displayUnit: 'Core',
            numberFormat: { binary: false, roundLength: 0 },
          },
        },
        {
          node: {
            __typename: 'ResourceSlotType',
            id: 'mem',
            slotName: 'mem',
            slotType: 'bytes',
            displayName: 'Memory',
            displayUnit: 'GiB',
            numberFormat: { binary: true, roundLength: 0 },
          },
        },
      ],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Image select (paginated list + value lookup, both resolve to one image)
// ─────────────────────────────────────────────────────────────────────────────

function buildImageNode() {
  return {
    __typename: 'ImageV2',
    id: btoa(`ImageV2:${MOCK_IMAGE_UUID}`),
    identity: {
      canonicalName: MOCK_IMAGE_CANONICAL_NAME,
      architecture: 'x86_64',
    },
  };
}

export function adminPresetImageSelectMocks() {
  const node = buildImageNode();
  return {
    BAIAdminImageSelectPaginatedQuery: () => ({
      adminImagesV2: { count: 1, edges: [{ node }] },
    }),
    BAIAdminImageSelectValueQuery: (variables: Record<string, any>) =>
      variables?.skipSelected
        ? { adminImagesV2: null }
        : { adminImagesV2: { edges: [{ node }] } },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Create mutation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `AdminDeploymentPresetSettingPageCreateMutation` handler. Records the
 * outgoing `input` into `capture.input` (first call only — a re-render must
 * not clobber a good capture with a later null) and returns a minimal
 * successful preset matching the mutation's
 * `AdminDeploymentPresetSettingPageContent_preset` selection.
 */
export function adminPresetCreateMutationMock(capture: { input: any }) {
  return (variables: Record<string, any>) => {
    if (capture.input == null && variables?.input != null) {
      capture.input = variables.input;
    }
    return {
      adminCreateDeploymentRevisionPreset: {
        preset: buildCreatedPreset(),
      },
    };
  };
}

/**
 * Minimal `DeploymentRevisionPreset` shape satisfying the mutation's
 * `...AdminDeploymentPresetSettingPageContent_preset` selection. The spec
 * asserts on the outgoing request, not the returned preset detail.
 */
export function buildCreatedPreset(): Record<string, unknown> {
  return {
    __typename: 'DeploymentRevisionPreset',
    id: btoa(`DeploymentRevisionPreset:${MOCK_CREATED_PRESET_UUID}`),
    name: 'mock-created-preset',
    description: null,
    runtimeVariantId: btoa(`RuntimeVariant:${MOCK_RUNTIME_VARIANT_UUID}`),
    runtimeVariant: { name: 'custom' },
    cluster: { clusterMode: 'MULTI_NODE', clusterSize: 1 },
    execution: {
      imageId: btoa(`ImageV2:${MOCK_IMAGE_UUID}`),
      startupCommand: null,
      bootstrapScript: null,
      environ: [],
    },
    resource: { resourceOpts: [] },
    resourceSlots: [],
    deploymentDefaults: {
      openToPublic: false,
      replicaCount: 1,
      revisionHistoryLimit: null,
      deploymentStrategy: 'ROLLING',
    },
    presetValues: [],
    modelDefinition: null,
  };
}
