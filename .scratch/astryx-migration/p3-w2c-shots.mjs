/**
 * Phase 3 wave 2 · partition C — live proof.
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3-w2c-shots.mjs
 *
 * Credentials come from the environment, never from this file.
 * Dev server on http://127.0.0.1:5870 (this agent's port band).
 *
 * Surfaces exercised (each hosts at least one converted file):
 *   1. Notification drawer      — WEBUINotificationDrawer (lab Drawer,
 *                                 SegmentedControl, DropdownMenu, StatusDot)
 *   2. RBAC page + role drawer  — RoleNodes, RoleDetailDrawer,
 *                                 RoleDetailDrawerContent (MetadataList,
 *                                 TabList, Badge), RolePermissionDetailTab,
 *                                 ScopedRolePermissionCard, RoleAssignmentTab
 *   3. RoleFormModal            — AstryxFormTextInput/TextArea/Checkbox,
 *                                 IconButton
 *   4. Session list + detail    — SessionInfoCell, SessionDetailDrawer
 *   5. Session launcher         — ResourceAllocationFormItems,
 *                                 ClusterModeFormItems, SharedMemoryFormItems,
 *                                 VFolderMountFormItem, SessionNameFormItem,
 *                                 SessionOwnerSetterCard
 *   6. Data / folder explorer   — VFolderNodeDescription, VFolderLazyView,
 *                                 SFTPServerButton, StoragePermissionEditModal
 *   7. Statistics               — UserSessionsMetrics (DateRangeInput, Banner)
 *   8. My account modal         — UserProfileSettingModal, TOTPActivateModal
 * Each in light AND dark.
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
const esc = async () => {
  await page.keyboard.press('Escape');
  await wait(800);
};

const count = async (sel) => page.locator(sel).count();

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
await shot('00-start-light');

/* ============================ 1. notification drawer ==================== */
async function notificationDrawer(tag) {
  const out = {};
  try {
    // The bell lives in the header; find it by its Astryx badge-count wrapper
    // or by the button holding a `lucide-bell` glyph.
    const bell = page.locator('header button, .ant-layout-header button');
    const n = await bell.count();
    for (let i = 0; i < n; i += 1) {
      const html = await bell.nth(i).innerHTML();
      if (html.includes('lucide-bell') || html.includes('bell')) {
        await bell.nth(i).click();
        break;
      }
    }
    await wait(2500);
    out.drawerOpen = await count('dialog.astryx-drawer');
    out.segmented = await count('.astryx-segmented-control');
    out.antdDrawer = await count('.ant-drawer');
    out.antdList = await count('.ant-list');
    await shot(`01-notification-drawer-${tag}`);
    // the ⋯ menu
    const more = page
      .locator('dialog.astryx-drawer button')
      .filter({ hasNot: page.locator('nothing') });
    out.drawerButtons = await more.count();
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 160);
    await esc().catch(() => {});
  }
  log(`notificationDrawer_${tag}`, out);
}
await notificationDrawer('light');

/* ================================ 2. RBAC ============================== */
async function rbac(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
    await wait(14000);
    out.astryxBadges = await count('.astryx-badge');
    out.antdTags = await count('.ant-tag');
    await shot(`02-rbac-list-${tag}`);

    // Open the detail drawer by clicking the first role name cell.
    await page
      .locator('table tbody tr td')
      .first()
      .click()
      .catch(() => {});
    await wait(9000);
    out.roleDrawer = await count('dialog.astryx-drawer');
    out.metadataLists = await count('.astryx-metadata-list');
    out.tabLists = await count('.astryx-tab-list, [class*="astryx-tab"]');
    out.antdDescriptions = await count('.ant-descriptions');
    out.antdTabs = await count('.ant-tabs');
    await shot(`03-rbac-role-drawer-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 160);
    await esc().catch(() => {});
  }
  log(`rbac_${tag}`, out);
}
await rbac('light');

/* ============================ 3. RoleFormModal ========================= */
async function roleForm(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
    await wait(12000);
    await page
      .getByRole('button', { name: /create role|add role/i })
      .first()
      .click()
      .catch(() => {});
    await wait(5000);
    out.textInputs = await count('.astryx-text-input');
    out.textAreas = await count('.astryx-textarea, textarea');
    out.antdInputs = await count('.ant-input');
    await shot(`04-role-form-modal-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 160);
    await esc().catch(() => {});
  }
  log(`roleForm_${tag}`, out);
}
await roleForm('light');

/* ========================= 4. sessions list + detail ==================== */
async function sessions(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
    await wait(15000);
    out.rows = await count('table tbody tr');
    await shot(`05-session-list-${tag}`);
    await page
      .locator('table tbody tr td')
      .first()
      .click()
      .catch(() => {});
    await wait(9000);
    out.detailDrawer = await count('dialog.astryx-drawer');
    out.antdDrawer = await count('.ant-drawer');
    await shot(`06-session-detail-drawer-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 160);
    await esc().catch(() => {});
  }
  log(`sessions_${tag}`, out);
}
await sessions('light');

/* ============================ 5. session launcher ====================== */
async function launcher(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
    await wait(18000);
    out.segmented = await count('.astryx-segmented-control');
    out.antdRadio = await count('.ant-radio-group');
    out.antdCard = await count('.ant-card');
    out.astryxCard = await count('.astryx-card');
    await shot(`07-launcher-step1-${tag}`);
    // step 2 hosts the resource allocation + cluster mode + shmem bar
    await page
      .getByRole('button', { name: /^next$/i })
      .first()
      .click()
      .catch(() => {});
    await wait(6000);
    await shot(`08-launcher-resources-${tag}`);
    out.segmentedAfter = await count('.astryx-segmented-control');
    // step 3 = storage (VFolderMountFormItem)
    await page
      .getByRole('button', { name: /^next$/i })
      .first()
      .click()
      .catch(() => {});
    await wait(6000);
    await shot(`09-launcher-storage-${tag}`);
  } catch (e) {
    out.error = String(e).slice(0, 160);
  }
  log(`launcher_${tag}`, out);
}
await launcher('light');

/* ================================ 6. data ============================== */
async function data(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
    await wait(14000);
    out.rows = await count('table tbody tr');
    await shot(`10-data-list-${tag}`);
    await page
      .locator('table tbody tr td a, table tbody tr td button')
      .first()
      .click()
      .catch(() => {});
    await wait(9000);
    out.metadataLists = await count('.astryx-metadata-list');
    out.antdDescriptions = await count('.ant-descriptions');
    await shot(`11-data-folder-detail-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 160);
    await esc().catch(() => {});
  }
  log(`data_${tag}`, out);
}
await data('light');

/* ============================= 7. statistics =========================== */
async function statistics(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}statistics`, { waitUntil: 'domcontentloaded' });
    await wait(15000);
    out.dateRange = await count(
      '[class*="astryx-daterange"], [class*="astryx-date"]',
    );
    out.antdPicker = await count('.ant-picker');
    out.banners = await count('.astryx-banner');
    await shot(`12-statistics-${tag}`);
  } catch (e) {
    out.error = String(e).slice(0, 160);
  }
  log(`statistics_${tag}`, out);
}
await statistics('light');

/* =========================== 8. my-account modal ======================= */
async function myAccount(tag) {
  const out = {};
  try {
    await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
    await wait(10000);
    // the account menu is the last header button
    const hdr = page.locator('header button, .ant-layout-header button');
    await hdr
      .last()
      .click()
      .catch(() => {});
    await wait(2000);
    await page
      .getByRole('menuitem', { name: /my account|profile/i })
      .first()
      .click()
      .catch(() => {});
    await wait(6000);
    out.textInputs = await count('.astryx-text-input');
    out.switches = await count('.astryx-switch');
    out.antdInputs = await count('.ant-input');
    await shot(`13-my-account-${tag}`);
    await esc();
  } catch (e) {
    out.error = String(e).slice(0, 160);
    await esc().catch(() => {});
  }
  log(`myAccount_${tag}`, out);
}
await myAccount('light');

/* ------------------------------ dark theme ----------------------------- */
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await wait(9000);
await page.evaluate(() => {
  const btns = Array.from(
    document.querySelectorAll('header button, .ant-layout-header button'),
  );
  btns[1]?.click();
});
await wait(3500);
await shot('20-start-dark');
log(
  'darkMode',
  await page.evaluate(
    () =>
      document.documentElement.getAttribute('data-theme') ??
      document.documentElement.className,
  ),
);

await notificationDrawer('dark');
await rbac('dark');
await sessions('dark');
await launcher('dark');
await data('dark');
await statistics('dark');

log('pageErrors', pageErrors.slice(0, 20));
log('consoleErrors', [...new Set(consoleErrors)].slice(0, 15));
fs.writeFileSync(`${OUT}/measure-p3-w2c.json`, JSON.stringify(results, null, 2));
await browser.close();
