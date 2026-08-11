// POLISH-3 items 2 + 6 — the Start page (announcement Banner + card cards).
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
        t: (el.textContent || '').trim().slice(0, 28),
        cls: String(el.className).slice(0, 40),
        x: +b.x.toFixed(2),
        y: +b.y.toFixed(2),
        w: +b.width.toFixed(2),
        h: +b.height.toFixed(2),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        padding: cs.padding,
      };
    };
    const banner = document.querySelector('.astryx-banner');
    const card = [...document.querySelectorAll('.astryx-text')].find((el) =>
      /Create New Storage Folder/.test(el.textContent || ''),
    );
    const desc = [...document.querySelectorAll('.astryx-text.supporting')].find(
      (el) => /Create folders/.test(el.textContent || ''),
    );
    const btn = [...document.querySelectorAll('.astryx-button')].find((el) =>
      /Create Folder/.test(el.textContent || ''),
    );
    return {
      banner: r(banner),
      bannerInner: banner ? r(banner.firstElementChild) : null,
      title: r(card),
      description: r(desc),
      button: r(btn),
    };
  });

const out = {};
await page.goto(`${BASE}start`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
for (const mode of ['light', 'dark']) {
  await setMode(mode);
  await page.waitForTimeout(1500);
  out[mode] = await snap();
  await page.screenshot({ path: `${OUT}/${TAG}-start-${mode}.png` });
  const banner = page.locator('.astryx-banner').first();
  if (await banner.count()) {
    await banner.screenshot({ path: `${OUT}/${TAG}-announcement-${mode}.png` });
  }
}
fs.writeFileSync(`${OUT}/${TAG}-start.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
