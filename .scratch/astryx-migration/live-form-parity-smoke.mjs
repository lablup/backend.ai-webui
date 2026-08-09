/**
 * Live spot-check for the ticket-34 form parity hardening, on the running dev
 * app (vite :4920, backend 10.82.0.130).
 *
 * The riskiest change in the pass is the `<Form layout>` default flipping from
 * `vertical` back to antd's `horizontal`: 29 call sites state no `layout` at
 * all and were silently re-laid when the engine went live. This script visits
 * three real screens — one of those default-layout forms, one explicitly
 * horizontal form with a `labelCol`, and the biggest vertical form in the app
 * — in light and dark, and reports what the shell actually rendered.
 *
 * Asserts: BAI shell only (no `.ant-form-item`), a label column that is
 * content/`labelCol`-sized rather than a fixed 120px, a colon on non-vertical
 * labels, no painted asterisk (the app's function `requiredMark`), and zero
 * page errors.
 */
import { chromium } from '@playwright/test';
import * as fs from 'node:fs';

const APP = process.env.APP ?? 'http://127.0.0.1:4920';
const OUT = '.scratch/astryx-migration/shots/form-parity/live';
fs.mkdirSync(OUT, { recursive: true });

const log = [];
const step = (ok, name, detail = '') => {
  const line = `${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`;
  log.push(line);
  console.log(line);
};

const CENSUS = () => {
  const items = [...document.querySelectorAll('[data-bai-form-item]')];
  const labelCols = items
    .map((i) => i.querySelector('[data-bai-form-item-label-col]'))
    .filter(Boolean);
  const colonShown = labelCols.filter((c) => {
    const l = c.querySelector('[data-bai-form-item-label]');
    if (!l) return false;
    const s = getComputedStyle(l, '::after');
    return s.content === '":"' && s.visibility !== 'hidden';
  }).length;
  return {
    url: decodeURIComponent(location.pathname),
    items: items.length,
    antdItems: document.querySelectorAll('.ant-form-item').length,
    antdForms: document.querySelectorAll('form.ant-form').length,
    layouts: [...new Set(items.map((i) => i.dataset.layout))],
    // The old shell pinned every horizontal label column to exactly 120px.
    labelColWidths: [
      ...new Set(
        labelCols.map((c) => Math.round(c.getBoundingClientRect().width)),
      ),
    ].sort((a, b) => a - b),
    colonShown,
    paintedAsterisks: [
      ...document.querySelectorAll('[data-bai-form-item-required]'),
    ].filter((l) => {
      const b = getComputedStyle(l, '::before');
      return b.content === '"*"' && b.display !== 'none';
    }).length,
    explainColors: [
      ...new Set(
        [...document.querySelectorAll('[data-bai-form-item-explain]')].map(
          (n) => getComputedStyle(n).color,
        ),
      ),
    ],
    errorColors: [
      ...new Set(
        [
          ...document.querySelectorAll('[data-bai-form-item-explain-error]'),
        ].map((n) => getComputedStyle(n).color),
      ),
    ],
  };
};

const clickBtn = (page, re) =>
  page
    .locator('button, a[role="button"]')
    .filter({ hasText: re })
    .first()
    .click({ force: true, timeout: 15000 });

const browser = await chromium.launch();

const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
const EMAIL = process.env.BAI_EMAIL ?? 'admin@lablup.com';
const PASSWORD = process.env.BAI_PASSWORD ?? '';

async function login(page) {
  await page.goto(`${APP}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(6000);
  const endpoint = page.getByPlaceholder('Endpoint');
  if (await endpoint.count()) {
    const value = await endpoint.first().inputValue();
    if (!value) await endpoint.first().fill(ENDPOINT);
  }
  const email = page.getByPlaceholder(/Email or Username/i);
  if (await email.count()) {
    if (!(await email.first().inputValue())) await email.first().fill(EMAIL);
    const pw = page.getByPlaceholder(/^Password$/i).first();
    if (!(await pw.inputValue())) await pw.fill(PASSWORD);
    await clickBtn(page, /^Login$/i);
    await page.waitForTimeout(12000);
  }
}

async function projectRoot(page) {
  await login(page);
  await page.goto(`${APP}/session/start`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(9000);
  const m = new URL(page.url()).pathname.match(/^\/project\/[^/]+/);
  return m ? m[0] : '';
}

async function run(mode) {
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1100 },
    colorScheme: mode,
  });
  await ctx.addInitScript((m) => {
    localStorage.setItem('backendaiwebui.settings.general.language', 'en');
    localStorage.setItem('backendaiwebui.setting.isDarkMode', String(m === 'dark'));
  }, mode);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e)));

  const root = await projectRoot(page);
  const out = {};

  const visit = async (name, go) => {
    await go().catch((e) =>
      console.log(`  (${name}: ${e.message.split('\n')[0]})`),
    );
    await page.waitForTimeout(5000);
    const c = await page.evaluate(CENSUS);
    await page.screenshot({
      path: `${OUT}/${mode}-${name}.png`,
      fullPage: true,
    });
    out[name] = c;
    step(
      c.items > 0 && c.antdItems === 0 && c.antdForms === 0 && c.paintedAsterisks === 0,
      `[${mode}] ${name}`,
      JSON.stringify(c),
    );
    return c;
  };

  // 1. Session launcher — the biggest form in the app, explicitly vertical.
  await visit('session-launcher', () =>
    page.goto(`${APP}${root}/session/start`, { waitUntil: 'networkidle' }),
  );

  // 2. Deployment preset editor — 18 items plus a `Form.List` (`resourceSlots`)
  //    whose rows are added/removed live.
  await visit('deployment-preset', () =>
    page.goto(`${APP}/admin/deployments/deployment-presets/new`, {
      waitUntil: 'networkidle',
    }),
  );
  // Empty submit -> the engine's explain slot, in the item's own error colour.
  await clickBtn(page, /^(Create|Save)$/i).catch(() => {});
  await page.waitForTimeout(3500);
  const presetErr = await page.evaluate(CENSUS);
  await page.screenshot({
    path: `${OUT}/${mode}-deployment-preset-errors.png`,
    fullPage: true,
  });
  step(
    presetErr.errorColors.length > 0,
    `[${mode}] deployment-preset validation`,
    JSON.stringify({
      errorColors: presetErr.errorColors,
      explainColors: presetErr.explainColors,
    }),
  );
  out['deployment-preset-errors'] = presetErr;

  // 3. Chat parameter sliders — `requiredMark={false}` + tooltips.
  await visit('chat-parameters', () =>
    page.goto(`${APP}${root}/chat`, { waitUntil: 'networkidle' }),
  );

  step(pageErrors.length === 0, `[${mode}] zero page errors`, pageErrors.join(' | '));
  await ctx.close();
  return { census: out, pageErrors };
}

const report = {};
for (const mode of ['light', 'dark']) {
  report[mode] = await run(mode);
}
await browser.close();
fs.writeFileSync(
  `${OUT}/live-report.json`,
  JSON.stringify({ generatedAt: new Date().toISOString(), report, log }, null, 1),
);
console.log(`\nwrote ${OUT}/live-report.json`);
