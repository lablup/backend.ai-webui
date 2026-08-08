/**
 * p3-w2a launcher probe — AgentSelect (BAIComplexSelect), EnvVarFormList
 * (AstryxFormTextInput rows) and DatePickerISO (DateTimeInput) all live behind
 * the session launcher's steps, so the route sweep cannot reach them.
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
    (m) => localStorage.setItem('backendaiwebui.settings.themeMode', JSON.stringify(m)),
    mode,
  );
  await page.goto(`${BASE.replace(/\/$/, '')}/session/start`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(16000);

  // Batch mode reveals DatePickerISO ("Schedule the session at a later time").
  try {
    await page
      .getByRole('radio', { name: /batch/i })
      .first()
      .click({ timeout: 5000 });
    await page.waitForTimeout(1500);
  } catch {
    /* segmented control renders as a button in some builds */
    try {
      await page
        .getByRole('button', { name: /^batch$/i })
        .first()
        .click({ timeout: 5000 });
      await page.waitForTimeout(1500);
    } catch {
      /* ignore */
    }
  }
  const scheduleToggle = page
    .locator('input[type="checkbox"]')
    .filter({ hasNot: page.locator('[disabled]') });
  log(`${mode}-launcherStep1`, {
    checkboxes: await scheduleToggle.count(),
    dateInputs: await page.locator('input[type="date"], .astryx-dateinput').count(),
  });
  await page.screenshot({ path: `${OUT}/${mode}-launcher-step1.png` });

  // Step 2 — "Environment & Resource allocation": AgentSelect + EnvVarFormList
  try {
    await page
      .getByRole('button', { name: /^next$/i })
      .first()
      .click({ timeout: 8000 });
    await page.waitForTimeout(12000);
  } catch (e) {
    log(`${mode}-nextClick`, String(e).slice(0, 120));
  }
  const complexTriggers = page.locator('button[class*="astryx-complexselector"]');
  log(`${mode}-launcherStep2`, {
    complexSelectors: await complexTriggers.count(),
    selectors: await page.locator('[class*="astryx-selector"]').count(),
    textinputs: await page.locator('[class*="astryx-textinput"] input, input[class*="astryx"]').count(),
  });
  await page.screenshot({
    path: `${OUT}/${mode}-launcher-step2.png`,
    fullPage: true,
  });

  // Open the agent select popup if it is on the page.
  try {
    const agentTrigger = page
      .locator('button')
      .filter({ hasText: /auto/i })
      .last();
    if (await agentTrigger.count()) {
      await agentTrigger.scrollIntoViewIfNeeded();
      await agentTrigger.click({ timeout: 6000 });
      await page.waitForTimeout(4000);
      log(`${mode}-agentSelectOptions`, await page.locator('[role="option"]').count());
      await page.screenshot({ path: `${OUT}/${mode}-agent-select.png` });
      await page.keyboard.press('Escape');
    }
  } catch (e) {
    log(`${mode}-agentSelect`, String(e).slice(0, 140));
  }
}

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(
  `${OUT}/measure-p3-w2a-launcher.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
