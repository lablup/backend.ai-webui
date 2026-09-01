// spec: Bulk Create Users from CSV — submit (real creation) + purge cleanup
//
// Unlike bulk-create-from-csv.spec.ts (which is client-side validation only and
// never submits), this spec actually clicks "Create N users" to create users on
// the backend, asserts the success toast, then permanently purges the created
// users in teardown via the admin GraphQL API so the test is repeatable and
// leaves no residue. Requires a running Backend.AI cluster.
import { createAdminApiContext, purgeUserViaApi } from '../utils/admin-api';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import test, {
  expect,
  type APIRequestContext,
  type Page,
} from '@playwright/test';

// Unique per run so re-runs never collide on email (the modal flags duplicates,
// and leftover users from a crashed run would otherwise break the next run).
const RUN_ID = Date.now().toString(36);
const PASSWORD = 'Testing@123';

// The `e2e-` email prefix lets the global-cleanup teardown's
// `sweepLeftoverE2EUsers` (/^e2e-[a-z0-9._-]*@lablup\.com$/i) reap these
// accounts as a backstop if a hard-killed run skips the afterEach purge.
const makeUser = (n: number) => ({
  email: `e2e-csvbulk-${RUN_ID}-${n}@lablup.com`,
  username: `csvbulk_${RUN_ID}_${n}`,
});

/**
 * Build an in-memory CSV (header + one row per user) so we don't depend on a
 * fixture file and can guarantee unique emails per run.
 */
function buildCSV(users: ReturnType<typeof makeUser>[]): Buffer {
  const lines = [
    'email,username,password',
    ...users.map((u) => `${u.email},${u.username},${PASSWORD}`),
  ];
  return Buffer.from(lines.join('\n'), 'utf-8');
}

async function openBulkCreateCSVModal(page: Page) {
  await navigateTo(page, 'credential?tab=users');
  await expect(page.getByRole('button', { name: 'Create User' })).toBeVisible({
    timeout: 15000,
  });
  const createUserBtn = page.getByRole('button', { name: 'Create User' });
  await createUserBtn
    .locator('xpath=ancestor::*[contains(@class,"ant-space-compact")]')
    .getByRole('button', { name: 'ellipsis' })
    .click();
  await page
    .getByRole('menuitem', { name: 'Bulk Create Users from CSV' })
    .click();
  await expect(
    page.getByRole('dialog', { name: 'Bulk Create Users from CSV' }),
  ).toBeVisible({ timeout: 5000 });
}

/**
 * Permanently purge the created users via the admin GraphQL API
 * (`purgeUserViaApi` deactivates then purges, pagination-immune — FR-3138).
 *
 * This replaces a UI-driven deactivate+purge flow that was fragile against the
 * V2 Users table (AdminUserManagement renders row actions as icon-only
 * BAINameActionCell buttons whose labels are hover Tooltips, not accessible
 * names). The API path is robust regardless of pagination or table chrome.
 *
 * Best-effort and never throws: a cleanup hiccup must not mask the real test
 * result. The global-cleanup teardown sweeps any leaked `e2e-*` account too.
 */
async function purgeCreatedUsers(emails: string[]): Promise<void> {
  let api: APIRequestContext | undefined;
  try {
    api = await createAdminApiContext();
    for (const email of emails) {
      await purgeUserViaApi(api, email);
    }
  } catch (error) {
    console.warn(
      '[bulk-create-from-csv-submit] failed to purge created users:',
      error,
    );
  } finally {
    await api?.dispose();
  }
}

test.describe(
  'Bulk Create Users from CSV — submit & purge',
  { tag: ['@credential', '@functional', '@fr-1818'] },
  () => {
    // Mutates shared backend state, so run serially.
    test.describe.configure({ mode: 'serial' });

    const users = [makeUser(1), makeUser(2), makeUser(3)];
    const emails = users.map((u) => u.email);

    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
    });

    test.afterEach(async () => {
      // Best-effort API cleanup; purgeCreatedUsers never throws.
      await purgeCreatedUsers(emails);
    });

    test('admin creates users from a valid CSV and they are persisted', async ({
      page,
    }) => {
      await openBulkCreateCSVModal(page);

      const dialog = page.getByRole('dialog', {
        name: 'Bulk Create Users from CSV',
      });
      // The dialog has two file inputs: a hidden "Replace File" ref input and
      // the Upload.Dragger's input[name="file"]. Target the dragger's input.
      const fileInput = dialog.locator('input[name="file"]');
      await fileInput.setInputFiles({
        name: `bulk-${RUN_ID}.csv`,
        mimeType: 'text/csv',
        buffer: buildCSV(users),
      });

      // Preview reflects the upload: all rows valid, submit enabled.
      const submitButton = page.getByRole('button', {
        name: /Create \d+ user/,
      });
      await expect(submitButton).toBeEnabled({ timeout: 10000 });

      await submitButton.click();

      // Success toast confirms server-side creation.
      await expect(
        page.locator('.ant-message').getByText(/Successfully created/),
      ).toBeVisible({ timeout: 30000 });

      // Modal closes on full success.
      await expect(dialog).toBeHidden({ timeout: 10000 });

      // The created users appear in the (active) user list.
      await navigateTo(page, 'credential?tab=users');
      await page.getByText('Active', { exact: true }).click();
      for (const email of emails) {
        await expect(
          page.getByRole('row').filter({ hasText: email }),
        ).toBeVisible({ timeout: 15000 });
      }
    });
  },
);
