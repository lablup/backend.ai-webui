/**
 * qa8 — defect (A), exact layer: dump the clip chain of the PINNED header cell
 * (`th[data-column-key="name"]`, sticky) while the resize drag is HELD, and the
 * same chain for the neighbouring non-pinned header at the same width.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-header-chain.mjs
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
page.setDefaultTimeout(60000);

const chain = (key) =>
  page.evaluate((k) => {
    const round = (n) => +n.toFixed(1);
    const th = document.querySelector(`table thead th[data-column-key="${k}"]`);
    if (!th) return null;
    let best = null;
    const walk = (n) => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const r = rg.getBoundingClientRect();
        if (r.width && (!best || r.width > best.r.width))
          best = { node: n, r, text: n.textContent.trim() };
        return;
      }
      for (const c of n.childNodes) walk(c);
    };
    walk(th);
    if (!best) return null;
    const layers = [];
    let el = best.node.parentElement;
    while (el) {
      const c = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      layers.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') ?? '').split(' ').slice(0, 2).join(' '),
        inlineStyle: el.getAttribute('style')?.slice(0, 60) ?? '',
        display: c.display,
        overflowX: c.overflowX,
        textOverflow: c.textOverflow,
        whiteSpace: c.whiteSpace,
        minWidth: c.minWidth,
        width: c.width,
        flex: c.flex,
        right: round(r.right),
        w: round(r.width),
      });
      if (el === th) break;
      el = el.parentElement;
    }
    const r = th.getBoundingClientRect();
    return {
      key: k,
      text: best.text,
      thW: round(r.width),
      thRight: round(r.right),
      textRight: round(best.r.right),
      layers,
    };
  }, key);

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);

const out = { rest: { name: await chain('name'), status: await chain('status') } };

const h = page.locator(
  'table thead th[data-column-key="name"] [role="separator"]',
);
const box = await h.boundingBox();
const cx = box.x + box.width / 2;
const cy = box.y + box.height / 2;
await page.mouse.move(cx, cy);
await page.mouse.down();
await page.mouse.move(cx - 40, cy, { steps: 6 });
await page.mouse.move(cx - 130, cy, { steps: 12 });
await page.waitForTimeout(500);
out.dragging = { name: await chain('name'), status: await chain('status') };
await page.screenshot({ path: `${ROOT}/${TAG}-overflow-header-chain.png` });
await page.mouse.up();

fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-header-chain.json`,
  JSON.stringify(out, null, 2),
);
for (const [phase, byKey] of Object.entries(out)) {
  for (const [k, c] of Object.entries(byKey)) {
    if (!c) continue;
    console.log(
      `===== ${phase}/${k} thW=${c.thW} thRight=${c.thRight} textRight=${c.textRight} "${c.text}"`,
    );
    for (const l of c.layers)
      console.log(
        '   ',
        (l.tag + '.' + l.cls).slice(0, 30).padEnd(31),
        'disp=' + l.display.padEnd(12),
        'ovf=' + l.overflowX.padEnd(8),
        'minW=' + l.minWidth.padEnd(6),
        'w=' + String(l.w).padStart(6),
        'right=' + String(l.right).padStart(7),
        l.inlineStyle ? '| ' + l.inlineStyle : '',
      );
  }
}
await browser.close();
