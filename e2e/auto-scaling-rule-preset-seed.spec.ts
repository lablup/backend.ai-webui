import { test, expect } from '@playwright/test';

const WEBUI_ENDPOINT = 'http://127.0.0.1:4265';
const WEBSERVER_ENDPOINT = 'http://10.122.10.107:8090';

test.describe('Auto Scaling Rule Preset seed', () => {
  test('seed', async ({ page }) => {
    await page.goto(WEBUI_ENDPOINT);
    await page.getByLabel('Email or Username').fill('admin@lablup.com');
    await page.getByLabel('Password').fill('wJalrXUt');
    // Expand endpoint if not visible
    const endpointInput = page.getByLabel('Endpoint');
    if (!(await endpointInput.isVisible({ timeout: 500 }).catch(() => false))) {
      await page.getByText('Advanced').click();
    }
    await endpointInput.fill(WEBSERVER_ENDPOINT);
    await page.getByLabel('Login', { exact: true }).click();
    await page.waitForSelector('[data-testid="user-dropdown-button"]', {
      timeout: 30000,
    });
    await page.goto(`${WEBUI_ENDPOINT}/admin-serving?tab=auto-scaling-rule`);
    await expect(page.getByRole('button', { name: /Add Preset/i })).toBeVisible(
      { timeout: 30000 },
    );
  });
});
