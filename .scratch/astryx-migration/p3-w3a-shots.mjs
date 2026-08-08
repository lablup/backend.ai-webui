/**
 * p3-w3a live proof — every route that renders a file this ticket converted.
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3-w3a-shots.mjs
 *
 * Credentials come from the environment, never from this file.
 * Dev server on http://127.0.0.1:5890 (agent W3-A's port band).
 *
 * Light pass then dark pass over the same route list; each route records
 * whether its specific converted widget rendered, plus every page error.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W3A_BASE ?? 'http://127.0.0.1:5890/';
// Project-scoped routes carry a `/project/<name>` prefix; it is discovered
// from the URL the app lands on after login (see PROJECT_PREFIX below).
const OUT = '.scratch/astryx-migration/shots/p3-w3a';
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

// Project-scoped routes live under `/project/<urlencoded project name>`; the
// app lands on one after login, so read the prefix off the URL rather than
// hardcoding a project this cluster may not have.
const PROJECT_PREFIX =
  new URL(page.url()).pathname.match(/^\/project\/[^/]+/)?.[0] ?? '';
log('projectPrefix', PROJECT_PREFIX);

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
    // StatisticsPage — BAISkeletonAstryx Suspense fallback + tabbed BAICard.
    'statistics',
    `${PROJECT_PREFIX}/statistics`,
    { tab: '[role="tab"]', card: '.astryx-card' },
  ],
  [
    // SchedulerPage — Tooltip on the tab label + BAISkeletonAstryx + the
    // EmptyState error fallback (only when the query fails).
    'scheduler',
    '/admin/scheduler',
    { tab: '[role="tab"]', stepper: 'ol[class*="stepper"], .astryx-stepper' },
  ],
  [
    // DiagnosticsPage — Switch + DropdownMenu + CollapsibleGroup + EmptyState.
    'diagnostics',
    '/admin/diagnostics',
    {
      switch: 'input[type="checkbox"][role="switch"], .astryx-switch',
      collapsible: '[class*="astryx-collapsible"]',
      emptystate: '.astryx-empty-state',
      dropdownTrigger: 'button[aria-haspopup="menu"]',
    },
    { settle: 12000 },
  ],
  [
    // AdminUsersPage — BAICardTabItem tab list.
    'admin-users',
    '/admin/users',
    { tab: '[role="tab"]', table: 'table' },
    { settle: 12000 },
  ],
  [
    // ProjectPage — BAIButton title -> Astryx tooltip (bulk edit).
    'admin-project',
    '/admin/project',
    { table: 'table', iconbutton: 'button[class*="astryx-icon-button"]' },
    { settle: 12000 },
  ],
  [
    // ReservoirPage — Grid + Card + lab Stat + IconButton + Button.
    'reservoir',
    '/admin/reservoir',
    {
      stat: '[class*="astryx-stat"]',
      card: '.astryx-card',
      grid: '[class*="astryx-grid"]',
      table: 'table',
    },
    { settle: 14000 },
  ],
  [
    // SessionLauncherPage — RadioList, TextArea, Checkbox, InputGroup,
    // NumberInput, Selector, Switch, lab Stepper.
    'session-launcher',
    `${PROJECT_PREFIX}/session/start`,
    {
      radio: 'input[type="radio"]',
      stepper: 'ol[class*="stepper"], .astryx-stepper',
      card: '.astryx-card',
    },
    { settle: 16000 },
  ],
  [
    // AstryxStylexProbePage — the antd reference button is gone.
    'astryx-probe',
    `${PROJECT_PREFIX}/stylex-probe`,
    { astryxBtn: '#astryx-btn-override', antdBtn: '#antd-btn' },
    { settle: 8000 },
  ],
];

for (const mode of ['light', 'dark']) {
  await setTheme(mode);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  for (const [key, path, probes, opts] of ROUTES) {
    await visit(`${mode}-${key}`, path, probes, opts);
  }

  // DiagnosticsPage — open the export DropdownMenu and toggle the Switch.
  try {
    await page.goto(`${BASE.replace(/\/$/, '')}/admin/diagnostics`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(11000);
    await page
      .locator('.bai-card button[aria-haspopup="menu"]:not([disabled])')
      .first()
      .click();
    await page.waitForTimeout(1500);
    log(`${mode}-diagnosticsMenuItems`, await count('[role="menuitem"]'));
    await shot(`${mode}-diagnostics-menu`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(800);
    await page
      .getByRole('switch')
      .first()
      .click({ timeout: 5000 })
      .catch(() => {});
    await page.waitForTimeout(2500);
    await shot(`${mode}-diagnostics-onlyfailed`);
    log(`${mode}-diagnosticsEmptyAfterFilter`, await count('.astryx-empty-state'));
  } catch (e) {
    log(`${mode}-diagnosticsInteract`, String(e).slice(0, 200));
  }

  // SessionLauncherPage — batch mode reveals TextArea + Checkbox +
  // InputGroup(NumberInput + Selector); step 2 reveals the HPC NumberInputs.
  try {
    await page.goto(`${BASE.replace(/\/$/, '')}${PROJECT_PREFIX}/session/start`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(16000);
    await page
      .getByRole('radio', { name: /batch/i })
      .first()
      .click({ timeout: 6000 })
      .catch(() => {});
    await page.waitForTimeout(3000);
    log(`${mode}-launcherBatchTextArea`, await count('textarea'));
    log(`${mode}-launcherBatchCheckbox`, await count('input[type="checkbox"]'));
    log(`${mode}-launcherSpinbuttons`, await count('[role="spinbutton"], input[type="number"]'));
    await shot(`${mode}-launcher-batch`);
    // step 2 (Environments & Resource allocation) holds the HPC grid.
    await page
      .getByRole('button', { name: /next/i })
      .first()
      .click({ timeout: 6000 })
      .catch(() => {});
    await page.waitForTimeout(6000);
    log(`${mode}-launcherStep2Spinbuttons`, await count('[role="spinbutton"], input[type="number"]'));
    log(`${mode}-launcherStep2Switch`, await count('[role="switch"]'));
    await shot(`${mode}-launcher-step2`);
  } catch (e) {
    log(`${mode}-launcherInteract`, String(e).slice(0, 200));
  }
}

log('pageErrors', pageErrors.slice(0, 12));
log('consoleErrors', consoleErrors.slice(0, 12));
fs.writeFileSync(`${OUT}/measure-p3-w3a.json`, JSON.stringify(results, null, 2));
await browser.close();
