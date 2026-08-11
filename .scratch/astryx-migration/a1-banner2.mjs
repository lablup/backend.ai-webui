/**
 * approved-1 — P5, geometry proof on a TALL banner with a trailing action.
 *
 * Builds the exact case the user reported out of a live `BAIAlert`: the copy is
 * narrowed until it wraps to several lines, `Banner`'s `styles.headerCentered`
 * branch is reproduced at StyleX's own (0,1,0) specificity, and an end area is
 * added with the component's own endArea geometry (flex, shrink 0, auto inline
 * margin, -4px block margin). Then the leading icon and the trailing control
 * are measured against the FIRST LINE of the copy, with the fix on and off.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const PROJECT =
  process.env.PROJECT ?? 'a%ED%95%9C%EA%B5%AD%EC%96%B4%EA%B0%80%EB%8A%A5_cde';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 900 },
  storageState: `${ROOT}/a1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}project/${PROJECT}/admin/users`, {
  waitUntil: 'domcontentloaded',
});
await page.waitForTimeout(16000);

// Narrow the alert and give it the trailing control the reported case has.
await page.evaluate(() => {
  const root = document.querySelector('.bai-alert');
  root.style.maxWidth = '360px';
  const header = root.querySelector('.astryx-banner');
  const end = document.createElement('div');
  end.id = 'probe-end-area';
  Object.assign(end.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    marginInlineStart: 'auto',
    marginBlock: '-4px',
  });
  const btn = document.createElement('button');
  Object.assign(btn.style, {
    width: '24px',
    height: '24px',
    border: '1px solid currentColor',
    borderRadius: '4px',
    background: 'transparent',
  });
  btn.textContent = '×';
  end.appendChild(btn);
  header.appendChild(end);
});
await page.waitForTimeout(300);

const measure = () =>
  page.evaluate(() => {
    const header = document.querySelector('.astryx-banner');
    const icon = header.firstElementChild;
    const end = document.getElementById('probe-end-area');
    const copy = Array.from(header.querySelectorAll('*')).find(
      (e) => (e.innerText || '').trim().length > 20 && e.children.length === 0,
    );
    const range = document.createRange();
    range.selectNodeContents(copy);
    const lineRects = Array.from(range.getClientRects());
    const first = lineRects[0];
    const mid = (r) => r.top + r.height / 2;
    return {
      alignItems: getComputedStyle(header).alignItems,
      copyLines: lineRects.length,
      headerH: Math.round(header.getBoundingClientRect().height),
      iconVsFirstLine: Math.round(
        mid(icon.getBoundingClientRect()) - mid(first),
      ),
      actionVsFirstLine: Math.round(
        mid(end.getBoundingClientRect()) - mid(first),
      ),
    };
  });

console.log('AFTER  (fix active):  ', JSON.stringify(await measure()));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/banner-tall-after-${MODE}.png`,
  clip: { x: 0, y: 60, width: 700, height: 260 },
});

// Reproduce Banner's own `headerCentered` branch, then remove the fix hook.
await page.addStyleTag({ content: '.astryx-banner { align-items: center; }' });
await page.waitForTimeout(200);
console.log('AFTER  (fix beats headerCentered):', JSON.stringify(await measure()));

await page.evaluate(() =>
  document
    .querySelectorAll('.bai-alert')
    .forEach((e) => e.classList.remove('bai-alert')),
);
await page.waitForTimeout(200);
console.log('BEFORE (fix removed): ', JSON.stringify(await measure()));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/banner-tall-before-${MODE}.png`,
  clip: { x: 0, y: 60, width: 700, height: 260 },
});
await browser.close();
