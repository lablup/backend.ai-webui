import { loginAsVisualRegressionUser2 } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1200,
    height: 2000,
  });
  await loginAsVisualRegressionUser2(page, request);

  // change dashboard mode
  await page.getByTestId('user-dropdown-button').click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('menuitem', { name: 'setting Preferences' }).click();
  await page
    .locator('div')
    .filter({ hasText: /^AI AgentsEnabled$/ })
    .getByLabel('Enabled')
    .click();
  await page.getByRole('link', { name: 'AI Agents' }).click();
  await page.waitForLoadState('networkidle');
});
test.describe(
  'AI Agents page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    test('ai agents full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('ai_agents_page.png', {
        fullPage: true,
      });
    });
  },
);
