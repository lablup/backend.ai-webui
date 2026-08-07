// PILOT 7 — link-style acceptance: the folder-name cell at rest and hovered,
// light + dark, under the NESTED ADMIN THEME the pilot page mounts.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const OUT = new URL('./shots/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const BASE = process.env.URL ?? 'http://127.0.0.1:5312/phase6.html';
const b = await chromium.launch();
const errors = [];
for (const mode of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, colorScheme: mode, deviceScaleFactor: 2 });
  p.on('pageerror', (e) => errors.push(`[${mode}] pageerror: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(`[${mode}] console: ${m.text()}`); });
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);
  const rows = p.locator('.bai-name-action-cell-title-area');
  const first = await rows.nth(0).boundingBox();
  const clip = { x: first.x - 10, y: first.y - 12, width: 420, height: first.height * 4 + 40 };
  await p.screenshot({ path: `${OUT}pilot7-linkstyle-rest-${mode}.png`, clip });
  await rows.nth(1).locator('a').hover();
  await p.waitForTimeout(350);
  await p.screenshot({ path: `${OUT}pilot7-linkstyle-${mode}.png`, clip });
  const colors = await p.locator('.bai-name-action-cell-title-area a span span').first()
    .evaluate((n) => getComputedStyle(n).color);
  console.log(`${mode}: visible name colour = ${colors}`);
  await p.close();
}
await b.close();
console.log(errors.length ? errors.join('\n') : 'no console/page errors');
