// Ticket 16 screenshot helper. Usage:
//   node theme-probe/shoot16.mjs <outDir> <cases,csv> <prefix>
import { chromium } from '@playwright/test';

const base = 'http://127.0.0.1:5625/theme-probe/ticket16.html';
const outDir = process.argv[2];
const cases = (process.argv[3] ?? 'frame,nodes,create,confirm').split(',');
const prefix = process.argv[4] ?? 'after';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300));
});
for (const c of cases) {
  for (const mode of ['light', 'dark']) {
    await page.goto(`${base}?case=${c}&mode=${mode}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: `${outDir}/${prefix}-${c}-${mode}.png`,
      fullPage: false,
    });
    console.log(`shot: ${prefix}-${c}-${mode}.png`);
  }
}
await browser.close();
