/**
 * p3-w2a fair-share drill-down — the gear opens
 * `ResourceGroupFairShareSettingModal` (Grid + NumberInput `units`), the name
 * cell advances the lab `Stepper` to Domain (DomainFairShareTable), and the
 * row action opens `FairShareWeightSettingModal`.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W2A_BASE ?? 'http://127.0.0.1:5850/';
const OUT = '.scratch/astryx-migration/shots/p3-w2a';
fs.mkdirSync(OUT, { recursive: true });
const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1700, height: 1100 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL ?? '');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? '');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(18000);

for (const mode of ['light', 'dark']) {
  await page.evaluate(
    (m) =>
      localStorage.setItem(
        'backendaiwebui.settings.themeMode',
        JSON.stringify(m),
      ),
    mode,
  );
  await page.goto(`${BASE.replace(/\/$/, '')}/scheduler`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(13000);

  /* gear -> ResourceGroupFairShareSettingModal */
  try {
    const row = page.locator('table tbody tr').first();
    const gear = row.locator('button').last();
    await gear.click({ timeout: 8000 });
    await page.waitForTimeout(5000);
    log(`${mode}-rgSettingModal`, {
      dialogs: await page.locator('[role="dialog"], dialog[open]').count(),
      spinbuttons: await page.getByRole('spinbutton').count(),
      unitsText: await page.getByText(/days/i).count(),
    });
    await page.screenshot({ path: `${OUT}/${mode}-rg-setting-modal.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
  } catch (e) {
    log(`${mode}-rgSettingModal`, String(e).slice(0, 150));
  }

  /* name cell -> Domain step */
  try {
    await page
      .locator('table tbody tr')
      .first()
      .locator('a, [role="button"]')
      .first()
      .click({ timeout: 8000 });
    await page.waitForTimeout(10000);
    await page.screenshot({ path: `${OUT}/${mode}-fairshare-domain.png` });
    log(`${mode}-domainStep`, {
      rows: await page.locator('table tbody tr').count(),
      steps: await page.locator('li[class*="step"]').count(),
    });
  } catch (e) {
    log(`${mode}-domainStep`, String(e).slice(0, 150));
  }

  /* row action -> FairShareWeightSettingModal */
  try {
    const row = page.locator('table tbody tr').first();
    await row.hover();
    await page.waitForTimeout(800);
    await row.locator('button').last().click({ timeout: 8000 });
    await page.waitForTimeout(6000);
    log(`${mode}-weightModal`, {
      dialogs: await page.locator('[role="dialog"], dialog[open]').count(),
      spinbuttons: await page.getByRole('spinbutton').count(),
    });
    await page.screenshot({ path: `${OUT}/${mode}-weight-modal.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
  } catch (e) {
    log(`${mode}-weightModal`, String(e).slice(0, 150));
  }
}

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(
  `${OUT}/measure-p3-w2a-fairshare.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
