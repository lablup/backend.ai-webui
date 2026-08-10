/**
 * qa8 — verify the PROPOSED fix without touching any source file.
 *
 * Injects the candidate rules at runtime into `@layer components` (the layer
 * BAITableAstryx.css already writes into; the project's layer order is
 * `reset, theme, base, astryx-base, astryx-theme, components, utilities`, and
 * Astryx's plugin styles ship precompiled inside `@layer astryx-base`), then
 * re-measures the painted escape.
 *
 *   (A) header:  thead th            -> overflow: hidden
 *   (B) body:    tbody td:not([colspan]) -> overflow: hidden
 *                (`:not([colspan])` spares BAITableAstryx's expanded-detail
 *                 <td>, which legitimately hosts a full nested table)
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-overflow-fixcheck.mjs
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';

const CANDIDATE_CSS = `@layer components {
  .bai-table-astryx-dim-layer thead th { overflow: hidden; }
  .bai-table-astryx-dim-layer tbody td:not([colspan]) { overflow: hidden; }
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

const inject = () =>
  page.evaluate((css) => {
    const s = document.createElement('style');
    s.id = 'qa8-candidate-fix';
    s.textContent = css;
    document.head.appendChild(s);
  }, CANDIDATE_CSS);

const result = { candidateCss: CANDIDATE_CSS, phases: {} };
const report = (p, rows) => {
  console.log(`===== ${p}: ${rows.length} escaping cells`);
  for (const r of rows.slice(0, 10))
    console.log(
      '   ',
      `${r.tag} t${r.ti} r${r.ri}`,
      (r.key ?? '?').padEnd(16),
      'pos=' + r.position.padEnd(7),
      'ovf=' + r.overflowX.padEnd(7),
      'w=' + String(r.w).padStart(6),
      'escape=+' + String(r.escapeRightPx).padStart(6),
      '|' + r.text,
    );
};

/* ---- (B)-style sticky BODY cell, top-level table: /agent ---------------- */
await page.goto(`${BASE}agent`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);
result.phases.agentBefore = await SWEEP();
report('agentBefore', result.phases.agentBefore);
await inject();
await page.waitForTimeout(600);
result.phases.agentAfter = await SWEEP();
report('agentAfter', result.phases.agentAfter);
await page.screenshot({ path: `${ROOT}/after-overflow-fix-agent.png` });

/* ---- (A) header while dragging: /session -------------------------------- */
await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 150000 });
await page.waitForTimeout(6000);

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

await drag();
result.phases.sessionDragBefore = await SWEEP();
report('sessionDragBefore', result.phases.sessionDragBefore);
await page.screenshot({ path: `${ROOT}/before-overflow-fix-session-drag.png` });
await page.mouse.up();
await page.waitForTimeout(800);

await inject();
await page.waitForTimeout(600);
await drag();
result.phases.sessionDragAfter = await SWEEP();
report('sessionDragAfter', result.phases.sessionDragAfter);
await page.screenshot({ path: `${ROOT}/after-overflow-fix-session-drag.png` });
await page.mouse.up();

// side effect check: is the resize handle still full-table height?
result.handleHeight = await page.evaluate(() => {
  const h = document.querySelector(
    'table thead th[data-column-key="name"] [role="separator"]',
  );
  const th = h?.closest('th');
  if (!h || !th) return null;
  return {
    handleH: +h.getBoundingClientRect().height.toFixed(1),
    thH: +th.getBoundingClientRect().height.toFixed(1),
  };
});
console.log('handle vs header height AFTER fix:', result.handleHeight);

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/after-overflow-fixcheck.json`,
  JSON.stringify(result, null, 2),
);
await browser.close();
