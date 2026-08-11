/**
 * qa8 BATCH-3 Q-37 — the four call sites outside the three reported surfaces:
 * the session LIST rename (SessionInfoCell), /admin/rbac's role edit
 * (RoleDetailDrawer) and scope-permission edit (ScopedRolePermissionCard), and
 * the keypair "Set as main" (MyKeypairManagementModal).
 *
 * Read-only: hovers, navigations and one drawer open. No mutation is submitted.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};

const paint = (labelRe) =>
  page.evaluate((src) => {
    const re = new RegExp(src, 'i');
    return Array.from(document.querySelectorAll('button'))
      .filter((b) => re.test(b.getAttribute('aria-label') ?? ''))
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => ({
        label: b.getAttribute('aria-label'),
        color: getComputedStyle(b).color,
        accentVar: getComputedStyle(b)
          .getPropertyValue('--color-text-accent')
          .trim(),
        hasClass: b.classList.contains('bai-action-accent'),
      }));
  }, labelRe.source);

for (const mode of ['light', 'dark']) {
  const rec = (out[mode] = {});

  // --- session list rename (revealed on row hover) ------------------------
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await settle(page);
  await setMode(page, mode);
  await settle(page);
  await page
    .locator('tbody tr')
    .first()
    .hover()
    .catch(() => {});
  await page.waitForTimeout(800);
  rec.sessionListEdit = await paint(/^Edit$/);

  // --- /admin/rbac --------------------------------------------------------
  await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  await settle(page);
  rec.rbacUrl = page.url();
  rec.rbacEditScope = await paint(/Edit Scope Permissions/);
  // Open a role's detail drawer by clicking the first role name.
  await page
    .locator('tbody a, tbody button')
    .first()
    .click({ timeout: 15000 })
    .catch((e) => (rec.rbacClickErr = e.message));
  await page.waitForTimeout(5000);
  await settle(page);
  rec.rbacEditRole = await paint(/Edit Role/);

  await page.screenshot({
    path: `${ROOT}/../shots/q37-accent/after-rbac-${mode}.png`,
    fullPage: false,
  });
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/b3-accent-extra.json`,
  JSON.stringify(out, null, 2) + '\n',
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
