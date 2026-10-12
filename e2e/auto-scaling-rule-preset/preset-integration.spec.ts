// spec: e2e/.agent-output/test-plan-auto-scaling-rule-preset.md
// section: 9. Preset Selectability in the Auto-Scaling Rule Editor (Integration)
//
// The auto-scaling rule editor lives on the deployment detail page, so these
// tests create an empty deployment shell (no revision needed) and delete it in afterAll.
import {
  cleanupDeploymentSafely,
  createDeploymentShell,
} from '../utils/deployment-fixtures';
import { loginAsAdmin, navigateTo, webuiEndpoint } from '../utils/test-util';
import { test, expect, Page, Locator } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function createPreset(
  page: Page,
  name: string,
  metricName = 'e2e_metric',
  queryTemplate = 'up',
): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
  await page.getByRole('button', { name: 'Create Preset' }).click();
  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible({ timeout: 10000 });
  await modal.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
  await modal.getByRole('textbox', { name: 'Metric Name' }).fill(metricName);
  await modal
    .getByRole('textbox', { name: 'Query Template' })
    .fill(queryTemplate);
  await modal.getByRole('button', { name: 'Create' }).click();
  await expect(
    page
      .getByText('Prometheus query preset has been successfully created.')
      .first(),
  ).toBeVisible({ timeout: 10000 });
  await expect(modal).toBeHidden({ timeout: 30000 });
}

async function deletePreset(page: Page, presetName: string): Promise<void> {
  await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
  const row = page.getByRole('row').filter({ hasText: presetName });
  if ((await row.count()) === 0) return;
  await row.getByRole('button', { name: 'Delete', exact: true }).click();
  const confirmModal = page.getByRole('dialog');
  await expect(confirmModal).toBeVisible({ timeout: 30000 });
  await confirmModal.locator('input').fill(presetName);
  await confirmModal
    .getByRole('button', { name: 'Delete', exact: true })
    .click();
  await expect(
    page
      .getByText('Prometheus query preset has been successfully deleted.')
      .first(),
  ).toBeVisible({ timeout: 10000 });
  await expect(confirmModal).toBeHidden({ timeout: 30000 });
}

async function openAddAutoScalingRuleModal(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Add Rules' }).click();
  const ruleModal = page.getByRole('dialog', { name: 'Add Auto Scaling Rule' });
  await expect(ruleModal).toBeVisible({ timeout: 20000 });
  return ruleModal;
}

async function selectPrometheusPreset(
  page: Page,
  ruleModal: Locator,
  presetName: string,
): Promise<void> {
  await ruleModal.getByRole('combobox', { name: /Metric Source/ }).click();
  await page.getByRole('option', { name: 'Prometheus' }).click();

  // The searchable selector renders as a button that opens a search popup.
  const presetSelect = ruleModal.getByRole('button', {
    name: /Prometheus Preset/,
  });
  await expect(presetSelect).toBeVisible({ timeout: 10000 });
  await presetSelect.click();
  await page
    .getByRole('combobox', { name: 'Search options', exact: true })
    .fill(presetName);
  const presetOption = page.getByRole('option', {
    name: presetName,
    exact: true,
  });
  await expect(presetOption).toBeVisible({ timeout: 10000 });
  await presetOption.click();
}

// ─────────────────────────────────────────────────────────────────────────────
// Integration Test Suite (Serial)
// ─────────────────────────────────────────────────────────────────────────────

test.describe(
  'Auto Scaling Rule Preset - Integration (Preset in Auto-Scaling Rule Editor)',
  {
    tag: [
      '@auto-scaling-rule-preset',
      '@admin',
      '@integration',
      '@requires-manager-v26.4',
    ],
  },
  () => {
    test.describe.configure({ mode: 'serial' });

    let presetName: string;
    let presetNameTimeWindow: string;
    let deploymentName: string;
    let deploymentUrl: string;

    test.afterAll(async ({ browser, request }) => {
      // Cleanup presets and services using a fresh context (page fixture not allowed in afterAll)
      const context = await browser.newContext();
      const page = await context.newPage();
      try {
        await loginAsAdmin(page, request);
      } catch {
        await context.close();
        return;
      }
      // Cleanup presets
      if (presetName) {
        try {
          await deletePreset(page, presetName);
        } catch {
          // ignore
        }
      }
      if (presetNameTimeWindow) {
        try {
          await deletePreset(page, presetNameTimeWindow);
        } catch {
          // ignore
        }
      }
      if (deploymentName) {
        await cleanupDeploymentSafely(page, deploymentName);
      }
      await context.close();
    });

    // 9.1 A newly created Prometheus Query Preset appears in the auto-scaling rule editor dropdown
    test('Superadmin can find a newly created preset in the auto-scaling rule editor Prometheus dropdown', async ({
      page,
      request,
    }) => {
      test.setTimeout(300_000);

      // Step 1: Login
      await loginAsAdmin(page, request);

      // Step 2: Create the integration preset
      const timestamp = Date.now();
      presetName = `e2e-preset-integration-${timestamp}`;

      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      await page.getByRole('button', { name: 'Create Preset' }).click();
      const createModal = page.getByRole('dialog');
      await expect(createModal).toBeVisible({ timeout: 10000 });
      await createModal
        .getByRole('textbox', { name: 'Name', exact: true })
        .fill(presetName);
      await createModal
        .getByRole('textbox', { name: 'Metric Name' })
        .fill('e2e_integration_metric');
      await createModal
        .getByRole('textbox', { name: 'Query Template' })
        .fill('rate(http_requests_total{job="e2e-test"}[5m])');

      // Click "Create"
      await createModal.getByRole('button', { name: 'Create' }).click();

      // Verify success notification
      await expect(
        page
          .getByText('Prometheus query preset has been successfully created.')
          .first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(createModal).toBeHidden({ timeout: 30000 });

      // Verify the preset row appears in the table
      await expect(
        page.getByRole('row').filter({ hasText: presetName }),
      ).toBeVisible({ timeout: 10000 });

      // Step 3: Create an empty deployment and land on its detail page
      deploymentName = `e2e-plan-preset-integration-${timestamp}`;
      await navigateTo(page, 'deployments');
      await createDeploymentShell(page, deploymentName);
      deploymentUrl = page.url();

      // Step 4: Open the Add Auto Scaling Rule modal
      const ruleModal = await openAddAutoScalingRuleModal(page);

      // Step 5: Set Metric Source to "Prometheus", then find and select the
      // test preset in the Prometheus Preset dropdown
      await selectPrometheusPreset(page, ruleModal, presetName);

      // Step 6: Verify the (hidden) Metric Name field is auto-filled
      await expect(
        ruleModal.getByRole('textbox', {
          name: 'Metric Name',
          exact: true,
          includeHidden: true,
        }),
      ).toHaveValue('e2e_integration_metric', { timeout: 5000 });

      // Step 7: Cancel the modal
      await ruleModal.getByRole('button', { name: 'Cancel' }).click();
      await expect(ruleModal).toBeHidden({ timeout: 30000 });
    });

    // 9.2 Selecting a Prometheus preset auto-fills the Metric Name and Cool Down Seconds
    test('Superadmin sees Metric Name auto-filled when selecting a preset with Time Window in the editor', async ({
      page,
      request,
    }) => {
      // Reuses the deployment created in 9.1 (serial mode).
      test.setTimeout(300_000);

      // Login
      await loginAsAdmin(page, request);

      // Create a second preset with Time Window
      const timestamp = Date.now();
      presetNameTimeWindow = `e2e-preset-integration-timewindow-${timestamp}`;

      await createPreset(page, presetNameTimeWindow, 'e2e_tw_metric', 'up');

      // Fill Time Window for this second preset via edit modal
      await page.goto(`${webuiEndpoint}/admin-serving?tab=prometheus-preset`);
      const twRow = page
        .getByRole('row')
        .filter({ hasText: presetNameTimeWindow });
      await expect(twRow).toBeVisible({ timeout: 10000 });
      await twRow.getByRole('button', { name: 'edit' }).click();
      const editModal = page.getByRole('dialog');
      await expect(editModal).toBeVisible({ timeout: 10000 });
      await editModal
        .getByRole('textbox', { name: /^Time Window/ })
        .fill('15m');
      await editModal.getByRole('button', { name: 'Save' }).click();
      await expect(
        page
          .getByText('Prometheus query preset has been successfully updated.')
          .first(),
      ).toBeVisible({ timeout: 10000 });
      await expect(editModal).toBeHidden({ timeout: 30000 });

      // Open the deployment created in 9.1 and its Add Auto Scaling Rule modal
      await page.goto(deploymentUrl);
      await expect(
        page.getByRole('heading', { level: 3, name: deploymentName }),
      ).toBeVisible({ timeout: 20000 });
      const ruleModal = await openAddAutoScalingRuleModal(page);

      // Set Metric Source to "Prometheus" and select the time-window preset
      await selectPrometheusPreset(page, ruleModal, presetNameTimeWindow);

      // Verify the hidden Metric Name field is auto-filled
      await expect(
        ruleModal.getByRole('textbox', {
          name: 'Metric Name',
          exact: true,
          includeHidden: true,
        }),
      ).toHaveValue('e2e_tw_metric', { timeout: 5000 });

      // Cancel the modal
      await ruleModal.getByRole('button', { name: 'Cancel' }).click();
      await expect(ruleModal).toBeHidden({ timeout: 30000 });
    });
  },
);
