/** p3-w3a helper — log in once and dump every reachable nav href. */
import { chromium } from '@playwright/test';

const BASE = process.env.W3A_BASE ?? 'http://127.0.0.1:5890/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1900, height: 1100 } });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  if (process.env.BAI_EMAIL) await userInput.fill(process.env.BAI_EMAIL);
  if (process.env.BAI_PW)
    await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page.getByRole('button', { name: /^login$/i }).first().click();
}
await page.waitForTimeout(18000);
console.log('url', page.url());
const hrefs = await page.evaluate(() =>
  Array.from(document.querySelectorAll('a[href]'))
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h.startsWith('/')),
);
console.log(JSON.stringify([...new Set(hrefs)], null, 1));
await browser.close();
