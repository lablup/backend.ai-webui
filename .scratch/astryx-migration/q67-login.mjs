/** Q-6/Q-7 — log in once and persist storage state for the tab/sider probes. */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6070/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
const user = page.locator('input[placeholder="Email or Username"]').first();
if (await user.count()) {
  console.log('login form present');
  await page.getByRole('button', { name: /^login$/i }).first().click();
} else console.log('no login form; url=', page.url());
await page.waitForTimeout(25000);
console.log('after-login url', page.url());
await ctx.storageState({ path: `${ROOT}/q67-state.json` });
await page.screenshot({ path: `${ROOT}/shots/tab-sider-restore/00-landing.png` });
await browser.close();
