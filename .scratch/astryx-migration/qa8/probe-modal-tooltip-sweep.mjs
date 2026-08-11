/**
 * qa8 modal group — item (E), sweep form.
 *
 * The single-target probe (probe-modal-tooltip.mjs) found the AutoMount
 * tooltip correctly anchored when the folder-create dialog is opened from
 * `/data`. This sweeps EVERY tooltip trigger inside a dialog on several
 * mount points and flags any layer that lands at the viewport origin — the
 * "anchor 가 화면 좌상단" symptom — so the finding is either reproduced with a
 * surface name or refuted across the surface class.
 *
 * A trigger is any element inside the open <dialog> carrying an inline
 * `anchor-name` (that is how `Layer/useLayer.tsx` marks them) plus an
 * `aria-describedby`; hovering it should open a `[role="tooltip"]` popover.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-tooltip-sweep.mjs
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
page.setDefaultTimeout(20000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

const openTooltipInfo = () =>
  page.evaluate(() => {
    const tip = [...document.querySelectorAll('[role="tooltip"]')].find((t) => {
      try {
        return t.matches(':popover-open');
      } catch {
        return false;
      }
    });
    if (!tip) return null;
    const r = tip.getBoundingClientRect();
    const c = getComputedStyle(tip);
    return {
      text: tip.textContent?.trim().slice(0, 40),
      rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
      positionAnchor: c.getPropertyValue('position-anchor').trim(),
      positionArea: c.getPropertyValue('position-area').trim(),
      insideDialog: !!tip.closest('dialog'),
      atViewportOrigin: r.x < 4 && r.y < 4,
    };
  });

/** Hover each tooltip trigger inside the open dialog and report its layer. */
async function sweepOpenDialog(label, bucket) {
  const triggers = page.locator(
    'dialog[open] [style*="anchor-name"][aria-describedby], dialog[open] button:has(svg.lucide-circle-question-mark), dialog[open] button:has(svg.lucide-info)',
  );
  const n = await triggers.count();
  const rows = [];
  for (let i = 0; i < Math.min(n, 14); i++) {
    const el = triggers.nth(i);
    try {
      const anchorRect = await el.boundingBox();
      await el.hover({ timeout: 4000 });
      await page.waitForTimeout(800);
      const tip = await openTooltipInfo();
      rows.push({
        i,
        anchorRect: anchorRect
          ? {
              x: +anchorRect.x.toFixed(1),
              y: +anchorRect.y.toFixed(1),
              w: +anchorRect.width.toFixed(1),
              h: +anchorRect.height.toFixed(1),
            }
          : null,
        tip,
        deltaX:
          tip && anchorRect
            ? +(tip.rect.x + tip.rect.w / 2 - (anchorRect.x + anchorRect.width / 2)).toFixed(1)
            : null,
      });
      await page.mouse.move(2, 2);
      await page.waitForTimeout(250);
    } catch (e) {
      rows.push({ i, error: String(e).split('\n')[0] });
    }
  }
  bucket[label] = { triggerCount: n, rows };
}

async function closeAll() {
  for (let i = 0; i < 3; i++) {
    if (!(await page.locator('dialog[open]').count())) return;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
  }
}

const result = { viewport: { w: 1600, h: 1000 } };
const bucket = (result.light = {});

// 1. Folder create, from /data
try {
  await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  await page.getByRole('button', { name: /create folder/i }).first().click();
  await page.waitForTimeout(2500);
  await sweepOpenDialog('folder-create-from-data', bucket);
  await closeAll();
} catch (e) {
  bucket['folder-create-from-data'] = { error: String(e).split('\n')[0] };
  await closeAll();
}

// 2. Session launcher (a page with many tooltips) — then its nested dialogs
try {
  await page.goto(`${BASE}session/start`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(14000);
  // The launcher renders in-page; open its folder-create dialog if present.
  const createBtn = page.getByRole('button', { name: /create folder/i }).first();
  if (await createBtn.count()) {
    await createBtn.click();
    await page.waitForTimeout(2500);
    await sweepOpenDialog('folder-create-from-launcher', bucket);
    await closeAll();
  } else {
    bucket['folder-create-from-launcher'] = { skipped: 'no create-folder button' };
  }
} catch (e) {
  bucket['folder-create-from-launcher'] = { error: String(e).split('\n')[0] };
  await closeAll();
}

// 3. A dialog opened from inside another dialog is the interesting nested case:
//    the folder explorer / import flow. Best effort.
try {
  await page.goto(`${BASE}data`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  const gear = page
    .locator('button[aria-label*="etting" i], button[aria-label*="설정"]')
    .first();
  if (await gear.count()) {
    await gear.click();
    await page.waitForTimeout(1500);
    await sweepOpenDialog('table-settings', bucket);
    await closeAll();
  }
} catch (e) {
  bucket['table-settings'] = { error: String(e).split('\n')[0] };
  await closeAll();
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-tooltip-sweep.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
