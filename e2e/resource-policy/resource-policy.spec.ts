// spec: Resource Policy page tests
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, { expect, type Page } from '@playwright/test';

const TEST_RUN_ID = Date.now().toString(36);

async function cleanupPolicy(page: Page, policyName: string) {
  const row = page.getByRole('row').filter({ hasText: policyName });
  const isVisible = await row.isVisible({ timeout: 2000 }).catch(() => false);
  if (isVisible) {
    // Hover over the name cell to reveal BAINameActionCell actions
    await row.getByRole('cell').first().hover();
    await row.getByRole('button', { name: 'delete' }).click();
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(row).toBeHidden({ timeout: 10000 });
  }
}

test.describe(
  'Resource Policy',
  { tag: ['@critical', '@resource-policy', '@functional'] },
  () => {
    test.describe.serial('Keypair Resource Policy CRUD', () => {
      const KEYPAIR_POLICY_NAME = `e2e-kp-policy-${TEST_RUN_ID}`;

      test('Admin can see Keypair policy list with expected columns', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Verify Keypair tab is selected by default
        await expect(
          page.getByRole('tab', { name: 'Keypair', selected: true }),
        ).toBeVisible();

        // Verify table columns
        await expect(
          page.getByRole('columnheader', { name: 'Name' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Concurrency' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Cluster Size' }),
        ).toBeVisible();

        // Verify default policy row exists
        const defaultRow = page.getByRole('row').filter({ hasText: 'default' });
        await expect(defaultRow).toBeVisible();

        // Cleanup any leftover test policy
        await cleanupPolicy(page, KEYPAIR_POLICY_NAME);
      });

      test('Admin can create a Keypair policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Click Create button
        await page.getByRole('button', { name: 'Create' }).click();

        // Verify Create Resource Policy dialog appears
        const modal = page.getByRole('dialog', {
          name: 'Create Resource Policy',
        });
        await expect(modal).toBeVisible();

        // Fill in the policy name
        await modal
          .getByRole('textbox', { name: 'Name' })
          .fill(KEYPAIR_POLICY_NAME);

        // Click OK
        await modal.getByRole('button', { name: 'OK' }).click();

        // Verify modal closes
        await expect(modal).toBeHidden({ timeout: 10000 });

        // Verify new policy appears in the table
        await expect(
          page.getByRole('row').filter({ hasText: KEYPAIR_POLICY_NAME }),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Admin can edit a Keypair policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Find the test policy row, hover to reveal actions, and click setting
        const policyRow = page
          .getByRole('row')
          .filter({ hasText: KEYPAIR_POLICY_NAME });
        await expect(policyRow).toBeVisible();
        await policyRow.getByRole('cell').first().hover();
        await policyRow.getByRole('button', { name: 'setting' }).click();

        // Verify Update dialog appears
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        // Change Cluster Size to 2
        const clusterSizeInput = modal.getByRole('spinbutton', {
          name: 'Cluster Size',
        });
        await clusterSizeInput.fill('2');

        // Click OK
        await modal.getByRole('button', { name: 'OK' }).click();

        // Verify modal closes
        await expect(modal).toBeHidden({ timeout: 10000 });

        // Verify the cluster size value is updated in the table
        const updatedRow = page
          .getByRole('row')
          .filter({ hasText: KEYPAIR_POLICY_NAME });
        await expect(
          updatedRow.getByRole('cell', { name: '2', exact: true }),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Admin can delete a Keypair policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Find the test policy row
        const policyRow = page
          .getByRole('row')
          .filter({ hasText: KEYPAIR_POLICY_NAME });
        await expect(policyRow).toBeVisible();

        // Hover to reveal actions, then click delete button
        await policyRow.getByRole('cell').first().hover();
        await policyRow.getByRole('button', { name: 'delete' }).click();

        // Confirm deletion in modal
        await page.getByRole('button', { name: 'Delete', exact: true }).click();

        // Verify the policy is removed
        await expect(
          page.getByRole('row').filter({ hasText: KEYPAIR_POLICY_NAME }),
        ).toBeHidden({ timeout: 10000 });
      });
    });

    test.describe.serial('User Resource Policy CRUD', () => {
      const USER_POLICY_NAME = `e2e-user-policy-${TEST_RUN_ID}`;

      test('Admin can see User policy list', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Switch to User tab
        await page.getByRole('tab', { name: 'User' }).click();
        await expect(
          page.getByRole('tab', { name: 'User', selected: true }),
        ).toBeVisible();

        // Verify table columns
        await expect(
          page.getByRole('columnheader', { name: 'Name' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Max Folder Count' }),
        ).toBeVisible();

        // Verify default policy row exists
        const defaultRow = page.getByRole('row').filter({ hasText: 'default' });
        await expect(defaultRow).toBeVisible();

        // Cleanup
        await cleanupPolicy(page, USER_POLICY_NAME);
      });

      test('Admin can create a User policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Switch to User tab
        await page.getByRole('tab', { name: 'User' }).click();

        // Click Create button
        await page.getByRole('button', { name: 'Create' }).click();

        // Verify dialog appears
        const modal = page.getByRole('dialog', {
          name: 'Create Resource Policy',
        });
        await expect(modal).toBeVisible();

        // Fill in policy name
        await modal
          .getByRole('textbox', { name: 'Name' })
          .fill(USER_POLICY_NAME);

        // Fill required fields
        await modal
          .getByRole('spinbutton', {
            name: 'Max Session Count Per Model Session',
          })
          .fill('10');
        await modal
          .getByRole('spinbutton', { name: 'Max Customized Image Count' })
          .fill('3');

        // Click OK and wait for response
        await modal.getByRole('button', { name: 'OK' }).click();

        // Verify modal closes (may take time for API call)
        await expect(modal).toBeHidden({ timeout: 30000 });

        // Verify new policy appears
        await expect(
          page.getByRole('row').filter({ hasText: USER_POLICY_NAME }),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Admin can delete a User policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Switch to User tab
        await page.getByRole('tab', { name: 'User' }).click();

        // Find and delete the test policy
        const policyRow = page
          .getByRole('row')
          .filter({ hasText: USER_POLICY_NAME });
        await expect(policyRow).toBeVisible();
        await policyRow.getByRole('cell').first().hover();
        await policyRow.getByRole('button', { name: 'delete' }).click();

        // Confirm deletion in modal
        await page.getByRole('button', { name: 'Delete', exact: true }).click();

        // Verify removal
        await expect(
          page.getByRole('row').filter({ hasText: USER_POLICY_NAME }),
        ).toBeHidden({ timeout: 10000 });
      });
    });

    test.describe.serial('Project Resource Policy CRUD', () => {
      const PROJECT_POLICY_NAME = `e2e-proj-policy-${TEST_RUN_ID}`;

      test('Admin can see Project policy list', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Switch to Project tab
        await page.getByRole('tab', { name: 'Project' }).click();
        await expect(
          page.getByRole('tab', { name: 'Project', selected: true }),
        ).toBeVisible();

        // Verify table columns
        await expect(
          page.getByRole('columnheader', { name: 'Name' }),
        ).toBeVisible();
        await expect(
          page.getByRole('columnheader', { name: 'Max Folder Count' }),
        ).toBeVisible();

        // Verify default policy row
        const defaultRow = page.getByRole('row').filter({ hasText: 'default' });
        await expect(defaultRow).toBeVisible();

        // Cleanup
        await cleanupPolicy(page, PROJECT_POLICY_NAME);
      });

      test('Admin can create a Project policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Switch to Project tab
        await page.getByRole('tab', { name: 'Project' }).click();

        // Click Create button
        await page.getByRole('button', { name: 'Create' }).click();

        // Verify dialog appears
        const modal = page.getByRole('dialog');
        await expect(modal).toBeVisible();

        // Fill in policy name
        await modal
          .getByRole('textbox', { name: 'Name' })
          .fill(PROJECT_POLICY_NAME);

        // Click OK
        await modal.getByRole('button', { name: 'OK' }).click();

        // Verify modal closes
        await expect(modal).toBeHidden({ timeout: 10000 });

        // Verify new policy appears
        await expect(
          page.getByRole('row').filter({ hasText: PROJECT_POLICY_NAME }),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Admin can delete a Project policy', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await navigateTo(page, 'resource-policy');

        // Switch to Project tab
        await page.getByRole('tab', { name: 'Project' }).click();

        // Find and delete the test policy
        const policyRow = page
          .getByRole('row')
          .filter({ hasText: PROJECT_POLICY_NAME });
        await expect(policyRow).toBeVisible();
        await policyRow.getByRole('cell').first().hover();
        await policyRow.getByRole('button', { name: 'delete' }).click();

        // Confirm deletion in modal
        await page.getByRole('button', { name: 'Delete', exact: true }).click();

        // Verify removal
        await expect(
          page.getByRole('row').filter({ hasText: PROJECT_POLICY_NAME }),
        ).toBeHidden({ timeout: 10000 });
      });
    });
  },
);
