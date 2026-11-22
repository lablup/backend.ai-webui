// spec: Diagnostics page — App Config fixture check (#10229)
// Read-only: Repair App Config writes server-global app config, so the test never runs it.
import { loginAsAdmin, navigateTo } from '../../utils/test-util';
import test, { expect } from '@playwright/test';

test.describe(
  'Diagnostics App Config fixture',
  {
    tag: [
      '@regression',
      '@diagnostics',
      '@functional',
      '@requires-manager-v26.7',
    ],
  },
  () => {
    test('Superadmin can view the App Config fixture check on the Diagnostics page', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await navigateTo(page, 'admin/diagnostics');

      const sectionTrigger = page.getByRole('button', {
        name: 'App Config',
        exact: true,
      });
      await expect(sectionTrigger).toBeVisible({ timeout: 30_000 });
      await expect(sectionTrigger).toHaveAttribute('aria-expanded', 'true');

      const passed = page.getByText(
        /App Config Fixture Registered - All \d+ definitions and \d+ allow-list entries match the fixture\./,
      );
      const missing = page.getByTestId('diagnostic-app-config-fixture-missing');
      const wrongRank = page.getByTestId(
        'diagnostic-app-config-fixture-wrong-rank',
      );
      const unexpected = page.getByTestId(
        'diagnostic-app-config-fixture-unexpected',
      );
      const repairButton = page.getByRole('button', {
        name: 'Repair App Config',
      });

      await expect(
        passed.or(missing).or(wrongRank).or(unexpected).first(),
      ).toBeVisible({
        timeout: 30_000,
      });

      if (await passed.isVisible()) {
        await expect(missing).toHaveCount(0);
        await expect(wrongRank).toHaveCount(0);
        await expect(unexpected).toHaveCount(0);
        await expect(repairButton).toHaveCount(0);
        return;
      }

      await expect(repairButton).toBeVisible();
      // Without entries to purge the button repairs on click, so it is left alone.
      if (!(await unexpected.isVisible())) return;

      await expect(unexpected).toContainText('Unexpected App Config Entries');
      await repairButton.click();
      const modal = page.getByRole('dialog', { name: 'Repair App Config' });
      await expect(modal).toBeVisible();
      await expect(
        modal.getByText(/Repairing purges these entries/),
      ).toBeVisible();
      await expect(
        modal.getByRole('button', { name: 'Repair App Config' }),
      ).toBeDisabled();
      await modal.getByRole('button', { name: 'Cancel' }).click();
      await expect(modal).toBeHidden();
    });
  },
);
