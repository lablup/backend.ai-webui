/** p3-w2c: measure the notification drawer header vs the built-in close button. */
import { chromium } from '@playwright/test';

const BASE = process.env.W2C_BASE ?? 'http://127.0.0.1:5870/';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1800, height: 1100 },
});
const page = await ctx.newPage();

await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const userInput = page.locator('input[placeholder="Email or Username"]').first();
if (await userInput.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if ((await ep.count()) && process.env.BAI_ENDPOINT)
    await ep.fill(process.env.BAI_ENDPOINT);
  await userInput.fill(process.env.BAI_EMAIL);
  await page.locator('input[type="password"]').first().fill(process.env.BAI_PW);
  await page
    .getByRole('button', { name: /^login$/i })
    .first()
    .click();
}
await page.waitForTimeout(18000);

await page.evaluate(() => {
  const b = Array.from(document.querySelectorAll('button')).find(
    (x) =>
      x.getBoundingClientRect().top < 70 &&
      x.querySelector('svg')?.getAttribute('class')?.includes('bell'),
  );
  b?.click();
});
await page.waitForTimeout(3000);

console.log(
  '### geometry =',
  JSON.stringify(
    await page.evaluate(() => {
      const d = document.querySelector('dialog.astryx-drawer[open]');
      if (!d) return null;
      const r = (el) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return {
          x: Math.round(b.x),
          y: Math.round(b.y),
          w: Math.round(b.width),
          h: Math.round(b.height),
        };
      };
      const buttons = Array.from(d.querySelectorAll('button')).map((b) => ({
        label: b.getAttribute('aria-label') || b.innerText.slice(0, 16),
        svg: b.querySelector('svg')?.getAttribute('class')?.slice(0, 40) || '',
        ...r(b),
      }));
      return {
        drawer: r(d),
        header: r(d.querySelector('.webui-notification-drawer-header')),
        body: r(d.querySelector('.webui-notification-drawer-body')),
        buttons,
      };
    }),
    null,
    1,
  ),
);
await browser.close();
