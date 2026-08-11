/**
 * qa8 modal group — item (D) "Modal 이 떠 있는 경우 notification message 가
 * 블러 처리되어서 보이지 않음" / "Bulk Create Users from CSV 에서 ... 에러
 * 메시지가 블러처리 되어 확인할 수 없음".
 *
 * HYPOTHESIS UNDER TEST: Astryx `Dialog` is a non-portalled native <dialog>
 * promoted with showModal(); its ::backdrop carries `backdrop-filter:
 * blur(2px)` and covers EVERY top-layer element that entered the top layer
 * BEFORE it, plus the whole normal-flow document. So:
 *   (1) `BAINotificationStackAstryx` — a plain <div class="bai-notification-
 *       stack"> in normal flow — is behind the backdrop, always.
 *   (2) `message.*` toasts render into Astryx `ToastViewport`, which DOES
 *       promote itself with popover="manual" — but it calls showPopover() on
 *       MOUNT (ToastViewport.tsx:358-370), i.e. long before any dialog opens,
 *       so it sits LOWER in top-layer order than the dialog and its backdrop.
 *
 * Both are driven client-side only: the notification through the public
 * `add-bai-notification` DOM event that `NotificationHost` listens on, and
 * the toast through the DEV-only `window.__baiAppShim` handle
 * (`packages/backend.ai-ui/src/app-shim/index.tsx:70`) that the CSV importer's
 * `message.error(t('credential.validation.CSVParseFailed'))` also goes
 * through. No mutation is fired at the cluster.
 *
 * Usage: node .scratch/astryx-migration/qa8/probe-modal-toplayer.mjs
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

async function setMode(mode) {
  await page.evaluate((m) => {
    const want = m === 'dark';
    if ((document.documentElement.dataset.theme === 'dark') === want) return;
    const b = Array.from(document.querySelectorAll('button')).find((x) =>
      /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
    );
    if (b) b.click();
  }, mode);
  await page.waitForTimeout(2000);
  const applied = await page.evaluate(
    () => document.documentElement.dataset.theme ?? null,
  );
  if (applied !== mode) throw new Error(`theme toggle did not take: ${applied}`);
  return applied;
}

const fireNotification = () =>
  page.evaluate(() => {
    document.dispatchEvent(
      new CustomEvent('add-bai-notification', {
        detail: {
          key: 'qa8-probe',
          message: 'QA8 PROBE NOTIFICATION',
          description: 'measured, not a real event',
          open: true,
          duration: 0,
        },
      }),
    );
  });

const fireToast = () =>
  page.evaluate(() => {
    const shim = window.__baiAppShim;
    if (!shim) return 'no __baiAppShim (not a DEV build?)';
    shim.message.error('QA8 PROBE TOAST — CSVParseFailed stand-in');
    return 'fired';
  });

/**
 * Everything about who is on top. `elementFromPoint` is the ground truth:
 * a modal <dialog>'s ::backdrop is hit-tested as the <dialog> itself, so if
 * probing the centre of a notice returns the dialog, the notice is UNDER the
 * backdrop (and therefore blurred + dimmed by it).
 */
const measureStacking = () =>
  page.evaluate(() => {
    const out = {};
    const dlg = document.querySelector('dialog[open]');
    out.dialogOpen = !!dlg;
    if (dlg) {
      const bd = getComputedStyle(dlg, '::backdrop');
      out.backdrop = {
        backdropFilter: bd.backdropFilter || bd.webkitBackdropFilter,
        backgroundColor: bd.backgroundColor,
      };
      out.dialogRect = (() => {
        const r = dlg.getBoundingClientRect();
        return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
      })();
    }

    const describe = (el, name) => {
      if (!el) return { name, present: false };
      const r = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const hit = document.elementFromPoint(cx, cy);
      return {
        name,
        present: true,
        rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
        position: c.position,
        zIndex: c.zIndex,
        // Is this element itself in the top layer?
        hasPopoverAttr: el.getAttribute('popover'),
        isPopoverOpen: (() => {
          try {
            return el.matches(':popover-open');
          } catch {
            return null;
          }
        })(),
        insideDialog: !!el.closest('dialog'),
        // Ground truth: what does the browser hit-test on top of it?
        hitTestTag: hit ? hit.tagName.toLowerCase() : null,
        hitTestIsDialog: hit ? hit.tagName.toLowerCase() === 'dialog' : null,
        hitTestIsSelfOrDescendant: hit ? el.contains(hit) || hit === el : null,
        // Full front-to-back stack at the notice's centre. If <dialog>
        // appears BEFORE this element, the dialog + its ::backdrop paint on
        // top of it.
        stackAtCentre: document
          .elementsFromPoint(cx, cy)
          .slice(0, 8)
          .map(
            (e) =>
              e.tagName.toLowerCase() +
              (e.className && typeof e.className === 'string'
                ? '.' + e.className.trim().split(/\s+/)[0]
                : ''),
          ),
      };
    };

    out.notificationStack = describe(
      document.querySelector('.bai-notification-stack'),
      '.bai-notification-stack',
    );
    // Astryx ToastViewport: the [popover] region that owns [data-toast-id]s.
    const toastNode = document.querySelector('[data-toast-id]');
    out.toastViewport = describe(
      toastNode?.closest('[popover], [role="region"]') ??
        document.querySelector('[role="region"][popover]'),
      'ToastViewport',
    );
    out.toastItem = describe(toastNode, '[data-toast-id]');
    return out;
  });

const result = { viewport: { w: 1600, h: 1000 } };

for (const mode of ['light', 'dark']) {
  const bucket = (result[mode] = {});
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(11000);
  bucket.appliedTheme = await setMode(mode);

  // --- control: notice + toast with NO dialog open ------------------------
  await fireNotification();
  bucket.toastFire = await fireToast();
  await page.waitForTimeout(1200);
  bucket.noDialog = await measureStacking();
  await page.screenshot({ path: `${ROOT}/${TAG}-toplayer-nodialog-${mode}.png` });
  await page.screenshot({
    path: `${ROOT}/${TAG}-toplayer-notice-crop-nodialog-${mode}.png`,
    clip: { x: 1140, y: 870, width: 460, height: 130 },
  });

  // --- now open a dialog on top of both ------------------------------------
  await page.locator('[data-testid="button-terms-of-service"]').click();
  await page.waitForTimeout(2500);
  // re-fire so the notice/toast are definitely alive while the dialog is up
  await fireNotification();
  await fireToast();
  await page.waitForTimeout(1200);
  bucket.withDialog = await measureStacking();
  await page.screenshot({
    path: `${ROOT}/${TAG}-toplayer-withdialog-${mode}.png`,
    fullPage: false,
  });
  // Tight crop of the bottom-right notice corner — this is the pixel evidence
  // the reporter saw ("블러 처리되어 보이지 않음").
  await page.screenshot({
    path: `${ROOT}/${TAG}-toplayer-notice-crop-${mode}.png`,
    clip: { x: 1140, y: 870, width: 460, height: 130 },
  });

  // --- and the reverse order: dialog first, THEN a fresh popover ----------
  // Proves the ordering rule rather than "popover never beats a dialog".
  bucket.orderProof = await page.evaluate(() => {
    const el = document.createElement('div');
    el.setAttribute('popover', 'manual');
    el.setAttribute('data-qa8-order-proof', '');
    el.style.cssText =
      'position:fixed;inset:auto 24px 24px auto;width:200px;height:60px;background:#0f0;margin:0;border:0;padding:0;';
    document.body.appendChild(el);
    el.showPopover?.();
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    const res = {
      shownAfterDialog: true,
      hitTestTag: hit?.tagName.toLowerCase() ?? null,
      hitIsSelf: hit === el,
    };
    el.remove();
    return res;
  });

  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-modal-toplayer.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
