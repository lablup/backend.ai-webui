import { loginAsUser, webuiEndpoint } from './utils/test-util';
import { getMenuItem } from './utils/test-util-antd';
import { expect, test } from '@playwright/test';

test.describe('Session page Visual Regression Test', () => {
  const sessionName = 'vrt-test-session' + new Date().getTime();

  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
    await page.setViewportSize({
      width: 1920,
      height: 2000,
    });
  });

  test('Before create a new session', async ({ page }) => {
    await page.goto(`${webuiEndpoint}/job`);
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('session_page.png', {
      mask: [
        page.locator('lablup-progress-bar'),
        page.locator('span.percentage.start-bar'),
        page.locator('span.percentage.end-bar'),
        page.locator('vaadin-grid-cell-content').filter({ hasText: 'Elapsed' }),
        page.getByText('CPU'),
      ],
      fullPage: true,
    });
  });

  test('Create a new session step by step', async ({ page }) => {
    // step1.png
    await getMenuItem(page, 'sessions').click();
    await page
      .getByTestId('start-session-button')
      .getByLabel('power_settings_new')
      .click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('step1.png', {
      fullPage: true,
    });

    const sessionNameInput = page.locator('#sessionName');
    await sessionNameInput.fill(sessionName);

    // step2.png
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveScreenshot('step2.png', {
      fullPage: true,
    });

    // step3.png
    await page.getByRole('button', { name: 'Next' }).click();
    page
      .getByRole('row', {
        name: 'e2e-test-folder-user-creation1752197331960 general local:volume1 User user R W',
      })
      .getByLabel('', { exact: true })
      .click();

    await expect(page).toHaveScreenshot('step3.png', {
      fullPage: true,
    });

    // step4.png
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveScreenshot('step4.png', {
      fullPage: true,
    });

    // step5.png
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page).toHaveScreenshot('step5.png', {
      mask: [page.getByRole('cell', { name: 'Session name :' })],
      fullPage: true,
    });
  });
});
