import { expect, type Locator, type Page } from '@playwright/test';

// Timeout for widget visibility checks - widgets load after GraphQL data fetches,
// which may be slow when multiple workers run in parallel.
export const WIDGET_TIMEOUT = 30_000;

// Resolves with the first successful GraphQL response of `operation` whose
// variables pass `matches`; rejects on a GraphQL error.
export const waitForGraphQL = async (
  page: Page,
  operation: string,
  matches: (variables: any) => boolean = () => true,
  timeout = WIDGET_TIMEOUT,
) => {
  const response = await page.waitForResponse(
    (res) => {
      if (res.request().method() !== 'POST') return false;
      let body: { query?: string; variables?: unknown } | null = null;
      try {
        body = res.request().postDataJSON();
      } catch {
        return false;
      }
      return (
        !!body?.query?.match(
          new RegExp(`(query|mutation)\\s+${operation}\\b`),
        ) && matches(body.variables)
      );
    },
    { timeout },
  );
  expect(response.ok()).toBe(true);
  const json = await response.json();
  expect(json.errors ?? []).toEqual([]);
};

// Clicks a board-saved "Show failures only" switch to `checked` and waits
// until the board write lands. Other board writes share the mutation, so match
// the filter payload; a board that already holds the value (a concurrent run
// on the shared account) sends no write.
export const setFailuresOnly = async (
  page: Page,
  toggle: Locator,
  checked: boolean,
) => {
  if ((await toggle.isChecked()) === checked) return;
  const saved = waitForGraphQL(
    page,
    'useAppConfigMyUpsertMutation',
    (variables) => JSON.stringify(variables).includes('DENIED') === checked,
    10_000,
  ).catch((error: Error) => {
    if (error.name !== 'TimeoutError') throw error;
  });
  await toggle.click();
  await expect(toggle).toBeChecked({ checked });
  await saved;
};
