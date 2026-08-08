/**
 * phase-3 wave 2 / partition B — live verification.
 *
 * Drives the surfaces this batch actually touched, in light and dark, and
 * writes screenshots + console errors to shots/p3-w2b/.
 *
 *   BAI_PROJECT_PATH=/project/<name> node .scratch/astryx-migration/w2b-shots.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BAI_WEBUI ?? 'http://127.0.0.1:5860/';
const STATE = process.env.BAI_STATE ?? '/tmp/w2b-state.json';
const OUT = '.scratch/astryx-migration/shots/p3-w2b';
mkdirSync(OUT, { recursive: true });

const P = process.env.BAI_PROJECT_PATH ?? '';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  storageState: STATE,
  viewport: { width: 1600, height: 1000 },
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  const t = m.text();
  if (m.type() !== 'error') return;
  // Pre-existing, unrelated to this batch: the Geist webfont is blocked by the
  // dev CSP, the manager returns inconsistent __typename for Group/UserGroup,
  // and one asset 404s.
  if (/fonts\.googleapis\.com|RelayResponseNormalizer|Failed to load resource/.test(t))
    return;
  errors.push(`[${page.url()}] ${t}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror ${page.url()}] ${e.message}`));

async function go(path) {
  await page.goto(new URL(path, BASE).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(6000);
}

async function shot(name) {
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('  shot', name);
}

/** Header moon/sun button toggles the app between light and dark. */
async function toggleTheme() {
  const btn = page
    .locator('header button, [class*="header"] button')
    .filter({ hasNot: page.locator('img') });
  // The theme toggle is the button whose accessible name mentions dark/light.
  const named = page.getByRole('button', { name: /dark|light|theme|테마/i });
  if (await named.count()) {
    await named.first().click();
  } else {
    await btn.nth(1).click();
  }
  await page.waitForTimeout(2500);
}

/** Click the first control matching any of the given accessible names. */
async function clickAny(names) {
  for (const n of names) {
    const l = page.getByRole('button', { name: n }).first();
    if ((await l.count()) && (await l.isVisible().catch(() => false))) {
      await l.click().catch(() => {});
      await page.waitForTimeout(3500);
      return true;
    }
  }
  return false;
}

async function run(mode) {
  // --- Start page + the "Start from URL" modal (Import* forms live there)
  await go(`${P}/start`);
  await shot(`${mode}-01-start`);
  if (
    await clickAny([
      /start with url/i,
      /url로 시작/i,
      /import/i,
      /hugging ?face/i,
    ])
  ) {
    await shot(`${mode}-02-start-from-url-modal`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
  }

  // --- Data page: FolderCreateModal, FileBrowserButton, FolderExplorer*
  await go(`${P}/data`);
  await shot(`${mode}-03-data`);
  if (await clickAny([/create folder/i, /new folder/i, /폴더 생성/i, /^create$/i])) {
    await shot(`${mode}-04-folder-create-modal`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1200);
  }

  // --- Session launcher: ImageEnvironmentSelectFormItems, ResourcePresetSelect,
  //     PortSelectFormItem, InputNumberWithSlider (parked)
  await go(`${P}/session/start`);
  await shot(`${mode}-05-session-launcher`);

  // --- Admin: resource policies (KeypairResourcePolicyList + storage tables)
  await go('/admin/resource-policy');
  await shot(`${mode}-06-resource-policy`);

  // --- Admin: users/credentials (KeypairInfoModal / KeypairSettingModal)
  await go('/admin/users');
  await shot(`${mode}-07-users`);

  // --- Admin: projects (ProjectAdminSettingModal, ProjectStoragePermissionTable)
  await go('/admin/project');
  await shot(`${mode}-08-projects`);

  // --- Admin: scheduler / fair share (FairShareItems/*)
  await go('/admin/scheduler');
  await shot(`${mode}-09-scheduler-fairshare`);

  // --- Admin: settings (PrometheusQueryPreset*)
  await go('/admin/settings');
  await shot(`${mode}-10-admin-settings`);

  // --- Admin: environments (ImageNodeSimpleTag / ImageTags)
  await go('/admin/environment');
  await shot(`${mode}-11-environments`);

  // --- Admin: RBAC (LegacyRolePermissionTab / LegacyRoleScopeTab)
  await go('/admin/rbac');
  await shot(`${mode}-12-rbac`);
}

console.log('--- light ---');
await run('light');
console.log('--- dark ---');
await go(`${P}/start`);
await toggleTheme();
await run('dark');

console.log('\n=== app console errors (%d) ===', errors.length);
for (const e of [...new Set(errors)]) console.log(' -', e);
await browser.close();
