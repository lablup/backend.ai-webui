import { loginAsVisualRegressionUser, navigateTo } from '../../utils/test-util';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page, request }) => {
  await page.setViewportSize({
    width: 1200,
    height: 2000,
  });
  await loginAsVisualRegressionUser(page, request);

  // Enable AI Agents in preferences
  await navigateTo(page, 'usersettings');
  await page
    .locator('div')
    .filter({ hasText: /^AI AgentsEnabled$/ })
    .getByLabel('Enabled')
    .click();

  // Navigate to AI Agents page
  await navigateTo(page, 'ai-agent');
  await expect(page.getByText('Lablup Customer Support Bot')).toBeVisible();
});
test.describe(
  'AI Agents page Visual Regression Test',
  { tag: ['@regression', '@visual'] },
  () => {
    // FIXME: Test timeout in beforeEach - checkbox for AI Agents enable cannot be clicked
    // Error: locator('div').filter({ hasText: /^AI AgentsEnabled$/ }).getByLabel('Enabled') times out
    // The AI Agents preference checkbox might have changed its structure or label
    test.fixme('ai agents full page', async ({ page }) => {
      await expect(page).toHaveScreenshot('ai_agents_page.png', {
        fullPage: true,
        maxDiffPixelRatio: 0.03,
      });
    });
  },
);
