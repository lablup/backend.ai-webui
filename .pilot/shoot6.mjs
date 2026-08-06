// PILOT 10 PHASE 6 — screenshot the converted page graph in light + dark.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:5311/phase6.html';
const browser = await chromium.launch();
const errors = [];

const states = [
  { key: '', name: 'pilot6' },
  { key: 'create', name: 'pilot6-create' },
  { key: 'delete', name: 'pilot6-delete' },
];

for (const mode of ['light', 'dark']) {
  for (const state of states) {
    const page = await browser.newPage({
      viewport: { width: 1500, height: 1000 },
      colorScheme: mode,
    });
    page.on('pageerror', (e) =>
      errors.push(`[${mode}/${state.name}] pageerror: ${e.message}`),
    );
    page.on('console', (m) => {
      if (m.type() === 'error')
        errors.push(`[${mode}/${state.name}] console: ${m.text()}`);
    });
    await page.goto(state.key ? `${BASE}?state=${state.key}` : BASE, {
      waitUntil: 'networkidle',
    });
    // Let the countdown border reach roughly mid-sweep on its 5 s cycle.
    await page.waitForTimeout(2500);
    await page.screenshot({
      path: `${OUT}${state.name}-${mode}.png`,
      fullPage: true,
    });
    console.log(`shot: ${state.name}-${mode}.png`);
    await page.close();
  }
}

// A clipped frame of the auto-refresh control mid-sweep, so the countdown
// border (item 6) is legible at 1.5px instead of lost in a full-page shot.
for (const mode of ['light', 'dark']) {
  const page = await browser.newPage({
    viewport: { width: 1500, height: 1000 },
    colorScheme: mode,
  });
  page.on('pageerror', (e) => errors.push(`[${mode}/countdown] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${mode}/countdown] console: ${m.text()}`);
  });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const rect = await page
    .locator('rect.bai-countdown-border-fill')
    .first()
    .evaluate((el) => {
      const b = el.getBoundingClientRect();
      return { x: b.x, y: b.y, width: b.width, height: b.height };
    });
  await page.screenshot({
    path: `${OUT}pilot6-countdown-${mode}.png`,
    clip: {
      x: rect.x - 24,
      y: rect.y - 16,
      width: rect.width + 48,
      height: rect.height + 32,
    },
  });
  console.log(`shot: pilot6-countdown-${mode}.png`);
  await page.close();
}

await browser.close();
console.log(errors.length ? errors.join('\n') : 'no console/page errors');
