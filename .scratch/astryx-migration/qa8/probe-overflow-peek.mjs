import { chromium } from '@playwright/test';
const BASE = 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = '.scratch/astryx-migration/qa8';
const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const p = await c.newPage();
await p.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('table tbody tr', { timeout: 120000 });
await p.waitForTimeout(5000);
console.log(
  await p.evaluate(
    () =>
      document.querySelector('table tbody tr td:nth-child(2)')?.outerHTML ?? '',
  ),
);
await b.close();
