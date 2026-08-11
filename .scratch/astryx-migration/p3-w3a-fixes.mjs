/**
 * p3-w3a follow-up — re-verifies the four defects the first shot pass exposed:
 *   1. BAICard duplicated a JSX tab label (SchedulerPage).
 *   2. CollapsibleGroup ignored a child's defaultIsOpen (DiagnosticsPage).
 *   3. InputGroup printed its label a second time (SessionLauncherPage).
 *   4. A horizontal RadioList overlapped its two descriptions (same page).
 * Plus the HPC Optimization grid, which sits below the fold on step 2.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W3A_BASE ?? 'http://127.0.0.1:5890/';
const OUT = '.scratch/astryx-migration/shots/p3-w3a';
fs.mkdirSync(OUT, { recursive: true });
const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
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
log('loggedIn', !(await userInput.count()));

for (const mode of ['light', 'dark']) {
  await page.evaluate((m) => {
    localStorage.setItem('backendaiwebui.settings.themeMode', JSON.stringify(m));
  }, mode);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);

  // 1. Scheduler tab label — must read the section name exactly ONCE.
  await page.goto(`${BASE.replace(/\/$/, '')}/admin/scheduler`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(11000);
  const tabText = (await page.locator('[role="tab"]').first().innerText().catch(() => ''))
    .replace(/\s+/g, ' ')
    .trim();
  log(`${mode}-schedulerTabText`, tabText);
  await page.screenshot({ path: `${OUT}/${mode}-scheduler-tab.png` });

  // 2. Diagnostics — every section open on first paint, like antd's
  //    defaultActiveKey={[all]}.
  await page.goto(`${BASE.replace(/\/$/, '')}/admin/diagnostics`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(12000);
  log(
    `${mode}-diagnosticsOpenTriggers`,
    await page.locator('[aria-expanded="true"]').count(),
  );
  await page.screenshot({ path: `${OUT}/${mode}-diagnostics-open.png`, fullPage: true });

  // 3 + 4. Launcher — batch step: radio rows stacked, timeout label once.
  await page.goto(`${BASE.replace(/\/$/, '')}${PREFIX}/session/start`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(16000);
  await page
    .getByRole('radio', { name: /batch/i })
    .first()
    .click({ timeout: 6000 })
    .catch(() => {});
  await page.waitForTimeout(3500);
  const bodyText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  log(
    `${mode}-timeoutLabelOccurrences`,
    (bodyText.match(/Batch Job Timeout Duration/g) ?? []).length,
  );
  await page.screenshot({ path: `${OUT}/${mode}-launcher-batch-fixed.png` });

  // HPC Optimization grid — step 2, below the fold.
  await page
    .getByRole('button', { name: /next/i })
    .first()
    .click({ timeout: 6000 })
    .catch(() => {});
  await page.waitForTimeout(7000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${OUT}/${mode}-launcher-hpc.png`, fullPage: true });
  log(
    `${mode}-hpcSpinbuttons`,
    await page.locator('[role="spinbutton"], input[type="number"]').count(),
  );
}

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(`${OUT}/measure-p3-w3a-fixes.json`, JSON.stringify(results, null, 2));
await browser.close();
