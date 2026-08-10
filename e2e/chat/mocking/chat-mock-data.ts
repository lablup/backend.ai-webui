// e2e/chat/mocking/chat-mock-data.ts
// Shared mock helpers and data for chat E2E tests.
import { setupGraphQLMocks } from '../../session/mocking/graphql-interceptor';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { type APIRequestContext, type Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Mock constants
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_ENDPOINT_UUID = 'chat-ep-aaaa-bbbb-cccc-000000000001';
export const MOCK_ENDPOINT_UUID_B = MOCK_ENDPOINT_UUID + '-b';
export const MOCK_ENDPOINT_URL = 'https://mock-chat-endpoint.backend.ai';
export const MOCK_ENDPOINT_URL_B = 'https://mock-chat-endpoint-b.backend.ai';
export const MOCK_MODEL_ID = 'gpt-mock-model';
export const MOCK_MODEL_ID_B = 'gpt-mock-model-b';

// ─────────────────────────────────────────────────────────────────────────────
// Relay global-id helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mirrors `toGlobalId` from `backend.ai-ui` (`btoa(\`${type}:${id}\`)`), but
 * implemented locally with `Buffer` since this file runs in the Playwright
 * Node context, not the browser. The Strawberry `deployment(id:)` field and
 * `myDeployments` connection nodes address deployments by this global id, and
 * the app decodes it back to the local UUID with `toLocalId`.
 */
function toGlobalId(type: string, id: string): string {
  return Buffer.from(`${type}:${id}`).toString('base64');
}

const MOCK_DEPLOYMENT_GLOBAL_ID = toGlobalId(
  'ModelDeployment',
  MOCK_ENDPOINT_UUID,
);
const MOCK_DEPLOYMENT_GLOBAL_ID_B = toGlobalId(
  'ModelDeployment',
  MOCK_ENDPOINT_UUID_B,
);

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL mock response factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a single mock deployment for ChatPageQuery (`myDeployments`).
 * Shape matches the wire-format GraphQL response (not Relay TypeScript types).
 */
export function chatPageQueryMockResponse() {
  return {
    myDeployments: {
      edges: [{ node: { id: MOCK_DEPLOYMENT_GLOBAL_ID } }],
    },
  };
}

/**
 * Returns two mock deployments for ChatPageQuery's `myDeployments` shape.
 * Currently unused by the setup helpers below (they only need one default
 * deployment), kept for parity with `deploymentSelectQueryTwoEndpointsMockResponse`.
 */
export function chatPageQueryTwoEndpointsMockResponse() {
  return {
    myDeployments: {
      edges: [
        { node: { id: MOCK_DEPLOYMENT_GLOBAL_ID } },
        { node: { id: MOCK_DEPLOYMENT_GLOBAL_ID_B } },
      ],
    },
  };
}

/**
 * Returns the deployment list for DeploymentSelectQuery (single deployment).
 * Includes all fields required by DeploymentSelectQuery: count, metadata.name,
 * networkAccess.endpointUrl.
 */
export function deploymentSelectQueryMockResponse() {
  return {
    myDeployments: {
      count: 1,
      edges: [
        {
          node: {
            id: MOCK_DEPLOYMENT_GLOBAL_ID,
            metadata: { name: 'mock-endpoint' },
            networkAccess: { endpointUrl: MOCK_ENDPOINT_URL },
          },
        },
      ],
    },
  };
}

/**
 * Returns two deployments for DeploymentSelectQuery (two-endpoint multi-pane tests).
 */
export function deploymentSelectQueryTwoEndpointsMockResponse() {
  return {
    myDeployments: {
      count: 2,
      edges: [
        {
          node: {
            id: MOCK_DEPLOYMENT_GLOBAL_ID,
            metadata: { name: 'mock-endpoint' },
            networkAccess: { endpointUrl: MOCK_ENDPOINT_URL },
          },
        },
        {
          node: {
            id: MOCK_DEPLOYMENT_GLOBAL_ID_B,
            metadata: { name: 'mock-endpoint-b' },
            networkAccess: { endpointUrl: MOCK_ENDPOINT_URL_B },
          },
        },
      ],
    },
  };
}

/**
 * Returns deployment detail for ChatCardQuery.
 *
 * IMPORTANT: ChatCardQuery uses `@catch` in Relay, but that is a client-side
 * transformation. The wire-format GraphQL response still returns the
 * ModelDeployment object directly (not wrapped in { ok, value }). Relay's
 * normalizer applies the Result wrapping after receiving the response.
 *
 * `deploymentId` here is the value ChatCardQuery actually sends on the wire —
 * the Relay *global* id (`toGlobalId('ModelDeployment', localId)`), not the
 * raw local UUID.
 */
export function chatCardQueryMockResponse(deploymentId: string) {
  const isB = deploymentId === MOCK_DEPLOYMENT_GLOBAL_ID_B;
  return {
    deployment: {
      id: deploymentId,
      networkAccess: {
        endpointUrl: isB ? MOCK_ENDPOINT_URL_B : MOCK_ENDPOINT_URL,
      },
      // `replicaState.desiredReplicaCount` is selected by ChatCardQuery
      // (FR-3332 migration off the legacy `replicas` scalar). It must be
      // present in the mock — the query wraps `deployment` in Relay `@catch`,
      // so a missing field makes the catch result not-ok, nulls the
      // deployment, and leaves the chat input disabled (no base URL → no
      // /v1/models fetch).
      replicaState: { desiredReplicaCount: 1 },
      metadata: { name: isB ? 'mock-endpoint-b' : 'mock-endpoint' },
    },
  };
}

/**
 * Returns a deployment detail with a null URL to test invalid base URL handling.
 */
export function chatCardQueryNullUrlMockResponse(deploymentId: string) {
  return {
    deployment: {
      id: deploymentId,
      networkAccess: { endpointUrl: null },
      // See chatCardQueryMockResponse: `replicaState` must be present for the
      // Relay `@catch` on `deployment` to resolve to a value (here we are
      // deliberately exercising the null-URL path, not a missing deployment).
      replicaState: { desiredReplicaCount: 1 },
      metadata: { name: 'mock-endpoint-no-url' },
    },
  };
}

/**
 * Returns deployment detail for DeploymentSelectValueQuery.
 * Variable name is `deploymentId` — matches the query's variable declaration,
 * and is the Relay global id (see chatCardQueryMockResponse).
 */
export function deploymentSelectValueQueryMockResponse(deploymentId: string) {
  const isB = deploymentId === MOCK_DEPLOYMENT_GLOBAL_ID_B;
  return {
    deployment: {
      id: deploymentId,
      metadata: {
        name: isB ? 'mock-endpoint-b' : 'mock-endpoint',
        // Not exercised by these tests (only read for the cross-project
        // "go to detail page" confirm flow); a fixed dummy UUID is enough to
        // satisfy the non-null field.
        projectId: '00000000-0000-0000-0000-000000000000',
      },
      networkAccess: {
        endpointUrl: isB ? MOCK_ENDPOINT_URL_B : MOCK_ENDPOINT_URL,
      },
    },
  };
}

/**
 * Returns an empty access-token list for DeploymentTokenSelectQuery.
 *
 * IMPORTANT: This query is NOT part of the chat "happy path" — it is only
 * triggered transiently by `CustomModelForm`/`DeploymentTokenSelect`, which
 * mount for a brief instant before the mocked `/v1/models` response resolves
 * (`_.isEmpty(models)` is true on the very first render). If this operation
 * is left unmocked, the request falls through to the real backend, which
 * rejects the mock deployment id's fake local UUID with a "badly formed
 * hexadecimal UUID string" GraphQL field error. Because `deployment(id: X)`
 * is the same field+args (same Relay storageKey) that ChatCardQuery and
 * DeploymentSelectValueQuery also read on `client:root`, that real error
 * poisons the shared record and makes ChatCardQuery's `@catch` resolve to
 * not-ok — leaving the chat composer permanently disabled. Mocking this
 * operation prevents the real backend from ever seeing the fake deployment id.
 *
 * `id` MUST be included even though the component only reads `accessTokens`:
 * Relay's compiler auto-appends `id` to every selection on a `Node`-like type
 * (see the generated query text), and Relay's normalizer uses that `id` value
 * to resolve the record's dataID. Omitting it makes Relay fall back to a
 * client-generated dataID for this response, which — because `deployment(id:
 * X)` is the exact same field+args (storageKey) as ChatCardQuery and
 * DeploymentSelectValueQuery on `client:root` — overwrites the shared root
 * link with an orphan record that only has `accessTokens`, wiping out
 * `id`/`networkAccess`/`replicaState` for every other reader of that same
 * root field (including ChatCardQuery's `@catch`).
 */
export function deploymentTokenSelectQueryMockResponse(deploymentId: string) {
  return {
    deployment: {
      id: deploymentId,
      accessTokens: { edges: [] },
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// REST API mock response factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a models API response with a single model.
 */
export function modelsApiMockResponse(modelId: string) {
  return { data: [{ id: modelId, object: 'model' }] };
}

/**
 * Builds an OpenAI-compatible SSE response matching the real model service format.
 */
export function makeSseResponse(content: string): string {
  const id = 'chatcmpl-mock-' + Math.random().toString(36).slice(2, 10);
  const created = Math.floor(Date.now() / 1000);

  // Chunk 1: role announcement
  const chunk1 = JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    created,
    model: 'test',
    choices: [
      {
        index: 0,
        delta: { role: 'assistant', content: '' },
        logprobs: null,
        finish_reason: null,
      },
    ],
  });

  // Chunk 2: content
  const chunk2 = JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    created,
    model: 'test',
    choices: [
      {
        index: 0,
        delta: { content },
        logprobs: null,
        finish_reason: null,
      },
    ],
  });

  // Chunk 3: finish
  const chunk3 = JSON.stringify({
    id,
    object: 'chat.completion.chunk',
    created,
    model: 'test',
    choices: [
      {
        index: 0,
        delta: {},
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
  });

  return `data: ${chunk1}\n\ndata: ${chunk2}\n\ndata: ${chunk3}\n\ndata: [DONE]\n\n`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page setup helper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full chat page setup:
 * 1. Login as admin.
 * 2. Clear chat history from localStorage.
 * 3. Install GraphQL mocks (must be before navigation).
 * 4. Install models API mock.
 * 5. Install chat completions mock.
 * 6. Navigate to /chat.
 */
export async function setupChatPage(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  await loginAsAdmin(page, request);

  // Clear chat history so each test starts from a blank state.
  // loginAsAdmin has already navigated to webuiEndpoint, so localStorage is accessible here.
  await page.evaluate(() => {
    localStorage.removeItem('backendaiwebui.cache.chat_history');
  });

  // GraphQL mocks — variable names must match the wire-format query variables
  await setupGraphQLMocks(page, {
    ChatPageQuery: () => chatPageQueryMockResponse(),
    ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.deploymentId),
    DeploymentSelectQuery: () => deploymentSelectQueryMockResponse(),
    DeploymentSelectValueQuery: (vars) =>
      deploymentSelectValueQueryMockResponse(vars.deploymentId),
    DeploymentTokenSelectQuery: (vars) =>
      deploymentTokenSelectQueryMockResponse(vars.deploymentId),
  });

  // Models API mock
  await page.route('**/v1/models', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(modelsApiMockResponse(MOCK_MODEL_ID)),
    });
  });

  // Chat completions mock — standard successful streaming response
  await page.route('**/v1/chat/completions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: makeSseResponse('Hello from mock!'),
    });
  });

  // Navigate to chat page
  await navigateTo(page, 'chat');
}

/**
 * Setup variant for two-endpoint multi-pane tests.
 * DeploymentSelectQuery returns both deployments; completions requests are
 * differentiated by URL (alpha vs beta prefix).
 */
export async function setupChatPageWithTwoEndpoints(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  await loginAsAdmin(page, request);

  await page.evaluate(() => {
    localStorage.removeItem('backendaiwebui.cache.chat_history');
  });

  await setupGraphQLMocks(page, {
    ChatPageQuery: () => chatPageQueryMockResponse(),
    ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.deploymentId),
    DeploymentSelectQuery: () =>
      deploymentSelectQueryTwoEndpointsMockResponse(),
    DeploymentSelectValueQuery: (vars) =>
      deploymentSelectValueQueryMockResponse(vars.deploymentId),
    DeploymentTokenSelectQuery: (vars) =>
      deploymentTokenSelectQueryMockResponse(vars.deploymentId),
  });

  // Models API mock — both endpoints respond with their respective model IDs
  // Differentiate by URL path/host since models endpoint is a GET request
  await page.route('**/v1/models', async (route) => {
    const url = route.request().url();
    const isEndpointB = url.includes('mock-chat-endpoint-b');
    const modelId = isEndpointB ? MOCK_MODEL_ID_B : MOCK_MODEL_ID;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(modelsApiMockResponse(modelId)),
    });
  });

  // Completions mock — differentiate by model ID in request body
  await page.route('**/v1/chat/completions', async (route) => {
    const postData = route.request().postData();
    const body = postData ? JSON.parse(postData) : {};
    // streamText sends `model` field; DefaultChatTransport sends `modelId`
    const model = body.model || body.modelId || '';
    const content = model.includes(MOCK_MODEL_ID_B)
      ? 'Response from endpoint B'
      : 'Response from endpoint A';
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: makeSseResponse(content),
    });
  });

  await navigateTo(page, 'chat');
}
