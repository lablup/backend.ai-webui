// e2e/chat/mocking/chat-mock-data.ts
// Shared mock helpers and data for chat E2E tests.
//
// The Chat deployment surface reads the Strawberry v2 Deployments API
// (`myDeployments` / `deployment(id:)`), so every factory below returns that
// wire shape. FR-3332 migrated these queries off the legacy Graphene
// `endpoint` / `endpoint_list` fields and renamed `EndpointSelect*` to
// `DeploymentSelect*`; a mock keyed on a stale operation name is not an error —
// the interceptor passes unmatched operations through to the real backend — so
// the names here must track the queries exactly.
import { setupGraphQLMocks } from '../../session/mocking/graphql-interceptor';
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import { expect, type APIRequestContext, type Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Mock constants
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DEPLOYMENT_UUID = 'chat-dp-aaaa-bbbb-cccc-000000000001';
export const MOCK_DEPLOYMENT_UUID_B = MOCK_DEPLOYMENT_UUID + '-b';
export const MOCK_DEPLOYMENT_URL = 'https://mock-chat-deployment.backend.ai';
export const MOCK_DEPLOYMENT_URL_B =
  'https://mock-chat-deployment-b.backend.ai';
export const MOCK_DEPLOYMENT_NAME = 'mock-deployment';
export const MOCK_DEPLOYMENT_NAME_B = 'mock-deployment-b';
export const MOCK_MODEL_ID = 'gpt-mock-model';
export const MOCK_MODEL_ID_B = 'gpt-mock-model-b';

/**
 * Assistant replies the two-deployment completions mock streams back. Exported
 * so a spec asserts the exact string the mock produces instead of restating it —
 * a restated literal is what let these assertions drift out of sync.
 */
export const MOCK_REPLY_A = 'Response from deployment A';
export const MOCK_REPLY_B = 'Response from deployment B';

// ─────────────────────────────────────────────────────────────────────────────
// Relay global ID helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encodes a deployment UUID the way the app's `toGlobalId` does. Chat holds
 * local UUIDs (chat provider state, the `deploymentId` URL param, the select's
 * value) and converts to the global Relay ID on the way into `deployment(id:)`,
 * so mocks must speak global IDs on the wire.
 */
export function toMockDeploymentGlobalId(uuid: string): string {
  return Buffer.from(`ModelDeployment:${uuid}`).toString('base64');
}

/**
 * Reverses {@link toMockDeploymentGlobalId} so a mock factory can tell which
 * deployment a `deployment(id:)` request is asking for.
 */
export function fromMockDeploymentGlobalId(globalId: string): string {
  return Buffer.from(globalId, 'base64').toString().split(':')[1] ?? '';
}

function isDeploymentB(deploymentGlobalId: string): boolean {
  return (
    fromMockDeploymentGlobalId(deploymentGlobalId) === MOCK_DEPLOYMENT_UUID_B
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GraphQL mock response factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the default deployment for ChatPageQuery, which reads
 * `myDeployments(limit: 1)` to pick the initially-selected deployment.
 * Shape matches the wire-format GraphQL response (not Relay TypeScript types).
 */
export function chatPageQueryMockResponse() {
  return {
    myDeployments: {
      edges: [{ node: { id: toMockDeploymentGlobalId(MOCK_DEPLOYMENT_UUID) } }],
    },
  };
}

/**
 * Returns the deployment list for DeploymentSelectQuery (single deployment).
 * Includes every field the query selects: `count`, `metadata.name` and
 * `networkAccess.endpointUrl`.
 */
export function deploymentSelectQueryMockResponse() {
  return {
    myDeployments: {
      count: 1,
      edges: [
        {
          node: {
            id: toMockDeploymentGlobalId(MOCK_DEPLOYMENT_UUID),
            metadata: { name: MOCK_DEPLOYMENT_NAME },
            networkAccess: { endpointUrl: MOCK_DEPLOYMENT_URL },
          },
        },
      ],
    },
  };
}

/**
 * Returns two deployments for DeploymentSelectQuery (multi-pane tests that
 * switch one pane onto a second deployment).
 */
export function deploymentSelectQueryTwoDeploymentsMockResponse() {
  return {
    myDeployments: {
      count: 2,
      edges: [
        {
          node: {
            id: toMockDeploymentGlobalId(MOCK_DEPLOYMENT_UUID),
            metadata: { name: MOCK_DEPLOYMENT_NAME },
            networkAccess: { endpointUrl: MOCK_DEPLOYMENT_URL },
          },
        },
        {
          node: {
            id: toMockDeploymentGlobalId(MOCK_DEPLOYMENT_UUID_B),
            metadata: { name: MOCK_DEPLOYMENT_NAME_B },
            networkAccess: { endpointUrl: MOCK_DEPLOYMENT_URL_B },
          },
        },
      ],
    },
  };
}

/**
 * Returns deployment detail for ChatCardQuery.
 *
 * IMPORTANT: ChatCardQuery wraps `deployment` in Relay `@catch`, but that is a
 * client-side transformation — the wire response still returns the
 * ModelDeployment object directly (not `{ ok, value }`). Relay applies the
 * Result wrapping while normalising.
 *
 * Every field the query selects must be present. A missing field makes the
 * catch result not-ok, which nulls the deployment and leaves the chat input
 * disabled (no base URL -> no /v1/models fetch).
 */
export function chatCardQueryMockResponse(deploymentGlobalId: string) {
  const isB = isDeploymentB(deploymentGlobalId);
  return {
    deployment: {
      id: deploymentGlobalId,
      networkAccess: {
        endpointUrl: isB ? MOCK_DEPLOYMENT_URL_B : MOCK_DEPLOYMENT_URL,
      },
      replicaState: { desiredReplicaCount: 1 },
      metadata: { name: isB ? MOCK_DEPLOYMENT_NAME_B : MOCK_DEPLOYMENT_NAME },
    },
  };
}

/**
 * Returns deployment detail for DeploymentSelectValueQuery — the lookup that
 * renders the currently-selected value in the deployment select.
 */
export function deploymentSelectValueQueryMockResponse(
  deploymentGlobalId: string,
) {
  const isB = isDeploymentB(deploymentGlobalId);
  return {
    deployment: {
      id: deploymentGlobalId,
      metadata: { name: isB ? MOCK_DEPLOYMENT_NAME_B : MOCK_DEPLOYMENT_NAME },
      networkAccess: {
        endpointUrl: isB ? MOCK_DEPLOYMENT_URL_B : MOCK_DEPLOYMENT_URL,
      },
    },
  };
}

/**
 * Returns the access-token list for DeploymentTokenSelectQuery. Empty by
 * default: the chat specs drive the token field as free text, and leaving this
 * unmocked sends the fake mock UUID to the real manager, which answers
 * "badly formed hexadecimal UUID string".
 */
export function deploymentTokenSelectQueryMockResponse(
  deploymentGlobalId: string,
) {
  return {
    deployment: {
      id: deploymentGlobalId,
      accessTokens: { edges: [] },
    },
  };
}

/**
 * The GraphQL mock map shared by every chat spec: one reachable deployment.
 * Exposed as a factory so a spec can spread it and override a single operation
 * (e.g. the null-URL ChatCardQuery variant) without restating the rest — the
 * drift that broke these specs came from restating the map in each spec.
 */
export function chatGraphQLMocks() {
  return {
    ChatPageQuery: () => chatPageQueryMockResponse(),
    ChatCardQuery: (vars: Record<string, string>) =>
      chatCardQueryMockResponse(vars.deploymentId),
    DeploymentSelectQuery: () => deploymentSelectQueryMockResponse(),
    DeploymentSelectValueQuery: (vars: Record<string, string>) =>
      deploymentSelectValueQueryMockResponse(vars.deploymentId),
    DeploymentTokenSelectQuery: (vars: Record<string, string>) =>
      deploymentTokenSelectQueryMockResponse(vars.deploymentId),
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
 * How long a freshly-navigated chat pane may take to become interactive.
 *
 * Deliberately far above the per-assertion timeouts in the specs: reaching an
 * interactive pane costs a full app boot (login, project/user bootstrap queries)
 * against the real manager before the mocked deployment lookups even run, and
 * that boot is what stretches under parallel workers — measured at ~15s per test
 * with `--workers=1` against a shared manager and over 45s with the default four.
 * It is a readiness gate, not a behavioural assertion, so a generous budget costs
 * nothing on a fast target while keeping a slow shared one usable; the specs' own
 * 5-10s assertion timeouts still measure chat behaviour on a settled page.
 * Stays under Playwright's 180s per-test timeout with room for the test body.
 */
export const CHAT_READY_TIMEOUT_MS = 120_000;

/**
 * Waits until a chat pane is actually interactive. Every chat setup path for a
 * reachable deployment ends here so a spec never starts asserting against a
 * half-booted page.
 *
 * Both conditions matter. Visibility alone is not readiness: the composer renders
 * disabled until the pane has resolved a deployment URL and fetched its model
 * list, and `press('Enter')` on a disabled composer silently does nothing — the
 * message never sends and the failure surfaces later as a missing reply rather
 * than as "the page was not ready".
 *
 * Not for panes that are expected to stay unavailable (e.g. a deployment with no
 * endpoint URL): those keep a disabled composer by design, so gate those specs on
 * the unavailability alert instead.
 */
export async function waitForChatReady(page: Page): Promise<void> {
  const composer = page.getByPlaceholder('Type your message here...').first();
  await composer.waitFor({ state: 'visible', timeout: CHAT_READY_TIMEOUT_MS });
  await expect(composer).toBeEnabled({ timeout: CHAT_READY_TIMEOUT_MS });
}

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
  await setupGraphQLMocks(page, chatGraphQLMocks());

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
  await waitForChatReady(page);
}

/**
 * Setup variant for two-deployment multi-pane tests.
 * DeploymentSelectQuery returns both deployments; completions requests are
 * differentiated by URL (alpha vs beta prefix).
 */
export async function setupChatPageWithTwoDeployments(
  page: Page,
  request: APIRequestContext,
): Promise<void> {
  await loginAsAdmin(page, request);

  await page.evaluate(() => {
    localStorage.removeItem('backendaiwebui.cache.chat_history');
  });

  await setupGraphQLMocks(page, {
    ...chatGraphQLMocks(),
    DeploymentSelectQuery: () =>
      deploymentSelectQueryTwoDeploymentsMockResponse(),
  });

  // Models API mock — both deployments respond with their respective model IDs
  // Differentiate by URL path/host since models endpoint is a GET request
  await page.route('**/v1/models', async (route) => {
    const url = route.request().url();
    const isB = url.includes('mock-chat-deployment-b');
    const modelId = isB ? MOCK_MODEL_ID_B : MOCK_MODEL_ID;
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
      ? MOCK_REPLY_B
      : MOCK_REPLY_A;
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: makeSseResponse(content),
    });
  });

  await navigateTo(page, 'chat');
  await waitForChatReady(page);
}
