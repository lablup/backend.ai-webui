/** qa8 — read the hover/tint/tooltip-relevant custom properties in both modes. */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const VARS = [
  '--color-overlay-hover',
  '--color-overlay-pressed',
  '--color-tint-hover',
  '--color-accent',
  '--color-accent-muted',
  '--color-error',
  '--color-background-inverted',
  '--color-text-inverted',
  '--color-background-surface',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);

const out = {};
for (const mode of ['light', 'dark']) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2200);
  out[mode] = await page.evaluate((vars) => {
    const cs = getComputedStyle(document.documentElement);
    const o = { theme: document.documentElement.dataset.theme };
    for (const v of vars) o[v] = cs.getPropertyValue(v).trim();
    return o;
  }, VARS);
}

fs.writeFileSync(`${ROOT}/before-vars.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
