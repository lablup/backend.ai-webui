// Open the notification stack (ticket 29 host) on the harness, in dark mode.
import { chromium } from '@playwright/test';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = dirname(fileURLToPath(import.meta.url));
const tag = process.argv[2] ?? 'after';
const browser = await chromium.launch();
for (const mode of ['light', 'dark']) {
  const ctx = await browser.newContext({
    colorScheme: mode,
    viewport: { width: 1440, height: 900 },
  });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:5795/theme-probe/notification29.html', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(800);
  for (const label of ['1. Start task', '3. Progress 70%', 'Error + detail']) {
    const b = page.getByRole('button', { name: label });
    if (await b.count()) await b.first().click();
    await page.waitForTimeout(300);
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: join(outDir, `${tag}-notif-${mode}.png`) });
  console.log(
    mode,
    JSON.stringify(
      await page.evaluate(() =>
        Array.from(document.querySelectorAll('[class*="astryx-card"]'))
          .slice(0, 3)
          .map((el) => {
            const cs = getComputedStyle(el);
            return { bg: cs.backgroundColor, color: cs.color };
          }),
      ),
    ),
  );
  await ctx.close();
}
await browser.close();
