// Ticket 18 — Deployments-area shots: each probe case in light and dark,
// tagged before/after.
//   pnpm exec node .scratch/astryx-migration/shots/18/capture.mjs <tag>
// Serve first (port policy 5645-5654):
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5645
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] ?? 'before';
const BASE = 'http://127.0.0.1:5645/theme-probe/deployments.html';

const shots = [];
for (const c of ['revision', 'replica', 'drawer']) {
  for (const theme of ['light', 'dark']) {
    shots.push({ c, theme });
  }
}

const browser = await chromium.launch();
const errors = [];
for (const { c, theme } of shots) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: c === 'replica' ? 300 : 1400 },
  });
  page.on('pageerror', (e) =>
    errors.push(`[${c}/${theme}] pageerror: ${e.message}`),
  );
  await page.goto(`${BASE}?case=${c}&theme=${theme}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${OUT}${tag}-${c}-${theme}.png`,
    fullPage: c !== 'drawer',
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
