/** qa8 IMPL — selector discovery for Admin > Users (read-only). */
import { chromium } from '@playwright/test';

const BASE = 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = '.scratch/astryx-migration/qa8';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}admin/users`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const out = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('tbody tr')];
  const first = rows[0];
  return {
    rowCount: rows.length,
    firstRowButtons: first
      ? [...first.querySelectorAll('button')].map((b) => ({
          al: b.getAttribute('aria-label'),
          title: b.getAttribute('title'),
          txt: b.textContent?.trim().slice(0, 30),
          disabled: b.disabled,
        }))
      : null,
    allMore: [...document.querySelectorAll('button')]
      .filter((b) => /more/i.test(b.getAttribute('aria-label') || ''))
      .map((b) => ({
        al: b.getAttribute('aria-label'),
        disabled: b.disabled,
        cls: (b.getAttribute('class') || '').slice(0, 40),
      })),
    buttons: [...document.querySelectorAll('button')].map((b) => ({
      al: b.getAttribute('aria-label'),
      txt: b.textContent?.trim().slice(0, 24),
      disabled: b.disabled,
    })),
  };
});
console.log(JSON.stringify(out, null, 2));
await page.screenshot({ path: `${ROOT}/disc-adminusers.png` });
await browser.close();
