// Ticket 20 shot runner. Usage: node shoot.mjs <prefix>
// Captures agent/resourceGroup cases in light+dark from the theme-probe
// harness on port 5665 (ticket-20 port policy, 5665-5674).
// Serve first:
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5665
import { chromium } from '@playwright/test';

const prefix = process.argv[2] ?? 'shot';
const outDir = new URL('.', import.meta.url).pathname;
const base = 'http://127.0.0.1:5665/theme-probe/resources.html';

const browser = await chromium.launch();
for (const [caseName, width, height] of [
  ['agent', 1000, 1200],
  ['resourceGroup', 900, 1000],
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
    await page.waitForTimeout(1500);
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
