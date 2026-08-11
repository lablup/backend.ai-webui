/**
 * qa8 (1)B/C — where does the hover paint actually come from?
 *
 * `--color-overlay-hover` is pinned OPAQUE in dark (`#262626`, from
 * `resources/theme.json:49` = antd `colorBgTextHover`). A root-level
 * `backgroundColor` read showed no rest->hover delta on the primary button, so
 * the paint must be an overlay element or pseudo-element ABOVE the button's own
 * background. This probe walks the whole subtree + pseudos of a hovered control
 * and reports every layer whose paint changes.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'before';

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

/** Snapshot every paint-bearing layer of `el` and its descendants + pseudos. */
const layers = (el) => {
  const out = [];
  const visit = (node, path) => {
    const cs = getComputedStyle(node);
    out.push({
      path,
      tag: node.tagName.toLowerCase(),
      cls: (node.getAttribute('class') || '').split(' ').slice(0, 2).join(' '),
      bg: cs.backgroundColor,
      bgImage: cs.backgroundImage,
      color: cs.color,
      opacity: cs.opacity,
      filter: cs.filter,
      boxShadow: cs.boxShadow,
    });
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(node, pseudo);
      if (p.content && p.content !== 'none') {
        out.push({
          path: path + pseudo,
          tag: pseudo,
          cls: '',
          bg: p.backgroundColor,
          bgImage: p.backgroundImage,
          color: p.color,
          opacity: p.opacity,
          filter: p.filter,
          boxShadow: p.boxShadow,
        });
      }
    }
    [...node.children].forEach((c, i) => visit(c, `${path}>${i}`));
  };
  visit(el, 'root');
  return out;
};

const diff = (a, b) =>
  b
    .map((y, i) => {
      const x = a[i];
      if (!x) return null;
      const changed = Object.keys(y).filter(
        (k) => !['path', 'tag', 'cls'].includes(k) && x[k] !== y[k],
      );
      return changed.length
        ? {
            path: y.path,
            tag: y.tag,
            cls: y.cls,
            changes: Object.fromEntries(
              changed.map((k) => [k, { rest: x[k], hover: y[k] }]),
            ),
          }
        : null;
    })
    .filter(Boolean);

const result = {};
for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
  const applied = await setMode(mode);
  const m = (result[mode] = { appliedTheme: applied });

  // The primary (filled, brand) button — reported as flipping to neutral grey.
  const primary = page.locator('button[data-variant="primary"]').first();
  if (await primary.count()) {
    m.primaryLabel = (await primary.textContent())?.trim().slice(0, 24);
    const rest = await primary.evaluate(layers);
    await primary.hover();
    await page.waitForTimeout(600);
    const hov = await primary.evaluate(layers);
    m.primaryDelta = diff(rest, hov);
    await primary.screenshot({
      path: `${ROOT}/${TAG}-btn-primary-${mode}-hover.png`,
    });
    await page.mouse.move(3, 3);
    await page.waitForTimeout(400);
    await primary.screenshot({
      path: `${ROOT}/${TAG}-btn-primary-${mode}-rest.png`,
    });
  }

  // The tab strip — the reported "label disappears on hover in dark".
  const tab = page.locator('.astryx-tab').nth(1);
  if (await tab.count()) {
    const rest = await tab.evaluate(layers);
    await tab.hover();
    await page.waitForTimeout(600);
    const hov = await tab.evaluate(layers);
    m.tabDelta = diff(rest, hov);
    await tab.screenshot({ path: `${ROOT}/${TAG}-tab-${mode}-hover.png` });
  }
  await page.mouse.move(3, 3);
  await page.waitForTimeout(300);
}

result.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/${TAG}-hover.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
