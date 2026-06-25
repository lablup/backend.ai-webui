import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe(
  'Serving page Visual Regression Test',
  { tag: ['@regression', '@serving', '@visual'] },
  () => {
    test.describe('Serving page', () => {
      test.beforeEach(async ({ page, request }) => {
        await loginAsVisualRegressionUser(page, request);
        // The serving page was renamed to 'deployments' in a recent UI update.
        // The old 'Active' tab was replaced by 'Running'/'Terminated' radio buttons.
        await navigateTo(page, 'deployments');
        // Wait for the page header to confirm the deployments page has loaded.
        await expect(
          page.getByRole('button', { name: 'Create Deployment' }),
        ).toBeVisible();
      });

      // FIXME: Snapshot diff expected — the serving page was renamed to 'deployments'
      // with an entirely different layout (new table columns, radio filter instead of tabs).
      // The baseline 'serving_page.png' is stale. Needs snapshot-update PR.
      test.fixme('serving full page', async ({ page }) => {
        await page.setViewportSize({
          width: 1920,
          height: 1200,
        });
        await expect(page).toHaveScreenshot('serving_page.png', {
          fullPage: true,
          maxDiffPixelRatio: 0.02,
        });
      });

      // FIXME(FR-3111/stale-baseline): The service launcher was revamped — the
      // "Model Definition" anchor is gone and `snapshot/create-service-page.png`
      // reflects the old form layout. Anchor/mask update + baseline refresh deferred
      // to FR-3115 (frozen backend).
      test.fixme('Create a new service page', async ({ page }) => {
        await page.setViewportSize({
          width: 1300,
          height: 2300,
        });
        await page.getByRole('button', { name: 'Start Service' }).click();
        await expect(page.getByText('Model Definition')).toBeVisible();
        await expect(page).toHaveScreenshot('create_service_page.png', {
          fullPage: true,
          maxDiffPixelRatio: 0.04,
          mask: [
            page.locator(
              'div:nth-child(3) > .ant-row > div:nth-child(2) > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
            page.locator(
              'div:nth-child(2) > div > div:nth-child(4) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
          ],
        });
      });

      // FIXME(FR-3111/missing-test-data): No pre-seeded service exists, so the
      // 'setting' row button cannot be clicked. Not a stale baseline; owned by the
      // test-data seeding triage category of FR-3109.
      test.fixme('Update Service', async ({ page }) => {
        await page.setViewportSize({
          width: 1100,
          height: 2300,
        });
        await page.getByRole('button', { name: 'setting' }).click();
        await page.getByText('Service Name(optional)').waitFor();
        await expect(page).toHaveScreenshot('update_service_page.png', {
          fullPage: true,
          mask: [
            page.locator(
              'div:nth-child(3) > .ant-row > div:nth-child(2) > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
            page.locator(
              'div:nth-child(2) > div > div:nth-child(4) > .ant-row > .ant-col > .ant-form-item-control-input > .ant-form-item-control-input-content > .ant-select > .ant-select-selector',
            ),
          ],
        });
      });

      // FIXME(FR-3111/missing-test-data): No pre-seeded service exists, so the
      // 'delete' row button cannot be clicked. Not a stale baseline; owned by the
      // test-data seeding triage category of FR-3109.
      test.fixme('Delete modal', async ({ page }) => {
        await page.getByRole('button', { name: 'delete' }).click();
        const deleteModal = page.locator('div.ant-modal-content').first();
        await expect(deleteModal).toHaveScreenshot('delete_modal.png');
      });
    });

    test.describe('Routing Info page', () => {
      // FIXME(FR-3111/missing-test-data): The seeded endpoint 'service_test2' does not
      // exist on the test backend, so beforeEach cannot open the routing info page.
      // (beforeEach navigates via 'deployments' — the old 'serving' route returns 404.)
      // Owned by the test-data seeding triage category of FR-3109.
      test.beforeEach(async ({ page, request }) => {
        await loginAsVisualRegressionUser(page, request);
        await navigateTo(page, 'deployments');
        await expect(
          page.getByRole('button', { name: 'Create Deployment' }),
        ).toBeVisible();
        await page.getByRole('link', { name: 'service_test2' }).click();
        await expect(
          page.getByRole('button', { name: 'plus Add Rules' }),
        ).toBeVisible();
      });

      // FIXME(FR-3111/missing-test-data): Skipped due to the beforeEach failure
      // (service_test2 not seeded). Not a stale baseline; see FR-3109 test-data triage.
      test.fixme('Routing Info page', async ({ page }) => {
        await page.setViewportSize({
          width: 1100,
          height: 1800,
        });
        await expect(page).toHaveScreenshot('routing_info_page.png', {
          fullPage: true,
          mask: [
            page.locator('td.ant-descriptions-item-content:has-text("ubuntu")'),
          ],
        });
      });

      // FIXME(FR-3111/missing-test-data): Skipped due to the beforeEach failure
      // (service_test2 not seeded). Not a stale baseline; see FR-3109 test-data triage.
      test.fixme('Add Auto Scaling Rule modal', async ({ page }) => {
        await page.getByRole('button', { name: 'plus Add Rules' }).click();
        await page.getByText('Add Auto Scaling Rule').waitFor();
        const addRuleModal = page.locator('div.ant-modal-content').first();
        await expect(addRuleModal).toHaveScreenshot(
          'add_auto_scaling_rule_modal.png',
        );
      });

      // FIXME(FR-3111/missing-test-data): Skipped due to the beforeEach failure
      // (service_test2 not seeded). Not a stale baseline; see FR-3109 test-data triage.
      test.fixme('generate token modal', async ({ page }) => {
        await page.getByRole('button', { name: 'plus Generate Token' }).click();
        await page.getByText('Generate new Token').waitFor();
        const tokenModal = page.locator('div.ant-modal').first();
        await expect(tokenModal).toHaveScreenshot('generate_token_modal.png', {
          mask: [page.locator('div.ant-picker')],
        });
      });
    });
  },
);
