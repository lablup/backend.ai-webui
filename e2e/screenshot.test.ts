import { loginAsAdmin, webuiEndpoint } from './utils/test-util';
import { test } from '@playwright/test';
import * as path from 'path';

const routes = [
  '/summary',
  '/session',
  '/session/start',
  '/serving',
  '/service',
  '/service/start',
  '/import',
  '/data',
  '/my-environment',
  '/agent-summary',
  '/statistics',
  '/environment',
  '/agent',
  '/settings',
  '/maintenance',
  '/information',
  '/usersettings',
  '/credential',
  '/logs',
  '/error',
  '/unauthorized',
];

test.describe.configure({ mode: 'parallel' });
test.describe.skip(
  'Screenshot all routes',
  { tag: ['@regression', '@visual'] },
  () => {
    let screenshotPath: string;
    test.beforeEach(async ({ page, request }) => {
      await loginAsAdmin(page, request);
      screenshotPath = process.env.SCREENSHOT_PATH
        ? path.resolve(process.env.SCREENSHOT_PATH)
        : path.resolve(__dirname + '/screenshots');
    });

    routes.forEach((route) => {
      test(`screenshot ${route}`, async ({ page }) => {
        await page.goto(`${webuiEndpoint}${route}`, {
          waitUntil: 'networkidle',
        });
        await page.screenshot({
          path: path.resolve(
            `${screenshotPath}/${route.replace(/\//g, '_')}.png`,
          ),
          fullPage: true,
        });
      });

      test(`screenshot ${route} (dark mode)`, async ({ page }) => {
        await page.goto(`${webuiEndpoint}${route}`, {
          waitUntil: 'networkidle',
        });
        await page.getByRole('button', { name: 'moon' }).click();
        // Wait for the dark mode to be applied
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.resolve(
            `${screenshotPath}/${route.replace(/\//g, '_')}_dark.png`,
          ),
          fullPage: true,
        });
      });

      test(`screenshot ${route} without sidebar`, async ({ page }) => {
        await page.goto(`${webuiEndpoint}${route}`, {
          waitUntil: 'networkidle',
        });
        await page.screenshot({
          path: path.resolve(
            `${screenshotPath}/${route.replace(/\//g, '_')}_no_sidebar.png`,
          ),
          clip: {
            x: 240,
            y: 0,
            width: (page.viewportSize()?.width || 0) - 240,
            height: page.viewportSize()?.height || 0,
          },
        });
      });

      test(`screenshot ${route} without sidebar (dark mode)`, async ({
        page,
      }) => {
        await page.goto(`${webuiEndpoint}${route}`, {
          waitUntil: 'networkidle',
        });
        await page.getByRole('button', { name: 'moon' }).click();
        // Wait for the dark mode to be applied
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.resolve(
            `${screenshotPath}/${route.replace(/\//g, '_')}_no_sidebar_dark.png`,
          ),
          clip: {
            x: 240,
            y: 0,
            width: (page.viewportSize()?.width || 0) - 240,
            height: page.viewportSize()?.height || 0,
          },
        });
      });
    });
  },
);
