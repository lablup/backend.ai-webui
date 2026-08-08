import { chromium } from '@playwright/test';

const BASE = process.env.P3C_BASE ?? 'http://127.0.0.1:5830/';
const OUT = '.scratch/astryx-migration/shots/p3-c';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 2200, height: 1100 },
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));

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

const btnDump = () =>
  page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .map((b) => ({
        n: (b.getAttribute('aria-label') || b.textContent || '').slice(0, 30),
        c: String(b.className).slice(0, 25),
      }))
      .filter((x) => x.n),
  );

await page.goto(`${BASE}admin/agent`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
console.log('AGENT TAB buttons:', JSON.stringify(await btnDump()));

await page.getByRole('button', { name: /storages/i }).first().click();
await page.waitForTimeout(8000);
await page.screenshot({ path: `${OUT}/recon-storages-tab.png` });
console.log('STORAGES TAB buttons:', JSON.stringify(await btnDump()));
const links = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.ant-table-tbody a')).map((a) =>
    (a.textContent || '').slice(0, 30),
  ),
);
console.log('STORAGES links:', JSON.stringify(links));

if (links.length) {
  await page.locator('.ant-table-tbody a').first().click();
  await page.waitForTimeout(10000);
  await page.screenshot({ path: `${OUT}/recon-storage-detail.png` });
  console.log('STORAGE DETAIL buttons:', JSON.stringify(await btnDump()));
}
await browser.close();
