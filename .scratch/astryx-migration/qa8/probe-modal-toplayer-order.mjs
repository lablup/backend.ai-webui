/**
 * qa8 modal group — item (D), the ORDERING half of the mechanism.
 *
 * The main probe proved the toast viewport is `popover="manual"` and
 * `:popover-open` and STILL comes out blurred behind an open dialog. This
 * isolates why: the CSS top layer is ordered by ENTRY, and a modal
 * <dialog>'s ::backdrop paints above every top-layer element that entered
 * before it. `ToastViewport` calls `showPopover()` on mount
 * (`Toast/ToastViewport.tsx:358-370`), so it always entered first.
 *
 * Test: with a dialog already open, inject two identical popovers —
 * one shown BEFORE the dialog was opened (re-shown by hide/show is not
 * possible without closing, so it is created before the dialog opens) and one
 * shown AFTER. Screenshot both; the "after" one must be crisp.
 *
 * Also records `inert`-ness, because top layer promotion alone does not make
 * a notice usable: a modal dialog makes the rest of the document inert, so
 * even a correctly-ordered notice cannot be clicked.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-toplayer-order.mjs
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

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(11000);

// EARLY popover — enters the top layer before any dialog.
await page.evaluate(() => {
  const el = document.createElement('div');
  el.id = 'qa8-early';
  el.setAttribute('popover', 'manual');
  el.style.cssText =
    'position:fixed;left:40px;top:40px;width:220px;height:56px;background:#00c853;color:#000;font:14px/56px sans-serif;text-align:center;margin:0;border:0;padding:0;';
  el.textContent = 'EARLY popover';
  document.body.appendChild(el);
  el.showPopover();
});
await page.waitForTimeout(400);

await page.locator('[data-testid="button-terms-of-service"]').click();
await page.waitForTimeout(2500);

// LATE popover — enters the top layer after the dialog.
await page.evaluate(() => {
  const el = document.createElement('div');
  el.id = 'qa8-late';
  el.setAttribute('popover', 'manual');
  el.style.cssText =
    'position:fixed;left:40px;top:120px;width:220px;height:56px;background:#2962ff;color:#fff;font:14px/56px sans-serif;text-align:center;margin:0;border:0;padding:0;';
  el.textContent = 'LATE popover';
  document.body.appendChild(el);
  el.showPopover();
});
await page.waitForTimeout(600);

const info = await page.evaluate(() => {
  const q = (id) => {
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      popoverOpen: el.matches(':popover-open'),
      // inert-ness: a modal <dialog> makes the rest of the document inert.
      // `checkVisibility` stays true, but hit-testing and focus do not work.
      hitAtCentre:
        document
          .elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          ?.tagName.toLowerCase() ?? null,
    };
  };
  const dlg = document.querySelector('dialog[open]');
  const bd = dlg ? getComputedStyle(dlg, '::backdrop') : null;
  return {
    dialogOpen: !!dlg,
    backdrop: bd
      ? {
          backdropFilter: bd.backdropFilter || bd.webkitBackdropFilter,
          backgroundColor: bd.backgroundColor,
        }
      : null,
    early: q('qa8-early'),
    late: q('qa8-late'),
    // Is the notification stack inert while the dialog is open?
    notificationStackInert: (() => {
      const s = document.querySelector('.bai-notification-stack');
      if (!s) return null;
      const btn = s.querySelector('button');
      return {
        present: true,
        hasButton: !!btn,
        // `HTMLElement.inert` is not inherited as a property; the modal
        // dialog's inertness is applied by the UA at the document level, so
        // the observable proof is that the element cannot take focus.
        focusable: (() => {
          if (!btn) return null;
          btn.focus();
          return document.activeElement === btn;
        })(),
      };
    })(),
  };
});

await page.screenshot({
  path: `${ROOT}/${TAG}-toplayer-order.png`,
  clip: { x: 20, y: 20, width: 300, height: 180 },
});
await page.screenshot({ path: `${ROOT}/${TAG}-toplayer-order-full.png` });

info.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-toplayer-order.json`,
  JSON.stringify(info, null, 2),
);
console.log(JSON.stringify(info, null, 2));
await browser.close();
