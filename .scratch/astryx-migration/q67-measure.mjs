/**
 * Q-6/Q-7 — measure card-type tab strip + sider nav-item metrics.
 *
 * BASE, ROOT, MODE (light|dark), PATH_ from env.
 */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:6070/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const PATH_ = process.env.PATH_ ?? 'session';
const TAG = process.env.TAG ?? 'probe';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/${process.env.STATE ?? 'q67-state.json'}`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
page.setDefaultNavigationTimeout(180000);
await page.goto(`${BASE}${PATH_}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(16000);

if (MODE === 'dark') {
  await page.evaluate(() => {
    if (document.documentElement.dataset.theme !== 'dark') {
      const b = Array.from(document.querySelectorAll('button')).find((x) =>
        /dark|theme|mode/i.test(x.getAttribute('aria-label') || x.title || ''),
      );
      if (b) b.click();
    }
  });
  await page.waitForTimeout(2500);
}

const probe = await page.evaluate(() => {
  const px = (v) => v;
  const grab = (el, props) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = px(cs.getPropertyValue(p));
    const r = el.getBoundingClientRect();
    o._box = { w: +r.width.toFixed(2), h: +r.height.toFixed(2) };
    return o;
  };
  const TABPROPS = [
    'height',
    'padding-inline-start',
    'padding-inline-end',
    'color',
    'background-color',
    'border-top-width',
    'border-top-color',
    'border-left-color',
    'border-right-color',
    'border-bottom-width',
    'border-bottom-color',
    'border-top-left-radius',
    'border-top-right-radius',
    'margin-bottom',
    'font-size',
  ];
  const NAVPROPS = [
    'height',
    'border-radius',
    'padding-inline-start',
    'padding-inline-end',
    'margin-top',
    'margin-bottom',
    'font-size',
    'background-color',
    'color',
  ];

  const root = document.documentElement;
  const tokens = {};
  for (const t of [
    '--color-accent',
    '--color-border',
    '--border-width',
    '--radius-element',
    '--radius-container',
    '--color-background-muted',
    '--color-background-card',
    '--color-text-secondary',
    '--size-element-lg',
    '--spacing-4',
    '--spacing-0-5',
  ]) {
    tokens[t] = getComputedStyle(root).getPropertyValue(t).trim();
  }
  tokens['data-astryx-theme'] = root.getAttribute('data-astryx-theme');
  tokens['data-theme'] = root.dataset.theme ?? null;

  // ---- card tabs
  const strips = Array.from(document.querySelectorAll('.bai-tab-list--card'));
  const cards = strips.map((strip) => {
    const cs = getComputedStyle(strip);
    const tabs = Array.from(strip.querySelectorAll('.astryx-tab'));
    const sel = tabs.find((t) => t.getAttribute('data-selected') === 'selected');
    const rest = tabs.find((t) => t.getAttribute('data-selected') !== 'selected');
    const stripTokens = {};
    for (const t of ['--color-accent', '--color-border', '--border-width', '--radius-element']) {
      stripTokens[t] = getComputedStyle(strip).getPropertyValue(t).trim();
    }
    return {
      stripClass: strip.className,
      stripBorderBottom: `${cs.borderBottomWidth} ${cs.borderBottomStyle} ${cs.borderBottomColor}`,
      stripGap: cs.gap,
      stripAlign: cs.alignItems,
      stripPaddingBottom: cs.paddingBottom,
      stripTokens,
      tabCount: tabs.length,
      selected: sel ? grab(sel, TABPROPS) : null,
      selectedLabel: sel ? (sel.innerText || '').trim().slice(0, 20) : null,
      rest: rest ? grab(rest, TABPROPS) : null,
      restLabel: rest ? (rest.innerText || '').trim().slice(0, 20) : null,
      indicatorDisplay: (() => {
        const i = strip.querySelector('.astryx-tab-indicator');
        return i ? getComputedStyle(i).display : 'none-found';
      })(),
    };
  });

  // ---- line tabs (for contrast)
  const lineStrips = Array.from(
    document.querySelectorAll('.astryx-tab-list:not(.bai-tab-list--card)'),
  ).length;

  // ---- sider
  const sider = document.querySelector('.bai-sider');
  const navItems = Array.from(document.querySelectorAll('.astryx-side-nav-item'));
  const selNav = navItems.find((n) => n.getAttribute('data-selected') === 'selected');
  const restNav = navItems.find((n) => n.getAttribute('data-selected') !== 'selected');
  const nav = document.querySelector('.astryx-side-nav');

  return {
    tokens,
    cards,
    lineStrips,
    sider: {
      present: !!sider,
      siderClass: sider ? sider.className : null,
      navWidth: nav ? +nav.getBoundingClientRect().width.toFixed(2) : null,
      itemCount: navItems.length,
      selectedLabel: selNav ? (selNav.innerText || '').trim().slice(0, 20) : null,
      selected: selNav ? grab(selNav, NAVPROPS) : null,
      restLabel: restNav ? (restNav.innerText || '').trim().slice(0, 20) : null,
      rest: restNav ? grab(restNav, NAVPROPS) : null,
      allRadii: [...new Set(navItems.map((n) => getComputedStyle(n).borderRadius))],
    },
  };
});

console.log(JSON.stringify({ MODE, PATH_, pageErrors, ...probe }, null, 2));
await page.screenshot({
  path: `${ROOT}/shots/tab-sider-restore/${TAG}-${MODE}.png`,
  fullPage: false,
});
await browser.close();
