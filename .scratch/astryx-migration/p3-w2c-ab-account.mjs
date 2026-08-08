/**
 * p3-w2c A/B probe: does the "My Account Information" modal render antd
 * `Form.Item` labels against a DARK Astryx dialog surface?
 *
 * Run once with the pre-conversion file checked out and once with the
 * converted one; compare `labelColor` vs `dialogBg`.
 */
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5870/';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1800, height: 1100 },
});
const page = await ctx.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
const u = page.locator('input[placeholder="Email or Username"]').first();
if (await u.count()) {
  const ep = page.locator('input[placeholder="Endpoint"]').first();
  if (await ep.count()) await ep.fill(process.env.BAI_ENDPOINT);
  await u.fill(process.env.BAI_EMAIL);
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
      x.querySelector('svg')?.getAttribute('class')?.includes('lucide-user'),
  );
  b?.click();
});
await page.waitForTimeout(2200);
await page
  .getByText(/my account/i)
  .first()
  .click()
  .catch(() => {});
await page.waitForTimeout(7000);
console.log(
  '###',
  JSON.stringify(
    await page.evaluate(() => {
      const labels = Array.from(
        document.querySelectorAll('.ant-form-item-label label'),
      ).map((l) => ({
        text: l.textContent,
        color: getComputedStyle(l).color,
      }));
      const dlg = document.querySelector('[role="dialog"]');
      return {
        labels,
        dialogBg: dlg ? getComputedStyle(dlg).backgroundColor : null,
        astryxMode: document
          .querySelector('[data-astryx-theme]')
          ?.getAttribute('data-astryx-mode'),
      };
    }),
    null,
    1,
  ),
);
await page.screenshot({ path: process.env.AB_OUT });
await browser.close();
