/** Q-6/Q-7 — legacy antd 6.5.0 oracle: card tabs (BAITabs NEO) + sider menu (BAIMenu). */
import { chromium } from '@playwright/test';

const URL = process.env.ORACLE ?? 'http://127.0.0.1:6081/tabsider.html';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
const page = await ctx.newPage();
const pageErrors = [];
page.on('pageerror', (e) => pageErrors.push(String(e)));
await page.goto(`${URL}${MODE === 'dark' ? '?dark=1' : ''}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

const out = await page.evaluate(() => {
  const g = (el, props) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of props) o[p] = cs.getPropertyValue(p);
    const b = el.getBoundingClientRect();
    o._box = { x: +b.x.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    return o;
  };
  const TAB = [
    'height',
    'padding-inline-start',
    'padding-inline-end',
    'margin-inline-start',
    'margin-inline-end',
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
  const NAV = [
    'height',
    'border-radius',
    'padding-inline-start',
    'padding-inline-end',
    'margin-top',
    'margin-bottom',
    'margin-inline-start',
    'margin-inline-end',
    'font-size',
    'background-color',
    'color',
    'width',
  ];

  const nav = document.querySelector('.ant-tabs-nav');
  const navBefore = nav ? getComputedStyle(nav, '::before') : null;
  const tabs = [...document.querySelectorAll('.ant-tabs-tab')];
  const active = tabs.find((t) => t.classList.contains('ant-tabs-tab-active'));
  const rest = tabs.find((t) => !t.classList.contains('ant-tabs-tab-active'));

  const menuItems = [...document.querySelectorAll('li.ant-menu-item')];
  const selMenu = menuItems.find((n) => n.classList.contains('ant-menu-item-selected'));
  const restMenu = menuItems.find((n) => !n.classList.contains('ant-menu-item-selected'));

  return {
    tabs: {
      navRect: nav
        ? (() => {
            const b = nav.getBoundingClientRect();
            return { x: +b.x.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
          })()
        : null,
      navMargin: nav ? getComputedStyle(nav).margin : null,
      railBorderBottom: navBefore
        ? `${navBefore.borderBottomWidth} ${navBefore.borderBottomStyle} ${navBefore.borderBottomColor}`
        : null,
      gapBetween: tabs.length > 1
        ? +(tabs[1].getBoundingClientRect().x - tabs[0].getBoundingClientRect().right).toFixed(2)
        : null,
      active: g(active, TAB),
      activeLabel: active ? active.innerText.trim() : null,
      rest: g(rest, TAB),
      restLabel: rest ? rest.innerText.trim() : null,
    },
    menu: {
      count: menuItems.length,
      radii: [...new Set(menuItems.map((n) => getComputedStyle(n).borderRadius))],
      selected: g(selMenu, NAV),
      selectedLabel: selMenu ? selMenu.innerText.trim() : null,
      rest: g(restMenu, NAV),
      restLabel: restMenu ? restMenu.innerText.trim() : null,
    },
  };
});

console.log(JSON.stringify({ MODE, pageErrors, ...out }, null, 2));
await page.screenshot({ path: `${ROOT}/shots/tab-sider-restore/oracle-${MODE}.png` });
await browser.close();
