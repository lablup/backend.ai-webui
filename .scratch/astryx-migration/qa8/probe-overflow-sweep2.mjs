/**
 * qa8 — sweep #2: same painted-escape test as probe-overflow-sweep.mjs, but
 *   (a) covers <th> as well as <td>, and
 *   (b) samples WHILE the resize drag is held (pointer down, not released),
 *       which is the state the reporter described.
 *
 * Also runs the sweep on a second route whose pinned first column renders raw
 * text rather than BAINameActionCell.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-sweep2.mjs
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
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const SWEEP = () =>
  page.evaluate(() => {
    const round = (n) => +n.toFixed(1);
    const out = [];
    document.querySelectorAll('table').forEach((table, ti) => {
      const ths = [...table.querySelectorAll('thead tr th')];
      [...table.querySelectorAll('tr')].forEach((tr, ri) => {
        [...tr.children]
          .filter((n) => n.tagName === 'TD' || n.tagName === 'TH')
          .forEach((cell, ci) => {
            const cR = cell.getBoundingClientRect();
            const cC = getComputedStyle(cell);
            let worst = null;
            const walk = (n) => {
              if (n.nodeType === 3 && n.textContent.trim()) {
                const rg = document.createRange();
                rg.selectNodeContents(n);
                const r = rg.getBoundingClientRect();
                if (!r.width) return;
                let clipRight = Infinity;
                let el = n.parentElement;
                while (el && el !== cell) {
                  const s = getComputedStyle(el);
                  if (s.overflowX !== 'visible')
                    clipRight = Math.min(
                      clipRight,
                      el.getBoundingClientRect().right,
                    );
                  el = el.parentElement;
                }
                if (cC.overflowX !== 'visible')
                  clipRight = Math.min(clipRight, cR.right);
                const escape = round(Math.min(r.right, clipRight) - cR.right);
                if (!worst || escape > worst.escape)
                  worst = { escape, text: n.textContent.trim().slice(0, 34) };
                return;
              }
              for (const c of n.childNodes) walk(c);
            };
            walk(cell);
            if (worst && worst.escape > 0.5)
              out.push({
                ti,
                ri,
                ci,
                tag: cell.tagName.toLowerCase(),
                key:
                  cell.getAttribute('data-column-key') ??
                  ths[ci]?.getAttribute('data-column-key') ??
                  null,
                position: cC.position,
                overflowX: cC.overflowX,
                w: round(cR.width),
                escapeRightPx: worst.escape,
                text: worst.text,
              });
          });
      });
    });
    return out;
  });

const result = { pageErrors, phases: {} };
const report = (phase, rows) => {
  console.log(`===== ${phase}: ${rows.length} escaping cells`);
  for (const r of rows.slice(0, 15))
    console.log(
      '   ',
      `t${r.ti} r${r.ri} ${r.tag}`,
      (r.key ?? '?').padEnd(16),
      'pos=' + r.position.padEnd(7),
      'ovf=' + r.overflowX.padEnd(7),
      'w=' + String(r.w).padStart(6),
      'escape=+' + String(r.escapeRightPx).padStart(6),
      '|' + r.text,
    );
};

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);
result.phases.sessionRest = await SWEEP();
report('sessionRest', result.phases.sessionRest);

for (const key of ['name', 'status']) {
  const h = page.locator(
    `table thead th[data-column-key="${key}"] [role="separator"]`,
  );
  if (!(await h.count())) continue;
  const box = await h.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 40, cy, { steps: 6 });
  await page.mouse.move(cx - 130, cy, { steps: 12 });
  await page.waitForTimeout(500);
  result.phases[`sessionDragging_${key}`] = await SWEEP();
  report(`sessionDragging_${key}`, result.phases[`sessionDragging_${key}`]);
  await page.screenshot({
    path: `${ROOT}/${TAG}-overflow-sweep2-dragging-${key}.png`,
  });
  await page.mouse.up();
  await page.waitForTimeout(900);
}

// second route: a pinned first column rendered as raw text
for (const route of ['admin/users', 'storage-settings', 'agent']) {
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('table tbody tr', { timeout: 40000 });
    await page.waitForTimeout(4500);
    const rows = await SWEEP();
    result.phases[route] = rows;
    report(route, rows);
  } catch (e) {
    result.phases[route] = `ERROR ${String(e).slice(0, 80)}`;
    console.log(`===== ${route}: ${result.phases[route]}`);
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-sweep2.json`,
  JSON.stringify(result, null, 2),
);
await browser.close();
