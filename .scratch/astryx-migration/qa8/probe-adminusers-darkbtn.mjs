/** qa8 helper — find the header dark-mode toggle on /admin/users. */
import { chromium } from '@playwright/test';
const ROOT = '.scratch/astryx-migration/qa8';
const b = await chromium.launch();
const c = await b.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const p = await c.newPage();
p.setDefaultNavigationTimeout(180000);
await p.goto('https://to-astryx.backend-ai-webui.localhost:1357/admin/users', {
  waitUntil: 'domcontentloaded',
});
await p.waitForTimeout(8000);
console.log(
  JSON.stringify(
    await p.evaluate(() =>
      [...document.querySelectorAll('button')].slice(0, 45).map((x) => ({
        al: x.getAttribute('aria-label'),
        t: x.title,
        cls: (x.className || '').toString().slice(0, 40),
        txt: x.textContent?.trim().slice(0, 24),
      })),
    ),
    null,
    1,
  ),
);
await b.close();
