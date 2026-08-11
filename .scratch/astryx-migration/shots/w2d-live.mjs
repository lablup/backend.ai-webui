/**
 * W2-D live verification — log in against the shared cluster and walk the
 * surfaces that render this ticket's converted components, in BOTH themes.
 *
 *   node .scratch/astryx-migration/shots/w2d-live.mjs [port] [outDir]
 *
 * Per route: screenshot, collect pageerrors + console errors, and record a few
 * structural probes (how many of the converted controls actually rendered).
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const PORT = process.argv[2] || '5880';
const OUT = process.argv[3] || path.join(import.meta.dirname, 'p3-w2d');
const BASE = `http://127.0.0.1:${PORT}`;
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['agent', '/agent'],
  ['reservoir', '/reservoir'],
  ['session', '/session'],
  ['data', '/data'],
  ['serving', '/serving'],
  ['project', '/admin/project'],
  ['users', '/admin/users'],
  ['summary', '/summary'],
];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`[console] ${m.text()}`);
});

async function login() {
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  // The dev env pre-fills endpoint/email/password; just submit.
  const loginBtn = page
    .locator('button:has-text("Login"), button:has-text("LOGIN")')
    .first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await loginBtn.click();
  }
  await page.waitForTimeout(8000);
}

async function setTheme(mode) {
  // Same approach p3-c used: click the header's real theme toggle, then
  // ASSERT the resolved mode — writing a localStorage key guesses at an
  // internal contract and silently no-ops if the key is wrong (which is
  // exactly what happened on the first pass here).
  const label = mode === 'dark' ? /^dark mode$/i : /^light mode$/i;
  await page
    .getByRole('button', { name: label })
    .first()
    .click({ timeout: 15000 });
  await page.waitForTimeout(3000);
  const resolved = await page.evaluate(() => ({
    dataTheme: document.documentElement.getAttribute('data-theme'),
    bodyClass: document.body.className,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  }));
  console.log(
    `theme toggle -> requested=${mode} data-theme=${resolved.dataTheme} bodyBg=${resolved.bodyBg}`,
  );
  if (resolved.dataTheme !== mode) {
    throw new Error(
      `theme did not apply (requested=${mode}, data-theme=${resolved.dataTheme})`,
    );
  }
}

const results = [];

async function visit(name, route, theme) {
  const before = errors.length;
  await page.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const probe = await page.evaluate(() => ({
    baiCards: document.querySelectorAll('.bai-card').length,
    astryxButtons: document.querySelectorAll('.astryx-button').length,
    astryxBadges: document.querySelectorAll('.astryx-badge').length,
    astryxSelectors: document.querySelectorAll('.astryx-selector').length,
    astryxTables: document.querySelectorAll('table').length,
    tableRows: document.querySelectorAll('tbody tr').length,
    antNodes: document.querySelectorAll(
      '.ant-card, .ant-btn, .ant-select, .ant-tag, .ant-badge',
    ).length,
    unnamedButtons: Array.from(document.querySelectorAll('button')).filter(
      (b) => !b.textContent?.trim() && !b.getAttribute('aria-label'),
    ).length,
  }));
  await page.screenshot({
    path: path.join(OUT, `live-${name}-${theme}.png`),
    fullPage: false,
  });
  results.push({
    route,
    theme,
    ...probe,
    newErrors: errors.slice(before),
  });
  console.log(
    `${theme} ${route} :: cards=${probe.baiCards} buttons=${probe.astryxButtons} badges=${probe.astryxBadges} selectors=${probe.astryxSelectors} rows=${probe.tableRows} antNodes=${probe.antNodes} unnamedBtns=${probe.unnamedButtons} errs=${errors.length - before}`,
  );
}

await login();
await page.screenshot({ path: path.join(OUT, 'live-00-after-login.png') });

for (const [name, route] of ROUTES) await visit(name, route, 'light');
await setTheme('dark');
for (const [name, route] of ROUTES) await visit(name, route, 'dark');

fs.writeFileSync(
  path.join(OUT, 'live-results.json'),
  JSON.stringify({ results, allErrors: errors }, null, 2),
);
console.log(`\nTOTAL console/page errors: ${errors.length}`);
for (const e of [...new Set(errors)].slice(0, 30)) console.log('  ', e);
await browser.close();
