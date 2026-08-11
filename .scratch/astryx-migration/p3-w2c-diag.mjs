/** p3-w2c diagnostic: locate the header controls + the notification drawer. */
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

console.log(
  '### topButtons =',
  JSON.stringify(
    await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button').forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.top < 70 && r.width > 0) {
          out.push({
            label: b.getAttribute('aria-label') || b.innerText.slice(0, 20),
            cls: b.className.slice(0, 60),
            x: Math.round(r.x),
            svg: b.querySelector('svg')?.getAttribute('class') || '',
          });
        }
      });
      return out;
    }),
    null,
    1,
  ),
);

console.log(
  '### drawers(before) =',
  JSON.stringify(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('dialog')).map((d) => ({
        cls: d.className.slice(0, 60),
        open: d.open,
        vis: d.getBoundingClientRect().width,
      })),
    ),
  ),
);

// click the bell (lucide-bell svg in the top bar)
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
  '### drawers(after) =',
  JSON.stringify(
    await page.evaluate(() =>
      Array.from(document.querySelectorAll('dialog')).map((d) => ({
        cls: d.className.slice(0, 60),
        open: d.open,
        w: Math.round(d.getBoundingClientRect().width),
        h: Math.round(d.getBoundingClientRect().height),
        text: d.innerText.slice(0, 120).replace(/\n/g, ' | '),
      })),
    ),
  ),
);
await page.screenshot({
  path: '.scratch/astryx-migration/shots/p3-w2c/diag-notification.png',
});

console.log(
  '### segmented =',
  await page.locator('.astryx-segmented-control').count(),
);

await browser.close();
