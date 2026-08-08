/** p3-w2c: computed padding on the notification drawer header row. */
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
  '###',
  JSON.stringify(
    await page.evaluate(() => {
      const h = document.querySelector('.webui-notification-drawer-header');
      const b = document.querySelector('.webui-notification-drawer-body');
      if (!h) return { header: null };
      const cs = getComputedStyle(h);
      const cb = b ? getComputedStyle(b) : null;
      return {
        headerClass: h.className,
        paddingInlineEnd: cs.paddingInlineEnd,
        appRegion: cs.getPropertyValue('-webkit-app-region'),
        bodyPaddingInline: cb?.paddingInline,
        spacing6: getComputedStyle(document.documentElement).getPropertyValue(
          '--spacing-6',
        ),
        sheets: Array.from(document.styleSheets)
          .flatMap((s) => {
            try {
              return Array.from(s.cssRules).map((r) => r.cssText);
            } catch {
              return [];
            }
          })
          .filter((t) => t.includes('webui-notification-drawer')),
      };
    }),
    null,
    1,
  ),
);
await browser.close();
