// spec: e2e/.agent-output/test-plan-auto-scaling-rule-preset.md
// sections: 7. Column Visibility, 8. Refresh, 10. Query Template Copy
import { loginAsAdmin, webuiEndpoint } from '../utils/test-util';
import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function createPreset(
  page: Page,
  name: string,
  metricName = 'e2e_metric',
  queryTemplate = 'up',
): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: /Add Preset/i })).toBeVisible({
    timeout: 60000,
  });
  await page.getByRole('button', { name: /Add Preset/i }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();
  const nameInput = modal.getByRole('textbox', { name: 'Name', exact: true });
  await expect(nameInput).toBeVisible({ timeout: 30000 });
  await nameInput.fill(name);
  await modal.getByRole('textbox', { name: 'Metric Name' }).fill(metricName);
  await modal
    .getByRole('textbox', { name: 'Query Template' })
    .fill(queryTemplate);
  await modal.getByRole('button', { name: 'Create' }).click({ force: true });
  await expect(
    page.getByText('Prometheus query preset has been successfully created.'),
  ).toBeVisible({ timeout: 120000 });
  await expect(modal).toBeHidden({ timeout: 30000 });
}

async function deletePreset(page: Page, presetName: string): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('button', { name: /Add Preset/i })).toBeVisible({
    timeout: 60000,
  });
  const row = page.getByRole('row').filter({ hasText: presetName });
  if ((await row.count()) === 0) return;
  await row.locator('button:has(.anticon-delete)').click();
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 30000 });
  await expect(confirmModal).not.toHaveClass(/ant-zoom-appear/, {
    timeout: 10000,
  });
  await confirmModal.locator('input').fill(presetName);
  await confirmModal
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(confirmModal).toBeHidden({ timeout: 30000 });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Column Visibility (Table Settings)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Column Visibility',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 7.1 Superadmin can show the hidden "Created At" and "Updated At" columns
    test('Superadmin can show the hidden Created At and Updated At columns via table settings', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });

      // Verify "Created At" and "Updated At" are NOT visible by default
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeHidden();
      await expect(
        page.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeHidden();

      // Click the column settings (gear) button
      await page.getByRole('button', { name: 'setting' }).click();
      const settingsModal = page.getByRole('dialog');
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await expect(settingsModal).toContainText('Table Settings');

      // Enable "Created At"
      await settingsModal.getByRole('checkbox', { name: 'Created At' }).check();

      // Enable "Updated At"
      await settingsModal.getByRole('checkbox', { name: 'Updated At' }).check();

      // Click "OK"
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Created At" column header is now visible
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible({ timeout: 10000 });

      // Verify "Updated At" column header is now visible
      await expect(
        page.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeVisible({ timeout: 10000 });

      // Restore hidden state for cleanup
      await page.getByRole('button', { name: 'setting' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Created At' })
        .uncheck();
      await settingsModal
        .getByRole('checkbox', { name: 'Updated At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });
    });

    // 7.2 Superadmin can hide the "Created At" and "Updated At" columns again
    test('Superadmin can hide the Created At and Updated At columns after enabling them', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });

      // Open column settings and enable both columns
      await page.getByRole('button', { name: 'setting' }).click();
      const settingsModal = page.getByRole('dialog');
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal.getByRole('checkbox', { name: 'Created At' }).check();
      await settingsModal.getByRole('checkbox', { name: 'Updated At' }).check();
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify both headers are visible
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeVisible({ timeout: 10000 });

      // Open column settings again and disable "Created At"
      await page.getByRole('button', { name: 'setting' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Created At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Created At" header is no longer visible
      await expect(
        page.getByRole('columnheader', { name: 'Created At' }),
      ).toBeHidden();

      // Open column settings again and disable "Updated At"
      await page.getByRole('button', { name: 'setting' }).click();
      await expect(settingsModal).toBeVisible();
      await expect(settingsModal).not.toHaveClass(/ant-zoom-appear/, {
        timeout: 10000,
      });
      await settingsModal
        .getByRole('checkbox', { name: 'Updated At' })
        .uncheck();
      await settingsModal.getByRole('button', { name: 'OK' }).click();
      await expect(settingsModal).toBeHidden({ timeout: 30000 });

      // Verify "Updated At" header is no longer visible
      await expect(
        page.getByRole('columnheader', { name: 'Updated At' }),
      ).toBeHidden();
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 8. Refresh
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Refresh',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@functional'] },
  () => {
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    // 8.1 Superadmin can refresh the preset list using the refresh button
    test('Superadmin can refresh the preset list using the refresh button', async ({
      page,
    }) => {
      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
      await page.waitForLoadState('domcontentloaded');

      // Verify table is visible
      await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });

      // Click the refresh (reload) button
      await page.getByRole('button', { name: 'reload' }).click();

      // Verify table is still visible after refresh
      await expect(page.getByRole('table')).toBeVisible({ timeout: 15000 });

      // Verify pagination info is still present (refresh completed)
      await expect(
        page.getByRole('listitem').filter({ hasText: /items/ }),
      ).toBeVisible({ timeout: 15000 });
    });
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// 10. Query Template Copy Interaction
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Query Template Copy',
  { tag: ['@auto-scaling-rule-preset', '@admin', '@functional'] },
  () => {
    let presetName: string;

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async ({ page }) => {
      if (presetName) {
        try {
          await deletePreset(page, presetName);
        } catch {
          // ignore cleanup errors
        }
        presetName = '';
      }
    });

    // 10.1 Superadmin can copy the Query Template text from the table row
    test('Superadmin can copy the Query Template text from the table row via copy icon', async ({
      page,
    }) => {
      presetName = `e2e-preset-copy-${Date.now()}`;
      const queryTemplate = 'rate(container_cpu_usage_seconds_total[5m])';

      // Create a preset with a distinctive Query Template
      await createPreset(page, presetName, 'e2e_metric', queryTemplate);

      // Navigate to the tab
      await page.goto(`${webuiEndpoint}/admin-serving?tab=auto-scaling-rule`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.getByRole('table')).toBeVisible({ timeout: 30000 });

      // Locate the preset row
      const row = page.getByRole('row').filter({ hasText: presetName });
      await expect(row).toBeVisible({ timeout: 15000 });

      // Find and click the copy icon in the Query Template cell
      // The cell text is truncated in the DOM (CSS ellipsis), so we locate it by column index (3rd cell = Query Template)
      const queryTemplateCell = row.locator('td').nth(2);
      await expect(queryTemplateCell).toBeVisible({ timeout: 15000 });

      const copyButton = queryTemplateCell.getByRole('button', {
        name: /copy/i,
      });
      await expect(copyButton).toBeVisible();
      await copyButton.click();

      // Verify the copy interaction is acknowledged (check icon or "Copied" state appears)
      // Ant Design Typography.Text copyable shows a check icon briefly after copying
      await expect(
        queryTemplateCell.locator('.anticon-check, [aria-label="check"]'),
      ).toBeVisible({ timeout: 5000 });
    });
  },
);
