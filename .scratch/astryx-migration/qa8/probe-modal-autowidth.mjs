/**
 * qa8 Q-21 — the `/admin/settings` dialogs that pass `width="auto"`.
 *
 * antd's `auto` meant shrink-to-fit, via `centered` + `display: inline-block`.
 * On a native `<dialog>` with `inset-inline: 0` and `margin: auto`, `width:auto`
 * resolves against the VIEWPORT instead, landing on the `max-width: 90vw` clamp.
 * Measure each dialog's rendered width against what its content needs.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'after';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(25000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(`${BASE}admin/settings`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);

const result = { openers: [], dialogs: [] };
const buttons = page.locator('button');
const n = await buttons.count();
for (let i = 0; i < n; i++) {
  const b = buttons.nth(i);
  const label = (
    (await b.getAttribute('aria-label')) ??
    (await b.textContent()) ??
    ''
  ).trim();
  if (!/setting|config|network|scheduler|edit/i.test(label)) continue;
  if (!(await b.isVisible().catch(() => false))) continue;
  result.openers.push(label.slice(0, 40));
  await b.click().catch(() => {});
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    if (!d) return null;
    const r = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    const prev = d.style.width;
    d.style.width = 'max-content';
    const max = d.getBoundingClientRect().width;
    d.style.width = prev;
    return {
      title: d.querySelector('h1,h2,h3')?.textContent?.trim().slice(0, 40),
      rendered: +r.width.toFixed(1),
      cssWidth: cs.width,
      maxWidth: cs.maxWidth,
      contentNeeds: +max.toFixed(1),
    };
  });
  if (info) result.dialogs.push(info);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
  if (result.dialogs.length >= 4) break;
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-autowidth.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
