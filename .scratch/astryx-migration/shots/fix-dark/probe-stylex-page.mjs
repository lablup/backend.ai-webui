// Open the in-app /stylex-probe route in dark mode and record what renders.
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const APP = process.env.APP_URL ?? 'http://127.0.0.1:4435/';
const tag = process.argv[2] ?? 'after';
const browser = await chromium.launch();
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({
    colorScheme: mode === 'dark' ? 'light' : 'dark',
    viewport: { width: 1440, height: 1000 },
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
  await page.goto(`${APP}stylex-probe`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({
    path: join(outDir, `${tag}-stylex-probe-${mode}.png`),
    fullPage: true,
  });
  console.log(mode, await page.title(), (await page.content()).length);
  await ctx.close();
}
await browser.close();
