// Ticket 02 — in-app probe page check (/stylex-probe) against the real app
// dev server (full vite.config.ts, adapters + useCustomThemeConfig +
// useThemeMode live). Run: node .scratch/astryx-migration/shots/measure-02-app.mjs
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const shotsDir = dirname(fileURLToPath(import.meta.url));
const URL = process.env.PROBE_URL ?? 'http://127.0.0.1:9199/stylex-probe';

const browser = await chromium.launch();
const page = await browser.newPage({
  colorScheme: 'light',
  viewport: { width: 1100, height: 1100 },
});
page.on('pageerror', (e) => console.error('PAGEERROR', e.message));
await page.goto(URL);
const found = await page
  .waitForSelector('#probe-brand-swatch', { timeout: 25000 })
  .then(() => true)
  .catch(() => false);
if (!found) {
  console.log('IN-APP PROBE NOT REACHABLE (page did not render #probe-brand-swatch)');
  await page.screenshot({ path: join(shotsDir, '02-app-unreachable.png') });
  await browser.close();
  process.exit(2);
}

const read = () =>
  page.evaluate(() => {
    const bg = (sel) =>
      getComputedStyle(document.querySelector(sel)).backgroundColor;
    return {
      brand: bg('#probe-brand-swatch'),
      brandBtn: bg('#probe-brand-btn'),
      admin: bg('#probe-admin-swatch'),
      sibling: bg('#probe-sibling-swatch'),
      secondary: bg('#probe-secondary-swatch'),
    };
  });

console.log('app-mode (default):', await read());
await page.screenshot({ path: join(shotsDir, '02-app-probe-light.png'), fullPage: true });
await page.click('#probe-mode-toggle');
await page.waitForTimeout(300);
console.log('after toggle:', await read());
await page.screenshot({ path: join(shotsDir, '02-app-probe-dark.png'), fullPage: true });
await browser.close();
