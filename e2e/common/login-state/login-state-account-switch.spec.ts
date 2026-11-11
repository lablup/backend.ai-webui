// The loginAs* helpers restore a per-worker saved login (#11133); switching
// accounts on one page must land on the requested account every time.
import { loginStateFile } from '../../utils/login-state';
import {
  loginAsAdmin,
  loginAsUser,
  userInfo,
  webServerEndpoint,
} from '../../utils/test-util';
import { expect, Page, test } from '@playwright/test';

async function expectSignedInAs(page: Page, email: string) {
  await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        String((globalThis as any).backendaiclient?.email ?? '').toLowerCase(),
      ),
    )
    .toBe(email.toLowerCase());
}

test.describe(
  'Login state reuse',
  { tag: ['@auth', '@functional', '@regression'] },
  () => {
    test('Switching between admin and user on one page signs in as the requested account each time', async ({
      page,
      request,
    }) => {
      const helperLog: string[] = [];
      const log = console.log;
      console.log = (...args: unknown[]) => {
        helperLog.push(args.map(String).join(' '));
        log(...args);
      };
      try {
        await loginAsAdmin(page, request);
        await expectSignedInAs(page, userInfo.admin.email);
        await loginAsUser(page, request);
        await expectSignedInAs(page, userInfo.user.email);

        // A restore attempt ends restored, or unusable after a transient
        // boot failure; a stale (dead) state would mean the cache is broken.
        const attempts = () =>
          helperLog.filter((line) =>
            /^\[login-cache\] (restored|unusable state)/.test(line),
          ).length;
        const stale = () =>
          helperLog.filter((line) => line.startsWith('[login-cache] stale'))
            .length;
        const attemptsBefore = attempts();
        const staleBefore = stale();
        // Both accounts now have a saved state in this worker.
        await loginAsAdmin(page, request);
        await expectSignedInAs(page, userInfo.admin.email);
        await loginAsUser(page, request);
        await expectSignedInAs(page, userInfo.user.email);

        const cacheOn = !!loginStateFile(
          webServerEndpoint,
          userInfo.admin.email,
        );
        expect(attempts() - attemptsBefore).toBe(cacheOn ? 2 : 0);
        expect(stale() - staleBefore).toBe(0);
      } finally {
        console.log = log;
      }
    });
  },
);
