/**
 * qa8 IMPLEMENTATION probe 3 — Q-29 close-up: shoot the "Container Registry
 * for Image Commit" form item itself, both modes.
 */
import { BASE, ROOT, launch, setMode, settle } from './probe-pages-lib.mjs';
import fs from 'node:fs';

const PHASE = process.env.PHASE ?? 'after';
const { browser, page, pageErrors } = await launch();
const out = { phase: PHASE };

await page.goto(`${BASE}admin/project`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(9000);
await settle(page, 8000);

const btn = page.getByRole('button', { name: /^create project$/i }).first();
await btn.waitFor({ state: 'visible', timeout: 60000 });
await btn.click();
await page.waitForTimeout(3500);
await settle(page, 8000);
await page.waitForTimeout(1200);

for (const mode of ['light', 'dark']) {
  out[mode] = { appliedTheme: await setMode(page, mode) };
  await page.waitForTimeout(1500);
  // re-resolve after the theme swap: the toggle remounts the dialog subtree
  const item = page
    .locator('[data-bai-form-item]')
    .filter({ hasText: /Container Registry for Image Commit/ })
    .first();
  await item.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await item.screenshot({ path: `${ROOT}/${PHASE}-q29-registryrow-${mode}.png` });
  out[mode].geometry = await page.evaluate(() => {
    const target = [...document.querySelectorAll('[data-bai-form-item]')].find((i) =>
      /container registry/i.test(
        i.querySelector('[data-bai-form-item-label]')?.textContent ?? '',
      ),
    );
    const fields = [...target.querySelectorAll('.astryx-field')];
    const cc =
      target.querySelector('[data-bai-form-item-control-col]') ??
      target.querySelector('[data-bai-form-item-control]');
    const r = (el) => {
      const b = el.getBoundingClientRect();
      return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1) };
    };
    return {
      fields: fields.map(r),
      controlCol: r(cc),
      gapPx:
        fields.length === 2
          ? +(
              fields[1].getBoundingClientRect().x -
              fields[0].getBoundingClientRect().right
            ).toFixed(1)
          : null,
      sameRow:
        fields.length === 2 &&
        Math.abs(
          fields[0].getBoundingClientRect().y - fields[1].getBoundingClientRect().y,
        ) < 2,
      overflowPx:
        fields.length === 2
          ? +(
              fields[1].getBoundingClientRect().right - cc.getBoundingClientRect().right
            ).toFixed(1)
          : null,
    };
  });
}

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/${PHASE}-impl-pages3.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
await browser.close();
