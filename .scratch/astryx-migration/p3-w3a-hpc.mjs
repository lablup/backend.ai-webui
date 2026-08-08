/**
 * p3-w3a — HPC Optimization card on launcher step 2. It lives below the fold
 * inside the app's own scroll container, and its two `NumberInput`s only
 * appear when the OpenMP switch is turned OFF, so it needs its own probe.
 * Also checks the W2A-17 grid trap: neither field may overflow its track.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W3A_BASE ?? 'http://127.0.0.1:5890/';
const OUT = '.scratch/astryx-migration/shots/p3-w3a';
const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1900, height: 2600 } });
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  if (process.env.BAI_EMAIL) await userInput.fill(process.env.BAI_EMAIL);
  if (process.env.BAI_PW)
    await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(18000);
const PREFIX = new URL(page.url()).pathname.match(/^\/project\/[^/]+/)?.[0] ?? '';

for (const mode of ['light', 'dark']) {
  await page.evaluate((m) => {
    localStorage.setItem('backendaiwebui.settings.themeMode', JSON.stringify(m));
  }, mode);
  await page.goto(`${BASE.replace(/\/$/, '')}${PREFIX}/session/start`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(17000);
  await page
    .getByRole('button', { name: /skip to review/i })
    .first()
    .click({ timeout: 6000 })
    .catch(() => {});
  await page.waitForTimeout(2000);
  // Back to step 2, where the HPC card lives.
  await page.goto(`${BASE.replace(/\/$/, '')}${PREFIX}/session/start`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(17000);
  await page
    .getByRole('button', { name: /^next/i })
    .first()
    .click({ timeout: 6000 })
    .catch(() => {});
  await page.waitForTimeout(7000);

  // The app scrolls inside its own container, so `scrollIntoViewIfNeeded` on
  // the document does nothing; a tall viewport puts the whole step on screen.
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${mode}-launcher-hpc-auto.png` });

  // Turning the OpenMP switch OFF reveals the two-column NumberInput grid.
  // The accessible name comes from a visually-hidden <label>, not aria-label,
  // so match by role name rather than by attribute.
  await page
    .getByRole('switch', { name: /openmp/i })
    .first()
    .click({ timeout: 8000 })
    .catch((e) => log('ompSwitchClick', String(e).slice(0, 120)));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${mode}-launcher-hpc-manual.png` });

  // W2A-17 trap check: no grid child may be wider than its own track.
  const overflow = await page.evaluate(() => {
    const grids = Array.from(document.querySelectorAll('[class*="astryx-grid"]'));
    const bad = [];
    for (const g of grids) {
      const gr = g.getBoundingClientRect();
      for (const c of Array.from(g.children)) {
        const cr = c.getBoundingClientRect();
        if (cr.right > gr.right + 1 || cr.left < gr.left - 1) {
          bad.push({ grid: gr.width, child: cr.width, dx: cr.right - gr.right });
        }
      }
    }
    return bad;
  });
  log(`${mode}-gridOverflow`, overflow);
  log(
    `${mode}-hpcSpinbuttons`,
    await page.locator('[role="spinbutton"], input[type="number"]').count(),
  );
}

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(`${OUT}/measure-p3-w3a-hpc.json`, JSON.stringify(results, null, 2));
await browser.close();
