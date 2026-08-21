// spec: .specs/FR-3620-usage-report/spec.md (W7 — usage-report e2e skeleton)
import { loginAsUser, navigateTo } from '../utils/test-util';
import { test, expect } from '@playwright/test';

// The report document loads behind Suspense (allocation + utilization
// queries), so give the first render the widget-style budget.
const REPORT_TIMEOUT = 30_000;

test.describe('Usage Report', { tag: ['@functional', '@usage-report'] }, () => {
  test.beforeEach(async ({ page, request }) => {
    await loginAsUser(page, request);
    await navigateTo(page, 'report/usage');
  });

  test('User can open the usage report page in user scope', async ({
    page,
  }) => {
    // Defaults to the last complete week (spec §1) in the user's own scope.
    await expect(
      page.getByRole('heading', { name: 'Weekly Resource Usage Report' }),
    ).toBeVisible({ timeout: REPORT_TIMEOUT });

    // The KPI tiles render in the header strip ("Sessions" alone would also
    // match the sidebar nav item, so scope to the KPI container).
    const kpis = page.locator('.usage-report-kpis');
    await expect(kpis.getByText('GPU-hours', { exact: true })).toBeVisible();
    await expect(kpis.getByText('CPU-hours', { exact: true })).toBeVisible();
    await expect(kpis.getByText('Sessions', { exact: true })).toBeVisible();
  });

  test('Period type toggle switches between weekly and monthly', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Weekly Resource Usage Report' }),
    ).toBeVisible({ timeout: REPORT_TIMEOUT });

    // Astryx SegmentedControl renders real radio inputs.
    await page.getByRole('radio', { name: 'Monthly', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Monthly Resource Usage Report' }),
    ).toBeVisible({ timeout: REPORT_TIMEOUT });
    await expect(page).toHaveURL(/period=monthly/);

    await page.getByRole('radio', { name: 'Weekly', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Weekly Resource Usage Report' }),
    ).toBeVisible({ timeout: REPORT_TIMEOUT });
  });

  test('Export buttons are visible in the control bar', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'PDF', exact: true }),
    ).toBeVisible({ timeout: REPORT_TIMEOUT });
    await expect(
      page.getByRole('button', { name: 'PNG', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'CSV', exact: true }),
    ).toBeVisible();
  });
});
