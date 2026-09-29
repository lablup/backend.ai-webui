// FR-4058: an ordinary user reads the MODEL_STORE project through
// `scopedProjectsV2` (manager >= 26.9.0a1) instead of the domain-admin-only
// `domainV2.projects`, so the Model Store page no longer falls back to the
// "Model Store project not found" banner.
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// PEP 440: a `26.9.0.devN` manager sorts before `a1` and is skipped.
const SCOPED_PROJECTS_MIN_MANAGER_VERSION = '26.9.0a1';

async function skipUnlessManagerSupportsScopedProjects(page: Page) {
  await page.waitForFunction(
    () => {
      const client = (globalThis as any).backendaiclient;
      return client !== undefined && client !== null && client.ready === true;
    },
    { timeout: 10000 },
  );
  const supported = await page.evaluate(
    (version) =>
      (globalThis as any).backendaiclient.isManagerVersionCompatibleWith(
        version,
      ) as boolean,
    SCOPED_PROJECTS_MIN_MANAGER_VERSION,
  );
  test.skip(
    !supported,
    `scopedProjectsV2 requires manager >= ${SCOPED_PROJECTS_MIN_MANAGER_VERSION}`,
  );
}

test.describe(
  'Model Store - Regular User Access',
  {
    tag: [
      '@model-store',
      '@serving',
      '@functional',
      '@regression',
      '@requires-manager-v26.9',
    ],
  },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsUser(page, request);
      await skipUnlessManagerSupportsScopedProjects(page);
    });

    test('User can open the Model Store page without a project error', async ({
      page,
    }) => {
      const projectQueryResponse = page.waitForResponse(
        (response) =>
          response.url().includes('/gql') &&
          (response.request().postData() ?? '').includes(
            'useModelStoreProjectQuery',
          ),
      );

      await navigateTo(page, 'model-store');
      await expect(page).toHaveURL(/\/model-store(\?|$)/);

      const projectQueryBody = await (await projectQueryResponse).json();
      expect(projectQueryBody.errors).toBeUndefined();
      expect(
        projectQueryBody.data?.scopedProjectsV2?.edges?.length ?? 0,
      ).toBeGreaterThan(0);

      await expect(
        page.getByRole('combobox', { name: 'Search filters' }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Select' }).filter({
          hasText: 'Newest first',
        }),
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Refresh', exact: true }),
      ).toBeVisible();

      // Either the card grid (with its "1–N of M" pagination) or the empty state.
      await expect(
        page
          .getByText(/^\d+–\d+ of \d+$/)
          .or(page.getByText('No models found'))
          .first(),
      ).toBeVisible();
      await expect(page.getByText('Model Store project not found')).toHaveCount(
        0,
      );
    });
  },
);
