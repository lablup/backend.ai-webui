// Q-5: one probe shape, two engines. Measures every metric the report asks
// about on the header user-dropdown panel: panel box / width / padding /
// radius / shadow / bg / max-height + overflow, per-item height / padding /
// font / colour, icon size, the icon->label gap, divider style + insets, the
// row rhythm, and the panel's offset and alignment relative to the trigger.
//
//   ENGINE=antd   -> the antd 6.5.0 oracle (`menu.html`), panel already open
//   ENGINE=astryx -> the live app, panel opened by clicking the trigger
//
// Astryx renders the OPEN menu inside a `[popover]`; the page also carries
// CLOSED `.astryx-dropdown-menu`s (the notification one is first in document
// order), so the open panel is selected by non-zero width, never by index.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const ENGINE = process.env.ENGINE ?? 'antd';
const DARK = process.env.DARK === '1';
const OUT =
  process.env.OUT ?? `/tmp/qa4-menu-${ENGINE}-${DARK ? 'dark' : 'light'}.json`;
const SHOT = process.env.SHOT;

const ANTD_BASE = `http://127.0.0.1:${process.env.ORACLE_PORT ?? '6061'}/menu.html${DARK ? '?dark=1' : ''}`;
const APP_BASE = process.env.BAI_BASE ?? 'http://127.0.0.1:6060/';

const pageErrors = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  colorScheme: DARK ? 'dark' : 'light',
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 300)));

if (ENGINE === 'antd') {
  await page.goto(ANTD_BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
} else {
  await page.goto(APP_BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-testid="user-dropdown-button"]', {
    timeout: 120000,
  });
  await page.waitForTimeout(4000);
  if (DARK) {
    // `themeMode` defaults to 'system', so the context's `colorScheme: dark`
    // already puts the app in dark through the shipped `useThemeMode` path —
    // the header button then reads "Light mode". Only click when the app did
    // NOT resolve dark on its own, and assert the result either way.
    let t = await page.evaluate(() => document.documentElement.dataset.theme);
    if (t !== 'dark') {
      await page.getByRole('button', { name: /^dark mode$/i }).first().click();
      await page.waitForTimeout(1500);
      t = await page.evaluate(() => document.documentElement.dataset.theme);
    }
    if (t !== 'dark') throw new Error(`theme did not resolve dark: ${t}`);
  }
  await page.locator('[data-testid="user-dropdown-button"]').first().click();
  await page.waitForTimeout(1000);
}

const data = await page.evaluate((engine) => {
  const isAntd = engine === 'antd';
  const box = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      x: +b.x.toFixed(1),
      y: +b.y.toFixed(1),
      w: +b.width.toFixed(1),
      h: +b.height.toFixed(1),
      pad: s.padding,
      margin: s.margin,
      radius: s.borderRadius,
      font: `${s.fontSize}/${s.lineHeight}`,
      weight: s.fontWeight,
      color: s.color,
      bg: s.backgroundColor,
      shadow: s.boxShadow,
      gap: s.gap,
      display: s.display,
      opacity: s.opacity,
      maxHeight: s.maxHeight,
      overflowY: s.overflowY,
      scrollH: el.scrollHeight,
      clientH: el.clientHeight,
    };
  };

  const visible = (els) => els.find((e) => e.getBoundingClientRect().width > 0);
  const menu = isAntd
    ? document.querySelector('.ant-dropdown-menu')
    : visible([...document.querySelectorAll('.astryx-dropdown-menu')]);
  // The painted surface: antd paints on the menu itself; Astryx paints on the
  // popover's inner wrapper (the menu element is transparent).
  const surface = isAntd ? menu : (menu?.parentElement ?? null);
  const popover = isAntd
    ? document.querySelector('.ant-dropdown')
    : (menu?.closest('[popover]') ?? null);
  const trigger = document.querySelector('[data-testid="user-dropdown-button"]');

  const scope = menu ?? document;
  const itemEls = [
    ...scope.querySelectorAll(isAntd ? '.ant-dropdown-menu-item' : '.astryx-item'),
  ];
  const dividerEls = [
    ...scope.querySelectorAll(
      isAntd ? '.ant-dropdown-menu-item-divider' : '.astryx-divider',
    ),
  ];

  const mRect = menu?.getBoundingClientRect();

  const items = itemEls.map((el) => {
    const b = box(el);
    const iconEl = el.querySelector('svg, .anticon');
    const ib = iconEl?.getBoundingClientRect();
    const labelEl =
      [...el.children].find((c) => !c.matches('svg, .anticon') && !c.querySelector('svg')) ?? el;
    const lb = labelEl.getBoundingClientRect();
    const ls = getComputedStyle(labelEl);
    return {
      text: (el.textContent ?? '').trim().slice(0, 26),
      disabled:
        el.getAttribute('aria-disabled') === 'true' ||
        el.classList.contains('ant-dropdown-menu-item-disabled'),
      h: b.h,
      w: b.w,
      y: b.y,
      pad: b.pad,
      radius: b.radius,
      bg: b.bg,
      opacity: b.opacity,
      gap: b.gap,
      iconW: ib ? +ib.width.toFixed(1) : null,
      iconLabelGap: ib ? +(lb.x - (ib.x + ib.width)).toFixed(1) : null,
      iconXFromPanel: ib && mRect ? +(ib.x - mRect.x).toFixed(1) : null,
      labelXFromPanel: mRect ? +(lb.x - mRect.x).toFixed(1) : null,
      labelFont: `${ls.fontSize}/${ls.lineHeight}`,
      labelWeight: ls.fontWeight,
      labelColor: ls.color,
    };
  });

  const dividers = dividerEls.map((el) => {
    const b = box(el);
    const s = getComputedStyle(el);
    return {
      h: b.h,
      w: b.w,
      margin: b.margin,
      bg: b.bg,
      borderTop: s.borderTopWidth + ' ' + s.borderTopColor,
      background: s.background.slice(0, 90),
      insetLeft: mRect ? +(b.x - mRect.x).toFixed(1) : null,
      insetRight: mRect ? +(mRect.x + mRect.width - (b.x + b.w)).toFixed(1) : null,
    };
  });

  const p = surface?.getBoundingClientRect();
  const t = trigger?.getBoundingClientRect();

  const pitch = items.slice(1).map((it, i) => +(it.y - items[i].y).toFixed(1));
  const rowGaps = items
    .slice(1)
    .map((it, i) => +(it.y - (items[i].y + items[i].h)).toFixed(1));

  return {
    engine,
    popover: box(popover),
    surface: box(surface),
    menu: box(menu),
    trigger: box(trigger),
    // vertical gap between the trigger's bottom edge and the panel's top edge
    offsetFromTrigger: p && t ? +(p.y - (t.y + t.height)).toFixed(1) : null,
    // 0 == the panel's right edge is flush with the trigger's right edge
    rightAlignDelta: p && t ? +(p.x + p.width - (t.x + t.width)).toFixed(1) : null,
    // does the panel clip its own content?
    scrolls: menu ? menu.scrollHeight > menu.clientHeight + 1 : null,
    contentHeight: menu?.scrollHeight ?? null,
    itemCount: items.length,
    items,
    dividers,
    pitch,
    rowGaps,
  };
}, ENGINE);

data.pageErrors = pageErrors;
fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(JSON.stringify(data, null, 1));
if (SHOT) await page.screenshot({ path: SHOT });
await browser.close();
