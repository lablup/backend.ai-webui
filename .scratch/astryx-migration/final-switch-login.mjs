/**
 * final switch — log in once and persist the storage state for the sweep.
 *
 * Same shape as `a1-login.mjs`; kept separate so the state file cannot be
 * confused with an earlier ticket's.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6020/';
const ROOT = process.env.ROOT;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 200)));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await page.screenshot({
  path: `${ROOT}/shots/final-switch/00-login-light.png`,
});
const user = page.locator('input[placeholder="Email or Username"]').first();
if (await user.count()) {
  console.log('login form present');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
} else console.log('no login form; url=', page.url());
await page.waitForTimeout(25000);
console.log('after-login url', page.url());
console.log('login pageErrors:', JSON.stringify(errs));
await ctx.storageState({ path: `${ROOT}/final-switch-state.json` });
await page.screenshot({
  path: `${ROOT}/shots/final-switch/01-landing.png`,
});
await browser.close();
