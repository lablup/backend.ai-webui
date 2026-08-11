/**
 * qa8 BATCH-3 Q-37 — does the ghost IconButton have ANY hover wash today, and
 * does a real Playwright hover register? Both mode passes.
 */
import { launch, setMode, settle, BASE, ROOT } from './probe-b3-accent-lib.mjs';
import fs from 'node:fs';

const { browser, page, pageErrors } = await launch();
const out = {};

const read = (el) =>
  el.evaluate((b) => {
    const cs = getComputedStyle(b);
    return {
      isHover: b.matches(':hover'),
      color: cs.color,
      bg: cs.backgroundColor,
      cls: b.className.toString(),
    };
  });

for (const mode of ['light', 'dark']) {
  await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await settle(page);
  await setMode(page, mode);
  await page.waitForTimeout(1500);

  const rec = (out[mode] = {});
  for (const label of ['Manage Apps', 'Refresh']) {
    const el = page.getByRole('button', { name: label, exact: true }).first();
    rec[label] = { rest: await read(el) };
    await el.hover();
    await page.waitForTimeout(500);
    rec[label].hover = await read(el);
    await page.mouse.move(2, 2);
    await page.waitForTimeout(300);
  }
}

out.pageErrors = pageErrors;
fs.writeFileSync(`${ROOT}/b3-accent-hover.json`, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
await browser.close();
