// Ticket 15 shot runner. Usage: node shoot.mjs <prefix>
// Captures board/summary cases in light+dark from the theme-probe harness
// on port 5615 (ticket-15 port policy).
import { chromium } from '@playwright/test';

const prefix = process.argv[2] ?? 'shot';
const outDir = new URL('.', import.meta.url).pathname;
const base = 'http://127.0.0.1:5615/theme-probe/dashboard.html';

const browser = await chromium.launch();
for (const [caseName, width, height] of [
  ['board', 1440, 1000],
  ['summary', 1440, 900],
]) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({
      viewport: { width, height },
      colorScheme: scheme,
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${base}?case=${caseName}`, { waitUntil: 'networkidle' });
    // Let suspense boundaries settle + invitation fetch flip.
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: `${outDir}${prefix}-${caseName}-${scheme}.png`,
      fullPage: true,
    });
    if (errors.length) {
      console.log(`[${prefix} ${caseName} ${scheme}] page errors:`);
      for (const e of errors.slice(0, 5)) console.log('  ' + e.split('\n')[0]);
    }
    await ctx.close();
  }
}
await browser.close();
console.log('done:', prefix);
