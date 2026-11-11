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
import * as fs from 'fs';

async function expectSignedInAs(page: Page, email: string) {
  await expect(page.getByTestId('user-dropdown-button')).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => (globalThis as any).backendaiclient?.email))
    .toBe(email);
}

test.describe(
  'Login state reuse',
  { tag: ['@auth', '@functional', '@regression'] },
  () => {
    test('Switching between admin and user on one page signs in as the requested account each time', async ({
      page,
      request,
    }) => {
      await loginAsAdmin(page, request);
      await expectSignedInAs(page, userInfo.admin.email);
      const adminState = loginStateFile(
        webServerEndpoint,
        userInfo.admin.email,
      );
      if (adminState) expect(fs.existsSync(adminState)).toBe(true);

      await loginAsUser(page, request);
      await expectSignedInAs(page, userInfo.user.email);

      // Both accounts now come from their saved states.
      await loginAsAdmin(page, request);
      await expectSignedInAs(page, userInfo.admin.email);

      await loginAsUser(page, request);
      await expectSignedInAs(page, userInfo.user.email);
    });
  },
);
