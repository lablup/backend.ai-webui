// Toast-only dark check (no modal scrim on top).
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP_URL ?? 'http://127.0.0.1:4435/';
const tag = process.argv[2] ?? 'after';
const browser = await chromium.launch();
const report = {};
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({
    colorScheme: mode === 'dark' ? 'light' : 'dark',
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto(APP, { waitUntil: 'domcontentloaded' });
  await page.evaluate(
    (m) =>
      localStorage.setItem(
        'backendaiwebui.settings.themeMode',
        JSON.stringify(m),
      ),
    mode,
  );
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    window.__baiAppShim?.message?.success('Toast dark probe');
  });
  await page.waitForTimeout(1000);
  report[mode] = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[class*="toast"]')).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        cls: String(el.className).slice(0, 70),
        size: `${Math.round(r.width)}x${Math.round(r.height)}`,
        bg: cs.backgroundColor,
        color: cs.color,
        colorScheme: cs.colorScheme,
      };
    }),
  );
  await page.screenshot({
    path: join(outDir, `${tag}-toast-${mode}.png`),
    clip: { x: 940, y: 700, width: 500, height: 200 },
  });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
