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
 *       feeds the Runtime selector (a plain Astryx Selector fed from this
 *       page-level list query) a single deterministic `custom` variant so the
 *       wizard's Service Configuration section is deterministically shown.
 *   - AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery
 *       point lookup (`runtimeVariant(id:)`) the page fires for the currently
 *       selected variant id; stubbed to the same node for determinism.
 *   - AdminDeploymentPresetSettingPageResourceSlotTypesQuery
 *       supplies cpu/mem resource slot type metadata for the Resources card.
 *   - BAIAdminImageSelectAstryxPaginatedQuery /
 *     BAIAdminImageSelectAstryxValueQuery
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
/**
 * Canonical name WITHOUT the `@<architecture>` suffix: BAIAdminImageSelectAstryx
 * composes each option label as `${canonicalName}@${architecture}`, so a
 * canonical name that already embeds `@x86_64` would render doubled
 * (`...@x86_64@x86_64`) and no option would match the expected label.
 */
export const MOCK_IMAGE_CANONICAL_NAME =
  'cr.backend.ai/testing/mock-fr3474:1.0';
export const MOCK_IMAGE_ARCHITECTURE = 'x86_64';
/** The option label the Image select renders for the mocked image. */
export const MOCK_IMAGE_OPTION_LABEL = `${MOCK_IMAGE_CANONICAL_NAME}@${MOCK_IMAGE_ARCHITECTURE}`;

// ─────────────────────────────────────────────────────────────────────────────
// Runtime variant (page-level list query + selected-value point lookup)
// ─────────────────────────────────────────────────────────────────────────────

function buildRuntimeVariantNode() {
  return {
    __typename: 'RuntimeVariant',
    id: btoa(`RuntimeVariant:${MOCK_RUNTIME_VARIANT_UUID}`),
    name: 'custom',
    readsVfolderConfigFiles: true,
  };
}

export function adminPresetRuntimeVariantsMock() {
  return () => ({
    runtimeVariants: {
      edges: [{ node: buildRuntimeVariantNode() }],
    },
  });
}

/**
 * `AdminDeploymentPresetSettingPageSelectedRuntimeVariantQuery` handler: the
 * page point-looks-up the currently selected variant (`runtimeVariant(id:)`)
 * so the selection resolves even when it falls outside the capped list query.
 * The query `@skip`s while nothing is selected (`skip: true`); return a null
 * variant in that case so the empty selection resolves cleanly.
 */
export function adminPresetSelectedRuntimeVariantMock() {
  return (variables: Record<string, any>) =>
    variables?.skip
      ? { runtimeVariant: null }
      : { runtimeVariant: buildRuntimeVariantNode() };
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
      architecture: MOCK_IMAGE_ARCHITECTURE,
    },
  };
}

export function adminPresetImageSelectMocks() {
  const node = buildImageNode();
  return {
    BAIAdminImageSelectAstryxPaginatedQuery: () => ({
      adminImagesV2: { count: 1, edges: [{ node }] },
    }),
    // The value query `@skip`s while nothing is selected (`skipSelected:
    // true`); return a null connection in that case so the empty selection
    // resolves cleanly.
    BAIAdminImageSelectAstryxValueQuery: (variables: Record<string, any>) =>
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
