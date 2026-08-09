import { chromium } from '@playwright/test';
import fs from 'node:fs';

const OUT = process.argv[2];
const TAG = process.argv[3];
const WIDTHS = [1600, 1200, 800];

const measureFn = () => {
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return {
      x: Math.round(b.x),
      y: Math.round(b.y),
      w: Math.round(b.width),
      h: Math.round(b.height),
      b: Math.round(b.bottom),
    };
  };
  const out = {};
  const dialog = document.querySelector('.astryx-dialog');
  if (!dialog) return { error: 'no dialog' };
  out.dialog = r(dialog);
  const header = dialog.querySelector('.astryx-layout-header');
  out.header = r(header);
  out.headerHasDivider = header ? header.hasAttribute('data-divider') : null;
  const content = dialog.querySelector('.astryx-layout-content');
  out.content = r(content);
  out.contentPadding = content ? getComputedStyle(content).padding : null;
  const hdr = dialog.querySelector('[data-testid="folder-explorer-header"]');
  out.explorerHeader = {
    ...r(hdr),
    gap: hdr ? getComputedStyle(hdr).gap : null,
  };
  const acts = dialog.querySelector('[data-testid="folder-explorer-actions"]');
  out.explorerActions = {
    ...r(acts),
    gap: acts ? getComputedStyle(acts).gap : null,
  };
  const crumbs = dialog.querySelector('.astryx-breadcrumbs');
  out.breadcrumbs = r(crumbs);
  const scrollWrap = dialog.querySelector('.astryx-table-scroll-wrapper');
  out.tableScrollWrapper = scrollWrap
    ? {
        ...r(scrollWrap),
        marginLeft: getComputedStyle(scrollWrap).marginLeft,
        marginRight: getComputedStyle(scrollWrap).marginRight,
      }
    : null;
  const tabList = dialog.querySelector('.astryx-tab-list');
  out.tabList = tabList
    ? { ...r(tabList), marginBottom: getComputedStyle(tabList).marginBottom }
    : null;
  const panel = tabList ? tabList.nextElementSibling : null;
  out.tabPanel = r(panel);
  const rh = dialog.querySelector('.astryx-resize-handle');
  out.resizeHandle = rh
    ? { ...r(rh), margin: getComputedStyle(rh).margin }
    : null;
  const bodyWrap = content ? content.firstElementChild : null;
  out.bodyWrap = bodyWrap
    ? { ...r(bodyWrap), minHeight: getComputedStyle(bodyWrap).minHeight }
    : null;
  const stack = bodyWrap ? bodyWrap.firstElementChild : null;
  out.rootStack = stack
    ? { ...r(stack), gap: getComputedStyle(stack).gap }
    : null;
  out.derived = {
    headerBottomToContentTop:
      out.content && out.header ? out.content.y - out.header.b : null,
    breadcrumbTopMinusContentTop:
      out.breadcrumbs && out.content ? out.breadcrumbs.y - out.content.y : null,
    tabListBottomToPanelTop:
      out.tabList && out.tabPanel ? out.tabPanel.y - out.tabList.b : null,
    tableLeftMinusContentLeft:
      out.tableScrollWrapper && out.content
        ? out.tableScrollWrapper.x - out.content.x
        : null,
    explorerPaneToInfoPaneGap:
      out.tableScrollWrapper && out.tabList
        ? out.tabList.x - (out.tableScrollWrapper.x + out.tableScrollWrapper.w)
        : null,
    dialogFillRatio:
      out.dialog ? Math.round((out.dialog.h / window.innerHeight) * 100) : null,
  };
  return out;
};

const errors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

await page.goto('http://localhost:6030/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(3000);
const loginBtn = page.getByLabel('Login', { exact: true });
if (await loginBtn.isVisible().catch(() => false)) await loginBtn.click();
await page.waitForSelector('[data-testid="user-dropdown-button"]', {
  timeout: 60000,
});
await page.waitForTimeout(2000);

const results = {};
for (const theme of ['light', 'dark']) {
  await page.emulateMedia({ colorScheme: theme });
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 1000 });
    await page.goto('http://localhost:6030/data', {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForTimeout(4000);
    try {
      await page.locator('table tbody tr').first().waitFor({ timeout: 20000 });
    } catch (e) {
      /* ignore */
    }
    const cand = page
      .locator('table tbody tr td')
      .nth(1)
      .locator('a, button, span[role="button"]')
      .first();
    await cand.click({ timeout: 20000 }).catch(async () => {
      await page.locator('table tbody tr td').nth(1).click();
    });
    await page.waitForSelector('[data-testid="folder-explorer-header"]', {
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
    results[theme + '-' + w] = await page.evaluate(measureFn);
    await page.screenshot({
      path: OUT + '/' + TAG + '-' + w + '-' + theme + '.png',
    });
  }
}
await ctx.close();
await browser.close();
fs.writeFileSync(
  OUT + '/' + TAG + '-rhythm.json',
  JSON.stringify({ results, pageErrors: errors }, null, 2),
);
console.log('pageErrors:', errors.length);
console.log('done');
