/**
 * qa8 BATCH-3 Q-37 / Q-38 — the measurement (same file runs before and after).
 *
 *   TAG=before node .scratch/astryx-migration/qa8/probe-b3-accent-measure.mjs
 *
 * Surfaces:
 *   A. session detail drawer  (BRAND route — antd `colorLink`  #ff7a00/#be5e06)
 *   B. /admin/environment     (ADMIN route — antd `colorInfo`  #028df2/#0387bf)
 *
 * Read-only: it navigates, opens the drawer, hovers. No mutation.
 */
import {
  launch,
  setMode,
  settle,
  themeVars,
  restAndHover,
  BASE,
  ROOT,
} from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const TAG = process.env.TAG ?? 'before';
const VARS = [
  '--color-text-accent',
  '--color-text-primary',
  '--color-accent',
  '--color-accent-muted',
];
const { browser, page, pageErrors } = await launch();
const out = { tag: TAG, at: new Date().toISOString() };

const DRAWER_BTNS = [
  'Session Scheduling History', // SessionDetailContent — status/history
  'Copy', // EditableSessionName — session name copy (and, AFTER Q-38, BAIText's)
  'Edit', // EditableSessionName — rename
  'button.Copy', // BAIText copyable  (Q-38: the broken key, BEFORE only)
];
const ENV_BTNS = ['Edit Minimum Image Resource Limit', 'Manage Apps'];
/** Neutral controls that must NOT move — the standing control for the sweep. */
const CONTROL_BTNS = ['Close', 'See Container Logs'];

for (const mode of ['light', 'dark']) {
  const rec = (out[mode] = {});

  // ---- A. session detail drawer -----------------------------------------
  await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await settle(page);
  await setMode(page, mode);
  await settle(page);
  // The session LIST's own rename control (SessionInfoCell) — same cluster.
  rec.listRename = await restAndHover(page, 'tbody', 'Edit');

  const link = page.locator('tbody a, tbody button').first();
  await link.click({ timeout: 20000 });
  await page.waitForTimeout(6000);
  await settle(page);

  rec.sessionVars = await themeVars(page, VARS);
  rec.drawer = {};
  for (const l of [...DRAWER_BTNS, ...CONTROL_BTNS]) {
    rec.drawer[l] = await restAndHover(page, '.astryx-drawer', l);
  }
  rec.drawerCopyLabels = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.astryx-drawer button'))
      .map((b) => b.getAttribute('aria-label'))
      .filter((l) => l && /copy/i.test(l)),
  );
  rec.drawerAccentButtons = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('.astryx-drawer .bai-action-accent'),
    ).map((b) => ({
      label: b.getAttribute('aria-label'),
      color: getComputedStyle(b).color,
    })),
  );
  await page.screenshot({
    path: `${ROOT}/../shots/q37-accent/${TAG}-drawer-${mode}.png`,
    clip: { x: 800, y: 60, width: 800, height: 420 },
  });

  // Q-38 in Korean. `window.switchLanguage` only dispatches a `langChanged`
  // CustomEvent that `useCurrentLanguage` handles in memory (and BUI's own
  // i18next instance follows through `BAIConfigProvider`), so this writes
  // nothing to the cluster. Switched straight back to English afterwards.
  await page.evaluate(() => window.switchLanguage?.('ko'));
  await page.waitForTimeout(2500);
  rec.copyLabelsKo = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.astryx-drawer button'))
      .map((b) => b.getAttribute('aria-label'))
      .filter((l) => l && /copy|복사/i.test(l)),
  );
  await page.evaluate(() => window.switchLanguage?.('en'));
  await page.waitForTimeout(2000);

  // ---- B. /admin/environment --------------------------------------------
  await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await settle(page);
  rec.envVars = await themeVars(page, VARS);
  rec.env = {};
  for (const l of ENV_BTNS) {
    rec.env[l] = await restAndHover(page, 'body', l);
  }
  await page.screenshot({
    path: `${ROOT}/../shots/q37-accent/${TAG}-env-${mode}.png`,
    clip: { x: 900, y: 200, width: 700, height: 400 },
  });
}

out.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/b3-accent-${TAG}.json`,
  JSON.stringify(out, null, 2) + '\n',
);
console.log(JSON.stringify(out, null, 2));
await browser.close();
