/**
 * p3-c live proof — exercise the flipped Astryx selects on real pages.
 *
 *   BAI_ENDPOINT=... BAI_EMAIL=... BAI_PW=... \
 *     node .scratch/astryx-migration/p3c-select-shots.mjs
 *
 * Credentials come from the environment, never from this file.
 * Dev server on http://127.0.0.1:5830 (agent C's port band).
 *
 * What each measurement proves: the popup opens against the live backend, the
 * rows are the Relay page (page size preserved), scrolling to the bottom fires
 * `endReached` -> `loadNext` (row count grows), server search narrows the list,
 * clicking a row commits, and the CLOSED trigger prints the label resolved
 * from the VALUE — the "mandatory infrastructure" of ticket 26.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.P3C_BASE ?? 'http://127.0.0.1:5830/';
const OUT = '.scratch/astryx-migration/shots/p3-c';
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
  viewport: { width: 2200, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200));
});

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const dialog = () => page.locator('[role="dialog"]:visible').last();
const listbox = () => page.locator('[role="listbox"]:visible').last();
const rows = () => listbox().locator('[role="option"]');
const searchBox = () => dialog().locator('input[role="combobox"]').first();
const esc = async () => {
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);
};

async function scrollLoad(times = 2) {
  const counts = [];
  for (let i = 0; i < times; i += 1) {
    await listbox().evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.waitForTimeout(2500);
    counts.push(await rows().count());
  }
  return counts;
}

/**
 * Exercise one BAIComplexSelect. `trigger` is a Playwright locator for the
 * closed ComplexSelector button.
 */
async function exercise(key, trigger, opts = {}) {
  const out = {};
  try {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.waitForTimeout(opts.settle ?? 3500);
    out.initialRows = await rows().count();
    if (opts.shot) await shot(opts.shot);
    if (opts.scroll && out.initialRows > 0)
      out.rowsAfterScroll = await scrollLoad(2);
    if (opts.search) {
      await searchBox().fill(opts.search);
      await page.waitForTimeout(3000);
      out.rowsAfterSearch = await rows().count();
      await searchBox().fill('');
      await page.waitForTimeout(2500);
    }
    if (out.initialRows > 0) {
      out.picked = (await rows().first().innerText()).split('\n')[0].trim();
      await rows().first().click();
      await page.waitForTimeout(1500);
      // multiple mode keeps the popup open; single mode closed it already
      if (opts.multiple) {
        out.pickedSecond = (await rows().nth(1).innerText())
          .split('\n')[0]
          .trim();
        await rows().nth(1).click();
        await page.waitForTimeout(1200);
        await esc();
      }
      out.triggerText = (await trigger.innerText()).trim();
      if (opts.shotAfter) await shot(opts.shotAfter);
    } else {
      await esc();
    }
  } catch (e) {
    out.error = String(e).slice(0, 140);
    await esc().catch(() => {});
  }
  log(key, out);
  return out;
}

/* ------------------------------- login -------------------------------- */
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
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
await page.waitForTimeout(15000);
log('loggedIn', !(await userInput.count()));

/* == RoleFormModal.ScopeIdSelect — the P3C-4 router (3 reachable branches) = */
async function openRoleModal() {
  if (await page.locator('#scopes_0_scopeType').first().count()) return;
  await page
    .getByRole('button', { name: /create role|add role/i })
    .first()
    .click();
  await page.waitForTimeout(4000);
}
async function pickScopeType(label) {
  await openRoleModal();
  await page.locator('#scopes_0_scopeType').first().click();
  await page.waitForTimeout(1200);
  await page
    .locator('.ant-select-item-option')
    .filter({ hasText: new RegExp(`^${label}$`, 'i') })
    .first()
    .click();
  await page.waitForTimeout(5000);
}
// `BAIComplexSelect` does not forward the `id` antd `Form.Item` injects, so the
// ComplexSelector trigger is addressed by its accessible name; the
// `AstryxFormSelector` (Domain) branch does carry the id.
const scopeIdTrigger = () =>
  page
    .locator('#scopes_0_scopeId')
    .or(page.getByRole('button', { name: /^target$/i }))
    .last();

await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await shot('01-rbac-light');

await pickScopeType('User');
await exercise('A_BAIUserSelectAstryx_roleScope', scopeIdTrigger(), {
  scroll: true,
  search: 'admin',
  shot: '02-user-select-open-light',
  shotAfter: '03-user-select-picked-light',
});
await pickScopeType('Project');
await exercise('B_BAIAdminProjectSelectAstryx_roleScope', scopeIdTrigger(), {
  scroll: true,
});
await pickScopeType('Domain');
await exercise('C_AstryxFormSelector_domainScope', scopeIdTrigger(), {});
await esc();
await page
  .getByRole('button', { name: /^cancel$/i })
  .last()
  .click()
  .catch(() => {});
await page.waitForTimeout(1500);

/* == BAIAdminResourceGroupSelectAstryx — the class-C cursor-paginated one == */
await page.goto(`${BASE}admin/agent`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await shot('04-admin-agent-light');
/* == StorageHostSettingsPanel + UserFolderPermissionPanel (multiple mode) == */
await page
  .getByRole('button', { name: /storages/i })
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(7000);
await page
  .locator('.ant-table-tbody a')
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(10000);
await shot('05-storage-host-drawer-light');

// StorageHostSettingsPanel lives on the Capacity tab: the user / project
// quota-scope pickers (P3C-2 `width={240}`).
await page
  .getByRole('button', { name: /capacity/i })
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(8000);
await exercise(
  'D_BAIUserSelectAstryx_storageHostQuotaScope',
  page.getByRole('button', { name: /for user/i }).last(),
  { scroll: true, shot: '06-storage-user-open-light' },
);
await shot('07-storage-capacity-filled-light');

// UserFolderPermissionPanel: multiple-mode keypair resource policies — proves
// P26-4 (display-only trigger chips, deselect by re-clicking the row).
await page
  .getByRole('button', { name: /user folder permissions/i })
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(8000);
await exercise(
  'E_BAIAdminKeypairResourcePolicySelectAstryx_multiple',
  page.getByRole('button', { name: /keypair resource polic/i }).last(),
  { multiple: true, shot: '08-keypair-policies-open-light' },
);
await shot('09-user-folder-permissions-filled-light');

/* ---------------------------- dark theme ------------------------------- */
await page.evaluate(() => {
  const btns = Array.from(
    document.querySelectorAll('header button, .ant-layout-header button'),
  );
  btns[1]?.click();
});
await page.waitForTimeout(3000);
await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await shot('10-rbac-dark');
await pickScopeType('User');
await exercise('F_BAIUserSelectAstryx_dark', scopeIdTrigger(), {
  scroll: true,
  shot: '11-user-select-open-dark',
  shotAfter: '12-user-select-picked-dark',
});

log('pageErrors', pageErrors.slice(0, 15));
log('consoleErrors', [...new Set(consoleErrors)].slice(0, 10));
fs.writeFileSync(`${OUT}/measure-p3c.json`, JSON.stringify(results, null, 2));
await browser.close();
