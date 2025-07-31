import { loginAsAdmin } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('User page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1800,
      height: 1400,
    });
    await loginAsAdmin(page);
  });
  test(`users table`, async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();
    await page.getByText('Active', { exact: true }).waitFor();

    // full page
    await expect(page).toHaveScreenshot('users_table.png', {
      fullPage: true,
    });

    // user detail modal
    await page
      .getByRole('row', { name: 'user2@lablup.com user2 user' })
      .getByRole('button')
      .first()
      .click();
    await page.getByText('model-store').waitFor();
    await expect(page).toHaveScreenshot('user_detail_modal.png', {
      fullPage: true,
      mask: [page.getByRole('cell', { name: 'model-store' })],
    });
    await page.getByRole('button', { name: 'Close' }).click();

    // modify user detail modal
    await page
      .getByRole('row', { name: 'user2@lablup.com user2 user' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.getByLabel('Modify User Detail').getByText('User ID').waitFor();
    await expect(page).toHaveScreenshot('modify_user_detail_modal.png', {
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Close' }).click();
  });

  test(`credentials table`, async ({ page }) => {
    await page.getByRole('link', { name: 'Users' }).click();

    // credential table
    await page
      .locator('div')
      .filter({ hasText: /^Credentials$/ })
      .first()
      .click();
    await page.getByLabel('User ID').getByText('User ID').waitFor();
    await expect(page).toHaveScreenshot('credentials_table.png', {
      fullPage: true,
      mask: [page.getByRole('cell', { name: 'Sessions' })],
    });

    // keypair detail modal
    await page
      .getByRole('row', { name: 'user2@lablup.com' })
      .getByRole('button')
      .first()
      .click();
    await page
      .getByLabel('Keypair DetailMain Access Key')
      .getByText('user2@lablup.com')
      .waitFor();
    await expect(page).toHaveScreenshot('keypair_detail_modal.png', {
      fullPage: true,
      mask: [
        page.getByRole('cell', { name: 'Sessions' }),
        page.getByRole('cell', { name: 'Number Of Queries :' }),
      ],
    });
    await page.getByRole('button', { name: 'Close' }).click();

    // resource policy modal
    await page
      .getByRole('row', { name: 'user2@lablup.com' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.getByText('Modify keypair resource policy').waitFor();
    await expect(page).toHaveScreenshot('resource_policy_modal.png', {
      fullPage: true,
      mask: [page.getByRole('cell', { name: 'Sessions' })],
    });
    await page.getByRole('button', { name: 'Close' }).click();
  });
});
