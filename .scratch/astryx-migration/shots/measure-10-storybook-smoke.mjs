/**
 * Ticket 10 — Storybook smoke: representative BUI stories must render under
 * the theme shim (built storybook served at localhost:6016).
 *
 *   cd packages/backend.ai-ui/storybook-static && python3 -m http.server 6016 &
 *   node .scratch/astryx-migration/shots/measure-10-storybook-smoke.mjs
 */
import { chromium } from '@playwright/test';

const IDS = [
  'flex-baiflex--default', // gap tokens through the shim
  'card-baicard--default',
  'table-baitable--default', // createStyles token-as-props conversion
  'modal-baimodal--default',
  'select-baiselect--default', // createStyles token-as-props conversion
  'table-bainameactioncell--default', // createStyles token-as-props conversion
  'alert-baialert--default', // createStyles token-as-props conversion
  'link-bailink--default', // createStyles token-as-props conversion
];

const browser = await chromium.launch();
const page = await browser.newPage();
let failed = 0;

for (const id of IDS) {
  const errors = [];
  const onPageError = (e) => errors.push(`pageerror: ${e.message}`);
  const onConsole = (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  };
  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  await page.goto(`http://localhost:6016/iframe.html?id=${id}&viewMode=story`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(500);

  const htmlLen = await page
    .locator('#storybook-root')
    .innerHTML()
    .then((h) => h.trim().length)
    .catch(() => 0);
  const overlay = await page
    .locator('.sb-show-errordisplay')
    .isVisible()
    .catch(() => false);
  // Liveness: a probed shim token must produce a real value in the page —
  // resolve --spacing-3 (antd marginSM=12) under the neutral scope.
  const probed = await page.evaluate(() => {
    const host = document.createElement('div');
    host.setAttribute('data-astryx-theme', 'neutral');
    const el = document.createElement('div');
    el.style.setProperty('padding-top', 'var(--spacing-3)');
    host.appendChild(el);
    document.body.appendChild(host);
    const v = getComputedStyle(el).paddingTop;
    host.remove();
    return v;
  });

  page.off('pageerror', onPageError);
  page.off('console', onConsole);

  const ok = htmlLen > 0 && !overlay && errors.length === 0 && probed === '12px';
  if (!ok) failed += 1;
  console.log(
    `${ok ? 'PASS' : 'FAIL'}  ${id}  html=${htmlLen}  overlay=${overlay}  probe(--spacing-3)=${probed}` +
      (errors.length ? `\n      ${errors.slice(0, 3).join('\n      ')}` : ''),
  );
}

await browser.close();
console.log(failed === 0 ? 'SMOKE: ALL PASS' : `SMOKE: ${failed} FAILED`);
process.exit(failed === 0 ? 0 : 1);
