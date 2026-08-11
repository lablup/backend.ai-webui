// Ticket 14 — responsive-policy pilots: shoot each pilot case at the widths
// where its breakpoint behaviour changes, tagged before/after.
//   pnpm exec node .scratch/astryx-migration/shots/14/capture.mjs <tag>
// Serve first:  cd react && pnpm exec vite --config theme-probe/vite.config.mts
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] ?? 'before';
const BASE = 'http://127.0.0.1:9198/theme-probe/responsive.html';

const shots = [
  // Pilot A: side-by-side vs stacked
  { c: 'picker', w: 1400, h: 400 },
  { c: 'picker', w: 1100, h: 400 }, // antd: lg={24} band (992-1199) stacks
  { c: 'picker', w: 900, h: 400 },
  { c: 'picker', w: 500, h: 500 },
  // Pilot B: xl (1200) gate — margin-style vs overlay-style
  { c: 'drawer', w: 1400, h: 450 },
  { c: 'drawer', w: 1000, h: 450 },
  // Pilot C: fixed 576px modal — width must not change
  { c: 'modal', w: 900, h: 900 },
];

const browser = await chromium.launch();
const errors = [];
for (const { c, w, h } of shots) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on('pageerror', (e) => errors.push(`[${c}@${w}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${c}@${w}] console: ${m.text()}`);
  });
  await page.goto(`${BASE}?case=${c}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}${tag}-${c}-${w}.png` });
  console.log(`shot: ${tag}-${c}-${w}.png`);
  await page.close();
}
await browser.close();
if (errors.length) {
  console.error('--- page errors ---');
  for (const e of errors) console.error(e);
  process.exitCode = 1;
}
