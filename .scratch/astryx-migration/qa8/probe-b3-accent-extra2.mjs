/** qa8 BATCH-3 Q-37 — what IS reachable on /admin/rbac and /session rows? */
import { launch, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};
const dump = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .filter((b) => b.getBoundingClientRect().width > 0)
      .map((b) => ({
        label: b.getAttribute('aria-label'),
        text: b.textContent?.trim().slice(0, 26) ?? '',
        color: getComputedStyle(b).color,
        accent: b.classList.contains('bai-action-accent'),
      })),
  );

await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await settle(page);
out.rbacTabs = await page.evaluate(() =>
  Array.from(document.querySelectorAll('[role="tab"], .astryx-tab')).map((t) =>
    t.textContent?.trim().slice(0, 30),
  ),
);
out.rbacButtons = await dump();
out.rbacRows = await page.evaluate(
  () => document.querySelectorAll('tbody tr').length,
);

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
await settle(page);
await page
  .locator('tbody tr')
  .first()
  .hover()
  .catch(() => {});
await page.waitForTimeout(1000);
out.sessionRowButtons = (await dump()).filter(
  (b) => /edit|rename|copy/i.test(b.label ?? '') || b.accent,
);

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/b3-accent-extra2.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2).slice(0, 8000));
await browser.close();
