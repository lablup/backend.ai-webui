// FR-3414 / FR-3415 (ADR-0001): the header's current-project selector must be
// hidden on every project-agnostic route (they operate above project scope)
// and visible everywhere else; leaving an admin route must restore the
// previous selection untouched (the selector block is unmounted there, so
// nothing can write the current-project atom).
//
// The route list is DERIVED from the app's single source of truth
// (`react/src/helper/projectAgnosticRoutes.ts`) rather than duplicated here —
// a fourth hand-maintained copy is exactly how the earlier copies drifted.
// The module is a deliberate leaf (it imports nothing), so pulling it into
// Playwright costs nothing.
import {
  PROJECT_AGNOSTIC_MENU_KEYS,
  PROJECT_AGNOSTIC_ROUTE_PATHS,
  type ProjectAgnosticMenuKey,
} from '../../react/src/helper/projectAgnosticRoutes';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

/**
 * Menu keys whose page is behind a manager feature flag (`routes.tsx` gates
 * them on `baiClient.supports(...)` and redirects to `/error` otherwise).
 * They are still gated in the app; they are just not navigable on every test
 * cluster, so this spec cannot assert the header on them.
 */
const FEATURE_GATED_MENU_KEYS = new Set<ProjectAgnosticMenuKey>([
  'scheduler', // 'fair-share-scheduling'
  'rbac', // 'rbac'
  'reservoir', // 'reservoir'
]);

/** `navigateTo` resolves against the base URL, so paths are passed unrooted. */
const PROJECT_AGNOSTIC_ROUTES = PROJECT_AGNOSTIC_MENU_KEYS.filter(
  (menuKey) => !FEATURE_GATED_MENU_KEYS.has(menuKey),
).map((menuKey) =>
  PROJECT_AGNOSTIC_ROUTE_PATHS[menuKey].canonicalPath.replace(/^\//, ''),
);

test.describe(
  'Header project selector on project-agnostic routes',
  { tag: ['@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test('selector is absent on every project-agnostic route', async ({
      page,
    }) => {
      for (const route of PROJECT_AGNOSTIC_ROUTES) {
        await navigateTo(page, route);
        // The header itself must still render (no layout collapse) …
        await expect(page.getByTestId('webui-header')).toBeVisible();
        // … but the project selector block must not be mounted at all.
        await expect(page.getByTestId('selector-project')).toHaveCount(0);
      }
    });

    test('the Environments page selects its project in the page, not the header', async ({
      page,
    }) => {
      // FR-3415: `environment` joined the gated set once the page grew its own
      // all-projects selector. The header selector is gone; the in-page one is
      // there instead.
      await navigateTo(page, 'admin/environment');
      await expect(page.getByTestId('webui-header')).toBeVisible();
      await expect(page.getByTestId('selector-project')).toHaveCount(0);
      await expect(
        page.getByTestId('environment-project-select'),
      ).toBeVisible();
    });

    test('selector is present on the user Data page', async ({ page }) => {
      await navigateTo(page, 'data');
      await expect(page.getByTestId('selector-project')).toBeVisible();
    });

    test('leaving an admin route restores the previous selection untouched', async ({
      page,
    }) => {
      // Capture the selection on a general page.
      await navigateTo(page, 'data');
      const selector = page.getByTestId('selector-project');
      await expect(selector).toBeVisible();
      const before = (await selector.innerText()).trim();
      expect(before).not.toEqual('');

      // Visit each admin route (selector unmounted there) …
      for (const route of PROJECT_AGNOSTIC_ROUTES) {
        await navigateTo(page, route);
        await expect(page.getByTestId('selector-project')).toHaveCount(0);
      }

      // … and come back: the selection must be exactly what it was.
      await navigateTo(page, 'data');
      await expect(page.getByTestId('selector-project')).toBeVisible();
      await expect(page.getByTestId('selector-project')).toHaveText(before);
    });
  },
);
