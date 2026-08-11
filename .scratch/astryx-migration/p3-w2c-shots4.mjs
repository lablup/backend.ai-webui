/** p3-w2c pass 4: re-shoot the notification drawer after the header reserve. */
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:5870/';
const OUT = '.scratch/astryx-migration/shots/p3-w2c';
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1800, height: 1100 },
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));

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

const openBell = () =>
  page.evaluate(() => {
    const b = Array.from(document.querySelectorAll('button')).find(
      (x) =>
        x.getBoundingClientRect().top < 70 &&
        x.querySelector('svg')?.getAttribute('class')?.includes('bell'),
    );
    b?.click();
  });

for (const mode of ['light', 'dark']) {
  await page.evaluate((m) => {
    window.localStorage.setItem(
      'backendaiwebui.settings.themeMode',
      JSON.stringify(m),
    );
  }, mode);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(12000);
  await openBell();
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${OUT}/50-notification-fixed-${mode}.png` });
  console.log(
    `### ${mode} =`,
    JSON.stringify(
      await page.evaluate(() => {
        const d = document.querySelector('dialog.astryx-drawer[open]');
        const btns = Array.from(d?.querySelectorAll('button') ?? []).map((b) => {
          const r = b.getBoundingClientRect();
          return {
            l: b.getAttribute('aria-label') || b.innerText.slice(0, 12),
            x: Math.round(r.x),
            r: Math.round(r.right),
          };
        });
        return { open: !!d, btns };
      }),
    ),
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
}
console.log('### pageErrors =', JSON.stringify(pageErrors));
await browser.close();
