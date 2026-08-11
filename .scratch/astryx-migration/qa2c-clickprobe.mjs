/** qa2-c: list the clickable cells on a table page so the drawer-opening
 * selector can be chosen from evidence instead of guessed. */
import { chromium } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
const TARGET = process.argv[2] ?? 'session';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1100 },
  ignoreHTTPSErrors: true,
});
await ctx.addInitScript((ep) => {
  try {
    localStorage.setItem('backendaiwebui.api_endpoint', ep);
  } catch {
    /* storage unavailable */
  }
}, ENDPOINT);
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const u = page.locator('input[placeholder*="mail" i]').first();
if (await u.count()) {
  await u.fill('admin@lablup.com');
  await page.locator('input[type="password"]').first().fill('wJalrXUt');
  await page
    .getByRole('button', { name: /login/i })
    .first()
    .click();
}
await page.waitForTimeout(15000);
const PREFIX = new URL(page.url()).pathname.replace(/\/[^/]*$/, '');
const url = TARGET.startsWith('/')
  ? new URL(TARGET.slice(1), BASE).toString()
  : new URL(PREFIX + '/' + TARGET, BASE).toString();
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(13000);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const w = document.querySelector('.astryx-table-scroll-wrapper');
      if (!w) return { error: 'no table' };
      const rows = [...w.querySelectorAll('tbody tr')].slice(0, 2);
      return rows.map((tr) =>
        [...tr.querySelectorAll('a,button,[role="button"]')].map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 30),
          aria: el.getAttribute('aria-label'),
          href: el.getAttribute('href'),
          cls: (el.className || '').toString().slice(0, 40),
        })),
      );
    }),
    null,
    1,
  ),
);
await browser.close();
