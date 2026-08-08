/**
 * p3-w2a modal/interaction probe — the converted surfaces that only appear
 * after a click: EnvVarFormList rows, the fair-share setting modals
 * (Grid + NumberInput `units`), the fair-share weight modal, and the
 * auto-scaling rule editor.
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

  /* ---- EnvVarFormList rows (launcher step 2) ---- */
  try {
    await page.goto(`${BASE.replace(/\/$/, '')}/session/start`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(15000);
    await page
      .getByRole('button', { name: /^next$/i })
      .first()
      .click({ timeout: 8000 });
    await page.waitForTimeout(11000);
    const addEnv = page
      .getByRole('button', { name: /add environment variable/i })
      .first();
    await addEnv.scrollIntoViewIfNeeded();
    await addEnv.click();
    await page.waitForTimeout(1200);
    await addEnv.click();
    await page.waitForTimeout(1500);
    log(`${mode}-envVarRows`, {
      inputs: await page
        .locator('input[placeholder]')
        .filter({ hasText: '' })
        .count(),
      astryxInputs: await page.locator('.astryx-textinput input').count(),
    });
    await page.screenshot({ path: `${OUT}/${mode}-envvars.png` });
  } catch (e) {
    log(`${mode}-envVars`, String(e).slice(0, 150));
  }

  /* ---- ResourceGroupFairShareSettingModal (gear on the fair-share row) ---- */
  try {
    await page.goto(`${BASE.replace(/\/$/, '')}/scheduler`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(12000);
    await page
      .locator('table button')
      .first()
      .click({ timeout: 8000 });
    await page.waitForTimeout(4000);
    log(`${mode}-rgFairShareModal`, {
      dialogs: await page.locator('[role="dialog"]').count(),
      numberInputs: await page.locator('input[inputmode="decimal"], input[type="number"]').count(),
    });
    await page.screenshot({ path: `${OUT}/${mode}-rg-fairshare-modal.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
  } catch (e) {
    log(`${mode}-rgFairShareModal`, String(e).slice(0, 150));
  }

  /* ---- FairShare domain step + weight modal ---- */
  try {
    await page
      .getByRole('link', { name: /default/i })
      .first()
      .click({ timeout: 8000 });
    await page.waitForTimeout(9000);
    await page.screenshot({ path: `${OUT}/${mode}-fairshare-domain.png` });
    log(`${mode}-fairShareDomainRows`, await page.locator('table tbody tr').count());
    await page
      .locator('table button')
      .first()
      .click({ timeout: 8000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: `${OUT}/${mode}-fairshare-weight-modal.png` });
    log(`${mode}-weightModalDialogs`, await page.locator('[role="dialog"]').count());
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
  } catch (e) {
    log(`${mode}-fairShareDomain`, String(e).slice(0, 150));
  }

  /* ---- Deployment detail: auto-scaling rules ---- */
  try {
    await page.goto(`${BASE.replace(/\/$/, '')}/deployments`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(11000);
    const firstDeployment = page.locator('table tbody a').first();
    if (await firstDeployment.count()) {
      await firstDeployment.click();
      await page.waitForTimeout(12000);
      await page.screenshot({
        path: `${OUT}/${mode}-deployment-detail.png`,
        fullPage: true,
      });
      log(`${mode}-autoScalingCard`, {
        badges: await page.locator('.astryx-badge').count(),
        iconButtons: await page.locator('[class*="astryx-iconbutton"]').count(),
      });
    } else {
      log(`${mode}-deploymentDetail`, 'no deployments on this cluster');
    }
  } catch (e) {
    log(`${mode}-deploymentDetail`, String(e).slice(0, 150));
  }
}

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(
  `${OUT}/measure-p3-w2a-modals.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
