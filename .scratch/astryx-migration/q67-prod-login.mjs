/** Q-6/Q-7 — log into the PRODUCTION build (no VITE_DEFAULT_* env auto-login). */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6090/';
const ROOT = process.env.ROOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(15000);
const user = page.locator('input[placeholder="Email or Username"]').first();
if (await user.count()) {
  await user.fill('admin@lablup.com');
  const pw = page.locator('input[type="password"]').first();
  await pw.fill('wJalrXUt');
  await page.getByRole('button', { name: /^login$/i }).first().click();
} else {
  console.log('no login form; url=', page.url());
}
await page.waitForTimeout(25000);
console.log('after-login url', page.url());
await ctx.storageState({ path: `${ROOT}/q67-prod-state.json` });
await browser.close();
