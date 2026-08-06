// PILOT 10 — screenshot the antd/Astryx comparison harness in light + dark.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];

for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1200 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) => errors.push(`[${mode}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${mode}] console: ${m.text()}`);
  });

  await page.goto('http://127.0.0.1:5311/', { waitUntil: 'networkidle' });
  await page.evaluate((m) => {
    document.documentElement.setAttribute('data-theme', m);
    document.documentElement.setAttribute('data-astryx-theme', 'neutral');
  }, mode);
  // Re-render the antd side under the right algorithm.
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate((m) => {
    document.documentElement.setAttribute('data-theme', m);
    document.documentElement.setAttribute('data-astryx-theme', 'neutral');
  }, mode);
  await page.waitForTimeout(800);

  await page.screenshot({ path: `${OUT}pilot-${mode}.png`, fullPage: true });
  console.log(`shot: pilot-${mode}.png`);
  await page.close();
}

await browser.close();
console.log(errors.length ? errors.join('\n') : 'no console/page errors');
