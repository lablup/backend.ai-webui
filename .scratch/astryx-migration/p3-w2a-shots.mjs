/**
 * p3-w2a live proof — the surfaces that render partition A's converted files.
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3-w2a-shots.mjs
 *
 * Credentials come from the environment, never from this file.
 * Dev server on http://127.0.0.1:5850 (agent W2-A's port band).
 *
 * Light pass then dark pass, same route list; each route records its heading
 * text plus whether the specific converted widget rendered, and every page
 * error is collected.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W2A_BASE ?? 'http://127.0.0.1:5850/';
const OUT = '.scratch/astryx-migration/shots/p3-w2a';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const pageErrors = [];
const consoleErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1900, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
});

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const count = (sel) => page.locator(sel).count();

/* ------------------------------- login -------------------------------- */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  if (process.env.BAI_EMAIL) await userInput.fill(process.env.BAI_EMAIL);
  if (process.env.BAI_PW)
    await page
      .locator('input[type="password"]')
      .first()
      .fill(process.env.BAI_PW);
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(18000);
log('loggedIn', !(await userInput.count()));

async function setTheme(mode) {
  await page.evaluate((m) => {
    localStorage.setItem('backendaiwebui.settings.themeMode', JSON.stringify(m));
  }, mode);
}

async function visit(key, path, probes, opts = {}) {
  const out = { path };
  try {
    await page.goto(`${BASE.replace(/\/$/, '')}${path}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(opts.settle ?? 9000);
    for (const [name, sel] of Object.entries(probes)) {
      out[name] = await count(sel);
    }
    out.astryxRoots = await count('[class*="astryx-"]');
    out.antdRoots = await count('[class*="ant-"]');
    if (opts.after) await opts.after(out);
    await shot(`${key}`);
  } catch (e) {
    out.error = String(e).slice(0, 200);
  }
  log(key, out);
}

const ROUTES = [
  [
    'statistics',
    '/statistics',
    {
      // AllocationHistory: Banner + Selector, AllocationHistoryStatistics cards
      banner: '.astryx-banner',
      selector: 'button.astryx-selector, .astryx-selector',
      cards: '.astryx-card',
    },
  ],
  [
    'scheduler-fairshare',
    '/scheduler',
    {
      // FairShareList: lab Stepper + Banner + the fair-share tables
      stepper: 'ol[class*="stepper"], .astryx-stepper',
      steps: 'li[class*="step"]',
      banner: '.astryx-banner',
      table: 'table',
    },
  ],
  [
    'diagnostics',
    '/admin/diagnostics',
    {
      // DiagnosticResultList: Banner rows + secondary Text lines
      banner: '.astryx-banner',
      text: '.astryx-text',
    },
  ],
  [
    'session-launcher',
    '/session/start',
    {
      // AgentSelect (BAIComplexSelect) + EnvVarFormList + DatePickerISO live
      // behind the launcher steps; the first step is what loads by default.
      textinput: '.astryx-textinput, input.astryx-input',
      card: '.astryx-card',
    },
    { settle: 14000 },
  ],
  [
    'sessions',
    '/session',
    {
      // SessionActionButtons / EditableSessionName render per row
      iconbutton: 'button[class*="astryx-iconbutton"]',
      table: 'table',
    },
    { settle: 14000 },
  ],
  [
    'deployments',
    '/deployments',
    {
      table: 'table',
      badge: '.astryx-badge',
    },
    { settle: 12000 },
  ],
  [
    'data',
    '/data',
    {
      // EditableVFolderName rows
      table: 'table',
      link: 'a',
    },
    { settle: 12000 },
  ],
  [
    'dashboard',
    '/dashboard',
    {
      // ConfigurableResourceCard (DropdownMenu trigger) + BAIPanelItem
      card: '.astryx-card',
      progressbar: '[class*="astryx-progressbar"]',
    },
    { settle: 12000 },
  ],
];

for (const mode of ['light', 'dark']) {
  await setTheme(mode);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  for (const [key, path, probes, opts] of ROUTES) {
    await visit(`${mode}-${key}`, path, probes, opts);
  }
  // Notification drawer — BAINotificationButton + the notification items.
  try {
    await page.locator('[data-testid="button-notification"]').first().click();
    await page.waitForTimeout(2500);
    await shot(`${mode}-notification-drawer`);
    log(`${mode}-notificationDrawerOpen`, await count('.ant-drawer, [role="dialog"]'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
  } catch (e) {
    log(`${mode}-notificationDrawer`, String(e).slice(0, 160));
  }
  // Download modal — DownloadModal (MetadataList + BAITabs + Selector).
  try {
    await page
      .getByRole('button', { name: /admin lablu|admin/i })
      .first()
      .click();
    await page.waitForTimeout(1800);
    await page
      .getByRole('menuitem', { name: /download/i })
      .first()
      .click();
    await page.waitForTimeout(3500);
    await shot(`${mode}-download-modal`);
    log(`${mode}-downloadModalTabs`, await count('[role="tab"]'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
  } catch (e) {
    log(`${mode}-downloadModal`, String(e).slice(0, 160));
  }
}

log('pageErrors', pageErrors.slice(0, 12));
log('consoleErrors', consoleErrors.slice(0, 12));
fs.writeFileSync(`${OUT}/measure-p3-w2a.json`, JSON.stringify(results, null, 2));
await browser.close();
