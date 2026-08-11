// Dump every custom property that actually resolves at <html> in the running app.
import { chromium } from '@playwright/test';

const APP = process.env.APP_URL ?? 'http://127.0.0.1:4435/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ colorScheme: 'light' });
const page = await ctx.newPage();
await page.goto(APP, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const names = await page.evaluate(() => {
  const cs = getComputedStyle(document.documentElement);
  const out = {};
  for (let i = 0; i < cs.length; i++) {
    const p = cs[i];
    if (p.startsWith('--')) out[p] = cs.getPropertyValue(p).trim();
  }
  return out;
});
console.log(JSON.stringify(names, null, 2));
await browser.close();
