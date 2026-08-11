/**
 * qa8 — alternative fix for (A) that does NOT clip the <th> (so the resize
 * handle keeps bleeding through the body rows and the sticky shadow survives):
 * unblock the flex item that stops BAITableAstryx's own clipping header span
 * from shrinking.
 *
 * Chain measured while dragging `name` down to 60px:
 *   th(60, overflow:visible)
 *     > div
 *       > button  display:flex, width 44
 *         > span  min-width:AUTO, width 93   <-- refuses to shrink (min-content)
 *           > span  BAI clip wrapper, min-width:0, overflow:hidden, width 93
 *
 * Candidate: `min-width: 0` on that flex item.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-fixcheck2.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const CANDIDATE_CSS = `@layer components {
  .bai-table-astryx-dim-layer thead th button > span { min-width: 0; }
}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(60000);

const headerEscape = () =>
  page.evaluate(() => {
    const round = (n) => +n.toFixed(1);
    const th = document.querySelector(
      'table thead th[data-column-key="name"]',
    );
    const r = th.getBoundingClientRect();
    let worst = -Infinity;
    let text = '';
    const walk = (n) => {
      if (n.nodeType === 3 && n.textContent.trim()) {
        const rg = document.createRange();
        rg.selectNodeContents(n);
        const tr = rg.getBoundingClientRect();
        if (!tr.width) return;
        let clip = Infinity;
        let el = n.parentElement;
        while (el && el !== th) {
          const s = getComputedStyle(el);
          if (s.overflowX !== 'visible')
            clip = Math.min(clip, el.getBoundingClientRect().right);
          el = el.parentElement;
        }
        if (getComputedStyle(th).overflowX !== 'visible')
          clip = Math.min(clip, r.right);
        const e = round(Math.min(tr.right, clip) - r.right);
        if (e > worst) {
          worst = e;
          text = n.textContent.trim();
        }
        return;
      }
      for (const c of n.childNodes) walk(c);
    };
    walk(th);
    return { thW: round(r.width), escapeRightPx: worst, text };
  });

const drag = async () => {
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
  await page.waitForTimeout(400);
};

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);

const out = {};
await drag();
out.before = await headerEscape();
await page.mouse.up();
await page.waitForTimeout(800);

await page.evaluate((css) => {
  const s = document.createElement('style');
  s.textContent = css;
  document.head.appendChild(s);
}, CANDIDATE_CSS);
await page.waitForTimeout(500);

await drag();
out.after = await headerEscape();
await page.screenshot({ path: `${ROOT}/after-overflow-fix2-session-drag.png` });
await page.mouse.up();

fs.writeFileSync(
  `${ROOT}/after-overflow-fixcheck2.json`,
  JSON.stringify({ candidateCss: CANDIDATE_CSS, ...out }, null, 2),
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
