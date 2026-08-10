// Bug 2 diagnosis: endpoint field loses focus while typing.
import { chromium } from '@playwright/test';

const BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6050/';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: 'light',
});
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('[console.error]', m.text().slice(0, 300));
});
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);

// Expand advanced settings if the endpoint input is not visible yet.
let ep = page.locator('input[placeholder="Endpoint"]').first();
if (!(await ep.count())) {
  const adv = page.getByRole('link', { name: /advanced/i }).first();
  if (await adv.count()) {
    await adv.click();
    await page.waitForTimeout(500);
  }
  ep = page.locator('input[placeholder="Endpoint"]').first();
}
console.log('endpoint input count:', await ep.count());

// Tag the element so we can detect a remount (new DOM node loses the tag).
await ep.evaluate((el) => {
  el.__probeTag = 'TAG0';
  window.__blurLog = [];
  el.addEventListener('blur', () => {
    window.__blurLog.push({
      at: Date.now(),
      newFocus: document.activeElement?.tagName + '.' + (document.activeElement?.className || ''),
    });
  });
});

await ep.click();
// Start from an empty field: select-all + delete, the way a user retypes.
await page.keyboard.press('Control+a');
await page.keyboard.press('Delete');
await page.waitForTimeout(300);
console.log(
  'after clear:',
  JSON.stringify(
    await page.evaluate(() => {
      const el = document.querySelector('input[placeholder="Endpoint"]');
      return {
        v: el?.value,
        focused: el === document.activeElement,
        tag: el?.__probeTag,
      };
    }),
  ),
);

const TYPE = 'http://abc';
const trace = [];
for (const ch of TYPE) {
  await page.keyboard.type(ch, { delay: 60 });
  await page.waitForTimeout(120);
  const snap = await page.evaluate(() => {
    const el = document.querySelector('input[placeholder="Endpoint"]');
    const act = document.activeElement;
    return {
      value: el ? el.value : null,
      sameNodeAsActive: el === act,
      tagPresent: el ? el.__probeTag === 'TAG0' : null,
      activeTag: act ? act.tagName + (act.getAttribute('placeholder') ? `[${act.getAttribute('placeholder')}]` : '') : null,
      selStart: el ? el.selectionStart : null,
      blurs: (window.__blurLog || []).length,
    };
  });
  trace.push({ ch, ...snap });
}
console.log(JSON.stringify(trace, null, 1));
console.log('blurLog:', JSON.stringify(await page.evaluate(() => window.__blurLog)));

await browser.close();
