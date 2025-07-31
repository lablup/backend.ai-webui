import { loginAsVisualRegressionAdmin } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({
    width: 1800,
    height: 1400,
  });
  await loginAsVisualRegressionAdmin(page);
  await page.getByRole('link', { name: 'Users' }).click();
  await page.getByText('Active', { exact: true }).waitFor();
});

test.describe('User page Visual Regression Test', () => {
  test(`users table`, async ({ page }) => {
    // full page
    await expect(page).toHaveScreenshot('users_table.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.005,
    });

    // user detail modal
    await page
      .getByRole('row', { name: 'user2@lablup.com user2 user' })
      .getByRole('button')
      .first()
      .click();
    await page.getByText('model-store').waitFor();
    const userDetailModal = page.locator('div.ant-modal').first();
    await expect(userDetailModal).toHaveScreenshot('user_detail_modal.png', {
      mask: [page.getByRole('cell', { name: 'model-store' })],
      maxDiffPixelRatio: 0.005,
    });
    await page.getByRole('button', { name: 'Close' }).click();

    // modify user detail modal
    await page
      .getByRole('row', { name: 'user2@lablup.com user2 user' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.waitForLoadState('networkidle');
    const modifyUserDetailModal = page.locator('div.ant-modal').nth(1);
    await expect(modifyUserDetailModal).toHaveScreenshot(
      'modify_user_detail_modal.png',
    );
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
      mask: [
        page.getByRole('cell', { name: 'Sessions' }),
        page.locator('td.ant-table-cell').nth(3),
        page.locator('td.ant-table-cell').nth(11),
        page.locator('td.ant-table-cell').nth(19),
        page.locator('td.ant-table-cell').nth(27),
        page.locator('td.ant-table-cell').nth(35),
      ],
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
    const keypairDetailModal = page.locator('div.ant-modal').first();
    await expect(keypairDetailModal).toHaveScreenshot(
      'keypair_detail_modal.png',
      {
        mask: [
          page.getByRole('cell', { name: 'Sessions' }).nth(5),
          page.getByRole('cell', { name: 'Number Of Queries :' }),
          page.getByRole('cell', { name: 'Last Used' }),
        ],
      },
    );
    await page.getByRole('button', { name: 'Close' }).click();

    // resource policy modal
    await page
      .getByRole('row', { name: 'user2@lablup.com' })
      .getByRole('button')
      .nth(1)
      .click();
    await page.getByText('Modify keypair resource policy').waitFor();
    const modifyKeypairResourcePolicyModal = page
      .locator('div.ant-modal')
      .nth(1);
    await expect(modifyKeypairResourcePolicyModal).toHaveScreenshot(
      'modify_keypair_resource_policy_modal.png',
      {
        mask: [page.getByRole('cell', { name: 'Sessions' })],
      },
    );
    await page.getByRole('button', { name: 'Close' }).click();
  });
});
