/**
 * p3-c live proof, dark-theme pass — same `BAIUserSelectAstryx` surface as the
 * light run, with the header's Dark mode toggle actually flipped first.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.P3C_BASE ?? 'http://127.0.0.1:5830/';
const OUT = '.scratch/astryx-migration/shots/p3-c';
fs.mkdirSync(OUT, { recursive: true });

const results = {};
const pageErrors = [];
const log = (k, v) => {
  results[k] = v;
  console.log(`### ${k} = ${JSON.stringify(v)}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 2200, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
const listbox = () => page.locator('[role="listbox"]:visible').last();
const rows = () => listbox().locator('[role="option"]');

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(7000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if (await ep.count()) await ep.fill(process.env.BAI_ENDPOINT ?? '');
  await userInput.fill(process.env.BAI_EMAIL ?? '');
  await page
    .locator('input[type="password"]')
    .first()
    .fill(process.env.BAI_PW ?? '');
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);

await page.getByRole('button', { name: /^dark mode$/i }).first().click();
await page.waitForTimeout(3000);
log(
  'themeAfterToggle',
  await page.evaluate(
    () =>
      document.documentElement.dataset.theme ??
      getComputedStyle(document.body).backgroundColor,
  ),
);

await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await shot('05-rbac-dark');

await page.getByRole('button', { name: /create role|add role/i }).first().click();
await page.waitForTimeout(4000);
await page.locator('#scopes_0_scopeType').first().click();
await page.waitForTimeout(1200);
await page
  .locator('.ant-select-item-option')
  .filter({ hasText: /^User$/i })
  .first()
  .click();
await page.waitForTimeout(5000);

const trigger = page.getByRole('button', { name: /^target$/i }).last();
await trigger.click();
await page.waitForTimeout(4000);
log('initialRows', await rows().count());
await shot('06-user-select-open-dark');

const counts = [];
for (let i = 0; i < 2; i += 1) {
  await listbox().evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await page.waitForTimeout(2500);
  counts.push(await rows().count());
}
log('rowsAfterScroll', counts);

const picked = (await rows().first().innerText()).split('\n')[0].trim();
await rows().first().click();
await page.waitForTimeout(1500);
log('picked', picked);
log('triggerText', (await trigger.innerText()).trim());
await shot('07-user-select-picked-dark');

log('pageErrors', pageErrors.slice(0, 10));
fs.writeFileSync(`${OUT}/measure-p3c-dark.json`, JSON.stringify(results, null, 2));
await browser.close();
