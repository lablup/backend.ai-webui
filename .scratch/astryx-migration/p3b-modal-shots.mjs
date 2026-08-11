/**
 * Phase 3 / ticket B — live evidence for the Astryx-backed BUI modal family.
 *
 *   node .scratch/astryx-migration/p3b-login.mjs      # once, persists state
 *   node .scratch/astryx-migration/p3b-modal-shots.mjs
 *
 * Endpoint/credentials never live in this file; the login script persists a
 * browser storage state at BAI_STATE.
 */
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = (process.env.BAI_WEBUI ?? 'http://127.0.0.1:5820').replace(/\/$/, '');
const STATE = process.env.BAI_STATE ?? '/tmp/p3b-state.json';
const OUT = '.scratch/astryx-migration/shots/p3-b';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const log = (k, v) => {
  results[k] = v;
  console.log(`\n### ${k}\n` + JSON.stringify(v, null, 2));
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: STATE,
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const setScheme = async (scheme) => {
  await page.emulateMedia({ colorScheme: scheme });
  await page.waitForTimeout(600);
};

/** Probe whatever native <dialog> is currently open. */
const probeDialog = () =>
  page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    if (!d) return { open: false };
    const cs = getComputedStyle(d);
    const heading = d.querySelector('h2');
    return {
      open: true,
      role: d.getAttribute('role'),
      ariaModal: d.getAttribute('aria-modal'),
      hasAriaLabelledBy: !!d.getAttribute('aria-labelledby'),
      title: heading?.textContent?.trim().slice(0, 80) ?? null,
      width: cs.width,
      background: cs.backgroundColor,
      // The whole point of the ticket: no antd DOM left inside the shell.
      antNodesInside: d.querySelectorAll('[class*="ant-"]').length,
      astryxButtons: [...d.querySelectorAll('button.astryx-button')].map((b) => ({
        label: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 32),
        variant: b.getAttribute('data-variant'),
        disabled: b.disabled || b.getAttribute('aria-disabled') === 'true',
        busy: b.getAttribute('aria-busy') === 'true',
      })),
    };
  });

const goto = async (route) => {
  await page.goto(BASE + route, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(9000);
};

const clickText = async (name, opts = {}) => {
  await page.getByRole('button', { name, exact: false }).first().click(opts);
  await page.waitForTimeout(1500);
};

/* =============================================== 1. info modal (BUI BAIModal) */
await goto('/admin/resource-policy');
await clickText(/^Info$/);
log('1-info-modal', await probeDialog());
await shot('01-info-modal-light');
await setScheme('dark');
await shot('02-info-modal-dark');
await setScheme('light');
// Escape must dismiss (antd `keyboard` default).
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
log('1-info-modal-after-escape', await probeDialog());

/* ========================================== 2. settings modal (BAIModal+Form) */
await clickText(/^Edit$/);
log('2-settings-modal', await probeDialog());
await shot('03-settings-modal-light');
await setScheme('dark');
await shot('04-settings-modal-dark');
await setScheme('light');
// Backdrop click: antd's `maskClosable` default is true -> Astryx purpose 'info'.
await page.mouse.click(20, 20);
await page.waitForTimeout(900);
log('2-settings-modal-after-backdrop-click', await probeDialog());

/* ================================== 3. typed-confirm delete (BAIDeleteConfirm) */
await clickText(/^Delete$/);
log('3-delete-modal-initial', await probeDialog());
await shot('05-delete-typed-confirm-light');
await setScheme('dark');
await shot('06-delete-typed-confirm-dark');
await setScheme('light');

const confirmInput = page.locator('dialog[open] input[type="text"]').first();
await confirmInput.fill('definitely-wrong');
await page.waitForTimeout(500);
log('3-delete-modal-wrong-text', await probeDialog());

// The exact string to type is echoed in the label.
const expected = await page.evaluate(() => {
  const d = document.querySelector('dialog[open]');
  const code = d?.querySelector('code, [class*="code"]');
  return code?.textContent?.trim() ?? null;
});
log('3-delete-expected-confirm-string', expected);
if (expected) {
  await confirmInput.fill(expected);
  await page.waitForTimeout(600);
  log('3-delete-modal-exact-text', await probeDialog());
  await shot('07-delete-typed-confirm-enabled');
}
// Cancel — this run must not destroy real data.
await page.getByRole('button', { name: /^Cancel$/i }).first().click();
await page.waitForTimeout(900);
log('3-delete-modal-after-cancel', await probeDialog());

/* ======================================================= 4. folder create */
await goto('/data');
await clickText(/Create Folder/);
log('4-folder-create-modal', await probeDialog());
await shot('08-folder-create-light');
await setScheme('dark');
await shot('09-folder-create-dark');
await setScheme('light');
await page.keyboard.press('Escape');
await page.waitForTimeout(800);
log('4-folder-create-after-escape', await probeDialog());

fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
log('pageErrors', pageErrors.slice(0, 10));
await browser.close();
