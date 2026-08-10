/**
 * qa8 BATCH-3 Q-37 — role detail drawer: the copy label (evidence for the
 * host-side `button.Copy` sibling defect) and, if a scope row can be selected
 * client-side, the `ScopedRolePermissionCard` edit button on `secondary`.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};
const dump = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => ({
        label: b.getAttribute('aria-label'),
        color: getComputedStyle(b).color,
        accent: b.classList.contains('bai-action-accent'),
      }))
      .filter((b) => b.label),
  );

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(10000);
  await settle(page);
  await setMode(page, mode);
  await settle(page);
  const rec = (out[mode] = {});

  await page
    .locator('tbody a')
    .first()
    .click({ timeout: 15000 })
    .catch((e) => (rec.clickErr = e.message));
  await page.waitForTimeout(5000);
  await settle(page);
  rec.drawerButtons = await dump();

  // Selecting a scope row is pure client state (no request), and it is what
  // reveals ScopedRolePermissionCard's edit control.
  const box = page.locator('tbody input[type="checkbox"]').first();
  await box.click({ timeout: 8000 }).catch((e) => (rec.checkErr = e.message));
  await page.waitForTimeout(1500);
  rec.afterSelect = (await dump()).filter(
    (b) => /edit|scope/i.test(b.label ?? '') || b.accent,
  );
  await page.screenshot({
    path: `${ROOT}/../shots/q37-accent/after-rbac-selected-${mode}.png`,
  });
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/b3-accent-extra3.json`,
  JSON.stringify(out, null, 2) + '\n',
);
console.log(JSON.stringify(out, null, 2).slice(0, 7000));
await browser.close();
