// POLISH-3 item 4 — logo band, expanded + collapsed, both modes.
import fs from 'node:fs';
import { launch, login, BASE } from './probe.mjs';

const OUT = '.scratch/astryx-migration/shots/polish-3';
fs.mkdirSync(OUT, { recursive: true });
const TAG = process.env.TAG ?? 'before';

const { browser, page } = await launch();
await login(page);

const modeOf = () =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
const setMode = async (mode) => {
  if ((await modeOf()) !== mode) {
    await page.locator('[data-testid="button-theme"]').first().click();
    await page.waitForTimeout(1500);
  }
};

const snap = () =>
  page.evaluate(() => {
    const r = (el) => {
      if (!el) return null;
      const b = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        x: +b.x.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
        alignItems: cs.alignItems,
        paddingInline: `${cs.paddingInlineStart}/${cs.paddingInlineEnd}`,
        overflow: cs.overflow,
      };
    };
    const vis = (el) => !!(el && el.getBoundingClientRect().width);
    const wide = document.querySelector('img.logo-wide');
    const mark = document.querySelector('img.logo-collapsed');
    return {
      band: r(document.querySelector('.logo-and-text-container')),
      wide: vis(wide) ? r(wide) : null,
      mark: vis(mark) ? r(mark) : null,
      rail: r(document.querySelector('.bai-sider')),
    };
  });

const out = {};
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(6000);
for (const mode of ['light', 'dark']) {
  await setMode(mode);
  await page.waitForTimeout(800);
  out[`expanded-${mode}`] = await snap();
  await page
    .locator('.bai-sider-shell')
    .screenshot({ path: `${OUT}/${TAG}-logo-expanded-${mode}.png` });
  await page.keyboard.press('[');
  await page.waitForTimeout(1200);
  out[`collapsed-${mode}`] = await snap();
  await page
    .locator('.bai-sider-shell')
    .screenshot({ path: `${OUT}/${TAG}-logo-collapsed-${mode}.png` });
  await page.keyboard.press('[');
  await page.waitForTimeout(1200);
}
fs.writeFileSync(`${OUT}/${TAG}-logo.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
