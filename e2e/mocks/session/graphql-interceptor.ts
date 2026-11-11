import { Page } from '@playwright/test';

/**
 * A function that receives GraphQL variables and returns a mock response body.
 * The returned value is wrapped in `{ data: ... }` by the interceptor.
 */
export type GraphQLMockHandler = (
  variables: Record<string, any>,
) => Record<string, any>;

/**
 * A map of GraphQL operation names to their mock handlers.
 */
export type GraphQLMockMap = Record<string, GraphQLMockHandler>;

/**
 * Intercepts GraphQL POST requests to the `/admin/gql` endpoint and returns
 * mock responses for operations whose names appear in the `mocks` map.
 * Unmatched operations are passed through to the real backend via `route.continue()`.
 *
 * IMPORTANT: Call this **before** any navigation that triggers GraphQL queries.
 */
export async function setupGraphQLMocks(
  page: Page,
  mocks: GraphQLMockMap,
): Promise<void> {
  await page.route('**/admin/gql', async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') {
      await route.continue();
      return;
    }

    const postData = request.postData();
    if (!postData) {
      await route.continue();
      return;
    }

    let body: { query?: string; variables?: Record<string, any> };
    try {
      body = JSON.parse(postData);
    } catch {
      await route.continue();
      return;
    }

    const query = body.query ?? '';
    const match = query.match(/(?:query|mutation)\s+(\w+)/);
    const operationName = match?.[1];

    if (operationName && mocks[operationName]) {
      const variables = body.variables ?? {};
      const responseData = mocks[operationName](variables);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: responseData }),
      });
    } else {
      await route.continue();
    }
  });
}
