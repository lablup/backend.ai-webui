// Ticket 04 live verification: antd App.useApp() shim (message/modal) backed
// by Astryx Toast/AlertDialog/Dialog, on the login screen (no backend needed).
//
// Run from repo root with the dev server up on 127.0.0.1:5299:
//   node .scratch/astryx-migration/shots/measure-04-app-shim.mjs
//
// The login screen (LoginView + LoginFormPanel) imports the shim's `App`
// directly; the module also exposes the same singleton as
// `window.__baiAppShim` in dev, which lets us drive the flows whose real
// triggers require a live backend (modal.confirm fires on a 409
// concurrent-session response; message.error on a failed mutation).
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5299';
const OUT = process.env.SHOT_DIR ?? '.scratch/astryx-migration/shots/04';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const b = await chromium.launch();
const ctx = await b.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'light',
});
const p = await ctx.newPage();
await p.addInitScript(() => {
  localStorage.setItem(
    'backendaiwebui.settings.themeMode',
    JSON.stringify('light'),
  );
});
await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(3500);

// ---------------------------------------------------------------- 1. wiring
const hasShim = await p.evaluate(() => !!window.__baiAppShim);
check('shim module loaded by the login screen (window.__baiAppShim)', hasShim);
if (!hasShim) {
  await b.close();
  process.exit(1);
}

// ---------------------------------------------------- 2. message semantics
const msg = await p.evaluate(async () => {
  const shim = window.__baiAppShim;
  const out = {};
  const toastEls = () => [...document.querySelectorAll('.astryx-toast')];

  // thenable + auto-dismiss timing (1s antd seconds -> 1000ms Astryx)
  const t0 = performance.now();
  await shim.message.success('shim-auto-test', 1);
  out.autoHideMs = performance.now() - t0;

  // sticky (duration 0) + success glyph + close handle
  const handle = shim.message.success('shim-sticky-test', 0);
  await new Promise((r) => setTimeout(r, 400));
  const sticky = toastEls().find((e) =>
    e.textContent.includes('shim-sticky-test'),
  );
  out.stickyVisible = !!sticky;
  out.successGlyph = !!sticky?.querySelector('svg');
  out.antdMessageAbsent = !document.querySelector('.ant-message');

  let resolved = false;
  handle.then(() => {
    resolved = true;
  });
  handle(); // manual close via the returned handle
  await new Promise((r) => setTimeout(r, 800));
  out.closeResolved = resolved;
  out.stickyGone = !toastEls().some((e) =>
    e.textContent.includes('shim-sticky-test'),
  );

  // error type mapping
  const errHandle = shim.message.error({ content: 'shim-error-test', duration: 0 });
  await new Promise((r) => setTimeout(r, 400));
  const err = toastEls().find((e) => e.textContent.includes('shim-error-test'));
  out.errorType = err?.getAttribute('data-type') ?? err?.dataset?.type ?? null;
  out.errorVisible = !!err;
  window.__errHandle = errHandle;
  return out;
});
check(
  'message thenable resolves on auto-dismiss (~1s)',
  msg.autoHideMs > 900 && msg.autoHideMs < 3000,
  `${Math.round(msg.autoHideMs)}ms`,
);
check('message duration 0 renders a sticky toast', msg.stickyVisible);
check('success toast carries the severity glyph', msg.successGlyph);
check('close handle dismisses + resolves the promise', msg.closeResolved && msg.stickyGone);
check('message.error object form renders error-typed toast', msg.errorVisible, `data-type=${msg.errorType}`);
check('no antd .ant-message rendered (Astryx owns the toasts)', msg.antdMessageAbsent);

await p.screenshot({ path: `${OUT}/message-error-toast.png` });
await p.evaluate(() => window.__errHandle());
await p.waitForTimeout(600);

// ---------------------------------------- 3. modal.confirm (AlertDialog leg)
await p.evaluate(() => {
  const shim = window.__baiAppShim;
  window.__confirm1 = { resolved: 'pending', onOk: 0, onCancel: 0 };
  shim.modal
    .confirm({
      title: 'Concurrent session detected',
      content: 'Continue login and disconnect the other session?',
      okText: 'Login',
      cancelText: 'Cancel',
      onOk: () => {
        window.__confirm1.onOk++;
      },
      onCancel: () => {
        window.__confirm1.onCancel++;
      },
    })
    .then((v) => {
      window.__confirm1.resolved = v;
    });
});
const dlg = p.locator('dialog', { hasText: 'Concurrent session detected' });
await dlg.waitFor({ state: 'visible', timeout: 5000 });
check(
  'modal.confirm renders a native alertdialog',
  (await dlg.getAttribute('role')) === 'alertdialog',
);
await p.screenshot({ path: `${OUT}/modal-confirm-alertdialog.png` });
await dlg.getByRole('button', { name: 'Cancel' }).click();
await p.waitForTimeout(300);
const c1 = await p.evaluate(() => window.__confirm1);
check(
  'cancel fires onCancel and resolves false (antd promise semantics)',
  c1.onCancel === 1 && c1.onOk === 0 && c1.resolved === false,
  JSON.stringify(c1),
);

// ------------------------------- 4. async onOk: loading, close-on-resolve
await p.evaluate(() => {
  const shim = window.__baiAppShim;
  window.__confirm2 = { resolved: 'pending' };
  shim.modal
    .confirm({
      title: 'Async ok test',
      content: 'onOk resolves after 1.2s',
      okText: 'Proceed',
      onOk: () => new Promise((r) => setTimeout(r, 1200)),
    })
    .then((v) => {
      window.__confirm2.resolved = v;
    });
});
const dlg2 = p.locator('dialog', { hasText: 'Async ok test' });
await dlg2.waitFor({ state: 'visible', timeout: 5000 });
await dlg2.getByRole('button', { name: 'Proceed' }).click();
await p.waitForTimeout(500);
const stillOpen = await dlg2.isVisible();
await p.waitForTimeout(1500);
const c2 = await p.evaluate(() => window.__confirm2);
const closedAfter = !(await dlg2.isVisible().catch(() => false));
check(
  'async onOk keeps the dialog open until resolve, then closes + resolves true',
  stillOpen && closedAfter && c2.resolved === true,
  `openDuringPromise=${stillOpen} closedAfter=${closedAfter} resolved=${c2.resolved}`,
);

// ------------------------------- 5. rejected onOk keeps open; Escape cancels
await p.evaluate(() => {
  const shim = window.__baiAppShim;
  window.__confirm3 = { resolved: 'pending', onCancel: 0 };
  shim.modal
    .confirm({
      title: 'Reject test',
      content: 'onOk rejects',
      okText: 'Try',
      onOk: () => Promise.reject(new Error('nope')),
      onCancel: () => {
        window.__confirm3.onCancel++;
      },
    })
    .then((v) => {
      window.__confirm3.resolved = v;
    });
});
const dlg3 = p.locator('dialog', { hasText: 'Reject test' });
await dlg3.waitFor({ state: 'visible', timeout: 5000 });
await dlg3.getByRole('button', { name: 'Try' }).click();
await p.waitForTimeout(600);
const openAfterReject = await dlg3.isVisible();
await p.keyboard.press('Escape');
await p.waitForTimeout(400);
const c3 = await p.evaluate(() => window.__confirm3);
check(
  'rejected onOk keeps dialog open; Escape then cancels (resolve false)',
  openAfterReject && c3.onCancel === 1 && c3.resolved === false,
  `openAfterReject=${openAfterReject} ${JSON.stringify(c3)}`,
);

// --------------------------- 6. modal.error -> single-button Dialog branch
await p.evaluate(() => {
  const shim = window.__baiAppShim;
  window.__err1 = { resolved: 'pending', onOk: 0 };
  shim.modal
    .error({
      title: 'Login failed',
      content: 'Something went wrong on the server.',
      onOk: () => {
        window.__err1.onOk++;
      },
    })
    .then((v) => {
      window.__err1.resolved = v;
    });
});
const dlg4 = p.locator('dialog', { hasText: 'Login failed' });
await dlg4.waitFor({ state: 'visible', timeout: 5000 });
const buttonNames = await dlg4.getByRole('button').allTextContents();
await p.screenshot({ path: `${OUT}/modal-error-dialog.png` });
await dlg4.getByRole('button', { name: 'OK' }).click();
await p.waitForTimeout(300);
const e1 = await p.evaluate(() => window.__err1);
check(
  'modal.error renders OK-only footer and resolves true on OK',
  !buttonNames.some((n) => /cancel/i.test(n)) &&
    e1.onOk === 1 &&
    e1.resolved === true,
  `buttons=${JSON.stringify(buttonNames)} ${JSON.stringify(e1)}`,
);

// ---------------------------------------------------------------- summary
await b.close();
const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`,
);
process.exit(failed.length ? 1 : 0);
