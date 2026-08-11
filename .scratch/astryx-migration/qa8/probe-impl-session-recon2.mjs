/** qa8 IMPL — recon: enumerate Selector triggers on /data, the folder modal and /session/start. */
import { BASE, launch, settle } from './probe-impl-session-lib.mjs';

const { browser, page } = await launch();

const dump = (tag) =>
  page.evaluate((t) => {
    const list = Array.from(
      document.querySelectorAll('[role="combobox"],[aria-haspopup="listbox"]'),
    ).map((el, i) => {
      const r = el.getBoundingClientRect();
      return {
        i,
        text: (el.textContent || '').trim().slice(0, 40),
        label: el.getAttribute('aria-label'),
        testid: el.getAttribute('data-testid'),
        y: +r.y.toFixed(0),
        w: +r.width.toFixed(0),
      };
    });
    return { tag: t, url: location.href, list };
  }, tag);

await page.goto(new URL('/data', BASE).toString(), { waitUntil: 'domcontentloaded' });
await page.waitForSelector('table tbody tr', { timeout: 90000 }).catch(() => {});
await settle(page);
await page.waitForTimeout(2000);
console.log(JSON.stringify(await dump('/data'), null, 1));

// open the first folder
const links = await page.locator('table tbody tr a').count();
console.log('folder links:', links);
if (links) {
  await page.locator('table tbody tr a').first().click();
  await page.waitForTimeout(6000);
  console.log(JSON.stringify(await dump('/data folder modal'), null, 1));
  const txt = await page.evaluate(
    () =>
      (
        document.querySelector('dialog[open]') ??
        document.querySelector('[role="dialog"]')
      )?.textContent?.slice(0, 400) ?? 'no dialog',
  );
  console.log('DIALOG TEXT:', txt);
}

await page.goto(new URL('/session/start', BASE).toString(), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(12000);
await settle(page);
await page.waitForTimeout(3000);
console.log(JSON.stringify(await dump('/session/start'), null, 1));

await browser.close();
