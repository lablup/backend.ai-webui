/** qa2-c: identify the `display:contents` wrapper that defeats the Astryx
 * table's `:first-child`/`:last-child`-scoped vertical bleed. */
import { chromium } from '@playwright/test';

const BASE = process.env.QA_BASE ?? 'http://127.0.0.1:5930/';
const ENDPOINT = process.env.BAI_ENDPOINT ?? 'http://10.82.0.130:8090';
const TARGET = process.argv[2] ?? 'data';

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
await page.goto(
  TARGET.startsWith('/')
    ? new URL(TARGET, BASE).toString()
    : new URL(PREFIX + '/' + TARGET, BASE).toString(),
  { waitUntil: 'domcontentloaded' },
);
await page.waitForTimeout(10000);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const w = document.querySelector('.astryx-table-scroll-wrapper');
      if (!w) return { error: 'no wrapper' };
      const chain = [];
      let el = w;
      for (let i = 0; i < 6 && el; i++) {
        const s = getComputedStyle(el);
        chain.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 70),
          style: el.getAttribute('style'),
          display: s.display,
          isFirst: el === el.parentElement?.firstElementChild,
          isLast: el === el.parentElement?.lastElementChild,
          siblings: el.parentElement?.children.length,
          html: el.outerHTML.slice(0, 130),
        });
        el = el.parentElement;
      }
      return chain;
    }),
    null,
    1,
  ),
);
await browser.close();
