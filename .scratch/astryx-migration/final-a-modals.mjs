/**
 * final-A modal proof:
 *   - FairShareWeightSettingModal  -> Domain/Project/UserResourceGroupAlert
 *   - BulkCreateUserFromCSVModal   -> BAIText / Astryx Tooltip cell renderers
 *   - ModelCardDeployModal         -> Banner + IconButton
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6001';
const OUT = '.scratch/astryx-migration/shots/final-a';
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
const dialog = () => page.locator('[role="dialog"]:visible');

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const ui = page.locator('input[placeholder="Email or Username"]').first();
if (await ui.count()) {
  await page
    .locator('input[placeholder="Endpoint"]')
    .first()
    .fill('http://10.82.0.130:8090');
  await ui.fill('admin@lablup.com');
  await page.locator('input[type="password"]').first().fill('wJalrXUt');
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(20000);

for (const mode of ['light', 'dark']) {
  const tag = mode === 'light' ? 'l' : 'd';
  await page.evaluate(
    (m) =>
      localStorage.setItem(
        'backendaiwebui.settings.themeMode',
        JSON.stringify(m),
      ),
    mode,
  );

  // ── FairShare weight modal (Domain/Project/UserResourceGroupAlert) ────────
  await page.goto(`${BASE}/scheduler`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(14000);
  // the per-row settings affordance is the gear icon button in the Name cell
  const gear = page
    .locator('button:has(svg.lucide-settings), [role="button"]:has(svg.lucide-settings)')
    .first();
  log(`${tag}.fairshareModal.gearFound`, await gear.count());
  if (await gear.count()) {
    await gear.click().catch(() => {});
    await page.waitForTimeout(8000);
  }
  log(`${tag}.fairshareModal.open`, await page.getByText(/weight/i).count());
  log(
    `${tag}.fairshareModal.banners`,
    await page
      .locator('[class*="banner"]')
      .allInnerTexts()
      .catch(() => []),
  );
  await shot(`20-fairshare-modal-${mode}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);

  // ── Bulk-create-users-from-CSV modal ─────────────────────────────────────
  await page.goto(`${BASE}/admin/users`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(13000);
  const more = page.locator('svg.lucide-ellipsis').first();
  log(`${tag}.csv.moreFound`, await more.count());
  if (await more.count()) {
    await more.click({ force: true }).catch(() => {});
    await page.waitForTimeout(1500);
    const item = page.getByRole('menuitem', { name: /csv/i }).first();
    log(`${tag}.csv.menuItemFound`, await item.count());
    if (await item.count()) {
      await item.click().catch(() => {});
      await page.waitForTimeout(5000);
    }
  }
  log(`${tag}.csv.dialogOpen`, await dialog().count());
  log(`${tag}.csv.hasFileInput`, await page.locator('input[type="file"]').count());
  await shot(`22-csv-modal-${mode}`);

  const file = page.locator('input[type="file"]').last();
  if (await file.count()) {
    await file.setInputFiles({
      name: 'bulk.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        [
          'email,username,password',
          'final.a.ok@lablup.com,finalaok,Abcd1234!',
          'not-an-email,,short',
        ].join('\n') + '\n',
      ),
    });
    await page.waitForTimeout(8000);
    log(
      `${tag}.csv.gridRows`,
      await page.locator('tbody tr, [role="row"]').count(),
    );
    log(
      `${tag}.csv.errorIcons`,
      await page.locator('svg.lucide-circle-alert').count(),
    );
    // hover an error cell so the (now Astryx) tooltip renders
    const errIcon = page.locator('svg.lucide-circle-alert').first();
    if (await errIcon.count()) {
      await errIcon.hover().catch(() => {});
      await page.waitForTimeout(1500);
      log(
        `${tag}.csv.tooltipText`,
        await page
          .locator('[role="tooltip"]:visible, .astryx-tooltip')
          .allInnerTexts()
          .catch(() => []),
      );
    }
    await shot(`23-csv-validated-${mode}`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);

  // ── Model card deploy modal ──────────────────────────────────────────────
  // The models live in the `model-store` project; the project is a URL segment
  // since FR-3055, so address it directly instead of driving the switcher.
  await page.goto(`${BASE}/project/model-store/model-store`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForTimeout(15000);
  await shot(`24-model-store-${mode}`);
  const card = page
    .locator('a[href*="model-store/"], [class*="card"]')
    .filter({ hasNotText: 'No models found' })
    .first();
  log(`${tag}.deploy.cardFound`, await card.count());
  if (await card.count()) {
    await card.click({ timeout: 6000 }).catch(() => {});
    await page.waitForTimeout(9000);
    await shot(`24b-model-drawer-${mode}`);
  }
  const deployBtn = page.getByRole('button', { name: /deploy/i }).first();
  log(`${tag}.deploy.button`, await deployBtn.count());
  if (await deployBtn.count()) {
    await deployBtn.click().catch(() => {});
    await page.waitForTimeout(9000);
  }
  log(
    `${tag}.deploy.presetLabel`,
    await page.getByText(/preset/i).count(),
  );
  log(
    `${tag}.deploy.banners`,
    await page
      .locator('[class*="banner"]')
      .allInnerTexts()
      .catch(() => []),
  );
  log(
    `${tag}.deploy.infoIconButton`,
    await page.locator('svg.lucide-info').count(),
  );
  await shot(`25-deploy-modal-${mode}`);
  const ok = page.getByRole('button', { name: /^(deploy|ok)$/i }).last();
  if (await ok.count()) {
    await ok.click().catch(() => {});
    await page.waitForTimeout(4000);
    log(
      `${tag}.deploy.validationShown`,
      await page.locator('[aria-invalid="true"]').count(),
    );
    await shot(`26-deploy-validated-${mode}`);
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
}

log('pageErrors', pageErrors);
fs.writeFileSync(
  `${OUT}/results-modals.json`,
  JSON.stringify({ results, pageErrors }, null, 2),
);
await browser.close();
