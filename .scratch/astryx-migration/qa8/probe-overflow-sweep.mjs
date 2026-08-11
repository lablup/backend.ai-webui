/**
 * qa8 — sweep: find EVERY table cell whose text is actually PAINTED outside its
 * own <td> (i.e. no ancestor between the text and the cell clips it, and the
 * cell itself does not clip either).
 *
 * `visibleEscapeRightPx > 0` is the defect. The walk resolves the real clip
 * chain, so a cell whose inner component happens to ellipsis itself (e.g.
 * BAINameActionCell) is correctly reported as fine.
 *
 * Runs on /session, at rest and after dragging each of the first few resizable
 * columns down to the 60px minimum.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-sweep.mjs
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
      table.querySelectorAll('tbody tr').forEach((tr, ri) => {
        [...tr.children]
          .filter((n) => n.tagName === 'TD')
          .forEach((td, ci) => {
            const tdR = td.getBoundingClientRect();
            const tdC = getComputedStyle(td);
            // every text node in the cell
            const nodes = [];
            const walk = (n) => {
              if (n.nodeType === 3 && n.textContent.trim()) nodes.push(n);
              for (const c of n.childNodes) walk(c);
            };
            walk(td);
            let worst = null;
            for (const n of nodes) {
              const rg = document.createRange();
              rg.selectNodeContents(n);
              const r = rg.getBoundingClientRect();
              if (!r.width) continue;
              // resolve the clip chain between the text and the <td>
              let clipRight = Infinity;
              let el = n.parentElement;
              while (el && el !== td) {
                const c = getComputedStyle(el);
                if (c.overflowX !== 'visible')
                  clipRight = Math.min(clipRight, el.getBoundingClientRect().right);
                el = el.parentElement;
              }
              if (tdC.overflowX !== 'visible')
                clipRight = Math.min(clipRight, tdR.right);
              const painted = Math.min(r.right, clipRight);
              const escape = round(painted - tdR.right);
              if (!worst || escape > worst.escape)
                worst = {
                  escape,
                  text: n.textContent.trim().slice(0, 40),
                };
            }
            if (worst && worst.escape > 0.5)
              out.push({
                ti,
                ri,
                ci,
                key: ths[ci]?.getAttribute('data-column-key') ?? null,
                header: ths[ci]?.textContent?.trim().slice(0, 20) ?? null,
                tdPosition: tdC.position,
                tdOverflowX: tdC.overflowX,
                tdW: round(tdR.width),
                escapeRightPx: worst.escape,
                text: worst.text,
              });
          });
      });
    });
    return out;
  });

const result = { pageErrors, phases: {} };

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);

result.phases.rest = await SWEEP();

const narrow = async (key) => {
  const h = page.locator(
    `table thead th[data-column-key="${key}"] [role="separator"]`,
  );
  if (!(await h.count())) return false;
  const box = await h.boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx - 40, cy, { steps: 6 });
  await page.mouse.move(cx - 120, cy, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  return true;
};

for (const key of ['name', 'status', 'owner']) {
  if (await narrow(key)) {
    result.phases[`narrowed_${key}`] = await SWEEP();
    await page.screenshot({
      path: `${ROOT}/${TAG}-overflow-sweep-narrowed-${key}.png`,
    });
  }
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-overflow-sweep.json`,
  JSON.stringify(result, null, 2),
);
for (const [phase, rows] of Object.entries(result.phases)) {
  console.log(`===== ${phase}: ${rows.length} escaping cells`);
  for (const r of rows.slice(0, 12))
    console.log(
      '   ',
      `t${r.ti} r${r.ri}`,
      (r.key ?? '?').padEnd(16),
      'pos=' + r.tdPosition.padEnd(7),
      'ovf=' + r.tdOverflowX.padEnd(7),
      'tdW=' + String(r.tdW).padStart(6),
      'escape=+' + String(r.escapeRightPx).padStart(6),
      '|' + r.text,
    );
}
await browser.close();
