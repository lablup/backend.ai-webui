/**
 * approved-1 — P5: Banner slot alignment on a TALL alert.
 *
 * Astryx `Banner` swaps its header from `align-items: flex-start` to
 * `align-items: center` whenever `description == null && hasActions`
 * (`styles.headerCentered`). To exercise that branch on a real, live alert
 * (the app's own action/dismiss alerts are all state-gated), the probe
 * re-creates the branch exactly as StyleX would: one injected rule at the same
 * (0,1,0) specificity StyleX emits. The A/B is then whether `.bai-alert
 * .astryx-banner` (0,2,0) — the fix — takes the header back to flex-start, and
 * where the leading icon lands relative to the FIRST LINE of the copy.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const PROJECT = process.env.PROJECT ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  // Narrow enough that the notice wraps to several lines — the case the
  // `isSingleLine` predicate mispredicts.
  viewport: { width: 820, height: 900 },
  storageState: `${ROOT}/a1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}project/${PROJECT}/admin/users`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(16000);

const measure = async (label) =>
  page.evaluate((label) => {
    const root = document.querySelector('.bai-alert');
    if (!root) return { label, error: 'no .bai-alert on page' };
    const header = root.querySelector('.astryx-banner');
    const icon = header.firstElementChild;
    const text = header.querySelector('h1,h2,h3,h4,h5,h6,p,div');
    const end = header.lastElementChild;
    const hr = header.getBoundingClientRect();
    const ir = icon.getBoundingClientRect();
    // First line box of the copy — Range gives the real line rects.
    const tr = (() => {
      const node = header.querySelector('*');
      const r = document.createRange();
      const target =
        Array.from(header.querySelectorAll('*')).find(
          (e) => (e.innerText || '').trim().length > 20,
        ) ?? node;
      r.selectNodeContents(target);
      const rects = Array.from(r.getClientRects());
      return rects[0] ?? target.getBoundingClientRect();
    })();
    return {
      label,
      alignItems: getComputedStyle(header).alignItems,
      headerH: Math.round(hr.height),
      lines: Math.round(
        text ? text.getBoundingClientRect().height / 22 : 0,
      ),
      iconCenterY: Math.round(ir.top + ir.height / 2),
      firstLineCenterY: Math.round(tr.top + tr.height / 2),
      iconOffsetFromFirstLine: Math.round(
        ir.top + ir.height / 2 - (tr.top + tr.height / 2),
      ),
      endCenterY: end === icon ? null : Math.round(
        end.getBoundingClientRect().top + end.getBoundingClientRect().height / 2,
      ),
    };
  }, label);

console.log('BASELINE (no centering branch):', JSON.stringify(await measure('baseline')));

// Reproduce `styles.headerCentered` at StyleX's own (0,1,0) specificity.
await page.addStyleTag({ content: '.astryx-banner { align-items: center; }' });
await page.waitForTimeout(300);
console.log(
  'WITH headerCentered, fix ACTIVE:',
  JSON.stringify(await measure('centered+fix')),
);
await page.screenshot({
  path: `${ROOT}/shots/approved-1/banner-after-${MODE}.png`,
  clip: { x: 0, y: 0, width: 820, height: 320 },
});

// Now strip the `.bai-alert` hook — i.e. the pre-fix behaviour.
await page.evaluate(() => {
  document
    .querySelectorAll('.bai-alert')
    .forEach((e) => e.classList.remove('bai-alert'));
});
await page.waitForTimeout(300);
const before = await page.evaluate(() => {
  const header = document.querySelector('.astryx-banner');
  const icon = header.firstElementChild;
  const target = Array.from(header.querySelectorAll('*')).find(
    (e) => (e.innerText || '').trim().length > 20,
  );
  const r = document.createRange();
  r.selectNodeContents(target);
  const tr = Array.from(r.getClientRects())[0];
  const ir = icon.getBoundingClientRect();
  return {
    alignItems: getComputedStyle(header).alignItems,
    iconOffsetFromFirstLine: Math.round(
      ir.top + ir.height / 2 - (tr.top + tr.height / 2),
    ),
  };
});
console.log('WITH headerCentered, fix REMOVED:', JSON.stringify(before));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/banner-before-${MODE}.png`,
  clip: { x: 0, y: 0, width: 820, height: 320 },
});
await browser.close();
