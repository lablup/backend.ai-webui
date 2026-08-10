/**
 * qa8 (1)C — the reported defect is "탭을 hover 했을 때 다크모드에서 글씨가
 * 안보입니다" on multi-tab pages (statistics, admin users). The screenshot shows
 * the hovered tab as a bare grey pill with NO label at all, which is a different
 * mechanism from "low contrast": it points at the hover OVERLAY painting over
 * the label rather than under it.
 *
 * So measure, per tab and per mode: label colour + the overlay's own colour and
 * stacking, at rest and while hovered, on the LINE style (admin users) as well
 * as the count-bearing strip on the session page.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

const ROUTES = [
  ['admin-users', 'admin/users'],
  ['session', 'session'],
];

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

async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2500);
  return page.evaluate(() => document.documentElement.dataset.theme ?? null);
}

const describeTab = (el) => {
  const cs = getComputedStyle(el);
  const before = getComputedStyle(el, '::before');
  const after = getComputedStyle(el, '::after');
  const r = el.getBoundingClientRect();
  return {
    label: el.textContent?.trim().slice(0, 20),
    selected: el.getAttribute('data-selected'),
    color: cs.color,
    bg: cs.backgroundColor,
    overlayHoverVar: cs.getPropertyValue('--color-overlay-hover').trim(),
    zIndex: cs.zIndex,
    isolation: cs.isolation,
    before: {
      content: before.content,
      bg: before.backgroundColor,
      zIndex: before.zIndex,
      inset: before.inset,
    },
    after: {
      content: after.content,
      bg: after.backgroundColor,
      zIndex: after.zIndex,
      inset: after.inset,
    },
    // Is the label actually painted where we think it is?
    rect: { w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
    // What element wins the hit test at the label's centre?
    topAtCentre: (() => {
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      return hit
        ? `${hit.tagName.toLowerCase()}.${(hit.getAttribute('class') || '').split(' ')[0]}`
        : null;
    })(),
  };
};

const result = {};
for (const [name, path] of ROUTES) {
  result[name] = {};
  for (const mode of ['light', 'dark']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    const applied = await setMode(mode);
    const bucket = (result[name][mode] = { appliedTheme: applied, tabs: [] });

    const tabs = page.locator('.astryx-tab, [role="tab"]');
    const n = Math.min(await tabs.count(), 4);
    for (let i = 0; i < n; i++) {
      const t = tabs.nth(i);
      const rest = await t.evaluate(describeTab);
      await t.hover();
      await page.waitForTimeout(450);
      const hover = await t.evaluate(describeTab);
      bucket.tabs.push({ i, rest, hover });
      await page.mouse.move(3, 3);
      await page.waitForTimeout(250);
    }
    // A hovered screenshot of the strip for the record.
    if (n) {
      await tabs.nth(0).hover();
      await page.waitForTimeout(500);
      const strip = page.locator('.astryx-tab-list, [role="tablist"]').first();
      await strip
        .screenshot({ path: `${ROOT}/${TAG}-tabs-${name}-${mode}.png` })
        .catch(() => {});
    }
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/${TAG}-tabs.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
