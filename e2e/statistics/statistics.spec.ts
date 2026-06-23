// spec: Statistics page tests
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe('Statistics', { tag: ['@functional', '@statistics'] }, () => {
  test('Admin can see Statistics page with Allocation History tab', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'statistics');

    // Verify Allocation History tab is selected by default
    await expect(
      page.getByRole('tab', { name: 'Allocation History', selected: true }),
    ).toBeVisible();

    // Verify Period selector exists
    await expect(page.getByText(/Period/)).toBeVisible();

    // Verify chart sections exist
    await expect(page.getByText('Sessions').first()).toBeVisible();
    await expect(page.getByText('CPU').first()).toBeVisible();
    await expect(page.getByText('Memory').first()).toBeVisible();
  });

  test(
    'Admin can switch to User Session History tab',
    { tag: ['@requires-manager-v25.6'] },
    async ({ page, request }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'statistics');

      // Declarative feature gate (FR-3112): the User Session History tab is
      // rendered only when the manager supports 'user-metrics'
      // (manager >= 25.6.0; tab introduced by FR-655).
      await skipUnlessClientFeature(
        page,
        'user-metrics',
        "User Session History tab requires the 'user-metrics' capability (Backend.AI manager >= 25.6.0, FR-655)",
      );

      // The backend is capable — the tab MUST be present; absence is a failure.
      const userSessionTab = page.getByRole('tab', {
        name: 'User Session History',
      });
      await expect(userSessionTab).toBeVisible();

      await userSessionTab.click();
      await expect(
        page.getByRole('tab', {
          name: 'User Session History',
          selected: true,
        }),
      ).toBeVisible();
    },
  );
});
