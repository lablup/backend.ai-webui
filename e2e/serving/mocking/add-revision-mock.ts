/**
 * Mock data + GraphQL handler factories for the deployment Add-Revision modal
 * (FR-3205 custom Start Command + FR-3342 runtime-variant defaults).
 *
 * These specs run "hybrid": a real deployment shell is created on the live
 * backend so the real `/deployments/:id` page and the real Add-Revision modal
 * render with zero page-mock brittleness, and ONLY the modal-internal GraphQL
 * operations are intercepted by operation name via `setupGraphQLMocks`:
 *
 *   - BAIRuntimeVariantSelectPaginatedQuery / BAIRuntimeVariantSelectValueQuery
 *       feed the Runtime select a single deterministic variant so the modal's
 *       `readsVfolderConfigFiles` branching is under test control regardless of
 *       what the live backend's schema exposes (the 26.8.0-gated field is not
 *       present on the QA manager, so it MUST be mocked).
 *   - DeploymentAddRevisionModalVariantDefaultQuery
 *       supplies the variant's DB `defaultModelDefinition` baseline that drives
 *       the command / port / model-path / health-check PLACEHOLDERS (FR-3342,
 *       display-only).
 *   - DeploymentAddRevisionModalManualImageQuery
 *       resolves a manually-typed image reference to a registered image id so a
 *       Custom-mode submit reaches the mutation without depending on the live
 *       image catalog.
 *   - DeploymentAddRevisionModalAddMutation
 *       returns a canned success shape and lets a spec capture the outgoing
 *       `input` to assert FR-3205 command/shell semantics.
 *
 * Convention mirrors `model-store-mock.ts`: base64 global ids (so `safeDecodeUuid`
 * / Relay store keys line up), `__typename` on every node, and each mock is a
 * factory returning a `(variables) => data` handler.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Stable UUIDs
// ─────────────────────────────────────────────────────────────────────────────

/** Runtime-variant local UUID used across all variant mocks. */
export const MOCK_RUNTIME_VARIANT_UUID = '11111111-1111-1111-1111-111111111111';

/** Image id the manual-image resolver returns (decoded to a UUID on submit). */
export const MOCK_RESOLVED_IMAGE_UUID = '22222222-2222-2222-2222-222222222222';

/** Revision id echoed back by the add mutation. */
export const MOCK_ADDED_REVISION_UUID = '33333333-3333-3333-3333-333333333333';

/** A resolvable-looking manual image reference typed into the modal. */
export const MOCK_MANUAL_IMAGE_REFERENCE =
  'cr.backend.ai/testing/mock-fr3205:1.0@x86_64';

// ─────────────────────────────────────────────────────────────────────────────
// Runtime-variant nodes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a `RuntimeVariant` node. `readsVfolderConfigFiles` is included by
 * default; pass `omitReadsFlag` to simulate an @since(26.8.0)-stripped response
 * from an older manager (the field is absent from the payload entirely).
 */
export function buildRuntimeVariantNode(
  name: string,
  readsVfolderConfigFiles: boolean,
  omitReadsFlag = false,
): Record<string, unknown> {
  const node: Record<string, unknown> = {
    __typename: 'RuntimeVariant',
    id: btoa(`RuntimeVariant:${MOCK_RUNTIME_VARIANT_UUID}`),
    name,
  };
  if (!omitReadsFlag) {
    node.readsVfolderConfigFiles = readsVfolderConfigFiles;
  }
  return node;
}

/**
 * Returns the two runtime-variant select mocks (paginated list + value point
 * lookup) that both resolve to the SAME single variant node, so the modal's
 * Runtime select offers exactly one deterministic option.
 *
 * @param name    variant display name (e.g. 'custom', 'vllm')
 * @param reads   value of `readsVfolderConfigFiles` when present
 * @param omitReadsFlag  when true, omit the flag entirely (old-manager sim)
 */
export function runtimeVariantSelectMocks(
  name: string,
  reads: boolean,
  omitReadsFlag = false,
) {
  const node = buildRuntimeVariantNode(name, reads, omitReadsFlag);
  return {
    BAIRuntimeVariantSelectPaginatedQuery: () => ({
      runtimeVariants: { count: 1, edges: [{ node }] },
    }),
    // The value query `@skip`s when nothing is selected (`skip: true`); return
    // a null variant in that case so the empty selection resolves cleanly.
    BAIRuntimeVariantSelectValueQuery: (variables: Record<string, any>) =>
      variables?.skip ? { runtimeVariant: null } : { runtimeVariant: node },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// DB defaultModelDefinition baseline (FR-3342 placeholders, display-only)
// ─────────────────────────────────────────────────────────────────────────────

/** Distinctive baseline values so placeholder assertions are unambiguous. */
export const MOCK_DB_DEFAULT_COMMAND =
  'python -m db_default_server --port 9001';
export const MOCK_DB_DEFAULT_MODEL_PATH = '/models/db-default';
export const MOCK_DB_DEFAULT_PORT = 9001;
export const MOCK_DB_DEFAULT_HEALTH_PATH = '/db-health';
export const MOCK_DB_DEFAULT_MAX_RETRIES = 7;
export const MOCK_DB_DEFAULT_INITIAL_DELAY = 33;

// ─────────────────────────────────────────────────────────────────────────────
// vfolder `model-definition.yaml` baseline (FR-3342 placeholder precedence)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expected placeholder values parsed from the seeded model folder's
 * `model-definition.yaml` (`e2e/serving/fixtures/model-definition.yaml`, uploaded
 * by `provisionDeploymentModelFolder`). They are intentionally DISTINCT from the
 * `MOCK_DB_DEFAULT_*` values above so a spec can prove the vfolder layer
 * overrides the DB `defaultModelDefinition` baseline (vfolder > DB precedence).
 *
 * The command mirrors the fixture's `service.start_command` tokens joined by
 * `parseModelDefinitionYaml` (no token needs quoting), the port is
 * `service.port`, and max-retries is `service.health_check.max_retries`.
 */
export const MOCK_VFOLDER_COMMAND = 'python3 /models/mock_openai_server.py';
export const MOCK_VFOLDER_PORT = 8000;
export const MOCK_VFOLDER_MAX_RETRIES = 10;

/**
 * `DeploymentAddRevisionModalVariantDefaultQuery` handler returning the
 * variant's DB `defaultModelDefinition`. Only its FIRST model's `service`
 * fields feed the placeholders on the command / port / model-path / health
 * check inputs.
 */
export function variantDefaultModelDefinitionMock() {
  return () => ({
    runtimeVariant: {
      id: btoa(`RuntimeVariant:${MOCK_RUNTIME_VARIANT_UUID}`),
      defaultModelDefinition: {
        models: [
          {
            name: 'model',
            modelPath: MOCK_DB_DEFAULT_MODEL_PATH,
            service: {
              command: MOCK_DB_DEFAULT_COMMAND,
              shell: '/bin/bash',
              port: MOCK_DB_DEFAULT_PORT,
              healthCheck: {
                path: MOCK_DB_DEFAULT_HEALTH_PATH,
                interval: 12,
                maxRetries: MOCK_DB_DEFAULT_MAX_RETRIES,
                maxWaitTime: 90,
                expectedStatusCode: 200,
                initialDelay: MOCK_DB_DEFAULT_INITIAL_DELAY,
              },
            },
          },
        ],
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Manual image resolver + add mutation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `DeploymentAddRevisionModalManualImageQuery` handler: resolves any typed
 * reference to a fixed registered image id (base64 global id so `safeDecodeUuid`
 * yields {@link MOCK_RESOLVED_IMAGE_UUID}).
 */
export function manualImageResolveMock() {
  return () => ({
    image: { id: btoa(`ImageNode:${MOCK_RESOLVED_IMAGE_UUID}`) },
  });
}

/**
 * `DeploymentAddRevisionModalAddMutation` handler. Records the outgoing
 * variables into `capture.input` (so a spec can assert FR-3205 command/shell
 * semantics) and returns a minimal successful revision matching the mutation's
 * `DeploymentRevisionDetail_revision` selection.
 */
export function addRevisionMutationMock(capture: { input: any }) {
  return (variables: Record<string, any>) => {
    // Record the FIRST invocation's input and never overwrite it — the modal
    // can re-issue the mutation (e.g. React re-render / retry), and a later
    // call with a missing `input` would otherwise clobber a good capture with
    // null and break the `expect.poll(() => capture.input)` assertion.
    if (capture.input == null && variables?.input != null) {
      capture.input = variables.input;
    }
    return {
      addModelRevision: {
        revision: buildAddedRevision(),
      },
    };
  };
}

/**
 * Minimal `ModelRevision` shape satisfying the mutation's
 * `...DeploymentRevisionDetail_revision` + `deployment` selections. Every
 * optional block is nulled/emptied — the specs assert on the outgoing request
 * and the success toast, not on the returned revision detail.
 */
export function buildAddedRevision(): Record<string, unknown> {
  return {
    __typename: 'ModelRevision',
    id: btoa(`ModelRevision:${MOCK_ADDED_REVISION_UUID}`),
    revisionNumber: 1,
    createdAt: '2026-01-01T00:00:00+00:00',
    clusterConfig: { mode: 'SINGLE_NODE', size: 1 },
    resourceSlots: [],
    resourceConfig: { resourceOpts: { entries: [] } },
    modelRuntimeConfig: {
      runtimeVariant: { name: 'custom' },
      inferenceRuntimeConfig: null,
      environ: { entries: [] },
      runtimeVariantPresetValues: [],
    },
    modelMountConfig: null,
    extraMounts: [],
    imageV2: null,
    modelDefinition: null,
    deployment: null,
  };
}
