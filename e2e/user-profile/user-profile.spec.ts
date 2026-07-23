// spec: e2e/.agent-output/test-plan-user-profile-allowed-client-ip.md
import {
  createAdminApiContext,
  purgeUserViaApi,
  sweepProfileTestUsersViaApi,
} from '../utils/admin-api';
import { loginAsAdmin, loginAsCreatedAccount } from '../utils/test-util';
import {
  openProfileModal,
  getCurrentClientIp,
  getAllowedClientIpFormItem,
  addIpTags,
  removeAllIpTags,
  createDisposableUser,
} from '../utils/user-profile-util';
import test, { expect } from '@playwright/test';

// These tests edit the logged-in account's own profile — full name, password,
// and the **Allowed Client IP** allowlist. Running them as the shared
// `admin@lablup.com` account is dangerous: an interrupted run can leave admin
// IP-restricted and lock everyone out of the shared backend (FR-3138).
//
// Instead we create a single disposable user for the whole file, run every
// profile test as that user, and purge it in an `afterAll` that runs even when
// a test fails — so no shared account is ever mutated and nothing is left
// behind.
const TEST_RUN_ID = Date.now().toString(36);
const EMAIL = `e2e-profile-${TEST_RUN_ID}@lablup.com`;
const USERNAME = `e2e-profile-${TEST_RUN_ID}`;
const PASSWORD = 'testing@123';

test.describe(
  'User Profile Setting Modal',
  { tag: ['@functional', '@regression', '@user-profile'] },
  () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async ({ browser }) => {
      // The UI account-creation flow drives several full page navigations
      // against a possibly-remote backend, which can outlast the default
      // per-test timeout. Give the hook its own generous budget.
      test.setTimeout(300_000);

      // Catch-all: purge any disposable user leaked by a previously
      // hard-killed run (where afterAll could not fire) before creating ours.
      // Done over the admin GraphQL API — the credential UI is paginated
      // (100 rows/page) and silently misses off-page leftovers, which is the
      // bug that motivated FR-3138. The API user list is pagination-immune.
      const api = await createAdminApiContext();
      try {
        await sweepProfileTestUsersViaApi(api);
      } finally {
        await api.dispose();
      }

      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      try {
        await loginAsAdmin(adminPage, adminContext.request);
        await createDisposableUser(adminPage, EMAIL, USERNAME, PASSWORD);
      } finally {
        await adminContext.close();
      }
    });

    test.afterAll(async () => {
      // Guaranteed teardown: purge the disposable user over the admin GraphQL
      // API, then sweep anything else matching the pattern. The API path is
      // fast, deterministic, and pagination-immune, so the created account is
      // always removed regardless of how the tests above ended (FR-3138).
      //
      // Teardown must never mask the real test result: a transient
      // GraphQL/network error here (or in the admin login) is logged and
      // swallowed instead of being allowed to fail an otherwise-green spec.
      // The next run's beforeAll sweep is the safety net for anything left.
      try {
        const api = await createAdminApiContext();
        try {
          await purgeUserViaApi(api, EMAIL);
          await sweepProfileTestUsersViaApi(api);
        } finally {
          await api.dispose();
        }
      } catch (e) {
        console.warn(
          `Profile-test teardown failed (non-fatal; next run's sweep will reclaim): ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      }
    });

    // =========================================================================
    // Allowed Client IP
    // =========================================================================
    test.describe('Allowed Client IP', () => {
      test('User can open profile modal and see Allowed Client IP field', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));

        await addIpTags(page.locator('.ant-modal'), [
          '192.168.1.1',
          '10.0.0.1',
        ]);

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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));

        await addIpTags(page.locator('.ant-modal'), [
          '10.20.30.0/24',
          '192.168.0.0/16',
        ]);

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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));

        await addIpTags(page.locator('.ant-modal'), ['not-an-ip']);

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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));

        await addIpTags(page.locator('.ant-modal'), [
          '192.168.1.1',
          'invalid-ip',
          '10.0.0.0/8',
        ]);

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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));

        await addIpTags(page.locator('.ant-modal'), ['192.168.1.1']);

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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        const fakeIp = currentIp === '10.0.0.1' ? '10.0.0.2' : '10.0.0.1';
        await addIpTags(page.locator('.ant-modal'), [fakeIp]);

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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        await addIpTags(page.locator('.ant-modal'), [currentIp]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Cleanup: clear allowed IPs
        await openProfileModal(page);
        await removeAllIpTags(page.locator('.ant-modal'));
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        const ipParts = currentIp.split('.');
        const cidrRange = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;

        await addIpTags(page.locator('.ant-modal'), [cidrRange]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Cleanup: clear allowed IPs
        await openProfileModal(page);
        await removeAllIpTags(page.locator('.ant-modal'));
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        // First, set an IP
        await addIpTags(page.locator('.ant-modal'), [currentIp]);
        await modal.getByRole('button', { name: 'Update' }).click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and remove all IPs
        await openProfileModal(page);
        await removeAllIpTags(page.locator('.ant-modal'));
        await page
          .locator('.ant-modal')
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          page.getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Verify IPs are cleared
        await openProfileModal(page);
        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');
        const currentIp = await getCurrentClientIp(page);

        const fullNameInput = modal.locator('input#full_name');
        const originalName = await fullNameInput.inputValue();
        const testName = `E2E Combined ${Date.now().toString(36)}`;

        await fullNameInput.clear();
        await fullNameInput.fill(testName);

        await addIpTags(page.locator('.ant-modal'), [currentIp]);

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

        const savedFormItem = getAllowedClientIpFormItem(
          page.locator('.ant-modal'),
        );
        await expect(
          savedFormItem.locator('.ant-tag').filter({ hasText: currentIp }),
        ).toBeVisible();

        // Cleanup: restore original name and clear IPs
        await page.locator('.ant-modal').locator('input#full_name').clear();
        await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .fill(originalName);
        await removeAllIpTags(page.locator('.ant-modal'));
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await expect(modal.locator('input#password')).toBeVisible();
        await expect(modal.locator('input#passwordConfirm')).toBeVisible();

        // "Original password" field should NOT be present
        await expect(modal.locator('input#originalPassword')).toHaveCount(0);

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Weak password is rejected', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await modal.locator('input#password').fill('123');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(modal.getByText(/At least 1 alphabet/)).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Mismatch passwords are rejected', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
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
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          page.getByText('There are no changes to update.'),
        ).toBeVisible({ timeout: 5000 });
      });

      test('Modal cancel does not save changes', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = page.locator('.ant-modal');

        const fullNameInput = modal.locator('input#full_name');
        const originalName = await fullNameInput.inputValue();

        await fullNameInput.clear();
        await fullNameInput.fill('Should Not Be Saved');
        await addIpTags(page.locator('.ant-modal'), ['10.0.0.1']);

        await modal.getByRole('button', { name: 'Cancel' }).click();
        await page.locator('.ant-modal').waitFor({ state: 'hidden' });

        // Reopen and verify nothing changed
        await openProfileModal(page);
        const restoredName = await page
          .locator('.ant-modal')
          .locator('input#full_name')
          .inputValue();
        expect(restoredName).toBe(originalName);

        const formItem = getAllowedClientIpFormItem(page.locator('.ant-modal'));
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
