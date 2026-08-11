/**
 * Q-6/Q-7 — replay the QA2-A tab measurement on the SAME routes so the current
 * rendering can be diffed against `shots/qa2-a/final-measurements.json`.
 * Adds sider nav-item metrics per route.
 */
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6070/';
const ROOT = process.env.ROOT;
const OUT = `${ROOT}/shots/tab-sider-restore`;
const TAG = process.env.TAG ?? 'before';
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['environment', 'admin/environment'],
  ['resources', 'admin/resources'],
  ['resource-policy', 'admin/resource-policy'],
  ['statistics', 'statistics'],
  ['users', 'admin/users'],
  ['project', 'admin/project'],
  ['maintenance', 'admin/maintenance'],
  ['settings', 'admin/settings'],
  ['scheduler', 'admin/scheduler'],
  ['my-environment', 'my-environment'],
  ['session', 'session'],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/${process.env.STATE ?? 'q67-state.json'}`,
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);

const measureTabs = () =>
  page.evaluate(() => {
    const round = (n) => +Number(n).toFixed(2);
    return [...document.querySelectorAll('.astryx-tab-list')].map((nav) => {
      const b = nav.getBoundingClientRect();
      const cs = getComputedStyle(nav);
      const parent = nav.parentElement;
      const pb = parent.getBoundingClientRect();
      const tabs = [...nav.querySelectorAll('[data-tab-value]')];
      const last = tabs.at(-1)?.getBoundingClientRect();
      return {
        style: nav.className.includes('bai-tab-list--card') ? 'card' : 'line',
        labels: tabs.map((t) => t.textContent.trim().slice(0, 24)),
        navX: round(b.x),
        navW: round(b.width),
        navH: round(b.height),
        parentX: round(pb.x),
        parentW: round(pb.width),
        lastTabRight: last ? round(last.right) : null,
        borderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
        paddingBlockEnd: cs.paddingBlockEnd,
        spansParent: Math.abs(b.width - pb.width) <= 1,
      };
    });
  });

const measureSider = () =>
  page.evaluate(() => {
    const items = [...document.querySelectorAll('.astryx-side-nav-item')];
    const sel = items.find((n) => n.getAttribute('data-selected') === 'selected');
    const one = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const b = el.getBoundingClientRect();
      return {
        label: (el.innerText || '').trim().slice(0, 18),
        w: +b.width.toFixed(1),
        h: +b.height.toFixed(1),
        radius: cs.borderRadius,
        padInline: `${cs.paddingInlineStart}/${cs.paddingInlineEnd}`,
        marginBlock: `${cs.marginTop}/${cs.marginBottom}`,
        fontSize: cs.fontSize,
        bg: cs.backgroundColor,
        color: cs.color,
      };
    };
    return {
      count: items.length,
      radii: [...new Set(items.map((n) => getComputedStyle(n).borderRadius))],
      selected: one(sel),
      rest: one(items.find((n) => n.getAttribute('data-selected') !== 'selected')),
    };
  });

const setMode = async (mode) => {
  const cur = () =>
    page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
  if ((await cur()) !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await page.waitForTimeout(1800);
  }
  return cur();
};

const report = {};
for (const mode of ['light', 'dark']) {
  for (const [name, path] of ROUTES) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    await page
      .locator('.astryx-tab-list')
      .first()
      .waitFor({ state: 'attached', timeout: 30000 })
      .catch(() => {});
    await page.waitForTimeout(5000);
    await setMode(mode);
    report[`${mode}/${name}`] = await measureTabs();
    report[`${mode}/${name}__sider`] = await measureSider();
    await page.screenshot({ path: `${OUT}/${TAG}-${mode}-${name}.png` });
  }
}
report.pageErrors = pageErrors;
fs.writeFileSync(`${OUT}/${TAG}-measurements.json`, JSON.stringify(report, null, 2));
console.log('pageErrors:', pageErrors.length);
console.log(JSON.stringify(report, null, 1).slice(0, 400));
await browser.close();
