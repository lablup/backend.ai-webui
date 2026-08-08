// to-astryx ticket 25 screenshot helper. Usage:
//   node theme-probe/shoot25.mjs <outDir> [cases,csv] [prefix] [port]
// PORT POLICY for this worktree: 5715-5724.
import { chromium } from '@playwright/test';

const outDir = process.argv[2];
const cases = (process.argv[3] ?? 'users,scheduling,groups').split(',');
const prefix = process.argv[4] ?? 'after';
const port = process.argv[5] ?? '5715';
const base = `http://127.0.0.1:${port}/theme-probe/table25.html`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', (m) => {
  if (m.type() === 'error')
    console.log('[console.error]', m.text().slice(0, 300));
});
for (const c of cases) {
  for (const mode of ['light', 'dark']) {
    await page.goto(`${base}?case=${c}&mode=${mode}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: `${outDir}/${prefix}-${c}-${mode}.png`,
      fullPage: false,
    });
    console.log(`shot: ${prefix}-${c}-${mode}.png`);

    // The column-settings modal is only reachable through the gear in the
    // bottom bar; shoot it for the `users` case so the rebuilt Astryx modal is
    // covered too.
    if (c === 'users') {
      const gear = page.getByRole('button', { name: 'Table Settings' }).first();
      if (await gear.count()) {
        await gear.click();
        await page.waitForTimeout(700);
        await page.screenshot({
          path: `${outDir}/${prefix}-settings-${mode}.png`,
          fullPage: false,
        });
        console.log(`shot: ${prefix}-settings-${mode}.png`);
      } else {
        console.log('settings gear not found — skipped');
      }
    }
  }
}
await browser.close();
