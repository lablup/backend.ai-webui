/**
 * Phase 3 wave 2 · partition C — pass 3 (the surfaces passes 1–2 missed).
 *
 * The diagnostic (`p3-w2c-diag.mjs`) established the two selector facts passes
 * 1–2 got wrong:
 *   - the top bar is not a `<header>`; its controls are found by position
 *     (`getBoundingClientRect().top < 70`) plus their lucide glyph class.
 *   - the notification drawer is a native `<dialog class="astryx-drawer">`
 *     that is always MOUNTED, so `count()` proves nothing — `dialog.open` is
 *     the real signal.
 * `/statistics` also lands on the Allocation History tab; `UserSessionsMetrics`
 * (the converted file) is behind "User Session History".
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
  await wait(900);
};

const clickTopGlyph = (glyph) =>
  page.evaluate((g) => {
    const b = Array.from(document.querySelectorAll('button')).find(
      (x) =>
        x.getBoundingClientRect().top < 70 &&
        x.querySelector('svg')?.getAttribute('class')?.includes(g),
    );
    b?.click();
    return !!b;
  }, glyph);

const drawerState = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('dialog.astryx-drawer')).map((d) => ({
      open: d.open,
      w: Math.round(d.getBoundingClientRect().width),
      text: d.innerText.slice(0, 200).replace(/\n/g, ' | '),
    })),
  );

/* ------------------------------- login -------------------------------- */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await wait(9000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
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
  await wait(12000);
  return page.evaluate(() => document.body.className);
}

/* ===================== 1. notification drawer (real) =================== */
async function notificationDrawer(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(11000);
    out.bellFound = await clickTopGlyph('bell');
    await wait(3000);
    out.drawers = await drawerState();
    out.segmented = await count('.astryx-segmented-control');
    out.statusDots = await count('.astryx-statusdot');
    out.antdDrawer = await count('.ant-drawer');
    out.antdList = await count('.ant-list');
    await shot(`31-notification-drawer-${tag}`);
    // the "..." DropdownMenu in the drawer header
    await page.evaluate(() => {
      const d = document.querySelector('dialog.astryx-drawer[open]');
      const b = Array.from(d?.querySelectorAll('button') ?? []).find((x) =>
        x.querySelector('svg')?.getAttribute('class')?.includes('ellipsis'),
      );
      b?.click();
    });
    await wait(1800);
    out.menuOpen = await count('[role="menu"], .astryx-dropdown-menu');
    await shot(`32-notification-more-menu-${tag}`);
    await esc();
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`notificationDrawer_${tag}`, out);
}

/* ================== 2. statistics · User Session History =============== */
async function sessionMetrics(tag) {
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
    await wait(14000);
    await page
      .getByText(/user session history/i)
      .first()
      .click()
      .catch(() => {});
    await wait(14000);
    out.url = page.url();
    out.antdPicker = await count('.ant-picker');
    out.banners = await count('.astryx-banner');
    out.emptyStates = await count('[class*="empty-state"], [class*="emptystate"]');
    out.rangeTrigger = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button'))
        .map((b) => b.innerText.trim())
        .filter((s) => /\d{4}|–|-/.test(s) && s.length < 40)
        .slice(0, 6),
    );
    await shot(`33-session-metrics-${tag}`);
    // open the range popover
    const trig = page
      .getByRole('button')
      .filter({ hasText: /\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/ })
      .first();
    if (await trig.count()) {
      await trig.click();
      await wait(2500);
      out.calendarOpen = await count(
        '[role="dialog"] table, [role="grid"], [class*="calendar"]',
      );
      await shot(`34-session-metrics-range-${tag}`);
      await esc();
    }
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`sessionMetrics_${tag}`, out);
}

/* ========================== 3. my account modal ======================== */
async function myAccount(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(11000);
    out.userBtn = await clickTopGlyph('lucide-user');
    await wait(2200);
    await page
      .getByText(/my account/i)
      .first()
      .click()
      .catch(() => {});
    await wait(7000);
    out.textInputs = await count('.astryx-text-input');
    out.switches = await count('.astryx-switch');
    out.antdInputs = await count('.ant-input');
    out.modalText = await page.evaluate(() => {
      const d = document.querySelector('[role="dialog"]');
      return d ? d.innerText.slice(0, 160).replace(/\n/g, ' | ') : null;
    });
    await shot(`35-my-account-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`myAccount_${tag}`, out);
}

/* ================= 4. folder explorer (VFolderNodeDescription) ========= */
async function folderExplorer(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
    await wait(15000);
    await shot(`36-data-list-${tag}`);
    await page
      .locator('table tbody tr td')
      .nth(1)
      .click()
      .catch(() => {});
    await wait(11000);
    out.metadataLists = await count('.astryx-metadata-list');
    out.antdDescriptions = await count('.ant-descriptions');
    out.badges = await count('.astryx-badge');
    out.antdTags = await count('.ant-tag');
    await shot(`37-folder-explorer-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 200);
    await esc().catch(() => {});
  }
  log(`folderExplorer_${tag}`, out);
}

/* ------------------------------- light --------------------------------- */
await notificationDrawer('light');
await sessionMetrics('light');
await myAccount('light');
await folderExplorer('light');

/* -------------------------------- dark --------------------------------- */
log('themeSwitch', await setTheme('dark'));
await notificationDrawer('dark');
await sessionMetrics('dark');
await myAccount('dark');
await folderExplorer('dark');

log('pageErrors', pageErrors.slice(0, 20));
log('consoleErrors', [...new Set(consoleErrors)].slice(0, 15));
fs.writeFileSync(
  `${OUT}/measure-p3-w2c-pass3.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
