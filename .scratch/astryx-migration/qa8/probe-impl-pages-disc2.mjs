import { BASE, ROOT, launch, settle } from './probe-pages-lib.mjs';

const { browser, page } = await launch();
await page.goto(`${BASE}admin/rbac`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);
await page.waitForTimeout(1500);

const rows = await page.evaluate(() =>
  [...document.querySelectorAll('table tbody tr')].map((tr) =>
    [...tr.querySelectorAll('td')].map((td) => td.textContent?.trim().slice(0, 30)),
  ),
);
console.log('ROWS', JSON.stringify(rows.slice(0, 3)));

await page.locator('table tbody tr').nth(0).locator('td').first().click();
await page.waitForTimeout(3000);
await settle(page, 5000);
console.log('url', page.url());
const info = await page.evaluate(() => {
  const hdr = document.querySelector('.bai-drawer-header');
  const title = document.querySelector('.bai-drawer-title');
  const body = document.querySelector('.bai-drawer-body, .bai-drawer-body-flush');
  const chain = [];
  let el = hdr;
  while (el && chain.length < 8) {
    chain.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className?.toString?.() ?? '').slice(0, 90),
      role: el.getAttribute('role'),
      rect: (() => {
        const r = el.getBoundingClientRect();
        return { x: +r.x.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
      })(),
    });
    el = el.parentElement;
  }
  return {
    hasHeader: !!hdr,
    title: title?.textContent?.trim(),
    bodyLen: (body?.textContent ?? '').trim().length,
    chain,
  };
});
console.log(JSON.stringify(info, null, 1));
await page.screenshot({ path: `${ROOT}/disc-rbac-drawer.png` });
await browser.close();
