/** approved-1 — log in and persist storage state for reuse by the probes. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const user = page.locator('input[placeholder="Email or Username"]').first();
if (await user.count()) {
  console.log('login form present');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
} else console.log('no login form; url=', page.url());
await page.waitForTimeout(20000);
console.log('after-login url', page.url());
await ctx.storageState({ path: `${ROOT}/a1-state.json` });
await page.screenshot({
  path: `${ROOT}/shots/approved-1/00-login-landing.png`,
});
await browser.close();
