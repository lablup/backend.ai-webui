/** qa8 BATCH-3 Q-37 — full computed-style diff, ghost IconButton rest vs hover. */
import { launch, settle, BASE } from './probe-b3-accent-lib.mjs';

const { browser, page } = await launch();
await page.goto(`${BASE}admin/environment`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(8000);
await settle(page);
console.log(
  'hover media:',
  await page.evaluate(() => matchMedia('(hover: hover)').matches),
  'pointer fine:',
  await page.evaluate(() => matchMedia('(pointer: fine)').matches),
);
const el = page.getByRole('button', { name: 'Manage Apps', exact: true }).first();
const snap = () =>
  el.evaluate((b) => {
    const cs = getComputedStyle(b);
    const o = {};
    for (const p of cs) o[p] = cs.getPropertyValue(p);
    return o;
  });
const a = await snap();
await el.hover();
await page.waitForTimeout(600);
const b = await snap();
const d = {};
for (const k of Object.keys(a)) if (a[k] !== b[k]) d[k] = [a[k], b[k]];
console.log('DIFF', JSON.stringify(d, null, 1));
await browser.close();
