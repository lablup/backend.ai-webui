// spec: .specs/FR-3620-usage-report/spec.md (W7 — usage-report e2e).
// Not covered here: the truncation banner needs utilization data straddling
// the retention edge, which a fresh e2e cluster cannot guarantee — deferred
// with the FR-3632 PR as a seeded-data follow-up.
import { loginAsAdmin, loginAsUser, navigateTo } from '../utils/test-util';
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

  test('A period without data keeps every section as an empty placeholder', async ({
    page,
  }) => {
    // A period far outside every retention window is deterministically empty;
    // spec §4: empty sections render a placeholder, never disappear.
    await navigateTo(
      page,
      'report/usage?period=monthly&periodStart=2020-01-01',
    );
    await expect(
      page.getByRole('heading', { name: 'Monthly Resource Usage Report' }),
    ).toBeVisible({ timeout: REPORT_TIMEOUT });

    // All four chart cards (utilization, GPU-hours, CPU-hours, sessions)
    // keep their slot with the placeholder text.
    await expect(page.getByText('No data for this period')).toHaveCount(4, {
      timeout: REPORT_TIMEOUT,
    });
  });
});

test.describe(
  'Usage Report (admin scope)',
  { tag: ['@functional', '@usage-report'] },
  () => {
    test('Superadmin can open the whole-cluster report with a top-users table', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'report/usage');
      await expect(
        page.getByRole('heading', { name: 'Weekly Resource Usage Report' }),
      ).toBeVisible({ timeout: REPORT_TIMEOUT });

      // The scope control renders only against managers with the 26.4.2
      // preset-result API (spec §5 feature gating).
      const adminScopeRadio = page.getByRole('radio', {
        name: 'Whole cluster',
        exact: true,
      });
      test.skip(
        !(await adminScopeRadio.isVisible()),
        'manager lacks prometheus-query-preset support',
      );

      await adminScopeRadio.click();
      await expect(page).toHaveURL(/scope=admin/);
      await expect(
        page.getByRole('heading', { name: 'Weekly Resource Usage Report' }),
      ).toBeVisible({ timeout: REPORT_TIMEOUT });
      // Admin scope appends the top-users table (spec §4 item 4).
      await expect(
        page.getByText('Top users by GPU-hours', { exact: true }),
      ).toBeVisible({ timeout: REPORT_TIMEOUT });
    });
  },
);
