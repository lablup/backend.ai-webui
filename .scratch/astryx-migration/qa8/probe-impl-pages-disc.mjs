import { BASE, ROOT, launch, settle } from './probe-pages-lib.mjs';

const URL_PATH = process.env.PATHNAME ?? 'data';
const { browser, page } = await launch();
await page.goto(`${BASE}${URL_PATH}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);
await settle(page, 10000);
const btns = await page.evaluate(() =>
  [...document.querySelectorAll('button')]
    .map((b) => (b.getAttribute('aria-label') || b.textContent || '').trim().slice(0, 40))
    .filter(Boolean),
);
console.log(JSON.stringify(btns));
console.log('url', page.url());
await page.screenshot({ path: `${ROOT}/disc-${URL_PATH.replace(/\W/g, '_')}.png` });
await browser.close();
