/** qa8 item B — identify the vertical stub left of the explorer's tab strip. */
import { chromium } from '@playwright/test';
import { BASE, ROOT, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const FOLDER = process.env.FOLDER ?? '6055ae8d-ea5c-4d20-ae6c-905ec08fad79';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
const out = {};

await page.goto(`${BASE}data?folder=${FOLDER}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await settle(page, 10000);
await page.waitForTimeout(2500);

for (const mode of ['light', 'dark']) {
  await setMode(page, mode);
  await page.waitForTimeout(1500);
  const m = (out[mode] = {});
  m.handles = await page.evaluate(() => {
    const info = (el, role) => {
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        role,
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 60),
        attrs: [...el.attributes]
          .filter((a) => a.name.startsWith('data-') || a.name.startsWith('aria-') || a.name === 'role')
          .map((a) => `${a.name}=${a.value}`)
          .join(' ')
          .slice(0, 140),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(2),
          h: +r.height.toFixed(1),
        },
        bg: c.backgroundColor,
        borderRadius: c.borderRadius,
        position: c.position,
        transform: c.transform,
        opacity: c.opacity,
        zIndex: c.zIndex,
      };
    };
    const out = [];
    for (const el of document.querySelectorAll(
      '[role="separator"], [class*="resize"], [data-astryx-comp*="resize"], [data-comp*="resize"]',
    )) {
      out.push(info(el, 'handle'));
      for (const k of el.querySelectorAll('*')) out.push(info(k, 'handle-child'));
    }
    return out;
  });
  // the flex row children around the tab strip
  m.row = await page.evaluate(() => {
    const nav = [...document.querySelectorAll('.bai-tab-list--card')].pop();
    if (!nav) return null;
    // the resizable row is the grandparent flex
    const panel = nav.parentElement;
    const row = panel?.parentElement;
    const box = (el, role) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        role,
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() ?? '').slice(0, 60),
        rect: {
          x: +r.x.toFixed(1),
          y: +r.y.toFixed(1),
          w: +r.width.toFixed(2),
          h: +r.height.toFixed(1),
        },
        bg: c.backgroundColor,
        display: c.display,
        gap: c.gap,
      };
    };
    return {
      nav: box(nav, 'nav'),
      panel: box(panel, 'panel'),
      row: box(row, 'row'),
      rowChildren: row ? [...row.children].map((c, i) => box(c, `child${i}`)) : [],
    };
  });
  const nav = m.row?.nav?.rect;
  if (nav) {
    await page.screenshot({
      path: `${ROOT}/before-b3-tall-${mode}.png`,
      clip: { x: nav.x - 40, y: nav.y - 30, width: 200, height: 460 },
    });
  }
}

fs.writeFileSync(`${ROOT}/before-pages-b3.json`, JSON.stringify(out, null, 2));
console.log('written');
await browser.close();
