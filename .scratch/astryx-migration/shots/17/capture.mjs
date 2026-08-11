// Ticket 17 — Sessions area visual gate: shoot each probe case light+dark,
// tagged before/after.
//   pnpm exec node .scratch/astryx-migration/shots/17/capture.mjs <tag>
// Serve first (port policy 5635-5644):
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5635
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] ?? 'before';
const BASE = 'http://127.0.0.1:5635/theme-probe/sessions.html';

const cases = [
  { c: 'tags', q: '' },
  { c: 'tags', q: '&sched=1', suffix: '-sched' },
  { c: 'idle', q: '' },
  { c: 'detail', q: '' },
];

const browser = await chromium.launch();
const errors = [];
for (const { c, q, suffix = '' } of cases) {
  for (const mode of ['light', 'dark']) {
    const page = await browser.newPage({
      viewport: { width: 900, height: 700 },
    });
    page.on('pageerror', (e) =>
      errors.push(`[${c}${suffix}/${mode}] pageerror: ${e.message}`),
    );
    await page.goto(`${BASE}?case=${c}&mode=${mode}${q}`, {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}${tag}-${c}${suffix}-${mode}.png` });
    console.log(`shot: ${tag}-${c}${suffix}-${mode}.png`);
    await page.close();
  }
}
await browser.close();
if (errors.length) {
  console.error('--- page errors ---');
  for (const e of errors) console.error(e);
  process.exitCode = 1;
}
