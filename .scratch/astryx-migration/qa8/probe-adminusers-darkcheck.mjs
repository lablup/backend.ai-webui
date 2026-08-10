/** qa8 helper — verify the header Dark mode button flips data-theme on /admin/users. */
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
console.log('before', await p.evaluate(() => document.documentElement.dataset.theme));
await p.getByRole('button', { name: /^dark mode$/i }).first().click();
await p.waitForTimeout(2500);
console.log('afterClick', await p.evaluate(() => document.documentElement.dataset.theme));
console.log(
  'labelNow',
  await p.evaluate(
    () =>
      [...document.querySelectorAll('button')]
        .map((x) => x.getAttribute('aria-label'))
        .filter((l) => l && /dark|light/i.test(l))[0],
  ),
);
await b.close();
