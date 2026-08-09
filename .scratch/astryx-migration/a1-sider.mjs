/** approved-1 — admin sider scroll diagnosis (catalog S-1). */
import { chromium } from '@playwright/test';

const BASE = process.env.BASE ?? 'http://127.0.0.1:5960/';
const ROOT = process.env.ROOT;
const MODE = process.env.MODE ?? 'light';
const PATH = process.env.PATH_ ?? 'admin/settings';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  storageState: `${ROOT}/a1-state.json`,
  colorScheme: MODE === 'dark' ? 'dark' : 'light',
});
const page = await ctx.newPage();
page.setDefaultNavigationTimeout(120000);
await page.goto(`${BASE}${PATH}`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(14000);

const probe = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  if (!nav) return { error: 'no nav' };
  const kids = Array.from(nav.children).map((el, i) => {
    const cs = getComputedStyle(el);
    return {
      i,
      tag: el.tagName,
      role: /Terms of Service/i.test(el.innerText || '')
        ? 'footer?'
        : el.querySelector('.astryx-side-nav-item')
          ? 'scroll?'
          : 'top?',
      overflowY: cs.overflowY,
      flex: cs.flex,
      minHeight: cs.minHeight,
      clientH: el.clientHeight,
      scrollH: el.scrollHeight,
      overflowPx: el.scrollHeight - el.clientHeight,
      rect: (() => {
        const r = el.getBoundingClientRect();
        return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
      })(),
    };
  });
  const items = Array.from(nav.querySelectorAll('.astryx-side-nav-item'));
  const last = items[items.length - 1];
  const footer = Array.from(document.querySelectorAll('div,footer')).find((e) =>
    /Terms of Service/i.test((e.innerText || '').slice(0, 60)),
  );
  const navCs = getComputedStyle(nav);
  return {
    navOverflowY: navCs.overflowY,
    navH: nav.clientHeight,
    navScrollH: nav.scrollHeight,
    kids,
    itemCount: items.length,
    itemLabels: items.map((e) => (e.innerText || '').trim().slice(0, 20)),
    lastItem: last ? (last.innerText || '').trim().slice(0, 24) : null,
    lastBottom: last ? Math.round(last.getBoundingClientRect().bottom) : null,
    footerTop: footer ? Math.round(footer.getBoundingClientRect().top) : null,
  };
});
console.log(JSON.stringify(probe, null, 1));

// Try scrolling the scroll column to the end and re-measure reachability.
const afterScroll = await page.evaluate(() => {
  const nav = document.querySelector('.astryx-side-nav');
  const col = Array.from(nav.children).find((el) =>
    el.querySelector('.astryx-side-nav-item'),
  );
  if (!col) return { error: 'no scroll column' };
  col.scrollTop = col.scrollHeight;
  const items = Array.from(nav.querySelectorAll('.astryx-side-nav-item'));
  const last = items[items.length - 1];
  const footer = Array.from(document.querySelectorAll('div,footer')).find((e) =>
    /Terms of Service/i.test((e.innerText || '').slice(0, 60)),
  );
  return {
    scrollTop: col.scrollTop,
    lastItem: (last.innerText || '').trim().slice(0, 24),
    lastBottom: Math.round(last.getBoundingClientRect().bottom),
    footerTop: footer ? Math.round(footer.getBoundingClientRect().top) : null,
    colBottom: Math.round(col.getBoundingClientRect().bottom),
  };
});
console.log('AFTER SCROLL', JSON.stringify(afterScroll, null, 1));
await page.screenshot({
  path: `${ROOT}/shots/approved-1/${process.env.TAG ?? 'sider'}-${MODE}.png`,
});
await browser.close();
