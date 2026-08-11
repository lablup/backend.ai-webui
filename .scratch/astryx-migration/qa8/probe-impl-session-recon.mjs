/** qa8 IMPL — recon: what the session tables and the launcher trigger look like. */
import { BASE, launch, settle } from './probe-impl-session-lib.mjs';

const { browser, page } = await launch();
for (const route of ['/session', '/admin-session']) {
  await page.goto(new URL(route, BASE).toString(), {
    waitUntil: 'domcontentloaded',
  });
  await page
    .waitForSelector('table tbody tr', { timeout: 90000 })
    .catch(() => {});
  await settle(page);
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => ({
    url: location.href,
    tables: document.querySelectorAll('table').length,
    rows: document.querySelectorAll('table tbody tr').length,
    ths: Array.from(document.querySelectorAll('table thead th')).map((t) => ({
      t: (t.textContent || '').trim().slice(0, 24),
      w: +t.getBoundingClientRect().width.toFixed(1),
    })),
    tabs: Array.from(document.querySelectorAll('[role="tab"]')).map((t) =>
      (t.textContent || '').trim(),
    ),
    appBtns: Array.from(document.querySelectorAll('button')).filter((b) =>
      /see app dialog/i.test(
        b.getAttribute('aria-label') || b.title || b.textContent || '',
      ),
    ).length,
  }));
  console.log(route, JSON.stringify(info, null, 1));
}
await browser.close();
