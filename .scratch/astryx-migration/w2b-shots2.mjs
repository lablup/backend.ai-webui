/**
 * phase-3 wave 2 / partition B — second pass over the slow surfaces, with a
 * longer settle and the modals this batch converted opened explicitly.
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
  viewport: { width: 1600, height: 1100 },
});
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  const t = m.text();
  if (m.type() !== 'error') return;
  if (/fonts\.googleapis\.com|RelayResponseNormalizer|Failed to load resource/.test(t))
    return;
  errors.push(`[${page.url()}] ${t}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror ${page.url()}] ${e.message}`));

async function go(path, settle = 16000) {
  await page.goto(new URL(path, BASE).toString(), {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await page.waitForTimeout(settle);
}
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` }).then(() => console.log('  shot', n));

async function toggleTheme() {
  const named = page.getByRole('button', { name: /dark|light|theme|테마/i });
  if (await named.count()) await named.first().click();
  await page.waitForTimeout(2500);
}

async function clickAny(names, settle = 4000) {
  for (const n of names) {
    const l = page.getByRole('button', { name: n }).first();
    if ((await l.count()) && (await l.isVisible().catch(() => false))) {
      await l.click().catch(() => {});
      await page.waitForTimeout(settle);
      return true;
    }
  }
  return false;
}

async function run(mode) {
  // Session launcher — ImageEnvironmentSelectFormItems, ResourcePresetSelect,
  // PortSelectFormItem, InputNumberWithSlider (parked).
  await go(`${P}/session/start`, 22000);
  await shot(`${mode}-05-session-launcher`);

  // RBAC — LegacyRolePermissionTab / LegacyRoleScopeTab.
  await go('/admin/rbac', 20000);
  await shot(`${mode}-12-rbac`);

  // Environments — ImageNodeSimpleTag / ImageTags.
  await go('/admin/environment', 20000);
  await shot(`${mode}-11-environments`);

  // Scheduler / fair share — UserFairShareTable + UsageBucketModal.
  await go('/admin/scheduler', 20000);
  await shot(`${mode}-09-scheduler-fairshare`);

  // Start page + the Start-from-URL modal (Import* forms).
  await go(`${P}/start`, 14000);
  if (await clickAny([/start with url/i, /url/i, /import/i], 6000)) {
    await shot(`${mode}-02-start-from-url-modal`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
  }

  // Users — KeypairInfoModal / KeypairSettingModal live behind the row menu.
  await go('/admin/users', 18000);
  await shot(`${mode}-07-users`);
}

console.log('--- light ---');
await run('light');
console.log('--- dark ---');
await go(`${P}/start`, 10000);
await toggleTheme();
await run('dark');

console.log('\n=== app console errors (%d) ===', errors.length);
for (const e of [...new Set(errors)]) console.log(' -', e);
await browser.close();
