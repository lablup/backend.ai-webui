// E2E tests for the login-screen plugin slot (`config.plugin.login`).
//
// Login plugins follow the same runtime-fetch model as page plugins:
// `LoginView.tsx` imports `/dist/plugins/<name>.js` (or
// `${apiEndpoint}/dist/plugins/<name>.js` in Electron) at runtime, so
// `page.route` can fulfill the request with fixture content — the same
// pattern as the existing page-plugin tests in this directory.
import { webuiEndpoint, modifyConfigToml } from '../utils/test-util';
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const PLUGIN_NAME = 'backend-ai-homepage-link';
const HOMEPAGE_LINK_PLUGIN_JS = fs.readFileSync(
  path.join(__dirname, `${PLUGIN_NAME}.js`),
  'utf-8',
);

test.describe(
  'Login Plugin',
  { tag: ['@plugin', '@functional', '@regression'] },
  () => {
    test('homepage-link plugin injects an external link into the login form', async ({
      page,
      request,
    }) => {
      await modifyConfigToml(page, request, {
        plugin: { login: PLUGIN_NAME },
      });

      await page.route(`**/dist/plugins/${PLUGIN_NAME}.js`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: HOMEPAGE_LINK_PLUGIN_JS,
        });
      });

      await page.goto(webuiEndpoint);

      const link = page.locator('.bai-homepage-link a');
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', 'https://www.backend.ai/');
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveText(/Visit backend\.ai/i);
    });

    test('no link appears when the plugin slot is unset', async ({
      page,
      request,
    }) => {
      await modifyConfigToml(page, request, {
        plugin: { login: '' },
      });

      await page.goto(webuiEndpoint);

      await page.locator('form').first().waitFor({ state: 'visible' });
      await expect(page.locator('.bai-homepage-link')).toHaveCount(0);
    });
  },
);
