/**
 * p3-c live proof, part 2 — the storage-host detail drawer.
 *
 * Covers `StorageHostSettingsPanel` (`BAIAdminProjectSelectAstryx` +
 * `BAIUserSelectAstryx`, P3C-2 `width={240}`) and `UserFolderPermissionPanel`
 * (`BAIAdminKeypairResourcePolicySelectAstryx` in MULTIPLE mode — the P26-4
 * display-only trigger chips).
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.P3C_BASE ?? 'http://127.0.0.1:5830/';
const OUT = '.scratch/astryx-migration/shots/p3-c';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1700, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const listbox = () => page.locator('[role="listbox"]:visible').last();
const rows = () => listbox().locator('[role="option"]');

async function exercise(key, trigger, opts = {}) {
  const out = {};
  try {
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    await page.waitForTimeout(4000);
    out.initialRows = await rows().count();
    if (opts.shot) await shot(opts.shot);
    if (opts.scroll && out.initialRows > 0) {
      const counts = [];
      for (let i = 0; i < 2; i += 1) {
        await listbox().evaluate((el) => {
          el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(2500);
        counts.push(await rows().count());
      }
      out.rowsAfterScroll = counts;
    }
    if (out.initialRows > 0) {
      out.picked = (await rows().first().innerText()).split('\n')[0].trim();
      await rows().first().click();
      await page.waitForTimeout(1500);
      if (opts.multiple && out.initialRows > 1) {
        out.pickedSecond = (await rows().nth(1).innerText())
          .split('\n')[0]
          .trim();
        await rows().nth(1).click();
        await page.waitForTimeout(1200);
        if (opts.shotMulti) await shot(opts.shotMulti);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(800);
      }
      out.triggerText = (await trigger.innerText()).trim();
      if (opts.shotAfter) await shot(opts.shotAfter);
    }
  } catch (e) {
    out.error = String(e).slice(0, 140);
  }
  log(key, out);
}

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if (await ep.count()) await ep.fill(process.env.BAI_ENDPOINT ?? '');
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
await page.waitForTimeout(15000);

for (const mode of ['light', 'dark']) {
  if (mode === 'dark') {
    await page
      .getByRole('button', { name: /dark mode|light mode/i })
      .first()
      .click()
      .catch(() => {});
    await page.waitForTimeout(2500);
  }
  await page.goto(`${BASE}admin/agent`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  await page
    .getByRole('button', { name: /storages/i })
    .first()
    .click();
  await page.waitForTimeout(7000);
  await page.locator('.ant-table-tbody a').first().click();
  await page.waitForTimeout(10000);
  await shot(`20-storage-drawer-${mode}`);

  // Tab 3 — Capacity (StorageHostSettingsPanel).
  await page
    .getByRole('button', { name: /^capacity/i })
    .first()
    .click();
  await page.waitForTimeout(8000);
  await shot(`21-storage-capacity-${mode}`);
  const names = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .map((b) => (b.getAttribute('aria-label') || b.textContent || '').slice(0, 30))
      .filter(Boolean),
  );
  log(`capacityTabButtons_${mode}`, names);
  await exercise(
    `D_BAIUserSelectAstryx_quotaScope_${mode}`,
    page.getByRole('button', { name: /select user|for user/i }).last(),
    { scroll: true, shot: `22-quota-user-open-${mode}`, shotAfter: `23-quota-user-picked-${mode}` },
  );

  // Tab 2 — User Folder Permissions (multiple-mode policy select).
  await page
    .getByRole('button', { name: /user folder permissions/i })
    .first()
    .click()
    .catch(() => {});
  await page.waitForTimeout(8000);
  await shot(`24-user-folder-permissions-${mode}`);
  await exercise(
    `E_BAIAdminKeypairResourcePolicySelectAstryx_multiple_${mode}`,
    page.getByRole('button', { name: /keypair resource polic|select/i }).last(),
    {
      multiple: true,
      shot: `25-policies-open-${mode}`,
      shotMulti: `26-policies-two-selected-${mode}`,
      shotAfter: `27-policies-trigger-chips-${mode}`,
    },
  );
}

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(
  `${OUT}/measure-p3c-storage.json`,
  JSON.stringify(results, null, 2),
);
await browser.close();
