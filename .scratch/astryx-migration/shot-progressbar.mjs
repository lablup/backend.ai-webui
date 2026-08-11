/**
 * Defect E evidence — `SimpleProgressWithLabel`'s bar colour in BOTH modes.
 * PHASE=before|after node .scratch/astryx-migration/shot-progressbar.mjs
 */
import { chromium } from '@playwright/test';
import { BASE, login } from './probe.mjs';

const PHASE = process.env.PHASE ?? 'after';
const OUT = '.scratch/astryx-migration/shots/sweep-fixes';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await login(page);
await page.goto(`${BASE.replace(/\/$/, '')}/session`, {
  waitUntil: 'domcontentloaded',
});
await page
  .getByText('My Total Resource Usage')
  .first()
  .waitFor({ timeout: 60000 });
await page.waitForTimeout(6000);

// Every element painted with the old literal #BFBFBF (= rgb(191,191,191)).
// After the fix these must be rgba(0,0,0,0.25) in light and
// rgba(255,255,255,0.25) in dark — i.e. mode-aware, and pixel-identical to
// #BFBFBF once composited on a white surface.
const measure = () =>
  page.evaluate(() => {
    const hits = [];
    for (const el of document.querySelectorAll('*')) {
      const cs = getComputedStyle(el);
      for (const prop of ['backgroundColor', 'color']) {
        const v = cs[prop];
        if (
          v === 'rgb(191, 191, 191)' ||
          v === 'rgba(0, 0, 0, 0.25)' ||
          v === 'rgba(255, 255, 255, 0.25)'
        ) {
          hits.push({ tag: el.tagName, prop, v });
        }
      }
      if (hits.length > 8) break;
    }
    return hits;
  });

const card = page
  .locator('div')
  .filter({ hasText: /^My Total Resource Usage/ })
  .first();

console.log('LIGHT:', JSON.stringify(await measure()));
await card.screenshot({ path: `${OUT}/${PHASE}-progressbar-light.png` });

await page
  .locator('button[aria-label="Dark mode"], button[aria-label="Light mode"]')
  .first()
  .click();
await page.waitForTimeout(2000);
console.log('DARK:', JSON.stringify(await measure()));
await card.screenshot({ path: `${OUT}/${PHASE}-progressbar-dark.png` });

await browser.close();
