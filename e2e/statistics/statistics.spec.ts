// spec: Statistics page tests
import { skipUnlessClientFeature } from '../utils/feature-gate-util';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, Page } from '@playwright/test';

// `role="tab"` is never emitted unless `TabList` is given `role="tablist"`,
// which this app never does. The active tab carries `aria-current="true"`.
function statisticsTab(page: Page, name: string) {
  return page
    .getByRole('navigation', { name: 'Tabs' })
    .getByRole('button', { name });
}

test.describe('Statistics', { tag: ['@functional', '@statistics'] }, () => {
  test('Admin can see Statistics page with Allocation History tab', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'statistics');

    // Verify Allocation History tab is selected by default
    const allocationHistoryTab = statisticsTab(page, 'Allocation History');
    await expect(allocationHistoryTab).toBeVisible();
    await expect(allocationHistoryTab).toHaveAttribute('aria-current', 'true');

    // Verify Period selector exists. The self-hosted form engine
    // (BAIFormItem) renders the label text twice -- once on a `title`
    // attribute label and once on the visible field label -- so an
    // unscoped text locator strict-mode-violates.
    await expect(page.getByText(/Period/).first()).toBeVisible();

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
      const userSessionTab = statisticsTab(page, 'User Session History');
      await expect(userSessionTab).toBeVisible();

      await userSessionTab.click();
      await expect(userSessionTab).toHaveAttribute('aria-current', 'true');
    },
  );
});
