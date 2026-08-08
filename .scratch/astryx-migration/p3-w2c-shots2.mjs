/**
 * Phase 3 wave 2 · partition C — pass 2.
 *
 * Pass 1 (`p3-w2c-shots.mjs`) covered the notification drawer, RBAC, sessions,
 * launcher and data in light mode and proved zero page errors. It missed three
 * things, which this pass fixes:
 *   - the theme toggle never fired (the header button index guess was wrong),
 *     so every "dark" shot was actually light. Dark mode is now set through the
 *     `backendaiwebui.settings.themeMode` localStorage key + reload, which is
 *     the same switch the toggle writes.
 *   - `/statistics` is project-scoped, so the bare path 404'd. Navigation now
 *     goes through the sidebar menu item.
 *   - the account menu is opened by its avatar button, not the last header
 *     button.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.W2C_BASE ?? 'http://127.0.0.1:5870/';
const OUT = '.scratch/astryx-migration/shots/p3-w2c';
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
  viewport: { width: 1800, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
});

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const wait = (ms) => page.waitForTimeout(ms);
const count = async (sel) => page.locator(sel).count();
const esc = async () => {
  await page.keyboard.press('Escape');
  await wait(800);
};

/* ------------------------------- login -------------------------------- */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await wait(9000);
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
await wait(18000);
log('loggedIn', !(await userInput.count()));

async function setTheme(mode) {
  await page.evaluate((m) => {
    window.localStorage.setItem(
      'backendaiwebui.settings.themeMode',
      JSON.stringify(m),
    );
  }, mode);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait(11000);
  return page.evaluate(() => ({
    bodyClass: document.body.className,
    rootTheme: document.documentElement.getAttribute('data-astryx-mode'),
    stored: window.localStorage.getItem('backendaiwebui.settings.themeMode'),
  }));
}

/* ============================= statistics ============================== */
async function statistics(tag) {
  const out = {};
  try {
    await page
      .getByRole('menuitem', { name: /statistics/i })
      .first()
      .click()
      .catch(async () => {
        await page
          .getByRole('link', { name: /statistics/i })
          .first()
          .click();
      });
    await wait(16000);
    out.url = page.url();
    out.dateRangeTrigger = await count(
      'button[class*="daterange"], .astryx-daterange-input, [class*="astryx-date"]',
    );
    out.antdPicker = await count('.ant-picker');
    out.banners = await count('.astryx-banner');
    out.emptyStates = await count('.astryx-empty-state, [class*="empty-state"]');
    await shot(`14-statistics-${tag}`);
    // open the range popover to prove the DateRangeInput works
    const trigger = page
      .getByRole('button')
      .filter({ hasText: /\d{4}/ })
      .first();
    if (await trigger.count()) {
      await trigger.click();
      await wait(2500);
      out.calendarOpen = await count(
        '[role="dialog"] [role="grid"], .astryx-calendar',
      );
      await shot(`15-statistics-daterange-open-${tag}`);
      await esc();
    }
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`statistics_${tag}`, out);
}

/* ============================ my account =============================== */
async function myAccount(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(11000);
    const hdr = page.locator('header button, .ant-layout-header button');
    const n = await hdr.count();
    out.headerButtons = n;
    // Walk the header buttons from the right until one opens a menu that has a
    // "my account"-ish entry.
    for (let i = n - 1; i >= 0; i -= 1) {
      await hdr
        .nth(i)
        .click()
        .catch(() => {});
      await wait(1600);
      const item = page.getByText(/my account|preferences|profile/i).first();
      if (await item.count()) {
        await item.click().catch(() => {});
        await wait(6000);
        break;
      }
      await esc();
    }
    out.textInputs = await count('.astryx-text-input');
    out.switches = await count('.astryx-switch');
    out.antdInputs = await count('.ant-input');
    out.tokenizers = await count('[class*="astryx-tokenizer"]');
    await shot(`16-my-account-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`myAccount_${tag}`, out);
}

/* ============================ light pass =============================== */
await statistics('light');
await myAccount('light');

/* ============================= dark pass =============================== */
log('themeSwitch', await setTheme('dark'));
await shot('20-start-dark');

async function notificationDrawer(tag) {
  const out = {};
  try {
    const bell = page.locator('header button, .ant-layout-header button');
    const n = await bell.count();
    for (let i = 0; i < n; i += 1) {
      const html = await bell.nth(i).innerHTML();
      if (html.includes('bell')) {
        await bell.nth(i).click();
        break;
      }
    }
    await wait(2500);
    out.drawerOpen = await count('dialog.astryx-drawer');
    out.segmented = await count('.astryx-segmented-control');
    out.antdDrawer = await count('.ant-drawer');
    await shot(`21-notification-drawer-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`notificationDrawer_${tag}`, out);
}
await notificationDrawer('dark');

async function rbac(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
    await wait(15000);
    out.astryxBadges = await count('.astryx-badge');
    out.antdTags = await count('.ant-tag');
    await shot(`22-rbac-list-${tag}`);
    await page
      .locator('table tbody tr td')
      .first()
      .click()
      .catch(() => {});
    await wait(10000);
    out.roleDrawer = await count('dialog.astryx-drawer');
    out.metadataLists = await count('.astryx-metadata-list');
    out.antdDescriptions = await count('.ant-descriptions');
    await shot(`23-rbac-role-drawer-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`rbac_${tag}`, out);
}
await rbac('dark');

async function sessions(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
    await wait(15000);
    await shot(`24-session-list-${tag}`);
    await page
      .locator('table tbody tr td')
      .first()
      .click()
      .catch(() => {});
    await wait(9000);
    out.detailDrawer = await count('dialog.astryx-drawer');
    await shot(`25-session-detail-drawer-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`sessions_${tag}`, out);
}
await sessions('dark');

async function launcher(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
    await wait(18000);
    await shot(`26-launcher-step1-${tag}`);
    await page
      .getByRole('button', { name: /^next$/i })
      .first()
      .click()
      .catch(() => {});
    await wait(6000);
    out.segmented = await count('.astryx-segmented-control');
    out.antdRadio = await count('.ant-radio-group');
    await shot(`27-launcher-resources-${tag}`);
    await page
      .getByRole('button', { name: /^next$/i })
      .first()
      .click()
      .catch(() => {});
    await wait(6000);
    await shot(`28-launcher-storage-${tag}`);
  } catch (e) {
    out.error = String(e).slice(0, 200);
  }
  log(`launcher_${tag}`, out);
}
await launcher('dark');

async function data(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
    await wait(14000);
    await shot(`29-data-list-${tag}`);
    await page
      .locator('table tbody tr td a, table tbody tr td button')
      .first()
      .click()
      .catch(() => {});
    await wait(9000);
    out.metadataLists = await count('.astryx-metadata-list');
    await shot(`30-data-folder-detail-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`data_${tag}`, out);
}
await data('dark');
await statistics('dark');

log('pageErrors', pageErrors.slice(0, 20));
log('consoleErrors', [...new Set(consoleErrors)].slice(0, 15));
fs.writeFileSync(
  `${OUT}/measure-p3-w2c-pass2.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
