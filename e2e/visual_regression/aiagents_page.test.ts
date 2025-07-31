import { loginAsUser2 } from '../utils/test-util';
import { expect, test } from '@playwright/test';

test.describe('Summary page Visual Regression Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({
      width: 1200,
      height: 2000,
    });
    await loginAsUser2(page);

    // change dashboard mode
    await page.getByTestId('user-dropdown-button').click();
    await page.waitForLoadState('networkidle');
    await page.getByRole('menuitem', { name: 'setting Preferences' }).click();
    await page
      .locator('div')
      .filter({ hasText: /^AI AgentsEnabled$/ })
      .getByLabel('Enabled')
      .click();
  });

  test(`ai agents full page`, async ({ page }) => {
    await page.getByRole('link', { name: 'AI Agents' }).click();
    await page.getByText('Lablup Customer Support Bot').waitFor();
    await expect(page).toHaveScreenshot('ai_agents_page.png', {
      fullPage: true,
    });
  });
});
