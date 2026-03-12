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
// GraphQL mock response factories
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a single mock endpoint for ChatPageQuery.
 * Shape matches the wire-format GraphQL response (not Relay TypeScript types).
 */
export function chatPageQueryMockResponse() {
  return {
    endpoint_list: {
      items: [{ endpoint_id: MOCK_ENDPOINT_UUID }],
    },
  };
}

/**
 * Returns the endpoint list for EndpointSelectQuery (single endpoint).
 * Includes all fields required by EndpointSelectQuery: total_count, name, url.
 */
export function endpointSelectQueryMockResponse() {
  return {
    endpoint_list: {
      total_count: 1,
      items: [
        {
          endpoint_id: MOCK_ENDPOINT_UUID,
          name: 'mock-endpoint',
          url: MOCK_ENDPOINT_URL,
        },
      ],
    },
  };
}

/**
 * Returns two endpoints for EndpointSelectQuery (two-endpoint multi-pane tests).
 */
export function endpointSelectQueryTwoEndpointsMockResponse() {
  return {
    endpoint_list: {
      total_count: 2,
      items: [
        {
          endpoint_id: MOCK_ENDPOINT_UUID,
          name: 'mock-endpoint',
          url: MOCK_ENDPOINT_URL,
        },
        {
          endpoint_id: MOCK_ENDPOINT_UUID_B,
          name: 'mock-endpoint-b',
          url: MOCK_ENDPOINT_URL_B,
        },
      ],
    },
  };
}

/**
 * Returns two mock endpoints for multi-pane tests (ChatPageQuery shape).
 */
export function chatPageQueryTwoEndpointsMockResponse() {
  return {
    endpoint_list: {
      items: [
        { endpoint_id: MOCK_ENDPOINT_UUID },
        { endpoint_id: MOCK_ENDPOINT_UUID_B },
      ],
    },
  };
}

/**
 * Returns endpoint detail for ChatCardQuery.
 *
 * IMPORTANT: ChatCardQuery uses `@catch` in Relay, but that is a client-side
 * transformation. The wire-format GraphQL response still returns the Endpoint
 * object directly (not wrapped in { ok, value }). Relay's normaliser applies
 * the Result wrapping after receiving the response.
 */
export function chatCardQueryMockResponse(endpointId: string) {
  const isB = endpointId === MOCK_ENDPOINT_UUID_B;
  return {
    endpoint: {
      endpoint_id: endpointId,
      url: isB ? MOCK_ENDPOINT_URL_B : MOCK_ENDPOINT_URL,
      name: isB ? 'mock-endpoint-b' : 'mock-endpoint',
    },
  };
}

/**
 * Returns an endpoint detail with a null URL to test invalid base URL handling.
 */
export function chatCardQueryNullUrlMockResponse(endpointId: string) {
  return {
    endpoint: {
      endpoint_id: endpointId,
      url: null,
      name: 'mock-endpoint-no-url',
    },
  };
}

/**
 * Returns endpoint detail for EndpointSelectValueQuery.
 * Variable name is `endpoint_id` (snake_case) — matches the query's variable declaration.
 */
export function endpointSelectValueQueryMockResponse(endpointId: string) {
  const isB = endpointId === MOCK_ENDPOINT_UUID_B;
  return {
    endpoint: {
      endpoint_id: endpointId,
      name: isB ? 'mock-endpoint-b' : 'mock-endpoint',
      url: isB ? MOCK_ENDPOINT_URL_B : MOCK_ENDPOINT_URL,
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
    ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.endpointId),
    EndpointSelectQuery: () => endpointSelectQueryMockResponse(),
    // EndpointSelectValueQuery uses snake_case `endpoint_id` variable
    EndpointSelectValueQuery: (vars) =>
      endpointSelectValueQueryMockResponse(vars.endpoint_id),
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
 * EndpointSelectQuery returns both endpoints; completions requests are
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
    ChatCardQuery: (vars) => chatCardQueryMockResponse(vars.endpointId),
    EndpointSelectQuery: () => endpointSelectQueryTwoEndpointsMockResponse(),
    // EndpointSelectValueQuery uses snake_case `endpoint_id` variable
    EndpointSelectValueQuery: (vars) =>
      endpointSelectValueQueryMockResponse(vars.endpoint_id),
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
