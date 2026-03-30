// spec: e2e/.agent-output/test-plan-user-profile-allowed-client-ip.md
import { loginAsAdmin } from '../utils/test-util';
import test, { expect } from '@playwright/test';

/**
 * Opens the User Profile Setting Modal by clicking the user dropdown
 * and selecting the "My Account" menu item.
 */
async function openProfileModal(page: import('@playwright/test').Page) {
  await page.getByTestId('user-dropdown-button').click();
  await page.getByText('My Account').click();
  // Wait for modal to be visible
  await page.locator('.ant-modal').waitFor({ state: 'visible' });
}

/**
 * Reads the current client IP displayed in the modal's helper text.
 */
async function getCurrentClientIp(
  page: import('@playwright/test').Page,
): Promise<string> {
  const ipText = await page.getByText(/Current client IP:/).textContent();
  // Extract IP from "Current client IP: x.x.x.x"
  const match = ipText?.match(/Current client IP:\s*(.+)/);
  return match?.[1]?.trim() ?? '';
}

/**
 * Gets the Allowed Client IP form item container within the modal.
 */
function getAllowedClientIpFormItem(page: import('@playwright/test').Page) {
  return page
    .locator('.ant-modal')
    .locator('.ant-form-item')
    .filter({ hasText: 'Allowed client IPs' });
}

/**
 * Adds IP tags to the Allowed Client IP select field.
 */
async function addIpTags(page: import('@playwright/test').Page, ips: string[]) {
  const formItem = getAllowedClientIpFormItem(page);
  const selectInput = formItem.getByRole('combobox');
  for (const ip of ips) {
    await selectInput.click();
    await selectInput.fill(ip);
    await selectInput.press('Enter');
  }
  // Blur the combobox so the Update/Cancel buttons become clickable
  await selectInput.press('Tab');
}

/**
 * Removes all IP tags from the Allowed Client IP select field.
 */
async function removeAllIpTags(page: import('@playwright/test').Page) {
  const formItem = getAllowedClientIpFormItem(page);
  const removeButtons = formItem.locator('.ant-tag .anticon-close');
  const count = await removeButtons.count();
  // Remove from last to first to avoid index shifting
  for (let i = count - 1; i >= 0; i--) {
    await removeButtons.nth(i).click();
  }
}

test.describe(
  'User Profile Setting Modal',
  { tag: ['@functional', '@regression', '@user-profile'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    // =========================================================================
    // Allowed Client IP
    // =========================================================================
    test.describe('Allowed Client IP', () => {
      test('User can open profile modal and see Allowed Client IP field', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        // Verify Allowed Client IPs label is visible
        await expect(modal.getByText('Allowed client IPs')).toBeVisible();

        // Verify hint text
        await expect(
          modal.getByText('CIDR address (e.g., 10.20.30.40, 10.20.30.0/24)'),
        ).toBeVisible();

        // Verify current client IP is displayed
        await expect(modal.getByText(/Current client IP:/)).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('User can add valid IP addresses as tags', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page);

        await addIpTags(page, ['192.168.1.1', '10.0.0.1']);

        // Verify tags are created
        await expect(
          formItem.locator('.ant-tag').filter({ hasText: '192.168.1.1' }),
        ).toBeVisible();
        await expect(
          formItem.locator('.ant-tag').filter({ hasText: '10.0.0.1' }),
        ).toBeVisible();

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('User can add valid CIDR ranges as tags', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page);

        await addIpTags(page, ['10.20.30.0/24', '192.168.0.0/16']);

        await expect(
          formItem.locator('.ant-tag').filter({ hasText: '10.20.30.0/24' }),
        ).toBeVisible();
        await expect(
          formItem.locator('.ant-tag').filter({ hasText: '192.168.0.0/16' }),
        ).toBeVisible();

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('Invalid IP/CIDR entries are highlighted in red', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page);

        await addIpTags(page, ['not-an-ip']);

        const redTag = formItem
          .locator('.ant-tag')
          .filter({ hasText: 'not-an-ip' });
        await expect(redTag).toBeVisible();
        await expect(redTag).toHaveClass(/ant-tag-red/);

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('Mixed valid and invalid IPs show correct tag colors', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page);

        await addIpTags(page, ['192.168.1.1', 'invalid-ip', '10.0.0.0/8']);

        const validTag = formItem
          .locator('.ant-tag')
          .filter({ hasText: '192.168.1.1' });
        await expect(validTag).toBeVisible();
        await expect(validTag).not.toHaveClass(/ant-tag-red/);

        const invalidTag = formItem
          .locator('.ant-tag')
          .filter({ hasText: 'invalid-ip' });
        await expect(invalidTag).toBeVisible();
        await expect(invalidTag).toHaveClass(/ant-tag-red/);

        const cidrTag = formItem
          .locator('.ant-tag')
          .filter({ hasText: '10.0.0.0/8' });
        await expect(cidrTag).toBeVisible();
        await expect(cidrTag).not.toHaveClass(/ant-tag-red/);

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('User can remove an IP tag', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page);

        await addIpTags(page, ['192.168.1.1']);

        const tag = formItem
          .locator('.ant-tag')
          .filter({ hasText: '192.168.1.1' });
        await expect(tag).toBeVisible();

        await tag.locator('.anticon-close').click();

        await expect(tag).toBeHidden();

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('Validation error when current client IP is not in the allowed list', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        const fakeIp = currentIp === '10.0.0.1' ? '10.0.0.2' : '10.0.0.1';
        await addIpTags(page, [fakeIp]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          modal.getByText(/is not in the allowed list/),
        ).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Validation passes when current client IP is included', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        await addIpTags(page, [currentIp]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Cleanup: clear allowed IPs
        await openProfileModal(page);
        await removeAllIpTags(page);
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Validation passes when current client IP is within a CIDR range', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        const ipParts = currentIp.split('.');
        const cidrRange = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;

        await addIpTags(page, [cidrRange]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Cleanup: clear allowed IPs
        await openProfileModal(page);
        await removeAllIpTags(page);
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });

      test('User can clear all allowed client IPs (remove restriction)', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        // First, set an IP
        await addIpTags(page, [currentIp]);
        await modal.getByRole('button', { name: 'Update' }).click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and remove all IPs
        await openProfileModal(page);
        await removeAllIpTags(page);
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Verify IPs are cleared
        await openProfileModal(page);
        const formItem = getAllowedClientIpFormItem(page);
        await expect(formItem.locator('.ant-tag')).toHaveCount(0);

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });
    });

    // =========================================================================
    // Full Name
    // =========================================================================
    test.describe('Full Name', () => {
      test('User can update full name successfully', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        const fullNameInput = modal.locator('input#full_name');
        const originalName = await fullNameInput.inputValue();

        const testName = `E2E Test User ${Date.now().toString(36)}`;
        await fullNameInput.clear();
        await fullNameInput.fill(testName);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and verify the name was saved
        await openProfileModal(page);
        const updatedName = await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .inputValue();
        expect(updatedName).toBe(testName);

        // Cleanup: restore original name
        await page.locator('.ant-modal').locator('input#full_name').clear();
        await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .fill(originalName);
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });

      test('User can update full name and allowed client IP together', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        const fullNameInput = modal.locator('input#full_name');
        const originalName = await fullNameInput.inputValue();
        const testName = `E2E Combined ${Date.now().toString(36)}`;

        await fullNameInput.clear();
        await fullNameInput.fill(testName);

        await addIpTags(page, [currentIp]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and verify both changes were saved
        await openProfileModal(page);
        const savedName = await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .inputValue();
        expect(savedName).toBe(testName);

        const savedFormItem = getAllowedClientIpFormItem(page);
        await expect(
          savedFormItem.locator('.ant-tag').filter({ hasText: currentIp }),
        ).toBeVisible();

        // Cleanup: restore original name and clear IPs
        await page.locator('.ant-modal').locator('input#full_name').clear();
        await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .fill(originalName);
        await removeAllIpTags(page);
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });
    });

    // =========================================================================
    // Password
    // =========================================================================
    test.describe('Password', () => {
      test('Password fields are present without original password field', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await expect(modal.locator('input#password')).toBeVisible();
        await expect(modal.locator('input#passwordConfirm')).toBeVisible();

        // "Original password" field should NOT be present
        await expect(modal.locator('input#originalPassword')).toHaveCount(0);

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Weak password is rejected', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await modal.locator('input#password').fill('123');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(modal.getByText(/At least 1 alphabet/)).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Mismatch passwords are rejected', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await modal.locator('input#password').fill('NewPass1!');
        await modal.locator('input#passwordConfirm').fill('DifferentPass2!');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          modal.getByText('Two new passwords do not match.'),
        ).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Password confirm is required when password is entered', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await modal.locator('input#password').fill('NewPass1!');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          modal.getByText('Two new passwords do not match.'),
        ).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });
    });

    // =========================================================================
    // General
    // =========================================================================
    test.describe('General', () => {
      test('No-change submission shows info message', async ({
        page,
        request,
      }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('There are no changes to update.'),
        ).toBeVisible({ timeout: 5000 });
      });

      test('Modal cancel does not save changes', async ({ page, request }) => {
        await loginAsAdmin(page, request);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        const fullNameInput = modal.locator('input#full_name');
        const originalName = await fullNameInput.inputValue();

        await fullNameInput.clear();
        await fullNameInput.fill('Should Not Be Saved');
        await addIpTags(page, ['10.0.0.1']);

        await modal.getByRole('button', { name: 'Cancel' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        // Reopen and verify nothing changed
        await openProfileModal(page);
        const restoredName = await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .inputValue();
        expect(restoredName).toBe(originalName);

        const formItem = getAllowedClientIpFormItem(page);
        await expect(
          formItem.locator('.ant-tag').filter({ hasText: '10.0.0.1' }),
        ).toHaveCount(0);

        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Cancel' })
          .click();
      });
    });
  },
);
