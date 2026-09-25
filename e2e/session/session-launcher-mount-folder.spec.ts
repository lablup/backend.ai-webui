// spec: FR-3974
import {
  createAdminApiContext,
  createVFolderViaApi,
  purgeVFolderViaApi,
} from '../utils/admin-api';
import { loginAsAdmin, navigateTo } from '../utils/test-util';
import { test, expect, type Page } from '@playwright/test';

// The session detail drawer refetches every 10s; two cycles leave room for
// the mount to reach it.
const MOUNT_VISIBLE_TIMEOUT = 20_000;

async function dismissNotifications(page: Page) {
  const notices = page.locator(
    '[data-testid="bai-notification-stack"] [data-notification-key]',
  );
  for (let safety = 0; safety < 20; safety++) {
    const first = notices.first();
    const dismiss = first.getByRole('button', { name: 'Dismiss' });
    if (!(await dismiss.isVisible().catch(() => false))) return;
    await dismiss.click().catch(() => {});
    await first.waitFor({ state: 'detached', timeout: 2000 }).catch(() => {});
  }
}

test.describe(
  'Session Launcher - Folder Mount',
  { tag: ['@regression', '@session', '@vfolder', '@functional'] },
  () => {
    test('Admin can mount a folder selected in the launcher and see it in the session detail', async ({
      page,
      request,
    }) => {
      const runId = Date.now();
      const folderName = `e2e-mount-folder-${runId}`;
      const sessionName = `e2e-mount-session-${runId}`;

      // 1. Log in and create a folder owned by the same admin
      await loginAsAdmin(page, request);
      const api = await createAdminApiContext();
      let folderId: string | undefined;
      try {
        folderId = await createVFolderViaApi(api, { name: folderName });

        // 2. Open the launcher and name the session. The folder must exist
        // first, because the launcher loads its folder list once on mount.
        await navigateTo(page, 'session/start');
        await page
          .getByRole('textbox', { name: 'Session Name', exact: true })
          .fill(sessionName);

        // 3. Select the folder in the Data & Storage step
        await page
          .getByRole('button', { name: /^Go to step \d+: Data & Storage/ })
          .click();
        await page
          .getByRole('row')
          .filter({ hasText: folderName })
          .getByRole('checkbox')
          .check();

        // 4. Review and launch
        await page.getByRole('button', { name: 'Skip to review' }).click();
        const launchButton = page.getByRole('button', {
          name: 'Launch',
          exact: true,
        });
        await expect(launchButton).toBeEnabled();
        await launchButton.click();
        await expect(page).toHaveURL(/\/session/);

        // 5. Open the session detail. Mounted folders render for any status,
        // so this does not wait for the session to be scheduled.
        await dismissNotifications(page);
        await page
          .getByRole('button', { name: sessionName, exact: true })
          .click();
        const drawer = page.getByRole('dialog', { name: 'Session Info' });
        await expect(
          drawer.getByText('Mounted folders', { exact: true }),
        ).toBeVisible();
        await expect(
          drawer.getByRole('link', { name: folderName, exact: true }),
        ).toBeVisible({ timeout: MOUNT_VISIBLE_TIMEOUT });
      } finally {
        await page
          .evaluate(
            (name) =>
              (globalThis as any).backendaiclient.destroy(name, null, true),
            sessionName,
          )
          .catch(() => {});
        if (folderId) await purgeVFolderViaApi(api, folderId);
        await api.dispose();
      }
    });
  },
);
