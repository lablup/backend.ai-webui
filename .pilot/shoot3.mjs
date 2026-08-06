// PILOT 10 PHASE 3 / ticket 13 — brand accent probe screenshots + measurement.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const errors = [];

for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1900, height: 1250 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) => errors.push(`[${mode}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${mode}] console: ${m.text()}`);
  });

  await page.goto('http://127.0.0.1:5311/phase3.html', {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1200);

  // MEASUREMENT: read the resolved --color-accent inside each themed column,
  // and the computed background of each column's primary Button.
  const measured = await page.evaluate(() => {
    const cols = Array.from(document.querySelectorAll('.col'));
    return cols.map((col) => {
      const head = col.querySelector('.col-head')?.textContent ?? '?';
      const accent = getComputedStyle(col)
        .getPropertyValue('--color-accent')
        .trim();
      const btn = Array.from(col.querySelectorAll('button')).find((b) =>
        (b.textContent ?? '').includes('Create folder'),
      );
      const btnBg = btn ? getComputedStyle(btn).backgroundColor : null;
      // A checked radio dot / switch track / tab indicator, if present.
      const radioDot = col.querySelector('[class*="radio"] [class*="dot"], .astryx-radio-dot');
      const dotBg = radioDot ? getComputedStyle(radioDot).backgroundColor : null;
      const badge = col.querySelector('[data-variant="info"]');
      const badgeBg = badge ? getComputedStyle(badge).backgroundColor : null;
      const ind = col.querySelector('[class*="tab-indicator"], .astryx-tab-indicator');
      const indColor = ind
        ? getComputedStyle(ind).backgroundColor + ' | ' +
          getComputedStyle(ind).getPropertyValue('--indicator-color').trim()
        : null;
      const seg = col.querySelector('.astryx-segmented-control [aria-checked="true"], [class*="segmented"] [aria-checked="true"]');
      const segBg = seg ? getComputedStyle(seg).backgroundColor : null;
      const sw = col.querySelector('.astryx-switch');
      const swBg = sw ? getComputedStyle(sw).backgroundColor : null;
      const pageBg = getComputedStyle(document.body).backgroundColor;
      const scheme = getComputedStyle(document.documentElement).colorScheme;
      return { head, accent, btnBg, dotBg, badgeBg, indColor, segBg, swBg, pageBg, scheme };
    });
  });
  console.log(`\n=== ${mode} ===`);
  for (const m of measured) console.log(JSON.stringify(m));

  await page.screenshot({ path: `${OUT}pilot3-${mode}.png`, fullPage: true });
  console.log(`shot: pilot3-${mode}.png`);
  await page.close();
}

await browser.close();
console.log('\n---');
console.log(errors.length ? errors.slice(0, 15).join('\n') : 'no console/page errors');
