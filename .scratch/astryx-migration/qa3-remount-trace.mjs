// Which DOM level is replaced on the first endpoint keystroke?
import { chromium } from '@playwright/test';
const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6052/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
if (!(await page.locator('input[placeholder="Endpoint"]').count())) {
  await page.getByRole('link', { name: /advanced/i }).first().click();
  await page.waitForTimeout(600);
}

await page.evaluate(() => {
  const el = document.querySelector('input[placeholder="Endpoint"]');
  // tag every ancestor so we can see which survived
  let n = el;
  let i = 0;
  while (n && n !== document.body) {
    n.__tag = 'A' + i++;
    n = n.parentElement;
  }
  window.__muts = [];
  const obs = new MutationObserver((recs) => {
    for (const r of recs) {
      if (r.type !== 'childList') continue;
      const removed = [...r.removedNodes].map(
        (x) => (x.nodeName || '') + '#' + (x.__tag ?? '?') + '.' + String(x.className || '').slice(0, 30),
      );
      const added = [...r.addedNodes].map(
        (x) => (x.nodeName || '') + '.' + String(x.className || '').slice(0, 30),
      );
      if (removed.length || added.length) {
        window.__muts.push({
          target: r.target.nodeName + '#' + (r.target.__tag ?? '?') + '.' + String(r.target.className || '').slice(0, 40),
          removed,
          added,
        });
      }
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
});

const ep = page.locator('input[placeholder="Endpoint"]').first();
await ep.click();
await page.keyboard.type('h', { delay: 50 });
await page.waitForTimeout(700);

console.log(
  JSON.stringify(
    await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="Endpoint"]');
      const chain = [];
      let n = el;
      while (n && n !== document.body) {
        chain.push({
          tag: n.nodeName,
          survivedAs: n.__tag ?? 'NEW',
          cls: String(n.className || '').slice(0, 60),
        });
        n = n.parentElement;
      }
      return { chain, muts: window.__muts };
    }),
    null,
    1,
  ),
);
await browser.close();
