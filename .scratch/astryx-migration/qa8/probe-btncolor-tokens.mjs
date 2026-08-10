/**
 * qa8 group — resolved Astryx token values PER SCOPE for the button-colour
 * cluster. `data-astryx-theme` is scope-dependent (brand vs admin), so the same
 * `var(--color-*)` name resolves differently on /session and /admin/*.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-btncolor-tokens.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const KEYS = [
  '--color-text-blue',
  '--color-background-blue',
  '--color-text-red',
  '--color-background-red',
  '--color-text-accent',
  '--color-accent',
  '--color-error',
  '--color-text-primary',
  '--color-text-secondary',
  '--color-text-disabled',
  '--color-background-muted',
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);

const out = {};
for (const route of ['session', 'admin/users', 'admin/environment']) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  out[route] = await page.evaluate((keys) => {
    const host = document.querySelector('main') ?? document.body;
    const cs = getComputedStyle(host);
    const o = {
      astryxTheme:
        host.closest('[data-astryx-theme]')?.dataset.astryxTheme ??
        document.documentElement.dataset.astryxTheme,
    };
    for (const k of keys) o[k] = cs.getPropertyValue(k).trim();
    return o;
  }, KEYS);
}
fs.writeFileSync(
  `${ROOT}/before-btncolor-tokens.json`,
  JSON.stringify(out, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
