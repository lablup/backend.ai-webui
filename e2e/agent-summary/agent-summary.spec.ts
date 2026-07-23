// spec: Agent Summary page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe(
  'Agent Summary',
  { tag: ['@functional', '@agent-summary'] },
  () => {
    test('Admin can see Agent Summary page with expected columns', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'agent-summary');

      // Verify Agent Summary tab is selected
      await expect(
        page.getByRole('tab', { name: 'Agent Summary', selected: true }),
      ).toBeVisible();

      // Verify table columns
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Architecture' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Allocation' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Resource Group' }),
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: 'Schedulable' }),
      ).toBeVisible();

      // Verify Connected/Terminated radio filter
      const radioGroup = page.getByRole('radiogroup');
      await expect(radioGroup).toBeVisible();
      await expect(
        radioGroup.getByText('Connected', { exact: true }),
      ).toBeVisible();
      await expect(radioGroup.getByText('Terminated')).toBeVisible();
    });

    test('Admin can switch between Connected and Terminated agents', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'agent-summary');

      // Click Terminated
      await page.getByText('Terminated').click();

      // Verify the table is still visible (may show "No data")
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();

      // Switch back to Connected
      await page.getByText('Connected', { exact: true }).click();

      // Table should still be visible
      await expect(
        page.getByRole('columnheader', { name: 'ID' }),
      ).toBeVisible();
    });
  },
);
