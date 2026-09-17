// spec: Statistics page tests
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

    // Verify the Period selector itself, not its label: the Astryx
    // `Selector` carries the (hidden) accessible name "Period", while the
    // enclosing `Form.Item` renders that same text as a visible label --
    // asserting on the text would pass even if the control never rendered.
    await expect(page.getByRole('combobox', { name: 'Period' })).toBeVisible();

    // Verify chart sections exist
    await expect(page.getByText('Sessions').first()).toBeVisible();
    await expect(page.getByText('CPU').first()).toBeVisible();
    await expect(page.getByText('Memory').first()).toBeVisible();
  });

  test('Admin can switch to User Session History tab', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page, request);
    await navigateTo(page, 'statistics');

    // FR-655's User Session History tab is always available (manager >= 26.4.0
    // is the project baseline).
    const userSessionTab = statisticsTab(page, 'User Session History');
    await expect(userSessionTab).toBeVisible();

    await userSessionTab.click();
    await expect(userSessionTab).toHaveAttribute('aria-current', 'true');
  });
});
