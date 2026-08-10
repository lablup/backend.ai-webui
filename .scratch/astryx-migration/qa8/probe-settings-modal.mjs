/**
 * qa8 Q-13 — "My Environments, RBAC Management 의 table settings modal 에서만
 * 다른 스타일을 갖고 있습니다".
 *
 * Opens the column-settings modal on a table that uses `BAITableAstryx`'s
 * built-in `tableSettings` (the majority look) and on the two the report names,
 * which reach the app's own `TableColumnsSettingModal`, and compares the chrome
 * that differed: dialog width, header title/subtitle, the search field's label,
 * the scroll box height and the footer button labels.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'after';

const ROUTES = [
  ['builtin-agents', 'agent'],
  ['rbac', 'admin/rbac'],
  ['my-environments', 'my-environment'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const result = {};
for (const [name, path] of ROUTES) {
  const bucket = (result[name] = { path });
  try {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(11000);

    const gear = page
      .locator('button[aria-label*="etting" i], button[aria-label*="설정"]')
      .first();
    if (!(await gear.count())) {
      bucket.error = 'no settings button found';
      continue;
    }
    await gear.click();
    await page.waitForTimeout(1500);

    bucket.metrics = await page.evaluate(() => {
      const dlg =
        document.querySelector('dialog[open]') ??
        document.querySelector('.astryx-dialog');
      if (!dlg) return { error: 'no dialog' };
      const r = dlg.getBoundingClientRect();
      const heading = dlg.querySelector('h1,h2,h3,[class*="heading"]');
      const sub = dlg.querySelector('[class*="subtitle"],[class*="supporting"]');
      const input = dlg.querySelector('input[type="text"], input:not([type])');
      const inputLabel = input?.closest('label')?.textContent?.trim() ?? null;
      const scroller = [...dlg.querySelectorAll('div')].find((d) => {
        const cs = getComputedStyle(d);
        return cs.overflowY === 'auto' || cs.overflowY === 'scroll';
      });
      const buttons = [...dlg.querySelectorAll('button')]
        .map((b) => b.textContent?.trim())
        .filter(Boolean);
      const grips = dlg.querySelectorAll('svg.lucide-grip-vertical').length;
      return {
        dialog: { w: +r.width.toFixed(1) },
        heading: heading?.textContent?.trim() ?? null,
        subtitle: sub?.textContent?.trim() ?? null,
        searchPlaceholder: input?.getAttribute('placeholder') ?? null,
        searchVisibleLabel: inputLabel,
        scrollerMaxHeight: scroller
          ? getComputedStyle(scroller).maxHeight
          : null,
        scrollerHeight: scroller ? getComputedStyle(scroller).height : null,
        buttons,
        gripHandles: grips,
        checkboxes: dlg.querySelectorAll('input[type="checkbox"]').length,
      };
    });

    const dlg = page.locator('dialog[open], .astryx-dialog').first();
    await dlg
      .screenshot({ path: `${ROOT}/${TAG}-settings-${name}.png` })
      .catch(() => {});
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
  } catch (e) {
    bucket.error = String(e).split('\n')[0];
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-settings-modal.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
