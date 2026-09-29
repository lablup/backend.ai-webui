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
  profileModal,
} from '../utils/user-profile-util';
import test, { expect, type Page } from '@playwright/test';

// Astryx also renders each toast into a screen-reader announcer, so an
// unscoped getByText() matches twice.
function toastRegion(page: Page) {
  return page.getByRole('region', { name: 'Notifications' });
}

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

        const modal = profileModal(page);

        // The test's contract is that the field is PRESENT, so assert the
        // control, not just its label — both the FormItem label and the inner
        // field label render the same text, so a text-only check passes even
        // when the combobox is missing.
        await expect(
          getAllowedClientIpFormItem(modal).getByRole('combobox'),
        ).toBeVisible();

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

        const formItem = getAllowedClientIpFormItem(profileModal(page));

        await addIpTags(profileModal(page), ['192.168.1.1', '10.0.0.1']);

        // Verify tags are created (each renders as a "Remove {ip}" button)
        await expect(
          formItem.getByRole('button', { name: 'Remove 192.168.1.1' }),
        ).toBeVisible();
        await expect(
          formItem.getByRole('button', { name: 'Remove 10.0.0.1' }),
        ).toBeVisible();

        await profileModal(page)
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('User can add valid CIDR ranges as tags', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(profileModal(page));

        await addIpTags(profileModal(page), [
          '10.20.30.0/24',
          '192.168.0.0/16',
        ]);

        // Each tag renders as a "Remove {cidr}" button
        await expect(
          formItem.getByRole('button', { name: 'Remove 10.20.30.0/24' }),
        ).toBeVisible();
        await expect(
          formItem.getByRole('button', { name: 'Remove 192.168.0.0/16' }),
        ).toBeVisible();

        await profileModal(page)
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('Invalid IP/CIDR entries are flagged with a validation error', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(profileModal(page));

        await addIpTags(profileModal(page), ['not-an-ip']);

        // The tokenizer keeps the entry; the field's validator names it.
        await expect(
          formItem.getByRole('button', { name: 'Remove not-an-ip' }),
        ).toBeVisible();
        await expect(formItem.getByText('Invalid IP: not-an-ip')).toBeVisible();

        await profileModal(page)
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('Mixed valid and invalid IPs flag only the invalid entry', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(profileModal(page));

        await addIpTags(profileModal(page), [
          '192.168.1.1',
          'invalid-ip',
          '10.0.0.0/8',
        ]);

        for (const ip of ['192.168.1.1', 'invalid-ip', '10.0.0.0/8']) {
          await expect(
            formItem.getByRole('button', { name: `Remove ${ip}` }),
          ).toBeVisible();
        }

        const error = formItem.getByText(/^Invalid IP:/);
        await expect(error).toBeVisible();
        await expect(error).toHaveText('Invalid IP: invalid-ip');

        await profileModal(page)
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('User can remove an IP tag', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const formItem = getAllowedClientIpFormItem(profileModal(page));

        await addIpTags(profileModal(page), ['192.168.1.1']);

        // Each token carries a remove button named "Remove {ip}"
        const removeButton = formItem.getByRole('button', {
          name: 'Remove 192.168.1.1',
        });
        await expect(removeButton).toBeVisible();

        await removeButton.click();

        await expect(removeButton).toBeHidden();
        await expect(formItem.getByText('192.168.1.1')).toBeHidden();

        await profileModal(page)
          .getByRole('button', { name: 'Cancel' })
          .click();
      });

      test('Validation error when current client IP is not in the allowed list', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);
        const currentIp = await getCurrentClientIp(page);

        const fakeIp = currentIp === '10.0.0.1' ? '10.0.0.2' : '10.0.0.1';
        await addIpTags(profileModal(page), [fakeIp]);

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

        const modal = profileModal(page);
        const currentIp = await getCurrentClientIp(page);

        await addIpTags(profileModal(page), [currentIp]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Cleanup: clear allowed IPs
        await openProfileModal(page);
        await removeAllIpTags(profileModal(page));
        await profileModal(page)
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });

      test('Validation passes when current client IP is within a CIDR range', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);
        const currentIp = await getCurrentClientIp(page);

        const ipParts = currentIp.split('.');
        const cidrRange = `${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.0/24`;

        await addIpTags(profileModal(page), [cidrRange]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Cleanup: clear allowed IPs
        await openProfileModal(page);
        await removeAllIpTags(profileModal(page));
        await profileModal(page)
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });

      test('User can clear all allowed client IPs (remove restriction)', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);
        const currentIp = await getCurrentClientIp(page);

        // First, set an IP
        await addIpTags(profileModal(page), [currentIp]);
        await modal.getByRole('button', { name: 'Update' }).click();
        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and remove all IPs
        await openProfileModal(page);
        await removeAllIpTags(profileModal(page));
        await profileModal(page)
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Verify IPs are cleared
        await openProfileModal(page);
        const formItem = getAllowedClientIpFormItem(profileModal(page));
        await expect(
          formItem.getByRole('button', { name: /^Remove / }),
        ).toHaveCount(0);

        await profileModal(page)
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

        const modal = profileModal(page);

        const fullNameInput = modal.getByRole('textbox', { name: 'Full Name' });
        const originalName = await fullNameInput.inputValue();

        const testName = `E2E Test User ${Date.now().toString(36)}`;
        await fullNameInput.clear();
        await fullNameInput.fill(testName);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and verify the name was saved
        await openProfileModal(page);
        const updatedName = await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .inputValue();
        expect(updatedName).toBe(testName);

        // Cleanup: restore original name
        await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .clear();
        await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .fill(originalName);
        await profileModal(page)
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });
      });

      test('User can update full name and allowed client IP together', async ({
        page,
        request,
      }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);
        const currentIp = await getCurrentClientIp(page);

        const fullNameInput = modal.getByRole('textbox', { name: 'Full Name' });
        const originalName = await fullNameInput.inputValue();
        const testName = `E2E Combined ${Date.now().toString(36)}`;

        await fullNameInput.clear();
        await fullNameInput.fill(testName);

        await addIpTags(profileModal(page), [currentIp]);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
        ).toBeVisible({ timeout: 10000 });

        // Reopen and verify both changes were saved
        await openProfileModal(page);
        const savedName = await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .inputValue();
        expect(savedName).toBe(testName);

        const savedFormItem = getAllowedClientIpFormItem(profileModal(page));
        await expect(
          savedFormItem.getByRole('button', { name: `Remove ${currentIp}` }),
        ).toBeVisible();

        // Cleanup: restore original name and clear IPs
        await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .clear();
        await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .fill(originalName);
        await removeAllIpTags(profileModal(page));
        await profileModal(page)
          .getByRole('button', { name: 'Update' })
          .click();
        await expect(
          toastRegion(page).getByText('Profile has been successfully updated.'),
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

        const modal = profileModal(page);

        await expect(
          modal.getByRole('textbox', { name: 'New Password', exact: true }),
        ).toBeVisible();
        await expect(
          modal.getByRole('textbox', { name: 'New password (again)' }),
        ).toBeVisible();

        // "Original password" field should NOT be present
        await expect(
          modal.getByRole('textbox', { name: /original password/i }),
        ).toHaveCount(0);

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Weak password is rejected', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);

        await modal
          .getByRole('textbox', { name: 'New Password', exact: true })
          .fill('123');

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(modal.getByText(/At least 1 alphabet/)).toBeVisible();

        await modal.getByRole('button', { name: 'Cancel' }).click();
      });

      test('Mismatch passwords are rejected', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);

        await modal
          .getByRole('textbox', { name: 'New Password', exact: true })
          .fill('NewPass1!');
        await modal
          .getByRole('textbox', { name: 'New password (again)' })
          .fill('DifferentPass2!');

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

        const modal = profileModal(page);

        await modal
          .getByRole('textbox', { name: 'New Password', exact: true })
          .fill('NewPass1!');

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

        const modal = profileModal(page);

        await modal.getByRole('button', { name: 'Update' }).click();

        await expect(
          toastRegion(page).getByText('There are no changes to update.'),
        ).toBeVisible({ timeout: 5000 });
      });

      test('Modal cancel does not save changes', async ({ page, request }) => {
        await loginAsCreatedAccount(page, request, EMAIL, PASSWORD);
        await openProfileModal(page);

        const modal = profileModal(page);

        const fullNameInput = modal.getByRole('textbox', { name: 'Full Name' });
        const originalName = await fullNameInput.inputValue();

        await fullNameInput.clear();
        await fullNameInput.fill('Should Not Be Saved');
        await addIpTags(profileModal(page), ['10.0.0.1']);

        await modal.getByRole('button', { name: 'Cancel' }).click();
        await profileModal(page).waitFor({ state: 'hidden' });

        // Reopen and verify nothing changed
        await openProfileModal(page);
        const restoredName = await profileModal(page)
          .getByRole('textbox', { name: 'Full Name' })
          .inputValue();
        expect(restoredName).toBe(originalName);

        const formItem = getAllowedClientIpFormItem(profileModal(page));
        await expect(
          formItem.getByRole('button', { name: 'Remove 10.0.0.1' }),
        ).toHaveCount(0);

        await profileModal(page)
          .getByRole('button', { name: 'Cancel' })
          .click();
      });
    });
  },
);
