// Ticket 22 — Settings-area shots: each probe case in light and dark,
// tagged before/after.
//   pnpm exec node .scratch/astryx-migration/shots/22/capture.mjs <tag>
// Serve first (port policy 5685-5694):
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5685
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] ?? 'before';
const caseFilter = process.argv[3]; // optional: 'settingList' | 'information'
const BASE = 'http://127.0.0.1:5685/theme-probe/settings.html';

const shots = [];
for (const c of caseFilter ? [caseFilter] : ['settingList', 'information']) {
  for (const theme of ['light', 'dark']) {
    shots.push({ c, theme });
  }
}

const browser = await chromium.launch();
const errors = [];
for (const { c, theme } of shots) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
  });
  page.on('pageerror', (e) =>
    errors.push(`[${c}/${theme}] pageerror: ${e.message}`),
  );
  await page.goto(`${BASE}?case=${c}&theme=${theme}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: `${OUT}${tag}-${c}-${theme}.png`,
    fullPage: true,
  });
  console.log(`shot: ${tag}-${c}-${theme}.png`);
  await page.close();
}
await browser.close();
if (errors.length) {
  console.error('--- page errors ---');
  for (const e of errors) console.error(e);
  process.exitCode = 1;
}
