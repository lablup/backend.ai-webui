/**
 * phase-3 wave 2 / partition B — session-launcher deep pass.
 *
 * Steps through the launcher so the two heaviest conversions in this batch are
 * actually on screen: `ImageEnvironmentSelectFormItems` (step 2, with the
 * environment Selector popup open) and `ResourcePresetSelect` (step 2), plus
 * `PortSelectFormItem` on the Network step.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BAI_WEBUI ?? 'http://127.0.0.1:5860/';
const STATE = process.env.BAI_STATE ?? '/tmp/w2b-state.json';
const OUT = '.scratch/astryx-migration/shots/p3-w2b';
mkdirSync(OUT, { recursive: true });
const P = process.env.BAI_PROJECT_PATH ?? '';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  storageState: STATE,
  viewport: { width: 1600, height: 1100 },
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  const t = m.text();
  if (m.type() !== 'error') return;
  if (/fonts\.googleapis\.com|RelayResponseNormalizer|Failed to load resource/.test(t))
    return;
  errors.push(`[${page.url()}] ${t}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror ${page.url()}] ${e.message}`));

const shot = (n) =>
  page.screenshot({ path: `${OUT}/${n}.png` }).then(() => console.log('  shot', n));

async function toggleTheme() {
  const named = page.getByRole('button', { name: /dark|light|theme|테마/i });
  if (await named.count()) await named.first().click();
  await page.waitForTimeout(2500);
}

async function run(mode) {
  await page.goto(new URL(`${P}/session/start`, BASE).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(20000);

  // Step 2 — Environments & Resource Allocation.
  await page.getByRole('button', { name: /^next/i }).first().click();
  await page.waitForTimeout(14000);
  await shot(`${mode}-13-launcher-environments`);

  // Open the environment Selector so the converted Badge rows are visible.
  const envCombo = page.getByRole('combobox').first();
  if (await envCombo.count()) {
    await envCombo.click().catch(() => {});
    await page.waitForTimeout(4000);
    await shot(`${mode}-14-launcher-environment-popup`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
  }

  // Step 3 (Data & Storage) then step 4 (Network → PortSelectFormItem).
  await page.getByRole('button', { name: /^next/i }).first().click();
  await page.waitForTimeout(8000);
  await page.getByRole('button', { name: /^next/i }).first().click();
  await page.waitForTimeout(8000);
  await shot(`${mode}-15-launcher-network`);
}

console.log('--- light ---');
await run('light');
console.log('--- dark ---');
await toggleTheme();
await run('dark');

console.log('\n=== app console errors (%d) ===', errors.length);
for (const e of [...new Set(errors)]) console.log(' -', e);
await browser.close();
