// Ticket 21 — Users/Credentials/ResourcePolicy area shots: each probe case
// in light and dark, tagged before/after.
//   pnpm exec node .scratch/astryx-migration/shots/21/capture.mjs <tag>
// Serve first (this worktree's port policy 5675-5684):
//   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5675 --strictPort
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const OUT = new URL('./', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] ?? 'before';
const BASE = 'http://127.0.0.1:5675/theme-probe/users21.html';

const shots = [];
for (const c of ['credentials', 'toolbar', 'keypair']) {
  for (const mode of ['light', 'dark']) {
    shots.push({ c, mode });
  }
}

const browser = await chromium.launch();
const errors = [];
for (const { c, mode } of shots) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  page.on('pageerror', (e) =>
    errors.push(`[${c}/${mode}] pageerror: ${e.message}`),
  );
  await page.goto(`${BASE}?case=${c}&mode=${mode}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: `${OUT}${tag}-${c}-${mode}.png`,
    fullPage: true,
  });
  console.log(`shot: ${tag}-${c}-${mode}.png`);
  await page.close();
}
await browser.close();
if (errors.length) {
  console.error('--- page errors ---');
  for (const e of errors) console.error(e);
  process.exitCode = 1;
}
