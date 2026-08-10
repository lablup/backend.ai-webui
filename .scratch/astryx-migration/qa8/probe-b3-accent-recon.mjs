/** qa8 BATCH-3 Q-37 — recon: find the drawer + image-table DOM shapes. */
import { launch, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
await settle(page);

// Click the first session name to open the detail drawer.
out.sessionRows = await page.evaluate(
  () => document.querySelectorAll('tbody tr').length,
);
const link = page
  .locator('tbody a, tbody [role="link"], tbody button')
  .filter({ hasNotText: '' })
  .first();
out.firstLinkText = await link.textContent().catch(() => null);
await link.click({ timeout: 15000 }).catch((e) => (out.clickErr = e.message));
await page.waitForTimeout(6000);
await settle(page);
out.url = page.url();

out.dialogs = await page.evaluate(() =>
  Array.from(
    document.querySelectorAll(
      'dialog,[role="dialog"],[class*="drawer" i],[class*="Drawer"]',
    ),
  )
    .map((d) => {
      const r = d.getBoundingClientRect();
      return {
        tag: d.tagName,
        cls: (d.className || '').toString().slice(0, 140),
        role: d.getAttribute('role'),
        w: +r.width.toFixed(0),
        h: +r.height.toFixed(0),
        open: d.hasAttribute('open'),
      };
    })
    .filter((d) => d.w > 0),
);

out.allButtons = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button'))
    .map((b) => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return {
        label: b.getAttribute('aria-label'),
        text: b.textContent?.trim().slice(0, 30) ?? '',
        cls: (b.className || '').toString().slice(0, 90),
        color: cs.color,
        x: +r.x.toFixed(0),
        y: +r.y.toFixed(0),
        w: +r.width.toFixed(0),
      };
    })
    .filter((b) => b.w > 0 && b.x > 500),
);

await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
await settle(page);
out.envUrl = page.url();
out.envButtons = await page.evaluate(() =>
  Array.from(document.querySelectorAll('button'))
    .map((b) => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b);
      return {
        label: b.getAttribute('aria-label'),
        text: b.textContent?.trim().slice(0, 30) ?? '',
        cls: (b.className || '').toString().slice(0, 90),
        color: cs.color,
        w: +r.width.toFixed(0),
      };
    })
    .filter((b) => b.w > 0),
);

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/b3-accent-recon.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2).slice(0, 6000));
await browser.close();
