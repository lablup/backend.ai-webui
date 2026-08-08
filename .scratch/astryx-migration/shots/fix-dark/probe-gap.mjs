// Measure BAIFlex inline gaps in the running app / harness.
// BAIFlex writes `gap` inline on every instance; a missing/0 gap on an
// instance that asked for gap="sm"|"md"|"lg" is the collapsed-spacing bug.
import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://127.0.0.1:4435/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const res = await page.evaluate(() => {
  const flexes = Array.from(document.querySelectorAll('div[style]')).filter(
    (el) =>
      el.style.display === 'flex' &&
      el.style.boxSizing === 'border-box' &&
      el.style.listStyle === 'none',
  );
  const byGap = {};
  for (const el of flexes) {
    const g = el.style.gap || '(none)';
    byGap[g] = (byGap[g] ?? 0) + 1;
  }
  return { total: flexes.length, byGap };
});
console.log(url, JSON.stringify(res, null, 2));
await browser.close();
