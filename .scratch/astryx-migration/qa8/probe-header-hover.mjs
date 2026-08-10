/**
 * qa8 Q-20 — the header band's hover wash.
 *
 * Every control on the band sits inside `MediaTheme mode="dark"`, so
 * `--color-overlay-hover: light-dark(rgba(0,0,0,0.06), #262626)` always took the
 * opaque branch and painted a near-black block on the brand-orange band. Legacy
 * resolved the band against the INVERTED mode (`ReverseThemeProvider`), i.e.
 * `#262626` in light and `rgba(0,0,0,0.06)` in dark.
 *
 * Measure the resolved property and the actual hover paint on each band control,
 * in both modes.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE =
  process.env.BASE ?? 'https://to-astryx.backend-ai-webui.localhost:1357/';
const ROOT = process.env.ROOT ?? '.scratch/astryx-migration/qa8';
const TAG = process.env.TAG ?? 'after';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  ignoreHTTPSErrors: true,
  storageState: `${ROOT}/state.json`,
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(180000);
page.setDefaultTimeout(30000);
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(e.message));

await page.goto(`${BASE}session`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(10000);

const result = {};
for (const mode of ['light', 'dark']) {
  const want = mode === 'dark';
  const isDark = await page.evaluate(
    () => document.documentElement.dataset.theme === 'dark',
  );
  if (isDark !== want) {
    await page
      .getByRole('button', { name: /^(dark|light) mode$/i })
      .first()
      .click();
    await page.waitForTimeout(2500);
  }

  const bucket = (result[mode] = {
    appliedTheme: await page.evaluate(
      () => document.documentElement.dataset.theme ?? null,
    ),
    bandOverlayVar: await page.evaluate(() => {
      const band = document.querySelector('[data-testid="webui-header"]');
      return band
        ? getComputedStyle(band).getPropertyValue('--color-overlay-hover').trim()
        : null;
    }),
    controls: [],
  });

  const buttons = page.locator('[data-testid="webui-header"] button');
  const n = Math.min(await buttons.count(), 5);
  for (let i = 0; i < n; i++) {
    const b = buttons.nth(i);
    if (!(await b.isVisible().catch(() => false))) continue;
    const rest = await b.evaluate((el) => ({
      label: el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 18),
      bgImage: getComputedStyle(el).backgroundImage,
      overlayVar: getComputedStyle(el)
        .getPropertyValue('--color-overlay-hover')
        .trim(),
    }));
    await b.hover();
    await page.waitForTimeout(450);
    const hover = await b.evaluate((el) => ({
      bgImage: getComputedStyle(el).backgroundImage,
    }));
    bucket.controls.push({ ...rest, hoverBgImage: hover.bgImage });
    await page.mouse.move(3, 600);
    await page.waitForTimeout(250);
  }

  await page
    .locator('[data-testid="webui-header"]')
    .screenshot({ path: `${ROOT}/${TAG}-header-hover-${mode}.png` })
    .catch(() => {});
}

result.pageErrors = pageErrors;
fs.writeFileSync(
  `${ROOT}/${TAG}-header-hover.json`,
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
