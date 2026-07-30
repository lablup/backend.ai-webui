// FR-3414 / FR-3415 / FR-3422 (ADR-0001): the header's real, interactive
// current-project selector must not be mounted on any project-agnostic route
// (they operate above project scope); instead a static, disabled placeholder
// reading "All projects" is shown there, with a tooltip explaining why
// selection is unavailable. Every other route keeps the real selector
// unchanged. Leaving an admin route must restore the previous selection
// untouched (the real selector block is unmounted on admin routes, so
// nothing there can write the current-project atom).
//
// FR-3422 is an alternative to FR-3414's "hide entirely" behavior, stacked
// on top for evaluation on a running dev server; it may be closed unmerged
// if the empty-header version is preferred instead.
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

    test('the disabled "All projects" placeholder is shown on every project-agnostic route', async ({
      page,
    }) => {
      for (const route of PROJECT_AGNOSTIC_ROUTES) {
        await navigateTo(page, route);
        // The header itself must still render (no layout collapse) …
        await expect(page.getByTestId('webui-header')).toBeVisible();
        // … the real, interactive selector must not be mounted at all …
        await expect(page.getByTestId('selector-project')).toHaveCount(0);
        // … and the disabled placeholder takes its place instead.
        const placeholder = page.getByTestId('selector-project-placeholder');
        await expect(placeholder).toBeVisible();
        await expect(placeholder).toContainText('All projects');
        await expect(placeholder).toHaveClass(/ant-select-disabled/);
      }
    });

    test('the placeholder tooltip explains why selection is unavailable', async ({
      page,
    }) => {
      await navigateTo(page, 'admin/data');
      const placeholder = page.getByTestId('selector-project-placeholder');
      await expect(placeholder).toBeVisible();

      await placeholder.hover();
      await expect(
        page.getByRole('tooltip', { name: /every project/i }),
      ).toBeVisible();
    });

    test('the Environments page selects its project in the page, not the header', async ({
      page,
    }) => {
      // FR-3415: `environment` joined the gated set once the page grew its own
      // all-projects selector. The header's real selector is gone (replaced by
      // the FR-3422 placeholder); the in-page one is there instead.
      await navigateTo(page, 'admin/environment');
      await expect(page.getByTestId('webui-header')).toBeVisible();
      await expect(page.getByTestId('selector-project')).toHaveCount(0);
      await expect(
        page.getByTestId('selector-project-placeholder'),
      ).toBeVisible();
      await expect(
        page.getByTestId('environment-project-select'),
      ).toBeVisible();
    });

    test('the real, interactive selector is present on the user Data page', async ({
      page,
    }) => {
      await navigateTo(page, 'data');
      await expect(page.getByTestId('selector-project')).toBeVisible();
      // The disabled placeholder only ever appears on project-agnostic routes.
      await expect(
        page.getByTestId('selector-project-placeholder'),
      ).toHaveCount(0);
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

      // Visit each admin route (real selector unmounted there, placeholder
      // shown instead) …
      for (const route of PROJECT_AGNOSTIC_ROUTES) {
        await navigateTo(page, route);
        await expect(page.getByTestId('selector-project')).toHaveCount(0);
        await expect(
          page.getByTestId('selector-project-placeholder'),
        ).toBeVisible();
      }

      // … and come back: the selection must be exactly what it was.
      await navigateTo(page, 'data');
      await expect(page.getByTestId('selector-project')).toBeVisible();
      await expect(page.getByTestId('selector-project')).toHaveText(before);
    });
  },
);
