/** qa8 helper — what does the CreateUser ButtonGroup overflow menu render? */
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
await p.waitForTimeout(9000);
const btns = await p.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((x, i) => ({
      i,
      al: x.getAttribute('aria-label'),
      txt: x.textContent?.trim().slice(0, 20),
      cls: (x.className || '').toString().slice(0, 30),
      x: Math.round(x.getBoundingClientRect().x),
      y: Math.round(x.getBoundingClientRect().y),
    }))
    .filter((o) => /more/i.test(o.al ?? '') || /more/i.test(o.txt ?? '')),
);
console.log('moreButtons', JSON.stringify(btns));
await p.locator('button[aria-label*="More" i]').last().click();
await p.waitForTimeout(1200);
console.log(
  'menu',
  JSON.stringify(
    await p.evaluate(() =>
      [
        ...document.querySelectorAll(
          '[role="menuitem"],[role="option"],[class*="dropdown-menu"] button,[class*="menu-item" i]',
        ),
      ].map((n) => ({
        role: n.getAttribute('role'),
        tag: n.tagName,
        cls: (n.className || '').toString().slice(0, 40),
        txt: n.textContent?.trim().slice(0, 40),
      })),
    ),
  ),
);
await b.close();
