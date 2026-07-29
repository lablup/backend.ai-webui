// FR-3414 (ADR-0001): the header's current-project selector must be hidden on
// the three super-admin-scoped routes (they operate above project scope) and
// visible everywhere else; leaving an admin route must restore the previous
// selection untouched (the selector block is unmounted there, so nothing can
// write the current-project atom).
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

const SUPER_ADMIN_ROUTES = ['admin/session', 'admin/deployments', 'admin/data'];

test.describe(
  'Header project selector on super-admin routes',
  { tag: ['@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test('selector is absent on the three super-admin routes', async ({
      page,
    }) => {
      for (const route of SUPER_ADMIN_ROUTES) {
        await navigateTo(page, route);
        // The header itself must still render (no layout collapse) …
        await expect(page.getByTestId('webui-header')).toBeVisible();
        // … but the project selector block must not be mounted at all.
        await expect(page.getByTestId('selector-project')).toHaveCount(0);
      }
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
      for (const route of SUPER_ADMIN_ROUTES) {
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
