/** qa8 IMPL — recon: how to open the session detail drawer from the table. */
import { BASE, launch, settle } from './probe-impl-session-lib.mjs';

const { browser, page } = await launch();
await page.goto(new URL('/admin-session', BASE).toString(), {
  waitUntil: 'domcontentloaded',
});
await page.waitForSelector('table tbody tr', { timeout: 90000 });
await settle(page);
await page.waitForTimeout(1500);
console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const td = document.querySelector('table tbody tr td:nth-child(2)');
      return {
        html: td?.innerHTML.slice(0, 1200),
        anchors: document.querySelectorAll('table tbody tr a').length,
      };
    }),
    null,
    1,
  ),
);
await browser.close();
