/**
 * qa8 group — action-button COLOUR cluster, recon pass.
 *
 * Finds the real selectors for:
 *   (A) /admin/users  BAINameActionCell row actions  vs  bulk-action buttons
 *   (C) /admin/environment control buttons
 *   (D/E) session detail drawer icon buttons
 *
 * Read-only: never clicks OK/Confirm/Delete; overlays dismissed with Escape.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-btncolor-recon.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const dumpButtons = (scope) =>
  page.evaluate((sel) => {
    const root = sel ? document.querySelector(sel) : document.body;
    if (!root) return null;
    return [...root.querySelectorAll('button')].slice(0, 60).map((b) => {
      const c = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return {
        cls: b.className,
        variant: b.dataset.variant ?? null,
        size: b.dataset.size ?? null,
        label: (b.getAttribute('aria-label') || b.textContent || '')
          .trim()
          .slice(0, 40),
        color: c.color,
        bg: c.backgroundColor,
        borderColor: c.borderColor,
        borderWidth: c.borderWidth,
        rect: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
        svgColor: b.querySelector('svg')
          ? getComputedStyle(b.querySelector('svg')).color
          : null,
        svgInline: b.querySelector('svg')?.getAttribute('style') ?? null,
      };
    });
  }, scope);

const out = {};

// ---------------- /admin/users ------------------------------------------
await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
out.usersRowActions = await dumpButtons('.bai-name-action-cell-actions');
out.usersAllButtons = await dumpButtons(null);
// check first row checkbox to reveal bulk actions
const cb = page.locator('table input[type="checkbox"]').nth(1);
if (await cb.count()) {
  await cb.click({ force: true }).catch(() => {});
  await page.waitForTimeout(1200);
}
out.usersAfterSelect = await dumpButtons(null);
await page.screenshot({ path: `${ROOT}/recon-users-light.png` });

// ---------------- /admin/environment -------------------------------------
await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
out.environment = await dumpButtons(null);
await page.screenshot({ path: `${ROOT}/recon-env-light.png` });

// ---------------- session detail drawer -----------------------------------
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
out.sessionRowHrefs = await page.evaluate(() =>
  [...document.querySelectorAll('table a')].slice(0, 5).map((a) => a.getAttribute('href')),
);
// open the first session detail via the name link
const nameLink = page.locator('table a').first();
if (await nameLink.count()) {
  await nameLink.click().catch(() => {});
  await page.waitForTimeout(8000);
}
out.sessionUrl = page.url();
out.drawer = await dumpButtons('[class*="drawer"], [role="dialog"], dialog');
out.sessionAll = await dumpButtons(null);
await page.screenshot({ path: `${ROOT}/recon-session-light.png` });

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/recon-btncolor.json`, JSON.stringify(out, null, 2));
console.log('written');
await browser.close();
