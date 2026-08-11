/**
 * Phase 3 / ticket B — OK-button loading + real submit/destroy round trip.
 *
 * Creates a throwaway keypair resource policy through the BUI `BAIModal`
 * (`confirmLoading` -> Astryx `Button.isLoading`), then removes it through
 * `BAIDeleteConfirmModal`'s typed-confirm gate. Self-cleaning: the only row it
 * touches is the one it created.
 */
import fs from 'node:fs';
import { chromium } from '@playwright/test';

const BASE = (process.env.BAI_WEBUI ?? 'http://127.0.0.1:5820').replace(/\/$/, '');
const STATE = process.env.BAI_STATE ?? '/tmp/p3b-state.json';
const OUT = '.scratch/astryx-migration/shots/p3-b';
const NAME = 'p3b-astryx-check';
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

const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const okBtnState = () =>
  page.evaluate(() => {
    const d = document.querySelector('dialog[open]');
    if (!d) return { open: false };
    const btns = [...d.querySelectorAll('button.astryx-button')];
    const last = btns[btns.length - 1];
    return {
      open: true,
      label: last?.textContent?.trim(),
      variant: last?.getAttribute('data-variant'),
      busy: last?.getAttribute('aria-busy') === 'true',
      disabled: last?.disabled ?? null,
      hasSpinner: !!last?.querySelector('svg[class*="spin"], [class*="spinner"]'),
    };
  });

await page.goto(BASE + '/admin/resource-policy', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);

/* ------------------------------------------------------------------ create */
await page.getByRole('button', { name: /Create Policy/i }).first().click();
await page.waitForTimeout(2000);
await page.locator('dialog[open] input#name, dialog[open] input[id$="name"]').first()
  .fill(NAME)
  .catch(async () => {
    await page.locator('dialog[open] input[type="text"]').first().fill(NAME);
  });
await page.waitForTimeout(500);
await shot('10-create-policy-modal');
log('create-modal-before-submit', await okBtnState());

// Slow the network so the in-flight loading state is observable.
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 1200,
  downloadThroughput: -1,
  uploadThroughput: -1,
});
await page.getByRole('button', { name: /^(Create|Save|OK)$/i }).last().click();
await page.waitForTimeout(400);
log('create-modal-while-submitting', await okBtnState());
await shot('11-create-policy-ok-loading');
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 0,
  downloadThroughput: -1,
  uploadThroughput: -1,
});
await page.waitForTimeout(6000);
log('create-modal-after-submit', await okBtnState());
log('row-created', await page.getByText(NAME).count());
await shot('12-after-create');

/* ------------------------------------------------------------------ delete */
const row = page.locator('tr', { hasText: NAME }).first();
await row.getByRole('button', { name: /Delete/i }).first().click();
await page.waitForTimeout(1500);
log('delete-modal-initial', await okBtnState());
const input = page.locator('dialog[open] input[type="text"]').first();
await input.fill(NAME);
await page.waitForTimeout(500);
log('delete-modal-gate-open', await okBtnState());
await shot('13-delete-gate-enabled');
await page.getByRole('button', { name: /^Delete$/i }).last().click();
await page.waitForTimeout(6000);
log('delete-modal-after-confirm', await okBtnState());
log('row-remaining', await page.getByText(NAME).count());
await shot('14-after-delete');

fs.writeFileSync(`${OUT}/ok-loading-results.json`, JSON.stringify(results, null, 2));
log('pageErrors', pageErrors.slice(0, 10));
await browser.close();
