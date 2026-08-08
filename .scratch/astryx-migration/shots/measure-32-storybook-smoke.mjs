/**
 * Ticket 32 — Storybook smoke over the FULL story index (extends ticket 10's
 * 8-story spot check to every `type: "story"` entry in `index.json`).
 *
 *   cd packages/backend.ai-ui && pnpm exec storybook build
 *   cd storybook-static && python3 -m http.server 5775 &
 *   node .scratch/astryx-migration/shots/measure-32-storybook-smoke.mjs [port] [outDir] [concurrency]
 *
 * For each story: load the iframe directly (viewMode=story, no manager
 * chrome), assert no error overlay, zero console/page errors (excluding raw
 * browser resource-load 404s — see FAIL CLASSIFICATION below), and non-empty
 * #storybook-root content. A story that fails the first pass gets ONE retry
 * (headless-Chromium-under-sequential-load flakiness is real at this scale —
 * see TIMING below). Representative IDs (one per NEW Astryx-era component +
 * a couple of notably-fixed legacy ones) get a light+dark screenshot.
 *
 * TIMING: the iframe's `load` event fires well before the story actually
 * commits (Vite chunk fetch + eval + Suspense/i18n settling measured up to
 * ~1.6s past `load` for some stories) — a fixed short wait after `load`
 * produces false negatives. This polls #storybook-root instead, up to 8s.
 *
 * FAIL CLASSIFICATION: a `console: Failed to load resource … 404` line is a
 * browser network-status log, not a JS/React error — it fires for the same
 * reason a broken <img src> would in the real app, and conflating it with
 * actual render failures would make an unrelated missing static asset block
 * the whole migration gate. `pageerror` (thrown exceptions) and explicit
 * `console.error(...)` calls from React/the app are NOT filtered.
 *
 * DARK MODE: `@vueless/storybook-dark-mode`'s `useDarkMode()` reads
 * `localStorage['sb-addon-themes-3']` — NOT `prefers-color-scheme` — and
 * only the toolbar (manager UI, not loaded when hitting /iframe.html
 * directly) ever writes it. `page.emulateMedia({colorScheme})` therefore has
 * NO effect on this repo's dark/light toggle; write the addon's localStorage
 * key directly before reloading.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.argv[2] || '5775';
const OUT_DIR = process.argv[3] || path.join(import.meta.dirname, '32');
const CONCURRENCY = Number(process.argv[4] || 6);
const BASE = `http://localhost:${PORT}`;

fs.mkdirSync(OUT_DIR, { recursive: true });

const indexRes = await fetch(`${BASE}/index.json`);
const index = await indexRes.json();
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story',
);

console.log(
  `Story index: ${stories.length} stories (${Object.keys(index.entries).length} total entries incl. docs)`,
);

// Representative IDs to screenshot light+dark — new Astryx-era components +
// a couple of notably-fixed legacy ones (PowerSearch renderInput demos).
const SHOOT_IDS = [
  'table-baitableastryx--default',
  'select-baicomplexselect--default',
  'fragments-baiuserselectastryx--default',
  'filter-baipropertyfilter--with-render-input',
  'filter-baigraphqlpropertyfilter--with-custom-type',
];

// A browser-level "resource failed to load" console line is not a render
// error (see FAIL CLASSIFICATION above).
const isNetworkNoise = (text) =>
  /^console: Failed to load resource: the server responded with a status of \d+/.test(
    text,
  );

const browser = await chromium.launch();

async function setDarkMode(page, mode) {
  await page.evaluate((m) => {
    localStorage.setItem(
      'sb-addon-themes-3',
      JSON.stringify({
        classTarget: 'body',
        current: m,
        darkClass: ['dark'],
        lightClass: ['light'],
        stylePreview: false,
        userHasExplicitlySetTheTheme: true,
      }),
    );
  }, mode);
}

async function checkStory(id) {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') {
      const text = `console: ${m.text()}`;
      if (!isNetworkNoise(text)) errors.push(text);
    }
  });

  let htmlLen = 0;
  let overlay = false;
  let navError = null;
  try {
    await page.goto(`${BASE}/iframe.html?id=${id}&viewMode=story`, {
      waitUntil: 'load',
      timeout: 30000,
    });
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline) {
      htmlLen = await page
        .locator('#storybook-root')
        .innerHTML()
        .then((h) => h.trim().length)
        .catch(() => 0);
      overlay = await page
        .locator('.sb-show-errordisplay, #error-message')
        .first()
        .isVisible()
        .catch(() => false);
      if (htmlLen > 0 || overlay) break;
      await page.waitForTimeout(200);
    }
    // Settle window: let any error thrown just after first paint (e.g. an
    // effect) surface before we snapshot `errors`.
    await page.waitForTimeout(300);
  } catch (e) {
    navError = e.message;
  }

  const ok = !navError && htmlLen > 0 && !overlay && errors.length === 0;

  if (ok && SHOOT_IDS.includes(id)) {
    for (const modeName of ['light', 'dark']) {
      await setDarkMode(page, modeName);
      await page.reload({ waitUntil: 'load' });
      // Re-poll after reload — same commit-timing caveat as above.
      const shootDeadline = Date.now() + 8000;
      while (Date.now() < shootDeadline) {
        const len = await page
          .locator('#storybook-root')
          .innerHTML()
          .then((h) => h.trim().length)
          .catch(() => 0);
        if (len > 0) break;
        await page.waitForTimeout(200);
      }
      await page.waitForTimeout(300);
      const safeId = id.replace(/[^a-z0-9-]/gi, '_');
      await page.screenshot({
        path: path.join(OUT_DIR, `${safeId}-${modeName}.png`),
        fullPage: true,
      });
    }
  }

  await page.close();
  return { id, ok, htmlLen, overlay, navError, errors };
}

async function runOne(entry) {
  let r = await checkStory(entry.id);
  if (!r.ok) {
    // One retry — sequential/concurrent headless navigation under load is
    // occasionally flaky (transient resource contention), not necessarily a
    // real bug.
    const retry = await checkStory(entry.id);
    if (retry.ok) {
      r = { ...retry, retried: true };
    } else {
      r = { ...r, retried: true, retryResult: retry };
    }
  }
  const full = { ...r, title: entry.title };
  console.log(
    `${r.ok ? 'PASS' : 'FAIL'}  ${entry.id}  html=${r.htmlLen}  overlay=${r.overlay}` +
      (r.retried ? '  [retried]' : '') +
      (r.navError ? `  navError=${r.navError}` : '') +
      (r.errors?.length
        ? `\n      ${r.errors.slice(0, 3).join('\n      ')}`
        : ''),
  );
  return full;
}

const queue = [...stories];
const results = [];
async function worker() {
  while (queue.length) {
    const entry = queue.shift();
    if (!entry) break;
    results.push(await runOne(entry));
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

await browser.close();

const failed = results.filter((r) => !r.ok);
fs.writeFileSync(
  path.join(OUT_DIR, 'smoke-results.json'),
  JSON.stringify(
    { total: results.length, failed: failed.length, results },
    null,
    2,
  ),
);

console.log(
  `\nSMOKE: ${results.length - failed.length}/${results.length} passed`,
);
if (failed.length) {
  console.log('FAILED IDs:');
  for (const f of failed) console.log(`  - ${f.id}`);
}
process.exit(failed.length === 0 ? 0 : 1);
